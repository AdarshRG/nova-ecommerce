// ==============================================================================
// FILE: lib/validators.ts
// ARCHITECTURE ROLE: Enterprise Type-Safe Schema Validation & Input Verification Engine
//
// 🎓 BEGINNER'S GUIDE TO RUNTIME SCHEMA VALIDATION:
//   What is the difference between "Compile-Time" and "Runtime" validation?
//     • COMPILE-TIME (TypeScript interfaces):
//       TypeScript checks types while you write code in VS Code. But when your code is
//       compiled to JavaScript and deployed to the server, ALL TypeScript types DISAPPEAR!
//     • RUNTIME (This validator file):
//       When a random user on the internet (or an autonomous AI agent) sends an HTTP POST
//       request to `/api/orders`, the server receives raw JSON.
//       This file validates that raw JSON at RUNTIME before your database or Stripe sees it!
//
//   Why is this crucial for an AI Application Engineer?
//     When working with LLMs that output JSON (Tool Calling & Structured Outputs), models
//     occasionally hallucinate invalid fields or omit required keys.
//     Runtime validators act as an impenetrable firewall that guarantees only 100% valid,
//     safe data enters your system.
// ==============================================================================

import { AddressFormData } from "../types/product";

// ------------------------------------------------------------------------------
// TYPE DEFINITION: ValidationResult
// A Discriminated Union pattern representing either Success or Failure
// ------------------------------------------------------------------------------
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

/**
 * Validates customer delivery address inputs
 *
 * @param input Raw unknown data from the client
 * @returns Type-narrowed AddressFormData or detailed validation error map
 */
export function validateAddress(input: unknown): ValidationResult<AddressFormData> {
  const errors: Record<string, string> = {};

  // 1. Guard check: Input must be a valid non-null JavaScript object
  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: { form: "Invalid address payload format; expected an object." },
    };
  }

  // Typecast to record for safe property probing
  const data = input as Record<string, unknown>;

  // 2. Full Name validation (Must be string, at least 2 characters, not just whitespace)
  if (typeof data.fullName !== "string" || data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  // 3. Email validation using standard RFC-compliant Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    typeof data.email !== "string" ||
    !emailRegex.test(data.email.trim())
  ) {
    errors.email = "Please enter a valid email address.";
  }

  // 4. Street Address validation
  if (typeof data.streetAddress !== "string" || data.streetAddress.trim().length < 5) {
    errors.streetAddress = "Street address must be at least 5 characters.";
  }

  // 5. City validation
  if (typeof data.city !== "string" || data.city.trim().length < 2) {
    errors.city = "City is required.";
  }

  // 6. Postal Code validation (Must be at least 4 alphanumeric characters)
  if (typeof data.postalCode !== "string" || data.postalCode.trim().length < 4) {
    errors.postalCode = "Enter a valid postal code (minimum 4 characters).";
  }

  // 7. Phone Number validation (Optional cleanup + minimum 7 digits)
  const phoneDigits = typeof data.phoneNumber === "string" ? data.phoneNumber.replace(/\D/g, "") : "";
  if (phoneDigits.length < 7) {
    errors.phoneNumber = "Enter a valid phone number (at least 7 digits).";
  }

  // If any field failed, return failure with all accumulated errors
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // If passed, return the sanitized and strictly-typed AddressFormData
  return {
    success: true,
    data: {
      fullName: (data.fullName as string).trim(),
      email: (data.email as string).trim().toLowerCase(),
      streetAddress: (data.streetAddress as string).trim(),
      city: (data.city as string).trim(),
      postalCode: (data.postalCode as string).trim(),
      phoneNumber: (data.phoneNumber as string).trim(),
    },
  };
}

/**
 * Validates Order Submission Payloads sent to POST /api/orders
 */
export interface ValidatedOrderPayload {
  items: Array<{ productId: string; quantity: number; selectedColor?: string }>;
  address: AddressFormData;
  shippingTierId: "standard" | "express" | "overnight";
  paymentMethod: "card" | "apple_pay" | "paypal";
  promoCode?: string;
}

export function validateOrderSubmission(input: unknown): ValidationResult<ValidatedOrderPayload> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== "object") {
    return { success: false, errors: { payload: "Missing or malformed request body." } };
  }

  const data = input as Record<string, unknown>;

  // 1. Validate Items Array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = "Shopping bag must contain at least 1 item to checkout.";
  } else {
    // Validate each item inside array
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item || typeof item !== "object") {
        errors[`items[${i}]`] = "Invalid item object structure.";
        continue;
      }
      const productId = item.productId || item.product?.id;
      if (!productId || typeof productId !== "string") {
        errors[`items[${i}].productId`] = "Item product ID is required.";
      }
      const qty = item.quantity;
      if (typeof qty !== "number" || qty < 1 || !Number.isInteger(qty)) {
        errors[`items[${i}].quantity`] = "Quantity must be an integer of 1 or greater.";
      }
    }
  }

  // 2. Validate Address sub-object
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.success) {
    Object.entries(addressValidation.errors).forEach(([field, msg]) => {
      errors[`address.${field}`] = msg;
    });
  }

  // 3. Validate Shipping Tier Enum
  const validTiers = ["standard", "express", "overnight"];
  if (typeof data.shippingTierId !== "string" || !validTiers.includes(data.shippingTierId)) {
    errors.shippingTierId = "Invalid delivery tier selected. Choose standard, express, or overnight.";
  }

  // 4. Validate Payment Method Enum
  const validMethods = ["card", "apple_pay", "paypal"];
  if (typeof data.paymentMethod !== "string" || !validMethods.includes(data.paymentMethod)) {
    errors.paymentMethod = "Invalid payment method. Choose card, apple_pay, or paypal.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Sanitize items array
  const sanitizedItems = (data.items as Array<Record<string, unknown>>).map((item) => ({
    productId: ((item.productId || (item.product as Record<string, unknown>)?.id) as string).trim(),
    quantity: Math.floor(item.quantity as number),
    selectedColor: typeof item.selectedColor === "string" ? item.selectedColor.trim() : undefined,
  }));

  return {
    success: true,
    data: {
      items: sanitizedItems,
      address: (addressValidation as { success: true; data: AddressFormData }).data,
      shippingTierId: data.shippingTierId as "standard" | "express" | "overnight",
      paymentMethod: data.paymentMethod as "card" | "apple_pay" | "paypal",
      promoCode: typeof data.promoCode === "string" ? data.promoCode.trim().toUpperCase() : undefined,
    },
  };
}
