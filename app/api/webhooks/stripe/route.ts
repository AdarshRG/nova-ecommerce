// ==============================================================================
// FILE: app/api/webhooks/stripe/route.ts
// ARCHITECTURE ROLE: Enterprise Stripe Webhook Receiver & Cryptographic Verification
//
// 🎓 BEGINNER'S GUIDE TO PAYMENT WEBHOOKS & SECURITY:
//   1. Why do we need a Webhook if the browser already told us the card worked?
//      NEVER trust the frontend for order fulfillment!
//      Imagine a user pays, their credit card goes through, but their laptop battery dies
//      before their browser can tell your server. Without a webhook, the customer was charged
//      but your store never ships their order!
//      A Webhook is a direct Server-to-Server notification from Stripe to your backend.
//      It is guaranteed to be delivered even if the user closes their browser instantly.
//
//   2. What is Cryptographic HMAC-SHA256 Signature Verification?
//      Anyone on the internet can make an HTTP POST request to your `/api/webhooks/stripe`
//      saying: `{"type": "payment_intent.succeeded", "orderNumber": "NV-9999"}`.
//      If you believe that fake request, you will ship $5,000 of electronics for FREE!
//      Stripe solves this by signing every payload with a secret key (`STRIPE_WEBHOOK_SECRET`)
//      using HMAC-SHA256. If a hacker tampers with even a single letter in the JSON,
//      the signature check fails and your server throws a 400 Bad Request!
//
//   3. The "Fast 200 OK" Rule:
//      Stripe expects an HTTP 200 response within 3 seconds. If your code takes too long
//      (e.g., waiting for slow email servers), Stripe will assume your server died and retry
//      sending the webhook repeatedly for up to 3 days!
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

/**
 * POST /api/webhooks/stripe
 * Receives raw Stripe event payloads and validates cryptographic HMAC signatures.
 */
export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------------------------------
    // STEP 1: READ RAW BODY STRING & SIGNATURE HEADER
    // --------------------------------------------------------------------------
    // Webhook signature verification MUST be calculated against the raw string body.
    // Parsing with `request.json()` first changes whitespace, breaking the cryptographic hash!
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("stripe-signature");

    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json(
        { error: "Empty webhook payload received." },
        { status: 400 }
      );
    }

    // --------------------------------------------------------------------------
    // STEP 2: CRYPTOGRAPHIC SIGNATURE VERIFICATION
    // --------------------------------------------------------------------------
    let event;
    try {
      event = stripe.verifyWebhookSignature(rawBody, signatureHeader);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Signature verification failed";
      console.error(`[STRIPE SECURITY ALERT] Invalid webhook signature: ${errorMessage}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log(`[STRIPE WEBHOOK VERIFIED] Event ID: ${event.id} | Type: ${event.type}`);

    // --------------------------------------------------------------------------
    // STEP 3: DISPATCH EVENT BY TYPE
    // --------------------------------------------------------------------------
    switch (event.type) {
      // ------------------------------------------------------------------------
      // EVENT: payment_intent.succeeded
      // Customer's card was successfully charged! We can safely fulfill the order.
      // ------------------------------------------------------------------------
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderNumber = paymentIntent.metadata?.orderNumber;
        const customerEmail = paymentIntent.metadata?.customerEmail;
        const amountPaidDollars = (paymentIntent.amount / 100).toFixed(2);

        console.log(
          `[STRIPE FULFILLMENT] Payment succeeded for order: ${orderNumber} | Customer: ${customerEmail} | Total: $${amountPaidDollars}`
        );

        if (orderNumber) {
          // 1. Update order status to "Processing" in database repository
          const updateResult = await db.order.updateStatus(orderNumber, "Processing");
          if (updateResult.success) {
            console.log(`[DATABASE] Order ${orderNumber} status transitioned to: Processing`);
          }

          // 2. Invalidate order cache in Redis so real-time tracking reflects "Paid/Processing"
          await redis.del(`order:${orderNumber}`);
          await redis.delByPrefix("order:");
          console.log(`[REDIS] Cache purged for order:${orderNumber}`);
        }
        break;
      }

      // ------------------------------------------------------------------------
      // EVENT: payment_intent.payment_failed
      // Customer's card was declined (insufficient funds, expired card, fraud flag).
      // ------------------------------------------------------------------------
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderNumber = paymentIntent.metadata?.orderNumber;
        console.warn(
          `[STRIPE PAYMENT DECLINED] Payment failed for order ${orderNumber}. Status: ${paymentIntent.status}`
        );
        // In production: Send notification email to customer asking them to update their card
        break;
      }

      // ------------------------------------------------------------------------
      // EVENT: checkout.session.completed
      // ------------------------------------------------------------------------
      case "checkout.session.completed": {
        console.log(`[STRIPE CHECKOUT] Checkout session completed.`);
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    // --------------------------------------------------------------------------
    // STEP 4: RETURN FAST 200 OK TO STRIPE
    // --------------------------------------------------------------------------
    return NextResponse.json(
      {
        received: true,
        eventId: event.id,
        eventType: event.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STRIPE WEBHOOK HANDLER ERROR]:", error);
    return NextResponse.json(
      { error: "Internal webhook processing error." },
      { status: 500 }
    );
  }
}
