// ==============================================================================
// FILE: tests/stripe.test.mjs
// ARCHITECTURE ROLE: Unit & Cryptographic Tests for Stripe Payment Integration
//
// 🎓 BEGINNER'S GUIDE TO TESTING PAYMENT GATEWAYS:
//   Why test financial cryptography?
//     1. Financial Precision: We must verify that dollar-to-cent conversions never
//        lose money or fail due to floating-point rounding quirks.
//     2. Webhook Defense: We must verify that genuine Stripe webhook signatures pass,
//        but spoofed or tampered requests are 100% BLOCKED.
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

describe("Stripe Financial Integration & Webhook Cryptography Test Suite", () => {
  // Test helper mirroring lib/stripe.ts logic
  const SECRET = "whsec_test_secret_key_2026";

  function toCents(dollars) {
    return Math.round(dollars * 100);
  }

  function toDollars(cents) {
    return (cents / 100).toFixed(2);
  }

  function signPayload(payload, secret = SECRET) {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  function verifyWebhook(payload, signature, secret = SECRET) {
    if (!signature) throw new Error("Missing signature header");
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (signature !== expected) throw new Error("Signature verification failed: digest mismatch");
    return JSON.parse(payload);
  }

  // ----------------------------------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------------------------------
  test("TC-01: Dollar to integer cents conversion eliminates floating-point bugs", () => {
    // In JavaScript: 0.1 + 0.2 is 0.30000000000000004
    const weirdFloat = 0.1 + 0.2;
    const cents = toCents(weirdFloat);
    assert.strictEqual(cents, 30); // Exactly 30 cents, no fractional pennies!

    assert.strictEqual(toCents(249.99), 24999);
    assert.strictEqual(toCents(0.0), 0);
    assert.strictEqual(toCents(14.5), 1450);
  });

  test("TC-02: Integer cents correctly format back to monetary dollar strings", () => {
    assert.strictEqual(toDollars(24999), "249.99");
    assert.strictEqual(toDollars(30), "0.30");
    assert.strictEqual(toDollars(100000), "1000.00");
  });

  test("TC-03: Authentic Stripe HMAC-SHA256 signature passes verification", () => {
    const rawPayload = JSON.stringify({
      id: "evt_test_12345",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_99", amount: 24999 } },
    });

    const validSig = signPayload(rawPayload);
    const verified = verifyWebhook(rawPayload, validSig);

    assert.strictEqual(verified.id, "evt_test_12345");
    assert.strictEqual(verified.type, "payment_intent.succeeded");
    assert.strictEqual(verified.data.object.amount, 24999);
  });

  test("TC-04: Tampered payload (hacker altering amount) is cryptographically rejected", () => {
    const originalPayload = JSON.stringify({
      id: "evt_test_12345",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_99", amount: 24999 } },
    });

    const validSig = signPayload(originalPayload);

    // Attacker modifies the payload after signing:
    const hackedPayload = JSON.stringify({
      id: "evt_test_12345",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_99", amount: 1 } }, // changed amount to 1 cent!
    });

    assert.throws(
      () => {
        verifyWebhook(hackedPayload, validSig);
      },
      /Signature verification failed/
    );
  });

  test("TC-05: Missing signature header throws error immediately", () => {
    const payload = JSON.stringify({ type: "payment_intent.succeeded" });
    assert.throws(
      () => {
        verifyWebhook(payload, null);
      },
      /Missing signature header/
    );
  });
});
