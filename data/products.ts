// ==============================================================================
// FILE: data/products.ts
// ARCHITECTURE ROLE: In-Memory Database Catalog & Product Lookup Functions
//
// ROUTE MAP & COMPONENT USAGE:
//   1. Provides mock database arrays (`CATEGORIES`, `PRODUCTS`) imported across:
//      - Homepage (`app/page.tsx`, `HeroSection.tsx`, `FeaturedProducts.tsx`)
//      - Dynamic Product Detail Pages (`app/products/[slug]/page.tsx`)
//      - Search Modal (`components/catalog/SearchModal.tsx`)
//      - Wishlist & Cart Drawers (`WishlistDrawer.tsx`, `CartDrawer.tsx`)
//   2. Day 5 Update: Includes realistic verified customer review arrays (`Review[]`)
//      with rating scores, helpful votes, and author avatars.
// ==============================================================================

import { Product, Category } from "../types/product";

/**
 * Array of store category departments.
 */
export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Audio & Tech",
    slug: "audio-tech",
    itemCount: 24,
    gradient: "from-blue-600 to-indigo-700",
    description: "High-fidelity wireless sound, spatial audio, and hybrid active noise cancellation gear.",
  },
  {
    id: "2",
    name: "Wearables",
    slug: "wearables",
    itemCount: 18,
    gradient: "from-purple-600 to-pink-600",
    description: "Next-gen smartwatches with continuous ECG, SpO2, and dual-frequency GPS tracking.",
  },
  {
    id: "3",
    name: "Smart Home",
    slug: "smart-home",
    itemCount: 32,
    gradient: "from-emerald-600 to-teal-700",
    description: "Ambient RGB dynamic lighting, screen-sync bars, and smart home automation devices.",
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    itemCount: 45,
    gradient: "from-amber-500 to-orange-600",
    description: "Weatherproof EDC tech backpacks, wireless charging docks, and protective gear.",
  },
];

/**
 * Main mock products catalog array with full specs, features, prices, and reviews.
 */
export const PRODUCTS: Product[] = [
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
    specs: {
      "Driver Size": "40mm Titanium",
      "Battery": "40 Hours (ANC On)",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.4 / USB-C / 3.5mm",
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
      {
        id: "rev-103",
        author: "David Kim",
        avatar: "DK",
        rating: 4,
        date: "2026-09-05",
        title: "Great Build Quality, Sleek Carrying Case",
        comment:
          "Premium materials all around. The touch controls take a day to get used to, but spatial audio mode sounds amazing when watching movies.",
        verifiedPurchase: true,
        helpfulCount: 12,
      },
    ],
  },
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
    specs: {
      "Display": "1.91-inch AMOLED (1000 nits)",
      "Battery": "Up to 7 Days",
      "Water Resistance": "50 Meters (5 ATM)",
      "Sensors": "ECG, SpO2, Accelerometer, Gyro",
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
      {
        id: "rev-202",
        author: "Brian Miller",
        avatar: "BM",
        rating: 4,
        date: "2026-09-12",
        title: "Precise GPS tracking for trail running",
        comment:
          "Dual frequency GPS locked onto satellites in under 5 seconds during my mountain trail run. Very satisfied with the health metrics.",
        verifiedPurchase: true,
        helpfulCount: 15,
      },
    ],
  },
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
    specs: {
      "Power": "15W USB-C Powered",
      "Lifespan": "50,000 Hours",
      "Compatibility": "Monitors 24 - 34 inches",
      "Connectivity": "Wi-Fi 2.4GHz + Bluetooth",
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
    specs: {
      "Capacity": "24 Liters",
      "Weight": "1.1 kg",
      "Laptop Fit": "Up to 16-inch MacBook Pro",
      "Material": "Waterproof Cordura Nylon",
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
          "Fits my 16-inch laptop, tablet, mechanical keyboard, and cables cleanly. Water resistance saved my gear during a heavy rainstorm last week.",
        verifiedPurchase: true,
        helpfulCount: 41,
      },
    ],
  },
];

/**
 * Lookup Helper: Finds a product object matching a given URL slug.
 * @param slug Dynamic route parameter string e.g. "nova-sonic-wireless"
 * @returns Product object if found, or undefined if not matched.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
