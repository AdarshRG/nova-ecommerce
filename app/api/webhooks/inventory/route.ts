// ==============================================================================
// FILE: app/api/webhooks/inventory/route.ts
// ARCHITECTURE ROLE: Headless Commerce Webhook Receiver & Event-Driven Cache Purge
//
// 🎓 BEGINNER'S GUIDE TO WEBHOOKS & EVENT-DRIVEN CACHE INVALIDATION:
//   What is a Webhook?
//     A webhook is an automated HTTP POST notification sent from an external system
//     (like BigCommerce, Shopify, an ERP warehouse, or inventory manager) to our server
//     whenever an event happens (e.g., stock count updated, price changed).
//
//   Why is this critical for an AI & Headless Commerce Engineer?
//     If we cache catalog data in Redis for 60 seconds, what happens if an item runs out
//     of stock 2 seconds after being cached?
//     Without webhooks, customers would continue buying out-of-stock items for 58 seconds!
//     With this Webhook endpoint:
//       1. Warehouse updates stock ➔ fires Webhook to our storefront.
//       2. This endpoint authenticates the request secret.
//       3. Calls `redis.delByPrefix("catalog:")` to INSTANTLY purge the stale cache!
//       4. Next visitor gets fresh database inventory immediately (<0ms delay)!
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { redis, cacheKeys } from "@/lib/redis";

// Webhook secret key for signature verification (stored in environment variables)
const WEBHOOK_SECRET = process.env.INVENTORY_WEBHOOK_SECRET || "nova_inventory_secret_2026";

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------------------------------
    // 1. AUTHENTICATE WEBHOOK SIGNATURE / SECRET
    // Prevents unauthorized users from calling our purge endpoint
    // --------------------------------------------------------------------------
    const authHeader = request.headers.get("x-webhook-secret");

    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized webhook caller. Invalid secret signature." },
        { status: 401 }
      );
    }

    // --------------------------------------------------------------------------
    // 2. PARSE EVENT PAYLOAD
    // --------------------------------------------------------------------------
    const body = await request.json();
    const { event, productId, productSlug, newStockCount, updatedPrice } = body;

    console.log(`[INVENTORY WEBHOOK] Received event '${event}' for product ID '${productId}'`);

    // --------------------------------------------------------------------------
    // 3. EVENT-DRIVEN CACHE PURGE (Immediate Cache Invalidation)
    // --------------------------------------------------------------------------
    let purgedKeysCount = 0;

    // A. Purge all catalog query cache keys ("catalog:*")
    purgedKeysCount += await redis.delByPrefix(cacheKeys.catalogPrefix);

    // B. Purge specific product detail cache key if slug is provided
    if (productSlug) {
      const specificKey = cacheKeys.productSlug(productSlug);
      const deleted = await redis.del(specificKey);
      if (deleted) purgedKeysCount++;
    }

    // C. Also flush AI prompt cache so the AI copilot recommends updated prices
    await redis.delByPrefix("ai:prompt:");

    return NextResponse.json(
      {
        success: true,
        message: "Inventory webhook received and Redis cache purged successfully.",
        event,
        productId,
        purgedKeysCount,
        cacheMetrics: redis.getMetrics(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing inventory webhook:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error processing inventory webhook." },
      { status: 500 }
    );
  }
}
