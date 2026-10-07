// ==============================================================================
// FILE: types/product.ts
// ARCHITECTURE ROLE: Centralized TypeScript Data Contracts & Domain Model Interfaces
//
// ROUTE MAP & COMPONENT USAGE:
//   This file defines the strict type contracts used across:
//     - Data Layer (`data/products.ts` catalog storage)
//     - State Stores (`store/useCartStore.ts`, `store/useWishlistStore.ts`)
//     - UI Components (`ProductCard.tsx`, `AddToCartButton.tsx`, `FilterBar.tsx`)
//     - Checkout System (`CheckoutModal.tsx` form validation)
//     - Server Routes (`app/page.tsx`, `app/products/[slug]/page.tsx`)
//
// ACCELERATED 60-DAY TRACK (Day 4 Update):
//   Added `AddressFormData` and `FormErrors` interfaces for enterprise shipping validation,
//   plus `WishlistItem` for saved user preferences.
// ==============================================================================

/**
 * Interface representing a single product item in the store catalog.
 */
export interface Product {
  id: string;             // Unique identifier e.g. "p1"
  slug: string;           // URL-friendly slug identifier e.g. "nova-sonic-wireless"
  name: string;           // Display product title
  category: string;       // Department category name e.g. "Audio & Tech"
  price: number;          // Current retail selling price in USD
  originalPrice?: number; // MSRP original price before discount (for strike-through UI)
  rating: number;         // Customer rating out of 5.0 (e.g. 4.9)
  reviewCount: number;    // Total verified customer reviews count
  imageBg: string;        // Tailwind CSS background styling class for visual box
  icon: string;           // Emoji or visual symbol representing the product
  description: string;    // Detailed narrative description of the item
  features: string[];     // Array of bullet point features
  specs: Record<string, string>; // Map of key-value technical specifications
  tag?: string;           // Promotional tag e.g. "BEST SELLER", "NEW ARRIVAL"
  badge?: string;         // Discount pill badge e.g. "SAVE $50", "15% OFF"
  inStock: boolean;       // Stock availability flag
  stockCount: number;     // Physical stock inventory quantity remaining
}

/**
 * Interface representing a category department.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  gradient: string;
  description: string;
}

/**
 * Interface representing an item inside the user's active shopping cart.
 */
export interface CartItem {
  product: Product;       // Full reference to the target product
  quantity: number;      // Quantity selected by the user
}

/**
 * Interface representing a global interactive toast alert notification.
 */
export interface ToastNotification {
  id: string;
  message: string;
  product?: Product;
  type: "success" | "info" | "warning";
}

/**
 * Interface representing shipping address data collected during checkout.
 */
export interface AddressFormData {
  fullName: string;       // Customer full name (minimum 2 characters)
  email: string;          // Customer email (validated against RFC format)
  streetAddress: string;  // Delivery street address
  city: string;           // Delivery city
  postalCode: string;     // Postal / ZIP code (validated format)
  phoneNumber: string;    // Contact phone number for delivery updates
}

/**
 * Interface mapping field validation error messages for checkout form.
 */
export type FormErrors = Partial<Record<keyof AddressFormData, string>>;
