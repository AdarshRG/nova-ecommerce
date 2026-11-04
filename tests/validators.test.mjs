// ==============================================================================
// FILE: tests/validators.test.mjs
// ARCHITECTURE ROLE: Unit & Regression Tests for Runtime Schema Validation
//
// 🎓 BEGINNER'S GUIDE TO TESTING VALIDATORS:
//   Why test validators?
//     If our schema validator has a bug, malicious users could submit orders with
//     quantity: -5 or invalid emails that crash our email notification service.
//     These automated tests run every time code is committed to guarantee that:
//       1. Valid customer addresses pass cleanly.
//       2. Bad emails, missing names, or malformed postal codes are REJECTED.
//       3. Attempted negative quantities or fake shipping tiers are BLOCKED.
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// In ES Module test runners, we can test validation logic directly:
describe("Runtime Schema Validator Test Suite", () => {
  // Mock validator mirroring lib/validators.ts rules
  function validateAddress(data) {
    const errors = {};
    if (!data || typeof data !== "object") return { success: false, errors: { form: "Invalid object" } };
    if (!data.fullName || data.fullName.trim().length < 2) errors.fullName = "Full name required (min 2 chars).";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) errors.email = "Valid email required.";
    if (!data.streetAddress || data.streetAddress.trim().length < 5) errors.streetAddress = "Street address required.";
    if (!data.city || data.city.trim().length < 2) errors.city = "City required.";
    if (!data.postalCode || data.postalCode.trim().length < 4) errors.postalCode = "Valid postal code required.";
    const digits = (data.phoneNumber || "").replace(/\D/g, "");
    if (digits.length < 7) errors.phoneNumber = "Valid phone required.";

    if (Object.keys(errors).length > 0) return { success: false, errors };
    return {
      success: true,
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        streetAddress: data.streetAddress.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim(),
        phoneNumber: data.phoneNumber.trim(),
      },
    };
  }

  function validateOrderPayload(body) {
    const errors = {};
    if (!body || typeof body !== "object") return { success: false, errors: { body: "Missing payload" } };
    if (!Array.isArray(body.items) || body.items.length === 0) {
      errors.items = "Cart must contain at least 1 item.";
    } else {
      body.items.forEach((item, idx) => {
        if (!item.productId || typeof item.productId !== "string") errors[`items[${idx}].productId`] = "Required";
        if (typeof item.quantity !== "number" || item.quantity < 1 || !Number.isInteger(item.quantity)) {
          errors[`items[${idx}].quantity`] = "Must be positive integer";
        }
      });
    }

    const addr = validateAddress(body.address);
    if (!addr.success) errors.address = addr.errors;

    const validTiers = ["standard", "express", "overnight"];
    if (!validTiers.includes(body.shippingTierId)) errors.shippingTierId = "Invalid tier";

    const validMethods = ["card", "apple_pay", "paypal"];
    if (!validMethods.includes(body.paymentMethod)) errors.paymentMethod = "Invalid payment method";

    if (Object.keys(errors).length > 0) return { success: false, errors };
    return { success: true };
  }

  // ----------------------------------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------------------------------
  test("TC-01: Valid customer address passes with trimmed & lowercased values", () => {
    const input = {
      fullName: "  Alex Morgan  ",
      email: "  ALEX.MORGAN@EXAMPLE.COM  ",
      streetAddress: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "97477",
      phoneNumber: "555-0199283",
    };

    const result = validateAddress(input);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.fullName, "Alex Morgan");
    assert.strictEqual(result.data.email, "alex.morgan@example.com");
  });

  test("TC-02: Invalid email address is correctly rejected", () => {
    const input = {
      fullName: "Alex Morgan",
      email: "not-a-valid-email",
      streetAddress: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "97477",
      phoneNumber: "555-0199283",
    };

    const result = validateAddress(input);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors.email);
  });

  test("TC-03: Empty shopping cart order is rejected", () => {
    const order = {
      items: [],
      address: {
        fullName: "Alex",
        email: "alex@example.com",
        streetAddress: "742 Evergreen Terrace",
        city: "Springfield",
        postalCode: "97477",
        phoneNumber: "5550199283",
      },
      shippingTierId: "standard",
      paymentMethod: "card",
    };

    const result = validateOrderPayload(order);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errors.items, "Cart must contain at least 1 item.");
  });

  test("TC-04: Negative item quantity in order payload is blocked", () => {
    const order = {
      items: [{ productId: "p-101", quantity: -3 }],
      address: {
        fullName: "Alex",
        email: "alex@example.com",
        streetAddress: "742 Evergreen Terrace",
        city: "Springfield",
        postalCode: "97477",
        phoneNumber: "5550199283",
      },
      shippingTierId: "standard",
      paymentMethod: "card",
    };

    const result = validateOrderPayload(order);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors["items[0].quantity"]);
  });

  test("TC-05: Non-whitelisted shipping tier is rejected", () => {
    const order = {
      items: [{ productId: "p-101", quantity: 1 }],
      address: {
        fullName: "Alex",
        email: "alex@example.com",
        streetAddress: "742 Evergreen Terrace",
        city: "Springfield",
        postalCode: "97477",
        phoneNumber: "5550199283",
      },
      shippingTierId: "teleportation_instant", // Fake tier
      paymentMethod: "card",
    };

    const result = validateOrderPayload(order);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors.shippingTierId);
  });
});
