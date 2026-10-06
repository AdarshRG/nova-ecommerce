// ==============================================================================
// TYPE DEFINITIONS: Product, Category, CartItem, and Toast Notification
// Centralized interfaces used across server components, client components, and state stores.
// Updated in Day 3 to support MSRP discount badges, inventory count, and interactive toast state.
// ==============================================================================

export interface Product {
  id: string;
  slug: string;           // URL-friendly identifier e.g. "nova-sonic-wireless"
  name: string;
  category: string;
  price: number;          // Current retail selling price
  originalPrice?: number; // MSRP original price before discount (for strike-through price UI)
  rating: number;         // Customer rating out of 5.0 (e.g. 4.9)
  reviewCount: number;    // Total verified customer reviews count
  imageBg: string;        // Tailwind CSS background class for visual card header
  icon: string;           // Visual icon/symbol representing product category
  description: string;
  features: string[];     // Bullet list of key product features
  specs: Record<string, string>; // Key-value specifications map e.g. { "Battery": "40h" }
  tag?: string;           // Optional badge label e.g. "BEST SELLER", "NEW ARRIVAL"
  badge?: string;         // Promotional badge label e.g. "SAVE $50", "HOT ITEM"
  inStock: boolean;       // Availability boolean flag
  stockCount: number;     // Remaining physical stock count for stock inventory badges
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  gradient: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Global Toast Notification interface for interactive client feedback
export interface ToastNotification {
  id: string;
  message: string;
  product?: Product;
  type: "success" | "info" | "warning";
}

