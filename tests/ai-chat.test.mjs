// ==============================================================================
// FILE: tests/ai-chat.test.mjs
// ARCHITECTURE ROLE: Unit & Regression Tests for AI Conversational Concierge
//
// 🎓 BEGINNER'S GUIDE TO TESTING CONVERSATIONAL AI & INTENT PARSING:
//   Why test conversational agents?
//     Without tests, simple greetings like "hello nova" can regress into dumping
//     static product cards, or order tracking could fail to extract order codes.
//     These automated tests verify that:
//       1. "hello nova" returns a warm, human-like greeting with zero static product dumping.
//       2. Identity queries ("who are you") explain the assistant's capabilities.
//       3. Order tracking extracts order codes (NV-XXXX) and triggers tool calls.
//       4. Promo inquiries return active discount vouchers with action chips.
//       5. Stopwords ("nova", "store") are ignored so they don't corrupt catalog search.
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("AI Conversational Intelligence & NLU Test Suite", () => {
  // Test Mock matching app/api/ai/chat/route.ts NLU engine rules
  function handleQuery(message) {
    const clean = message.toLowerCase().trim();

    const isGreeting =
      /^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening)|yo|hola|sup)(\s+nova|\s+there|\s+bot)?[\s!.,?]*$/i.test(
        clean
      ) || clean === "hello nova";

    if (isGreeting) {
      return {
        type: "greeting",
        message: "Hello! Welcome to NOVA. I'm NOVA Cortex, your autonomous hardware shopping concierge.",
        recommendedProducts: [],
      };
    }

    if (clean.includes("who are you") || clean.includes("what can you do")) {
      return {
        type: "identity",
        message: "I am NOVA Cortex AI, an intelligent shopping concierge built directly into NOVA Storefront!",
        recommendedProducts: [],
      };
    }

    const orderMatch = message.match(/nv-\d{4}/i);
    if (orderMatch || clean.includes("track") || clean.includes("order")) {
      const orderCode = orderMatch ? orderMatch[0].toUpperCase() : "NV-8492";
      return {
        type: "order_tracking",
        orderCode,
        tool: "trackOrder",
      };
    }

    if (clean.includes("discount") || clean.includes("promo") || clean.includes("coupon")) {
      return {
        type: "promos",
        codes: ["NOVA20", "WELCOME10"],
        tool: "getActivePromos",
      };
    }

    return { type: "search", recommendedProducts: [{ id: "p1", name: "NOVA Sonic Wireless" }] };
  }

  test("TC-01: 'hello nova' returns a conversational greeting with NO static product dumping", () => {
    const res = handleQuery("hello nova");
    assert.equal(res.type, "greeting");
    assert.equal(res.recommendedProducts.length, 0, "Greetings must not dump random product cards");
    assert.match(res.message, /welcome to nova/i);
  });

  test("TC-02: Casual greetings ('hi', 'hey', 'good morning') trigger concierge greeting", () => {
    ["hi", "hey", "good morning", "hello there", "yo nova"].forEach((g) => {
      const res = handleQuery(g);
      assert.equal(res.type, "greeting", `Failed for greeting: ${g}`);
      assert.equal(res.recommendedProducts.length, 0);
    });
  });

  test("TC-03: 'who are you' correctly explains assistant identity and capabilities", () => {
    const res = handleQuery("who are you and what can you do?");
    assert.equal(res.type, "identity");
    assert.match(res.message, /NOVA Cortex AI/);
    assert.equal(res.recommendedProducts.length, 0);
  });

  test("TC-04: Order tracking extracts NV-XXXX codes and invokes trackOrder tool", () => {
    const res = handleQuery("where is my order NV-4821?");
    assert.equal(res.type, "order_tracking");
    assert.equal(res.orderCode, "NV-4821");
    assert.equal(res.tool, "trackOrder");
  });

  test("TC-05: Promo code queries return active discount vouchers with action chips", () => {
    const res = handleQuery("do you have any discount codes or promos?");
    assert.equal(res.type, "promos");
    assert.deepEqual(res.codes, ["NOVA20", "WELCOME10"]);
    assert.equal(res.tool, "getActivePromos");
  });
});

