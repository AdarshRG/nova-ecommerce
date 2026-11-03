// ==============================================================================
// FILE: app/api/orders/route.ts
// ARCHITECTURE ROLE: Enterprise Order Processing, Rate Limiting & Schema-Validated Endpoint
//
// 🎓 BEGINNER'S GUIDE TO ENTERPRISE BACKEND ARCHITECTURE:
//   What does this endpoint do?
//     1. RATE LIMITING (DDoS Protection):
//        Limits orders to 20 attempts per minute per IP to prevent spam and card testing bots.
//     2. RUNTIME SCHEMA VALIDATION:
//        Uses `validateOrderSubmission()` to verify address, item structures, and enums.
//     3. DATABASE SERVICE DELEGATION (Repository Pattern):
//        Calls `db.order.create()` to recalculate prices on the server, calculate verified tax,
//        and persist the order invoice in the database.
//     4. HTTP 201 RESPONSE:
//        Returns the verified order receipt with rate-limit remaining headers.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { validateOrderSubmission } from "../../../lib/validators";
import { checkRateLimit } from "../../../lib/security";

/**
 * POST /api/orders
 * Receives customer checkout data, validates schema, verifies prices against database, and logs order.
 */
export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------------------------------
    // 1. RATE LIMITING: 20 order attempts per minute per IP
    // --------------------------------------------------------------------------
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "anonymous-client";

    const rateLimit = checkRateLimit(`order_${clientIp}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many checkout attempts. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": `${rateLimit.resetInSeconds}`,
          },
        }
      );
    }

    // --------------------------------------------------------------------------
    // 2. RUNTIME SCHEMA VALIDATION
    // --------------------------------------------------------------------------
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON request body." },
        { status: 400 }
      );
    }

    const validation = validateOrderSubmission(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Order validation failed. Please check your submitted inputs.",
          fieldErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------------------------
    // 3. DATABASE REPOSITORY DELEGATION (Zero-Trust Server Recalculation & Persist)
    // --------------------------------------------------------------------------
    const result = await db.order.create(validation.data);

    if (!result.success || !result.order) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create order record in database.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------------------------
    // 4. RETURN HTTP 201 CREATED
    // --------------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Order successfully authorized and recorded in database.",
        order: result.order,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": `${rateLimit.remaining}`,
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error processing order on backend.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Returns customer orders filtered by email query param (e.g., /api/orders?email=alex@nova.dev)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      const allOrders = await db.order.findMany();
      return NextResponse.json(
        {
          success: true,
          count: allOrders.length,
          orders: allOrders,
        },
        { status: 200 }
      );
    }

    const userOrders = await db.order.findManyByEmail(email);

    return NextResponse.json(
      {
        success: true,
        count: userOrders.length,
        orders: userOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error fetching orders from database." },
      { status: 500 }
    );
  }
}
