// ==============================================================================
// FILE: types/product.ts
// ARCHITECTURE ROLE: Centralized TypeScript Data Contracts & Domain Model Interfaces
//
// ROUTE MAP & COMPONENT USAGE:
//   This file defines the foundational TypeScript interfaces utilized across:
//     - Data Layer (`data/products.ts` catalog database array)
//     - State Stores (`store/useCartStore.ts`, `store/useWishlistStore.ts`)
//     - UI Components (`ProductCard.tsx`, `ProductReviews.tsx`, `SearchModal.tsx`)
//     - Checkout Validation (`CheckoutModal.tsx`)
//     - Server Routes (`app/page.tsx`, `app/products/[slug]/page.tsx`)
//
// ACCELERATED 60-DAY TRACK (Day 5 Update):
//   Added `Review` interface for verified customer feedback, rating distributions,
//   and `NewReviewFormData` contract for the interactive review submission form.
// ==============================================================================

/**
 * Interface representing a verified customer review for a product.
 */
export interface Review {
  id: string;              // Unique identifier for the review e.g. "rev-101"
  author: string;          // Customer display name e.g. "Alex Chen"
  avatar?: string;         // Customer avatar initials or image URL
  rating: number;          // Rating score from 1 to 5 stars
  date: string;            // ISO formatted or readable date string e.g. "2026-09-28"
  title: string;           // Short headline summary of the review
  comment: string;         // Full detailed review text content
  verifiedPurchase: boolean; // Flag indicating if reviewer purchased item from store
  helpfulCount: number;    // Count of users who upvoted this review as helpful
}

/**
 * Interface representing a single product item in the store catalog.
 */
export interface Product {
  id: string;              // Unique identifier e.g. "p1"
  slug: string;            // URL-friendly slug identifier e.g. "nova-sonic-wireless"
  name: string;            // Display product title
  category: string;        // Department category name e.g. "Audio & Tech"
  price: number;           // Current retail selling price in USD
  originalPrice?: number;  // MSRP original price before discount (for strike-through UI)
  rating: number;          // Customer rating average out of 5.0 (e.g. 4.9)
  reviewCount: number;     // Total verified customer reviews count
  reviews?: Review[];      // Array of verified customer reviews for PDP
  imageBg: string;         // Tailwind CSS background styling class for visual box
  icon: string;            // Emoji or visual symbol representing the product
  description: string;     // Detailed narrative description of the item
  features: string[];      // Array of bullet point features
  specs: Record<string, string>; // Map of key-value technical specifications
  tag?: string;            // Promotional tag e.g. "BEST SELLER", "NEW ARRIVAL"
  badge?: string;          // Discount pill badge e.g. "SAVE $50", "15% OFF"
  inStock: boolean;        // Stock availability flag
  stockCount: number;      // Physical stock inventory quantity remaining
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
  product: Product;        // Full reference to the target product
  quantity: number;       // Quantity selected by the user
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
  fullName: string;        // Customer full name (minimum 2 characters)
  email: string;           // Customer email (validated against RFC format)
  streetAddress: string;   // Delivery street address
  city: string;            // Delivery city
  postalCode: string;      // Postal / ZIP code (validated format)
  phoneNumber: string;     // Contact phone number for delivery updates
}

/**
 * Interface mapping field validation error messages for checkout form.
 */
export type FormErrors = Partial<Record<keyof AddressFormData, string>>;

/**
 * Interface representing new review form data submitted by users.
 */
export interface NewReviewFormData {
  author: string;
  rating: number;
  title: string;
  comment: string;
}
