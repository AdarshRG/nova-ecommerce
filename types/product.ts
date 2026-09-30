// ==============================================================================
// TYPE DEFINITIONS: Product, Category, and CartItem
// Centralized interfaces used across server components, client components, and state stores.
// ==============================================================================

export interface Product {
  id: string;
  slug: string;        // URL-friendly identifier e.g. "nova-sonic-wireless"
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageBg: string;
  icon: string;
  description: string;
  features: string[];
  specs: Record<string, string>; // Key-value specifications e.g. { "Battery": "40h", "Weight": "250g" }
  tag?: string;
  inStock: boolean;
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
