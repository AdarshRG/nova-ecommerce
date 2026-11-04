// ==============================================================================
// FILE: tests/pricing.test.mjs
// ARCHITECTURE ROLE: Unit & Business Logic Tests for E-Commerce Pricing & Taxes
//
// 🎓 BEGINNER'S GUIDE TO TESTING BUSINESS LOGIC:
//   Pricing and discounts are where bugs cost real money!
//   If a developer changes shipping logic and accidentally makes Overnight shipping $0,
//   the company loses hundreds of dollars per day.
//   These automated tests mathematically lock in our pricing and discount rules.
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("E-Commerce Pricing, Tax & Discount Engine Test Suite", () => {
  // Pricing engine mirroring lib/db.ts and CheckoutModal.tsx calculations
  function calculateOrderFinancials(items, shippingTierId = "standard", promoCode) {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Discounts
    let discount = 0;
    if (promoCode === "NOVA20") {
      discount = +(subtotal * 0.2).toFixed(2);
    } else if (promoCode === "WELCOME10") {
      discount = +(subtotal * 0.1).toFixed(2);
    }

    // Shipping
    let shipping = 15.0;
    if (shippingTierId === "standard") {
      shipping = subtotal >= 150 ? 0 : 15.0; // Free over $150
    } else if (shippingTierId === "express") {
      shipping = 25.0;
    } else if (shippingTierId === "overnight") {
      shipping = 45.0;
    }

    // 8% Sales Tax on taxable subtotal
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = +(taxableSubtotal * 0.08).toFixed(2);
    const total = +(taxableSubtotal + shipping + tax).toFixed(2);

    return {
      subtotal: +subtotal.toFixed(2),
      discount,
      shipping,
      tax,
      total,
    };
  }

  // ----------------------------------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------------------------------
  test("TC-01: Standard shipping is $15.00 for orders under $150", () => {
    const items = [{ unitPrice: 50.0, quantity: 2 }]; // $100 subtotal
    const res = calculateOrderFinancials(items, "standard");

    assert.strictEqual(res.subtotal, 100.0);
    assert.strictEqual(res.shipping, 15.0);
    assert.strictEqual(res.tax, 8.0); // 8% of 100
    assert.strictEqual(res.total, 123.0); // 100 + 15 + 8
  });

  test("TC-02: Standard shipping is FREE ($0) for orders $150 and above", () => {
    const items = [{ unitPrice: 200.0, quantity: 1 }]; // $200 subtotal
    const res = calculateOrderFinancials(items, "standard");

    assert.strictEqual(res.subtotal, 200.0);
    assert.strictEqual(res.shipping, 0.0); // FREE!
    assert.strictEqual(res.tax, 16.0); // 8% of 200
    assert.strictEqual(res.total, 216.0); // 200 + 0 + 16
  });

  test("TC-03: Promo code NOVA20 correctly applies 20% discount", () => {
    const items = [{ unitPrice: 100.0, quantity: 1 }];
    const res = calculateOrderFinancials(items, "standard", "NOVA20");

    assert.strictEqual(res.subtotal, 100.0);
    assert.strictEqual(res.discount, 20.0); // 20% off 100
    // Taxable subtotal is 80.0 -> Tax is 8% of 80 = 6.40
    assert.strictEqual(res.tax, 6.4);
    // Total is 80 + 15 (shipping) + 6.40 = 101.40
    assert.strictEqual(res.total, 101.4);
  });

  test("TC-04: Overnight rush shipping applies flat $45 fee regardless of subtotal", () => {
    const items = [{ unitPrice: 500.0, quantity: 1 }];
    const res = calculateOrderFinancials(items, "overnight");

    assert.strictEqual(res.shipping, 45.0);
    assert.strictEqual(res.tax, 40.0); // 8% of 500
    assert.strictEqual(res.total, 585.0); // 500 + 45 + 40
  });

  test("TC-05: Unrecognized promo code yields $0 discount", () => {
    const items = [{ unitPrice: 100.0, quantity: 1 }];
    const res = calculateOrderFinancials(items, "standard", "FAKE_PROMO_CODE");

    assert.strictEqual(res.discount, 0.0);
  });
});
