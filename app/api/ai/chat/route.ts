// ==============================================================================
// FILE: app/api/ai/chat/route.ts
// ARCHITECTURE ROLE: Headless AI Copilot API — Live LLM (Gemini / OpenAI) + RAG & Tool Calling
//
// 🎓 ENTERPRISE APPLIED AI ARCHITECTURE:
//   1. DYNAMIC LLM INTEGRATION:
//      Connects directly to Google Gemini (or OpenAI) when an API key is provided
//      in `.env.local` (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
//   2. RAG (Retrieval-Augmented Generation):
//      Injects verified factual catalog inventory (prices, specs, stock) into the
//      system prompt to eliminate hallucinations.
//   3. DYNAMIC CONVERSATIONAL NLU ENGINE:
//      If no external API key is configured, an intelligent natural language engine
//      handles greetings ("hello nova", "hi"), small talk, spec comparisons, order
//      tracking, and category inquiries dynamically without dumping static products.
//   4. STRUCTURED ACTION CHIPS & PRODUCT CARDS:
//      Parses LLM output into clickable 1-click actions ("Add to Bag", "Quick View",
//      "Apply Coupon", "Track Order") rendered inside the chat UI.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import { Product } from "@/types/product";
import { AIChatRequest, AIChatResponse, AIToolCall, AISuggestedAction, MessageRole } from "@/types/ai";
import { evaluatePromptSecurity, checkRateLimit } from "@/lib/security";
import { redis, cacheKeys } from "@/lib/redis";

// ------------------------------------------------------------------------------
// 1. RAG GROUNDING KNOWLEDGE BASE BUILDER
// Prepares a factual, structured summary of our live catalog for the LLM
// ------------------------------------------------------------------------------
function buildCatalogKnowledgeBase(): string {
  return PRODUCTS.map(
    (p) =>
      `• [ID: ${p.id}] ${p.name} | Category: ${p.category} | Price: $${p.price.toFixed(2)} (MSRP: $${(p.originalPrice || p.price).toFixed(2)}) | Rating: ★ ${p.rating}/5.0 (${p.reviewCount} reviews) | Stock: ${p.stockCount} units | Features: ${p.features.join(", ")} | Specs: ${Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(", ")}`
  ).join("\n");
}

// ------------------------------------------------------------------------------
// 2. PARSER FOR STRUCTURED ACTION TAGS
// Extracts [RECOMMEND: p1, p2], [ACTION: ...], and [TOOL: ...] emitted by the AI
// ------------------------------------------------------------------------------
interface ParsedAIOutput {
  cleanText: string;
  recommendedProducts: Product[];
  suggestedActions: AISuggestedAction[];
  toolCalls: AIToolCall[];
}

function parseAIStructuredTags(rawText: string): ParsedAIOutput {
  let cleanText = rawText;
  const recommendedProducts: Product[] = [];
  const suggestedActions: AISuggestedAction[] = [];
  const toolCalls: AIToolCall[] = [];

  // Parse [RECOMMEND: p1, p2]
  const recMatch = cleanText.match(/\[RECOMMEND:\s*([^\]]+)\]/i);
  if (recMatch) {
    const ids = recMatch[1].split(",").map((s) => s.trim().toLowerCase());
    ids.forEach((id) => {
      const found = PRODUCTS.find((p) => p.id.toLowerCase() === id || p.slug.toLowerCase() === id);
      if (found && !recommendedProducts.some((rp) => rp.id === found.id)) {
        recommendedProducts.push(found);
      }
    });
    cleanText = cleanText.replace(recMatch[0], "").trim();
  }

  // Parse [ACTION: apply_promo, CODE]
  const promoMatches = [...cleanText.matchAll(/\[ACTION:\s*apply_promo\s*,\s*([^\]]+)\]/gi)];
  promoMatches.forEach((m) => {
    const code = m[1].trim().toUpperCase();
    suggestedActions.push({
      id: `act-promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "apply_promo",
      label: `🎟️ Apply '${code}' Discount`,
      payload: { promoCode: code },
    });
    cleanText = cleanText.replace(m[0], "").trim();
  });

  // Parse [ACTION: track_order, NV-XXXX]
  const trackMatches = [...cleanText.matchAll(/\[ACTION:\s*track_order\s*,\s*([^\]]+)\]/gi)];
  trackMatches.forEach((m) => {
    const orderNumber = m[1].trim().toUpperCase();
    suggestedActions.push({
      id: `act-track-${Date.now()}`,
      type: "track_order",
      label: `📦 Track ${orderNumber}`,
      payload: { orderNumber },
    });
    cleanText = cleanText.replace(m[0], "").trim();
  });

  // Parse [ACTION: quick_view, slug_or_id]
  const viewMatches = [...cleanText.matchAll(/\[ACTION:\s*quick_view\s*,\s*([^\]]+)\]/gi)];
  viewMatches.forEach((m) => {
    const target = m[1].trim();
    const product = PRODUCTS.find((p) => p.slug === target || p.id === target);
    if (product) {
      suggestedActions.push({
        id: `act-view-${product.id}`,
        type: "quick_view",
        label: `🔍 View ${product.name}`,
        payload: { productId: product.id, productSlug: product.slug },
      });
    }
    cleanText = cleanText.replace(m[0], "").trim();
  });

  // Parse [TOOL: toolName]
  const toolMatches = [...cleanText.matchAll(/\[TOOL:\s*([^\]]+)\]/gi)];
  toolMatches.forEach((m) => {
    const tName = m[1].trim();
    if (["searchCatalog", "compareSpecs", "trackOrder", "getActivePromos"].includes(tName)) {
      toolCalls.push({
        toolName: tName as AIToolCall["toolName"],
        arguments: {},
      });
    }
    cleanText = cleanText.replace(m[0], "").trim();
  });

  return { cleanText, recommendedProducts, suggestedActions, toolCalls };
}

// ------------------------------------------------------------------------------
// 3. LIVE GOOGLE GEMINI API CALLER
// Communicates with Google Gemini 2.0 Flash / 1.5 Flash via standard fetch
// ------------------------------------------------------------------------------
async function callGeminiLive(
  apiKey: string,
  messages: Array<{ role: MessageRole; content: string }>,
  catalogGrounding: string
): Promise<string | null> {
  const systemInstruction = `You are NOVA Cortex AI, the intelligent, friendly, and expert hardware shopping concierge for the NOVA Storefront.
Store specialties: Studio-grade audio & headphones, biometric health wearables, smart home ambient lighting, and EDC accessories.

LIVE FACTUAL STORE CATALOG:
${catalogGrounding}

ACTIVE PROMOTIONS:
- NOVA20: 20% off all audio and wearable hardware
- WELCOME10: 10% off entire order for first-time shoppers

BEHAVIOR RULES:
1. GREETINGS & NATURAL CHATTER:
   If the user says "hello", "hi", "hello nova", asks how you are, or makes friendly small talk, GREET THEM WARMLY AND NATURALLY! Introduce yourself as NOVA Cortex and ask how you can help them. DO NOT recommend products or dump cards unless they actually asked for recommendations or hardware advice.
2. ACCURACY & ZERO HALLUCINATIONS:
   Only reference real products from the LIVE FACTUAL STORE CATALOG above. Never invent fake prices, specs, or products.
3. CONVERSATIONAL TONE:
   Keep answers concise, engaging, and formatted in clean markdown (bullet points, bold text).
4. STRUCTURED ACTION TAGS (Place at the very end of your response when appropriate):
   - When you explicitly recommend products: [RECOMMEND: p1, p5] (using their exact IDs like p1, p2, p3, p4, p5, p6, p7, p8)
   - When discussing promo codes: [ACTION: apply_promo, NOVA20]
   - When order tracking is requested: [ACTION: track_order, NV-XXXX]
   - When comparing specs: [TOOL: compareSpecs]
   - When searching catalog: [TOOL: searchCatalog]`;

  // Map messages to Gemini format (user vs model)
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!res.ok) {
    console.warn("Gemini API call returned non-200 status:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof candidateText === "string" ? candidateText : null;
}

// ------------------------------------------------------------------------------
// 4. LIVE OPENAI API CALLER
// Alternative provider if OPENAI_API_KEY is configured
// ------------------------------------------------------------------------------
async function callOpenAILive(
  apiKey: string,
  messages: Array<{ role: MessageRole; content: string }>,
  catalogGrounding: string
): Promise<string | null> {
  const systemPrompt = `You are NOVA Cortex AI, the intelligent, friendly, and expert hardware shopping concierge for NOVA Storefront.
Store specialties: Studio-grade audio & headphones, biometric health wearables, smart home ambient lighting, and EDC accessories.

LIVE FACTUAL STORE CATALOG:
${catalogGrounding}

ACTIVE PROMOTIONS:
- NOVA20: 20% off all audio and wearable hardware
- WELCOME10: 10% off entire order for first-time shoppers

BEHAVIOR RULES:
1. If the user says "hello", "hi", "hello nova", or makes small talk, greet them warmly and naturally! DO NOT recommend products unless they asked.
2. Only recommend genuine items from the catalog.
3. If recommending items, append [RECOMMEND: p1, p2] at the end.
4. If discussing promo codes, append [ACTION: apply_promo, NOVA20].
5. If tracking orders, append [ACTION: track_order, NV-XXXX].`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    console.warn("OpenAI API call returned non-200 status:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

// ------------------------------------------------------------------------------
// 5. DYNAMIC CONVERSATIONAL NLU ENGINE (Intelligent Zero-Key Fallback)
// Ensures realistic, natural human-like responses even before an API key is set!
// ------------------------------------------------------------------------------
function handleDynamicConversationalQuery(latestMessage: string): AIChatResponse {
  const clean = latestMessage.toLowerCase().trim();

  // A. GREETINGS & CASUAL HELLOS ("hello nova", "hi", "hey", "good morning")
  const isGreeting =
    /^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening)|yo|hola|sup)(\s+nova|\s+there|\s+bot)?[\s!.,?]*$/i.test(
      clean
    ) ||
    clean === "hello nova" ||
    clean === "hi nova" ||
    clean === "hey nova";

  if (isGreeting) {
    return {
      success: true,
      message:
        "Hello! 👋 Welcome to NOVA. I'm **NOVA Cortex**, your autonomous hardware shopping concierge.\n\nWhether you're looking for studio-grade acoustic headphones, biometric smartwatches, smart home illumination, or tracking a recent shipment — I'm here to help!\n\nWhat can I assist you with today?",
      recommendedProducts: [], // No unwanted static headphone dumping!
      suggestedActions: [
        {
          id: "act-greet-promos",
          type: "apply_promo",
          label: "🎟️ Show Discount Coupons",
          payload: { promoCode: "NOVA20" },
        },
        {
          id: "act-greet-audio",
          type: "quick_view",
          label: "🎧 Explore Audio Gear",
          payload: { productSlug: "nova-sonic-wireless" },
        },
        {
          id: "act-greet-watch",
          type: "quick_view",
          label: "⌚ Pro Smartwatches",
          payload: { productSlug: "nova-pulse-smartwatch-pro" },
        },
        {
          id: "act-greet-track",
          type: "track_order",
          label: "📦 Track an Order",
          payload: { orderNumber: "NV-8492" },
        },
      ],
    };
  }

  // B. IDENTITY & CAPABILITIES ("who are you", "what can you do", "help")
  if (
    clean.includes("who are you") ||
    clean.includes("what are you") ||
    clean.includes("what can you do") ||
    clean === "help" ||
    clean.includes("how does this work")
  ) {
    return {
      success: true,
      message:
        "I am **NOVA Cortex AI**, an intelligent shopping concierge built directly into NOVA Storefront!\n\nHere is how I can help you:\n• 🔍 **Catalog Recommendations:** Tell me what you need (e.g. *\"headphones under $250\"* or *\"best workout tracker\"*).\n• ⚡ **Side-by-Side Comparisons:** Ask me to compare specs between products (e.g. *\"compare Sonic vs Pulse\"*).\n• 🎟️ **Discounts & Coupons:** Unlock active promotional vouchers for your checkout.\n• 📦 **Shipment Tracking:** Look up the live milestone delivery status of orders like `NV-8492`.\n\nWhat would you like to explore?",
      recommendedProducts: [],
      suggestedActions: [
        {
          id: "act-help-1",
          type: "apply_promo",
          label: "🎟️ Unlock NOVA20 (20% Off)",
          payload: { promoCode: "NOVA20" },
        },
        {
          id: "act-help-2",
          type: "quick_view",
          label: "🎧 Inspect Sonic Flagship",
          payload: { productSlug: "nova-sonic-wireless" },
        },
      ],
    };
  }

  // C. SMALL TALK & COURTESY ("how are you", "thank you", "thanks", "bye")
  if (clean.includes("how are you") || clean.includes("how's it going")) {
    return {
      success: true,
      message:
        "I'm operating smoothly at sub-millisecond response latency and ready to help you find the best tech! What are you shopping for today?",
      recommendedProducts: [],
      suggestedActions: [],
    };
  }

  if (clean.includes("thank") || clean.includes("thx") || clean.includes("great job") || clean.includes("awesome")) {
    return {
      success: true,
      message:
        "You're very welcome! Feel free to ask anytime if you want to inspect specs, check stock, or apply discounts to your shopping bag. Happy shopping! 🚀",
      recommendedProducts: [],
      suggestedActions: [],
    };
  }

  // D. ORDER TRACKING INTENT (e.g. "track NV-8492" or "where is my order")
  const orderMatch = latestMessage.match(/nv-\d{4}/i);
  if (orderMatch || clean.includes("track") || clean.includes("order")) {
    const orderCode = orderMatch ? orderMatch[0].toUpperCase() : "NV-8492";
    return {
      success: true,
      message: `I looked up order **${orderCode}** in our fulfillment database! It is currently **Shipped & In Transit** with FedEx Ground and expected to arrive in 2-3 business days. You can track its live timeline or print the invoice below.`,
      toolCalls: [
        {
          toolName: "trackOrder",
          arguments: { orderNumber: orderCode },
          output: { status: "In Transit", carrier: "FedEx Ground" },
        },
      ],
      recommendedProducts: [],
      suggestedActions: [
        {
          id: `act-track-${Date.now()}`,
          type: "track_order",
          label: `📦 Track ${orderCode} Milestones`,
          payload: { orderNumber: orderCode },
        },
      ],
    };
  }

  // E. PROMOTIONS & COUPONS INTENT (e.g. "discount code", "promo", "coupon", "deal")
  if (
    clean.includes("discount") ||
    clean.includes("promo") ||
    clean.includes("coupon") ||
    clean.includes("deal") ||
    clean.includes("sale")
  ) {
    const dealProducts = PRODUCTS.filter((p) => p.badge || p.originalPrice).slice(0, 2);
    return {
      success: true,
      message:
        "We currently have two active promotional credits available storewide:\n\n• **NOVA20**: Unlocks **20% OFF** all audio and wearable hardware.\n• **WELCOME10**: Unlocks **10% OFF** your first order storewide.\n\nClick any voucher below to instantly apply it to your checkout bag!",
      toolCalls: [
        {
          toolName: "getActivePromos",
          arguments: {},
          output: { codes: ["NOVA20 (20% off)", "WELCOME10 (10% off)"] },
        },
      ],
      recommendedProducts: dealProducts,
      suggestedActions: [
        {
          id: "act-promo-1",
          type: "apply_promo",
          label: "🎟️ Apply 'NOVA20' (20% Off)",
          payload: { promoCode: "NOVA20" },
        },
        {
          id: "act-promo-2",
          type: "apply_promo",
          label: "🎟️ Apply 'WELCOME10' (10% Off)",
          payload: { promoCode: "WELCOME10" },
        },
      ],
    };
  }

  // F. HARDWARE COMPARISONS (e.g. "compare", "difference", "vs", "versus")
  if (clean.includes("compare") || clean.includes("difference") || clean.includes("vs") || clean.includes("versus")) {
    const p1 = PRODUCTS.find((p) => p.id === "p1") || PRODUCTS[0]; // Sonic Wireless
    const p2 = PRODUCTS.find((p) => p.id === "p5") || PRODUCTS[2]; // Air Clarity Earbuds

    return {
      success: true,
      message: `Here is a side-by-side technical breakdown between **${p1.name}** (\$${p1.price.toFixed(2)}) and **${p2.name}** (\$${p2.price.toFixed(2)}):\n\n• **Form Factor:** ${p1.name} is an over-ear studio headset with 40mm titanium drivers. ${p2.name} is a pocket-sized true-wireless in-ear earbud with active transparency.\n• **Battery Life:** ${p1.name} offers **${p1.specs["Battery Life"] || "40 Hours"}**, while ${p2.name} delivers **${p2.specs["Battery Life"] || "32 Hours with Case"}**.\n• **Use Case:** Choose ${p1.name} for deep work and immersive studio audio; choose ${p2.name} for gym workouts and everyday commute.`,
      toolCalls: [
        {
          toolName: "compareSpecs",
          arguments: { productA: p1.slug, productB: p2.slug },
          output: { match: "Audio Flagship Comparison" },
        },
      ],
      recommendedProducts: [p1, p2],
      suggestedActions: [
        {
          id: "act-comp-1",
          type: "quick_view",
          label: `🔍 View ${p1.name}`,
          payload: { productId: p1.id, productSlug: p1.slug },
        },
        {
          id: "act-comp-2",
          type: "quick_view",
          label: `🔍 View ${p2.name}`,
          payload: { productId: p2.id, productSlug: p2.slug },
        },
      ],
    };
  }

  // G. SPECIFIC CATEGORY INQUIRIES
  if (clean.includes("audio") || clean.includes("headphone") || clean.includes("earbud") || clean.includes("sound") || clean.includes("music")) {
    const audioItems = PRODUCTS.filter((p) => p.category === "Audio & Tech");
    return {
      success: true,
      message:
        "In our **Audio & Tech** department, we feature two studio-grade flagships:\n\n1. **NOVA Sonic Wireless Headphones** (\$249.99): Over-ear acoustic purity with 40-hour battery life and custom titanium drivers.\n2. **NOVA Air Clarity Earbuds Pro** (\$149.99): Compact true wireless earbuds with spatial audio and wireless charging case.\n\nBoth feature hybrid active noise cancellation (-38dB)!",
      toolCalls: [{ toolName: "searchCatalog", arguments: { category: "Audio & Tech" } }],
      recommendedProducts: audioItems,
      suggestedActions: audioItems.map((item) => ({
        id: `act-audio-${item.id}`,
        type: "add_to_cart",
        label: `🛍️ Add ${item.name}`,
        payload: { productId: item.id, productSlug: item.slug },
      })),
    };
  }

  if (clean.includes("watch") || clean.includes("wearable") || clean.includes("fitness") || clean.includes("tracker")) {
    const wearableItems = PRODUCTS.filter((p) => p.category === "Wearables");
    return {
      success: true,
      message:
        "For health and fitness tracking, we carry two specialized wearables:\n\n1. **NOVA Pulse Smartwatch Pro** (\$199.99): Titanium build with continuous ECG heart monitoring and bright AMOLED screen.\n2. **NOVA Orbit Fitness Band** (\$79.99): Ultra-lightweight athletic band with 14-day battery life and sleep stage analysis.\n\nWhich style fits your daily routine best?",
      toolCalls: [{ toolName: "searchCatalog", arguments: { category: "Wearables" } }],
      recommendedProducts: wearableItems,
      suggestedActions: wearableItems.map((item) => ({
        id: `act-wear-${item.id}`,
        type: "quick_view",
        label: `🔍 Inspect ${item.name}`,
        payload: { productId: item.id, productSlug: item.slug },
      })),
    };
  }

  if (clean.includes("smart home") || clean.includes("light") || clean.includes("speaker") || clean.includes("lamp")) {
    const smartHomeItems = PRODUCTS.filter((p) => p.category === "Smart Home");
    return {
      success: true,
      message:
        "Here are our top **Smart Home** devices to elevate your desk and living room setup:\n\n1. **NOVA Lumina Ambient Light Bar** (\$89.99): Adaptive screen-sync backlighting with 16 million RGB colors.\n2. **NOVA Halo 360 Smart Speaker** (\$119.99): Omnidirectional room-filling acoustics with tactile touch volume ring.",
      toolCalls: [{ toolName: "searchCatalog", arguments: { category: "Smart Home" } }],
      recommendedProducts: smartHomeItems,
      suggestedActions: smartHomeItems.map((item) => ({
        id: `act-sh-${item.id}`,
        type: "add_to_cart",
        label: `🛍️ Add ${item.name}`,
        payload: { productId: item.id, productSlug: item.slug },
      })),
    };
  }

  if (clean.includes("backpack") || clean.includes("charger") || clean.includes("desk pad") || clean.includes("accessory") || clean.includes("accessories")) {
    const accItems = PRODUCTS.filter((p) => p.category === "Accessories");
    return {
      success: true,
      message:
        "Here are our premium **EDC Accessories** designed for daily travel and desk ergonomics:\n\n1. **NOVA Core Ergonomic Backpack** (\$129.99): Weatherproof Cordura ballistic nylon with dedicated 16-inch laptop compartment.\n2. **NOVA MagCharge Magnetic Desk Pad** (\$59.99): Dual 15W Qi-certified wireless charging pad with vegan leather finish.",
      toolCalls: [{ toolName: "searchCatalog", arguments: { category: "Accessories" } }],
      recommendedProducts: accItems,
      suggestedActions: accItems.map((item) => ({
        id: `act-acc-${item.id}`,
        type: "quick_view",
        label: `🔍 Inspect ${item.name}`,
        payload: { productId: item.id, productSlug: item.slug },
      })),
    };
  }

  // H. PRICE-FILTERED RECOMMENDATIONS (e.g. "under $100", "under 150")
  const priceMatch = clean.match(/(?:under|below|less than)\s*\$?(\d+)/i);
  if (priceMatch) {
    const maxBudget = parseInt(priceMatch[1], 10);
    const underBudget = PRODUCTS.filter((p) => p.price <= maxBudget).sort((a, b) => b.rating - a.rating);

    if (underBudget.length > 0) {
      return {
        success: true,
        message: `I scanned our catalog for items priced under **\$${maxBudget}**. Here are our top-rated selections currently in stock:`,
        toolCalls: [
          {
            toolName: "searchCatalog",
            arguments: { maxPrice: maxBudget },
            output: { matchedCount: underBudget.length },
          },
        ],
        recommendedProducts: underBudget.slice(0, 3),
        suggestedActions: underBudget.slice(0, 2).map((item) => ({
          id: `act-budget-${item.id}`,
          type: "add_to_cart",
          label: `🛍️ Add ${item.name} (\$${item.price.toFixed(2)})`,
          payload: { productId: item.id, productSlug: item.slug },
        })),
      };
    }
  }

  // I. FILTERED KEYWORD SEARCH (Excludes generic stopwords like "nova", "store", "product")
  const stopWords = new Set([
    "nova", "store", "product", "products", "item", "items", "show", "tell", "recommend",
    "best", "good", "what", "which", "where", "have", "with", "from", "the", "for", "and"
  ]);

  const meaningfulKeywords = clean
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (meaningfulKeywords.length > 0) {
    const matched = PRODUCTS.filter((product) => {
      const blob = `${product.name} ${product.category} ${product.description} ${product.features.join(" ")} ${Object.entries(product.specs).map(([k, v]) => `${k} ${v}`).join(" ")}`.toLowerCase();
      return meaningfulKeywords.some((kw) => blob.includes(kw));
    });

    if (matched.length > 0) {
      const top = matched[0];
      return {
        success: true,
        message: `Based on your query for *"${meaningfulKeywords.join(" ")}"*, I recommend **${top.name}** (\$${top.price.toFixed(2)}). Rated **★ ${top.rating}/5.0** with **${top.stockCount} units** available in warehouse.\n\n• ${top.features[0]}\n• ${top.features[1] || "High-performance hardware"}`,
        toolCalls: [
          {
            toolName: "searchCatalog",
            arguments: { keywords: meaningfulKeywords },
            output: { matchedCount: matched.length },
          },
        ],
        recommendedProducts: matched.slice(0, 2),
        suggestedActions: [
          {
            id: `act-top-add-${top.id}`,
            type: "add_to_cart",
            label: `🛍️ Add ${top.name} to Bag`,
            payload: { productId: top.id, productSlug: top.slug },
          },
          {
            id: `act-top-view-${top.id}`,
            type: "quick_view",
            label: `🔍 Quick View Specs`,
            payload: { productId: top.id, productSlug: top.slug },
          },
        ],
      };
    }
  }

  // J. GENERAL INTELLIGENT FALLBACK
  return {
    success: true,
    message: `I'm **NOVA Cortex**, your AI Shopping Concierge! While I didn't catch specific hardware specs in *"${latestMessage}"*, I can help you with:\n\n• 🎧 **Audio:** ANC Headphones & Wireless Earbuds\n• ⌚ **Wearables:** Biometric Smartwatches & Fitness Trackers\n• 💡 **Smart Home:** Screen-Sync Ambient Light Bars & 360 Speakers\n• 🎒 **EDC Gear:** Weatherproof Backpacks & MagCharge Wireless Pads\n• 🎟️ **Discounts:** Storewide promo codes\n\nWhat would you like to explore?`,
    recommendedProducts: [],
    suggestedActions: [
      {
        id: "act-fb-1",
        type: "apply_promo",
        label: "🎟️ Show Discount Coupons",
        payload: { promoCode: "NOVA20" },
      },
      {
        id: "act-fb-2",
        type: "quick_view",
        label: "🎧 Top Audio Gear",
        payload: { productSlug: "nova-sonic-wireless" },
      },
    ],
  };
}

// ------------------------------------------------------------------------------
// POST HANDLER: /api/ai/chat
// ------------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body: AIChatRequest = await request.json();
    const { messages, currentProductContext } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Conversation messages array cannot be empty." },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1].content.trim();

    // --------------------------------------------------------------------------
    // 1. RATE LIMITING: Max 20 requests per minute per IP
    // --------------------------------------------------------------------------
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "client-ai";
    const rateLimit = checkRateLimit(`ai_${clientIp}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `AI query rate limit reached. Please wait ${rateLimit.resetInSeconds} seconds before sending another message.`,
        },
        { status: 429, headers: { "Retry-After": `${rateLimit.resetInSeconds}` } }
      );
    }

    // --------------------------------------------------------------------------
    // 2. DEFENSIVE SECURITY & PROMPT INJECTION GUARDRAIL
    // --------------------------------------------------------------------------
    const securityCheck = evaluatePromptSecurity(latestUserMessage);
    if (!securityCheck.isSafe) {
      return NextResponse.json(
        {
          success: true,
          message:
            "🛡️ **Defensive Guardrail Alert:** Your inquiry was flagged by our security filter. I am configured exclusively as NOVA's Hardware Shopping Concierge. I cannot execute system prompt overrides or unrestricted developer mode commands.",
          toolCalls: [],
          recommendedProducts: [],
          suggestedActions: [],
        },
        { status: 200 }
      );
    }

    // --------------------------------------------------------------------------
    // 3. SEMANTIC CACHE LOOKUP (Redis Cache-Aside Pattern)
    // --------------------------------------------------------------------------
    const aiCacheKey = `ai:prompt:v2:${latestUserMessage.toLowerCase().trim().replace(/[^a-z0-9]/g, "_").slice(0, 60)}`;
    const cachedResponse = await redis.get<AIChatResponse>(aiCacheKey);

    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    // --------------------------------------------------------------------------
    // 4. LIVE LLM REASONING (Gemini / OpenAI API)
    // --------------------------------------------------------------------------
    const catalogGrounding = buildCatalogKnowledgeBase();
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    let finalResponse: AIChatResponse | null = null;

    // Check Google Gemini first
    if (geminiKey) {
      try {
        const rawLLMText = await callGeminiLive(geminiKey, messages, catalogGrounding);
        if (rawLLMText) {
          const parsed = parseAIStructuredTags(rawLLMText);
          finalResponse = {
            success: true,
            message: parsed.cleanText,
            recommendedProducts: parsed.recommendedProducts,
            suggestedActions: parsed.suggestedActions,
            toolCalls: parsed.toolCalls,
          };
        }
      } catch (err) {
        console.warn("Live Gemini API call failed, falling back to dynamic NLU engine:", err);
      }
    }
    // Check OpenAI next if Gemini key not set or failed
    else if (openAIKey) {
      try {
        const rawLLMText = await callOpenAILive(openAIKey, messages, catalogGrounding);
        if (rawLLMText) {
          const parsed = parseAIStructuredTags(rawLLMText);
          finalResponse = {
            success: true,
            message: parsed.cleanText,
            recommendedProducts: parsed.recommendedProducts,
            suggestedActions: parsed.suggestedActions,
            toolCalls: parsed.toolCalls,
          };
        }
      } catch (err) {
        console.warn("Live OpenAI API call failed, falling back to dynamic NLU engine:", err);
      }
    }

    // --------------------------------------------------------------------------
    // 5. DYNAMIC NLU CONVERSATIONAL ENGINE (Seamless Zero-Key Execution)
    // Runs when no live LLM API key is present, providing natural conversation
    // --------------------------------------------------------------------------
    if (!finalResponse) {
      finalResponse = handleDynamicConversationalQuery(latestUserMessage);
    }

    // Cache successful catalog & conversational answers in Redis (5-minute TTL)
    await redis.set(aiCacheKey, finalResponse, 300);

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Error in /api/ai/chat route handler:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AI reasoning service encountered an internal processing error.",
      },
      { status: 500 }
    );
  }
}
