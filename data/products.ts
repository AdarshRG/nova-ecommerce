import { Product, Category } from "../types/product";

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Audio & Tech",
    slug: "audio-tech",
    itemCount: 24,
    gradient: "from-blue-600 to-indigo-700",
    description: "High-fidelity wireless sound and active noise cancellation gear.",
  },
  {
    id: "2",
    name: "Wearables",
    slug: "wearables",
    itemCount: 18,
    gradient: "from-purple-600 to-pink-600",
    description: "Next-gen smartwatches with continuous health and fitness tracking.",
  },
  {
    id: "3",
    name: "Smart Home",
    slug: "smart-home",
    itemCount: 32,
    gradient: "from-emerald-600 to-teal-700",
    description: "Ambient lighting and smart home automation devices.",
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    itemCount: 45,
    gradient: "from-amber-500 to-orange-600",
    description: "Ergonomic EDC backpacks, wireless docks, and cases.",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "nova-sonic-wireless",
    name: "NOVA Sonic Wireless Headphones",
    category: "Audio & Tech",
    price: 249.99,
    rating: 4.9,
    reviewCount: 142,
    imageBg: "bg-slate-800",
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
    tag: "Best Seller",
    inStock: true,
  },
  {
    id: "p2",
    slug: "nova-pulse-smartwatch-pro",
    name: "NOVA Pulse Smartwatch Pro",
    category: "Wearables",
    price: 199.5,
    rating: 4.8,
    reviewCount: 98,
    imageBg: "bg-indigo-900",
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
    tag: "New Arrival",
    inStock: true,
  },
  {
    id: "p3",
    slug: "nova-lumina-light-bar",
    name: "NOVA Lumina Ambient Light Bar",
    category: "Smart Home",
    price: 89.0,
    rating: 4.7,
    reviewCount: 76,
    imageBg: "bg-zinc-800",
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
    inStock: true,
  },
  {
    id: "p4",
    slug: "nova-core-backpack",
    name: "NOVA Core Ergonomic Backpack",
    category: "Accessories",
    price: 119.99,
    rating: 4.9,
    reviewCount: 215,
    imageBg: "bg-stone-800",
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
    inStock: true,
  },
];

// Helper Function: Find Product by Slug
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
