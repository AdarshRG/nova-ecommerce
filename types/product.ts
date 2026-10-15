// ==============================================================================
// FILE: types/product.ts
// ARCHITECTURE ROLE: Centralized TypeScript Data Contracts & Domain Model Blueprints
//
// 🎓 BEGINNER'S GUIDE TO THIS FILE:
//   What is this file?
//     Think of this file as the "Architectural Blueprint" of our whole application.
//     In TypeScript, an `interface` sets strict rules for what information an object
//     MUST have (like a product having a name and a price).
//   Why is it important?
//     If someone accidentally forgets to add a price, or types "prce" instead of "price",
//     TypeScript catches the mistake instantly while coding, rather than crashing on users!
//   What does the `?` question mark symbol mean?
//     When you see `originalPrice?: number`, the `?` means OPTIONAL.
//     It means a product doesn't HAVE to have an original MSRP price, but if it does,
//     it must be a valid number.
// ==============================================================================

/**
 * ColorVariant Interface
 * Represents a color option/finish for a hardware product (e.g., Space Black, Silver).
 */
export interface ColorVariant {
  name: string;        // Display name of the color e.g. "Space Black", "Titanium Silver"
  hex: string;         // Hex color code for CSS background dot e.g. "#0f172a"
  bgClass: string;     // Tailwind CSS background class e.g. "bg-slate-900"
}

/**
 * Review Interface
 * Represents a verified customer review and feedback entry.
 */
export interface Review {
  id: string;              // Unique ID e.g. "rev-101"
  author: string;          // Reviewer's display name e.g. "Marcus Vance"
  avatar?: string;         // Reviewer's initials e.g. "MV"
  rating: number;          // Star rating score from 1 to 5
  date: string;            // Formatted date string e.g. "2026-09-24"
  title: string;           // Headline summary e.g. "Phenomenal Sound!"
  comment: string;         // Full review text
  verifiedPurchase: boolean; // True if customer actually bought the item
  helpfulCount: number;    // Count of community upvotes
}

/**
 * Product Interface
 * Master domain model representing a hardware item in our catalog.
 */
export interface Product {
  id: string;                  // Unique identifier e.g. "p1"
  slug: string;                // URL path friendly name e.g. "nova-sonic-wireless"
  name: string;                // Product display title e.g. "NOVA Sonic Wireless"
  category: string;            // Department category e.g. "Audio & Tech"
  price: number;               // Current retail price in USD e.g. 249.99
  originalPrice?: number;      // Original MSRP price before discount e.g. 299.99
  rating: number;              // Average rating score (out of 5.0) e.g. 4.9
  reviewCount: number;         // Total review count e.g. 142
  reviews?: Review[];          // Array of verified customer reviews
  colorVariants?: ColorVariant[]; // Array of selectable color options
  imageBg: string;             // Tailwind background style class
  icon: string;                // Visual icon symbol representing product e.g. "🎧"
  description: string;         // Full narrative description
  features: string[];          // Bullet-point list of features
  specs: Record<string, string>; // Key-value map of technical specs e.g. { "Weight": "250g" }
  tag?: string;                // Optional badge e.g. "BEST SELLER"
  badge?: string;              // Optional discount tag e.g. "SAVE $50"
  inStock: boolean;            // Stock availability flag
  stockCount: number;          // Remaining stock quantity in warehouse
}

/**
 * Category Interface
 * Represents a department category in our store.
 */
export interface Category {
  id: string;          // Category unique ID e.g. "1"
  name: string;        // Display name e.g. "Audio & Tech"
  slug: string;        // URL path slug e.g. "audio-tech"
  itemCount: number;   // Number of items in this department
  gradient: string;    // Tailwind CSS gradient styling
  description: string; // Narrative overview of the department
}

/**
 * CartItem Interface
 * Represents an item placed inside the user's shopping bag.
 */
export interface CartItem {
  product: Product;    // Complete product object
  quantity: number;    // How many units the customer wants to buy
  selectedColor?: string; // Optional chosen color variant name
}

/**
 * ToastNotification Interface
 * Represents an alert popup message sliding onto the screen.
 */
export interface ToastNotification {
  id: string;          // Unique timestamp ID
  message: string;     // Text alert message
  product?: Product;   // Optional product linked to the alert
  type: "success" | "info" | "warning"; // Severity styling
}

/**
 * AddressFormData Interface
 * Represents the customer's delivery information during checkout.
 */
export interface AddressFormData {
  fullName: string;      // Customer's name
  email: string;         // Customer's email
  streetAddress: string; // Shipping street address
  city: string;          // Shipping city
  postalCode: string;    // Postal / ZIP code
  phoneNumber: string;   // Phone number for carrier updates
}

/**
 * FormErrors Type
 * Maps validation error messages to specific form field names.
 */
export type FormErrors = Partial<Record<keyof AddressFormData, string>>;

/**
 * NewReviewFormData Interface
 * Data collected when a user writes a review in the modal form.
 */
export interface NewReviewFormData {
  author: string;
  rating: number;
  title: string;
  comment: string;
}

/**
 * RecentlyViewedRecord Interface
 * Tracks when a user viewed a product for the browsing history bar.
 */
export interface RecentlyViewedRecord {
  productId: string;   // ID of viewed product
  viewedAt: number;    // Timestamp in milliseconds (Date.now())
}
