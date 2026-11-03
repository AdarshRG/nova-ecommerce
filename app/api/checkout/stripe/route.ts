// ==============================================================================
// FILE: app/api/checkout/stripe/route.ts
// ARCHITECTURE ROLE: Enterprise Stripe PaymentIntent Creator & Server-Side Price Verification
//
// 🎓 BEGINNER'S GUIDE TO PAYMENTINTENTS & FINANCIAL SECURITY:
//   1. What is a Stripe PaymentIntent?
//      A PaymentIntent is an object in Stripe that tracks the entire lifecycle of a customer's
//      attempt to pay. It handles complex payment state transitions:
//        • `requires_payment_method` ➔ Customer enters card details
//        • `requires_action` ➔ Customer verifies via 3D Secure / OTP SMS
//        • `processing` ➔ Bank is processing
//        • `succeeded` ➔ Money successfully captured!
//
//   2. Why do we NEVER trust the price sent from the client?
//      A malicious user could open Chrome DevTools, edit JavaScript, and send `{ total: 0.01 }`
//      for a $2,000 laptop!
//      In enterprise e-commerce, the client ONLY sends `productId` and `quantity`.
//      Our server looks up the genuine price in our PostgreSQL database (`db.product.findById`),
//      recalculates taxes and shipping, and forces Stripe to charge the verified amount.
//
//   3. What is the `clientSecret` returned to the browser?
//      The `clientSecret` (e.g., `pi_123_secret_456`) is a special single-use token that allows
//      the customer's browser to securely submit credit card details directly to Stripe's servers
//      without exposing our secret API keys or touching our application server!
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { db } from "../../../lib/db";
import { checkRateLimit } from "../../../lib/security";

interface CheckoutRequestBody {
  items: Array<{
    productId: string;
    quantity: number;
    selectedColor?: string;
  }>;
  customer: {
    fullName: string;
    email: string;
    streetAddress: string;
    city: string;
    postalCode: string;
  };
  shippingTierId?: "standard" | "express" | "overnight";
  promoCode?: string;
}

/**
 * POST /api/checkout/stripe
 * Generates a verified Stripe PaymentIntent with server-calculated totals.
 */
export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------------------------------
    // STEP 1: RATE LIMITING (Bot & Card Testing Protection)
    // --------------------------------------------------------------------------
    // Fraudsters often use stolen credit cards to test thousands of cards per minute.
    // We restrict payment intent initialization to 15 per minute per IP address.
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "anonymous-client";

    const rateLimit = checkRateLimit(`stripe_intent_${clientIp}`, 15, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many payment attempts. Please wait ${rateLimit.resetInSeconds}s before retrying.`,
        },
        { status: 429, headers: { "Retry-After": `${rateLimit.resetInSeconds}` } }
      );
    }

    // --------------------------------------------------------------------------
    // STEP 2: IDEMPOTENCY KEY EXTRACTION
    // --------------------------------------------------------------------------
    // If the customer accidentally double-clicks or their Wi-Fi reconnects,
    // this unique key guarantees Stripe never charges their card twice.
    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key") ||
      undefined;

    // --------------------------------------------------------------------------
    // STEP 3: PARSE REQUEST PAYLOAD
    // --------------------------------------------------------------------------
    let body: CheckoutRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { items, customer, shippingTierId = "standard", promoCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart cannot be empty for checkout." },
        { status: 400 }
      );
    }

    if (!customer?.email || !customer?.fullName) {
      return NextResponse.json(
        { success: false, error: "Customer name and valid email are required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------------------------------
    // STEP 4: ZERO-TRUST SERVER-SIDE PRICE RECALCULATION
    // --------------------------------------------------------------------------
    // Look up genuine product prices directly from the database repository.
    let subtotal = 0;
    const verifiedLineItems = [];

    for (const item of items) {
      const product = await db.product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ID "${item.productId}" not found in catalog.` },
          { status: 404 }
        );
      }
      if (!product.inStock) {
        return NextResponse.json(
          { success: false, error: `Item "${product.name}" is currently out of stock.` },
          { status: 400 }
        );
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      verifiedLineItems.push({
        id: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        total: lineTotal,
      });
    }

    // --------------------------------------------------------------------------
    // STEP 5: PROMO CODE & SHIPPING DISCOUNTS
    // --------------------------------------------------------------------------
    let discount = 0;
    if (promoCode === "NOVA20") {
      discount = +(subtotal * 0.2).toFixed(2); // 20% off
    } else if (promoCode === "WELCOME10") {
      discount = +(subtotal * 0.1).toFixed(2); // 10% off
    }

    // Shipping tiers calculation
    let shippingFee = 15.0; // standard base
    if (shippingTierId === "standard") {
      shippingFee = subtotal >= 150 ? 0 : 15.0; // Free ground delivery over $150
    } else if (shippingTierId === "express") {
      shippingFee = 25.0;
    } else if (shippingTierId === "overnight") {
      shippingFee = 45.0;
    }

    // Tax calculation (8% standard e-commerce sales tax)
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = +(taxableSubtotal * 0.08).toFixed(2);
    const finalTotalDollars = +(taxableSubtotal + shippingFee + tax).toFixed(2);

    // --------------------------------------------------------------------------
    // STEP 6: CREATE STRIPE PAYMENT INTENT (IN INTEGER CENTS!)
    // --------------------------------------------------------------------------
    const orderNumber = `NV-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentIntent = await stripe.createPaymentIntent(
      {
        amountInDollars: finalTotalDollars,
        currency: "usd",
        orderNumber,
        customerEmail: customer.email,
        customerName: customer.fullName,
        metadata: {
          orderNumber,
          customerEmail: customer.email,
          itemCount: String(items.length),
          promoCode: promoCode || "NONE",
          shippingTier: shippingTierId,
        },
      },
      idempotencyKey
    );

    // --------------------------------------------------------------------------
    // STEP 7: RETURN CLIENT SECRET TO BROWSER
    // --------------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.id,
        orderNumber,
        amountInCents: paymentIntent.amount,
        amountInDollars: finalTotalDollars,
        currency: paymentIntent.currency,
        breakdown: {
          subtotal,
          discount,
          shipping: shippingFee,
          tax,
          total: finalTotalDollars,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STRIPE CHECKOUT API ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Internal payment gateway error occurred." },
      { status: 500 }
    );
  }
}
