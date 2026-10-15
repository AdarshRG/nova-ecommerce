// ==============================================================================
// FILE: types/auth.ts
// ARCHITECTURE ROLE: Centralized TypeScript Interfaces for Customer Auth & Multi-Step Orders
//
// 🎓 BEGINNER'S GUIDE TO THIS FILE:
//   What is this file?
//     This file defines the data contracts for customer accounts, multi-step checkout
//     options (shipping speeds and payment methods), and official order tracking invoices.
//   Key Interfaces:
//     1. `User`: Customer profile (ID, name, email, member tier).
//     2. `ShippingTier`: Delivery speed options (Standard Ground, Express Air, Overnight Rush).
//     3. `PaymentInfo`: Masked payment details (Card last 4 digits, Apple Pay, PayPal).
//     4. `Order`: Complete invoice and tracking record saved after checkout.
// ==============================================================================

import { CartItem, AddressFormData } from "./product";

/**
 * User Interface
 * Represents a customer profile in our e-commerce store.
 */
export interface User {
  id: string;               // Unique user ID e.g. "usr-101"
  name: string;             // Customer's full name e.g. "Alex Morgan"
  email: string;            // Customer's email e.g. "alex@example.com"
  memberTier: "Gold VIP" | "Member" | "Guest"; // Loyalty level
  joinedDate: string;       // Date account was created
  savedAddress?: AddressFormData; // Optional saved shipping address
}

/**
 * OrderStatus Type
 * Strict status values an order can have during fulfillment.
 */
export type OrderStatus = "Processing" | "Shipped" | "Delivered";

/**
 * ShippingTier Interface
 * Represents a selectable delivery speed in Step 2 of checkout.
 */
export interface ShippingTier {
  id: "standard" | "express" | "overnight";
  name: string;             // Display title e.g. "Standard Ground"
  estimate: string;         // Arrival timeline e.g. "3-5 Business Days"
  price: number;            // Shipping fee (0 if free)
  description: string;      // Carrier info e.g. "Reliable carbon-neutral ground shipping"
}

/**
 * PaymentInfo Interface
 * Represents simulated payment authorization info for invoice display.
 */
export interface PaymentInfo {
  method: "card" | "apple_pay" | "paypal";
  cardLast4?: string;       // Masked last 4 digits e.g. "4242"
  cardBrand?: string;       // Card issuer e.g. "Visa", "Mastercard"
  cardHolder?: string;      // Name on card
}

/**
 * Order Interface
 * Master domain model representing a placed order invoice and fulfillment record.
 */
export interface Order {
  id: string;               // Unique order ID e.g. "ord-9821"
  orderNumber: string;      // Customer facing order code e.g. "NV-7842"
  trackingNumber: string;   // Carrier tracking code e.g. "TRK-NV-849201"
  date: string;             // Date order was placed e.g. "2026-10-15"
  items: CartItem[];        // List of products and quantities bought
  subtotal: number;         // Monetary subtotal
  discount: number;         // Discount applied
  shipping: number;         // Shipping fee
  shippingTier: ShippingTier; // Selected delivery speed option
  paymentInfo: PaymentInfo; // Masked payment record
  tax: number;              // Calculated sales tax
  total: number;            // Final total paid
  status: OrderStatus;      // Fulfillment state
  shippingAddress: AddressFormData; // Delivery destination
  estimatedDelivery: string; // Estimated arrival date string
}
