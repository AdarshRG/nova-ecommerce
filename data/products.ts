// ==============================================================================
// FILE: data/products.ts
// ARCHITECTURE ROLE: In-Memory Database Catalog & High-Performance Lookup Layer
//
// 🎓 BEGINNER'S GUIDE TO THIS FILE:
//   What is an "In-Memory Database"?
//     In production apps, products usually live inside an external database (like PostgreSQL or MySQL).
//     During development, we store our items in JavaScript arrays right here in memory (`const PRODUCTS = [...]`).
//     This allows our application to run blazingly fast without needing to connect to an external server.
//   How does Next.js use this data?
//     1. Server Components (`app/page.tsx`) import `PRODUCTS` directly to render the page HTML on Node.js.
//     2. Dynamic Routes (`app/products/[slug]`) call `getProductBySlug("nova-sonic-wireless")`
//        to find the specific product that matches the URL.
//     3. The `.find()` and `.filter()` methods are standard JavaScript functions:
//        - `.find()` returns the FIRST matching item.
//        - `.filter()` returns ALL items that match the condition.
// ==============================================================================

import { Product, Category } from "../types/product";

/**
 * CATEGORIES: Master catalog of store departments.
 * Used for top-level navigation, department grid cards, and dynamic SSG route pre-rendering.
 */
export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Audio & Tech",
    slug: "audio-tech",
    itemCount: 24,
    gradient: "from-blue-600 via-indigo-600 to-indigo-800",
    description: "Studio-grade wireless sound, active hybrid noise cancellation, and spatial acoustics.",
  },
  {
    id: "2",
    name: "Wearables",
    slug: "wearables",
    itemCount: 18,
    gradient: "from-purple-600 via-pink-600 to-rose-700",
    description: "Biometric health trackers with continuous ECG, dual-frequency GPS, and AMOLED displays.",
  },
  {
    id: "3",
    name: "Smart Home",
    slug: "smart-home",
    itemCount: 32,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    description: "Adaptive screen-sync backlighting, ambient RGB optics, and automated smart ecosystems.",
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    itemCount: 45,
    gradient: "from-amber-500 via-orange-600 to-amber-700",
    description: "Ballistic weatherproof Cordura EDC packs, magnetic wireless charging docks, and organizer gear.",
  },
];

/**
 * PRODUCTS: Master in-memory product database array.
 * Each item contains detailed specifications, color finishes, and verified customer reviews.
 */
export const PRODUCTS: Product[] = [
  // ----------------------------------------------------------------------------
  // ITEM 1: Audio & Tech Flagship Headphones
  // ----------------------------------------------------------------------------
  {
    id: "p1",
    slug: "nova-sonic-wireless",
    name: "NOVA Sonic Wireless Headphones",
    category: "Audio & Tech",
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.9,
    reviewCount: 142,
    imageBg: "bg-slate-900",
    icon: "🎧",
    description:
      "Engineered for acoustic purity. Features active hybrid noise cancellation, custom 40mm titanium drivers, and an astonishing 40-hour continuous battery life.",
    features: [
      "Hybrid Active Noise Cancellation (ANC)",
      "40 Hours Battery Life with Fast Charge",
      "Bluetooth 5.4 with Spatial Audio Support",
      "Memory Foam Ear Cushions",
    ],
    colorVariants: [
      { name: "Space Black", hex: "#0f172a", bgClass: "bg-slate-900" },
      { name: "Titanium Silver", hex: "#94a3b8", bgClass: "bg-slate-400" },
      { name: "Midnight Indigo", hex: "#1e1b4b", bgClass: "bg-indigo-950" },
    ],
    specs: {
      "Primary Driver": "40mm Titanium Acoustic Drivers",
      "Battery Life": "40 Hours (ANC On) / 55 Hours (ANC Off)",
      "Weight": "250g Ultra-lightweight",
      "Connectivity": "Bluetooth 5.4 / USB-C Lossless / 3.5mm",
      "Noise Cancellation": "Hybrid Active ANC (-38 dB)",
      "Water Resistance": "IPX4 Splash Resistant",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "BEST SELLER",
    badge: "SAVE $50",
    inStock: true,
    stockCount: 14,
    reviews: [
      {
        id: "rev-101",
        author: "Marcus Vance",
        avatar: "MV",
        rating: 5,
        date: "2026-09-24",
        title: "Phenomenal Noise Cancellation & Soundstage",
        comment:
          "The noise cancellation easily rivals top tier flagship brands. The bass is clean and warm without muddying the mids. 40-hour battery life is 100% accurate!",
        verifiedPurchase: true,
        helpfulCount: 34,
      },
      {
        id: "rev-102",
        author: "Sarah Jenkins",
        avatar: "SJ",
        rating: 5,
        date: "2026-09-18",
        title: "Super Comfortable For All-Day Office Work",
        comment:
          "I wear these for 8+ hours a day during remote calls. The memory foam cushions don't squeeze your head, and the mic quality is crisp.",
        verifiedPurchase: true,
        helpfulCount: 19,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 2: Wearables Flagship Smartwatch
  // ----------------------------------------------------------------------------
  {
    id: "p2",
    slug: "nova-pulse-smartwatch-pro",
    name: "NOVA Pulse Smartwatch Pro",
    category: "Wearables",
    price: 199.5,
    originalPrice: 239.0,
    rating: 4.8,
    reviewCount: 98,
    imageBg: "bg-slate-900",
    icon: "⌚",
    description:
      "Advanced health monitoring on your wrist. Features an Ultra HD AMOLED sapphire glass display, ECG heart monitoring, SPO2 sensor, and dual-frequency GPS.",
    features: [
      "1.9-inch Ultra HD AMOLED Display",
      "Continuous ECG & Heart Rate Tracking",
      "Dual-Frequency GPS for Precise Tracking",
      "50m Water Resistance (5 ATM)",
    ],
    colorVariants: [
      { name: "Stealth Obsidian", hex: "#18181b", bgClass: "bg-zinc-900" },
      { name: "Arctic Platinum", hex: "#cbd5e1", bgClass: "bg-slate-300" },
      { name: "Rose Blush", hex: "#fb7185", bgClass: "bg-rose-400" },
    ],
    specs: {
      "Primary Driver": "1.91-inch AMOLED Sapphire Glass (1000 nits)",
      "Battery Life": "Up to 7 Days Standard Use",
      "Weight": "48g (Body only)",
      "Connectivity": "Bluetooth 5.3 Low Energy + Wi-Fi",
      "Noise Cancellation": "Dual-Mic Call Noise Reduction",
      "Water Resistance": "50 Meters (5 ATM / IP68)",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "NEW ARRIVAL",
    badge: "15% OFF",
    inStock: true,
    stockCount: 6,
    reviews: [
      {
        id: "rev-201",
        author: "Elena Rostova",
        avatar: "ER",
        rating: 5,
        date: "2026-09-29",
        title: "Incredible AMOLED Display & Battery Life",
        comment:
          "Screen is bright even under direct sunlight. Battery lasts easily 6 days on a single charge with continuous heart rate monitoring enabled.",
        verifiedPurchase: true,
        helpfulCount: 22,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 3: Smart Home Dynamic Light Bar
  // ----------------------------------------------------------------------------
  {
    id: "p3",
    slug: "nova-lumina-light-bar",
    name: "NOVA Lumina Ambient Light Bar",
    category: "Smart Home",
    price: 89.0,
    originalPrice: 109.0,
    rating: 4.7,
    reviewCount: 76,
    imageBg: "bg-slate-900",
    icon: "💡",
    description:
      "Transform your workspace with intelligent dynamic backlighting. Syncs with screen colors, music beats, and voice commands.",
    features: [
      "Screen-Sync Color Matching Technology",
      "16 Million RGB Colors + Warm White",
      "Smart App & Voice Control (Alexa/Siri)",
      "Zero Screen Glare Optical Design",
    ],
    colorVariants: [
      { name: "Matte Graphite", hex: "#27272a", bgClass: "bg-zinc-800" },
      { name: "Frosted Lunar", hex: "#f8fafc", bgClass: "bg-slate-100" },
    ],
    specs: {
      "Primary Driver": "16 Million RGB Optical LEDs + Warm White",
      "Battery Life": "15W USB-C Continuous Powered",
      "Weight": "420g Counterbalanced Aluminum",
      "Connectivity": "Wi-Fi 2.4GHz + Bluetooth Mesh",
      "Noise Cancellation": "N/A (Optical Hardware)",
      "Water Resistance": "Dry Indoor Use Only",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "POPULAR",
    badge: "HOT DEAL",
    inStock: true,
    stockCount: 22,
    reviews: [
      {
        id: "rev-301",
        author: "Chris Taylor",
        avatar: "CT",
        rating: 5,
        date: "2026-09-20",
        title: "Must-have setup upgrade for night coding",
        comment:
          "Reduces eye strain completely when working at night. Screen color sync works flawlessly with zero lag!",
        verifiedPurchase: true,
        helpfulCount: 18,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 4: Accessories Tech Backpack
  // ----------------------------------------------------------------------------
  {
    id: "p4",
    slug: "nova-core-backpack",
    name: "NOVA Core Ergonomic Backpack",
    category: "Accessories",
    price: 119.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviewCount: 215,
    imageBg: "bg-slate-900",
    icon: "🎒",
    description:
      "Built for tech professionals on the go. Weather-proof Cordura fabric, padded 16-inch laptop compartment, and hidden RFID anti-theft pocket.",
    features: [
      "Waterproof 1000D Cordura Nylon Construction",
      "Dedicated TSA-friendly 16-inch Laptop Sleeve",
      "Integrated USB-C External Charging Port",
      "Ergonomic Weight-Balance Shoulder Straps",
    ],
    colorVariants: [
      { name: "Ballistic Black", hex: "#09090b", bgClass: "bg-zinc-950" },
      { name: "Tactical Olive", hex: "#365314", bgClass: "bg-lime-950" },
      { name: "Shadow Navy", hex: "#172554", bgClass: "bg-blue-950" },
    ],
    specs: {
      "Primary Driver": "1000D Ballistic Cordura Fabric Chassis",
      "Battery Life": "Pass-Through Integrated USB-C Hub",
      "Weight": "1.1 kg Ergonomic Frame",
      "Connectivity": "USB-C Passthrough Port + RFID Shield",
      "Noise Cancellation": "N/A (Ballistic Gear)",
      "Water Resistance": "Weatherproof Hydrophobic Coating",
      "Warranty": "Lifetime Craftsmanship Warranty",
    },
    tag: "TOP RATED",
    badge: "LIMITED",
    inStock: true,
    stockCount: 4,
    reviews: [
      {
        id: "rev-401",
        author: "Jessica Martinez",
        avatar: "JM",
        rating: 5,
        date: "2026-09-27",
        title: "Best EDC Tech Backpack I've Owned",
        comment:
          "Fits my 16-inch laptop, tablet, mechanical keyboard, and cables cleanly. Water resistance saved my gear during heavy rain.",
        verifiedPurchase: true,
        helpfulCount: 41,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 5: Audio & Tech Wireless Earbuds
  // ----------------------------------------------------------------------------
  {
    id: "p5",
    slug: "nova-air-clarity-earbuds",
    name: "NOVA Air Clarity Earbuds Pro",
    category: "Audio & Tech",
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.8,
    reviewCount: 88,
    imageBg: "bg-slate-900",
    icon: "🎵",
    description:
      "Ultra-compact true wireless earbuds with adaptive transparency mode, 11mm graphene drivers, and Qi wireless charging case.",
    features: [
      "Adaptive Active Noise Cancellation & Transparency",
      "32 Hours Total Playback with Wireless Charging Case",
      "Custom 11mm Graphene High-Resolution Drivers",
      "IPX5 Sweat & Water Resistance",
    ],
    colorVariants: [
      { name: "Ceramic Pearl", hex: "#f1f5f9", bgClass: "bg-slate-100" },
      { name: "Gloss Phantom", hex: "#020617", bgClass: "bg-slate-950" },
      { name: "Sage Emerald", hex: "#14532d", bgClass: "bg-emerald-900" },
    ],
    specs: {
      "Primary Driver": "11mm Graphene Acoustic Drivers",
      "Battery Life": "8h Earbuds + 24h Wireless Case (32h Total)",
      "Weight": "4.2g per earbud (42g with case)",
      "Connectivity": "Bluetooth 5.4 + Qi Wireless / USB-C",
      "Noise Cancellation": "Adaptive Active Noise Cancellation (-35 dB)",
      "Water Resistance": "IPX5 Sweat & Rain Resistant",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "COMPACT FLAGSHIP",
    badge: "SAVE $30",
    inStock: true,
    stockCount: 19,
    reviews: [
      {
        id: "rev-501",
        author: "Tyler Adams",
        avatar: "TA",
        rating: 5,
        date: "2026-10-02",
        title: "Crystal Clear Voice Mics & Punchy Bass",
        comment:
          "These stay locked in my ears during HIIT workouts. The transparency mode sounds completely natural like you're not wearing anything.",
        verifiedPurchase: true,
        helpfulCount: 26,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 6: Wearables Fitness Band
  // ----------------------------------------------------------------------------
  {
    id: "p6",
    slug: "nova-orbit-fitness-band",
    name: "NOVA Orbit Fitness Band",
    category: "Wearables",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviewCount: 64,
    imageBg: "bg-slate-900",
    icon: "🏃",
    description:
      "Featherweight fitness tracker designed for 24/7 recovery tracking, sleep cycle analysis, continuous skin temperature, and 14-day battery life.",
    features: [
      "14-Day Ultra Long Endurance Battery",
      "Continuous Blood Oxygen (SpO2) & Sleep Stages",
      "50+ Dedicated Athletic Exercise Tracking Modes",
      "Slim Curved OLED Touch Panel",
    ],
    colorVariants: [
      { name: "Carbon Slate", hex: "#334155", bgClass: "bg-slate-700" },
      { name: "Crimson Blaze", hex: "#e11d48", bgClass: "bg-rose-600" },
      { name: "Deep Pacific", hex: "#0369a1", bgClass: "bg-sky-700" },
    ],
    specs: {
      "Primary Driver": "1.47-inch Curved OLED Panel",
      "Battery Life": "14 Days Typical Use / 9 Days Heavy",
      "Weight": "24g (With hypoallergenic silicone strap)",
      "Connectivity": "Bluetooth 5.2 Low Energy",
      "Noise Cancellation": "N/A (Wearable Sensor)",
      "Water Resistance": "50 Meters (5 ATM / Swimming Proof)",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "VALUE PICK",
    badge: "20% OFF",
    inStock: true,
    stockCount: 31,
    reviews: [
      {
        id: "rev-601",
        author: "Melissa Scott",
        avatar: "MS",
        rating: 5,
        date: "2026-10-04",
        title: "Battery genuinely lasts two entire weeks!",
        comment:
          "I forgot where I put the charger because I only have to charge it twice a month. Extremely lightweight and comfortable to sleep in.",
        verifiedPurchase: true,
        helpfulCount: 14,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 7: Smart Home 360 Speaker
  // ----------------------------------------------------------------------------
  {
    id: "p7",
    slug: "nova-halo-smart-speaker",
    name: "NOVA Halo 360 Smart Speaker",
    category: "Smart Home",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.8,
    reviewCount: 52,
    imageBg: "bg-slate-900",
    icon: "🔊",
    description:
      "Omnidirectional 360-degree spatial sound system with room-calibration microphones, woven acoustical fabric, and voice assistant integration.",
    features: [
      "Room-Sensing Acoustic Auto-Calibration",
      "Dual Passive Radiators with Deep Sub-Bass",
      "AirPlay 2, Spotify Connect & Multi-Room Audio",
      "Touch-Sensitive Top Optical Volume Ring",
    ],
    colorVariants: [
      { name: "Charcoal Mesh", hex: "#1e293b", bgClass: "bg-slate-800" },
      { name: "Heather Mist", hex: "#64748b", bgClass: "bg-slate-500" },
    ],
    specs: {
      "Primary Driver": "Custom 2.5-inch Woofer + Dual Tweeters",
      "Battery Life": "Continuous AC Wall Adapter Power",
      "Weight": "850g Acoustic Dampened Enclosure",
      "Connectivity": "Wi-Fi 6 + Bluetooth 5.3 + AirPlay 2",
      "Noise Cancellation": "Far-Field Voice Echo Cancellation",
      "Water Resistance": "Indoor Moisture Resistant",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "NEW RELEASE",
    badge: "SAVE $30",
    inStock: true,
    stockCount: 11,
    reviews: [
      {
        id: "rev-701",
        author: "Devon Reed",
        avatar: "DR",
        rating: 5,
        date: "2026-10-05",
        title: "Incredible room-filling sound in a tiny package",
        comment:
          "Pairs with my NOVA Lumina light bar effortlessly. The room calibration makes acoustic guitars sound like the musician is in the room with you.",
        verifiedPurchase: true,
        helpfulCount: 17,
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // ITEM 8: Accessories Magnetic Desk Pad
  // ----------------------------------------------------------------------------
  {
    id: "p8",
    slug: "nova-magcharge-desk-pad",
    name: "NOVA MagCharge Magnetic Desk Pad",
    category: "Accessories",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.7,
    reviewCount: 114,
    imageBg: "bg-slate-900",
    icon: "⚡",
    description:
      "Premium vegan leather workspace mat with modular magnetic wireless charging zone. Powers your smartphone and wireless earbuds simultaneously.",
    features: [
      "Dual 15W Qi Fast Wireless Magnetic Charger",
      "Spill-Resistant Vegan Matte Leather Surface",
      "Smooth Low-Friction Mouse Tracking Area",
      "Concealed Cable Channel & Anti-Slip Base",
    ],
    colorVariants: [
      { name: "Saddle Tan", hex: "#78350f", bgClass: "bg-amber-900" },
      { name: "Midnight Onyx", hex: "#0f172a", bgClass: "bg-slate-900" },
      { name: "Forest Moss", hex: "#064e3b", bgClass: "bg-emerald-950" },
    ],
    specs: {
      "Primary Driver": "Dual 15W Fast Magnetic Induction Coils",
      "Battery Life": "USB-C PD 30W Input Powered",
      "Weight": "650g Weighted Natural Rubber Base",
      "Connectivity": "USB-C Braided Cable (2m included)",
      "Noise Cancellation": "N/A (Workspace Hardware)",
      "Water Resistance": "Spill & Stain Hydrophobic Coating",
      "Warranty": "2-Year Comprehensive Manufacturer Warranty",
    },
    tag: "DESK ESSENTIAL",
    badge: "25% OFF",
    inStock: true,
    stockCount: 28,
    reviews: [
      {
        id: "rev-801",
        author: "Camila Ruiz",
        avatar: "CR",
        rating: 5,
        date: "2026-10-01",
        title: "Cleaned up all the charging cables on my desk",
        comment:
          "Just drop my phone and earbuds on the magnetic corner and they charge fast. Mouse glides like butter on the leather.",
        verifiedPurchase: true,
        helpfulCount: 31,
      },
    ],
  },
];

// ==============================================================================
// CATALOG LOOKUP HELPER UTILITIES
// 🎓 Explanation: These helper functions give us quick ways to query our mock database!
// ==============================================================================

/**
 * getProductBySlug(slug)
 * Finds a product matching a specific URL slug.
 * Example: `getProductBySlug("nova-sonic-wireless")` returns the headphones object.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * getCategoryBySlug(slug)
 * Finds a category matching a specific category slug.
 * Example: `getCategoryBySlug("audio-tech")` returns the Audio & Tech category object.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/**
 * getProductsByCategory(categoryName)
 * Returns all products that belong to a specific department.
 * Example: `getProductsByCategory("Audio & Tech")` returns headphones and earbuds.
 */
export function getProductsByCategory(categoryName: string): Product[] {
  return PRODUCTS.filter((p) => p.category.toLowerCase() === categoryName.toLowerCase());
}
