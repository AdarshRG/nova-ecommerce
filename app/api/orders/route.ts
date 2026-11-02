// ==============================================================================
// FILE: app/api/orders/route.ts
// ARCHITECTURE ROLE: Enterprise Order Processing, Rate Limiting & Schema-Validated Endpoint
//
// 🎓 BEGINNER'S GUIDE TO ENTERPRISE BACKEND ARCHITECTURE:
//   What does this endpoint do?
//     1. RATE LIMITING (DDoS Protection):
//        Limits orders to 20 attempts per minute per IP to prevent credit card testing bots.
//     2. RUNTIME SCHEMA VALIDATION:
//        Uses `validateOrderSubmission()` to ensure every field (Email, Street, Postal Code,
//        Payment Method, Item array) conforms strictly to enterprise rules before processing.
//     3. ZERO-TRUST SERVER-SIDE RECALCULATION:
//        Looks up genuine prices in the database catalog to prevent client tampering.
//     4. ORDER CREATION:
//        Calculates verified tax, generates order ID (`NV-XXXX`), and returns HTTP 201 Created.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "../../../data/products";
import { Order, ShippingTier, PaymentInfo } from "../../../types/auth";
import { CartItem } from "../../../types/product";
import { validateOrderSubmission } from "../../../lib/validators";
import { checkRateLimit } from "../../../lib/security";

// In-memory server orders store (simulates a database table)
const SERVER_ORDERS_DATABASE: Order[] = [];

// Available shipping tiers configuration
const SERVER_SHIPPING_CONFIG: Record<
  string,
  { name: string; estimate: string; basePrice: number; description: string }
> = {
  standard: {
    name: "Standard Ground Delivery",
    estimate: "3-5 Business Days",
    basePrice: 15.0,
    description: "Reliable carbon-neutral ground delivery by FedEx Ground.",
  },
  express: {
    name: "Express Priority Air",
    estimate: "1-2 Business Days",
    basePrice: 25.0,
    description: "Air courier priority routing with guaranteed delivery window.",
  },
  overnight: {
    name: "Next-Day Morning Rush",
    estimate: "Tomorrow by 10:30 AM",
    basePrice: 45.0,
    description: "Emergency overnight priority dispatch with signature on delivery.",
  },
};

/**
 * POST /api/orders
 * Receives customer checkout data, validates schema, verifies prices against server catalog, and logs order.
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

    // Extract validated & sanitized payload
    const { items, address, shippingTierId, paymentMethod, promoCode } = validation.data;

    // --------------------------------------------------------------------------
    // 3. SERVER-SIDE RECALCULATION & FRAUD PREVENTION (Zero-Trust Security)
    // --------------------------------------------------------------------------
    let verifiedSubtotal = 0;
    const verifiedOrderItems: CartItem[] = [];

    for (const item of items) {
      const serverProduct = PRODUCTS.find((p) => p.id === item.productId);

      if (!serverProduct) {
        return NextResponse.json(
          {
            success: false,
            error: `Product with ID '${item.productId}' is invalid or no longer exists.`,
          },
          { status: 400 }
        );
      }

      // Warehouse stock check
      if (!serverProduct.inStock) {
        return NextResponse.json(
          {
            success: false,
            error: `${serverProduct.name} is currently out of stock in our fulfillment warehouse.`,
          },
          { status: 400 }
        );
      }

      verifiedSubtotal += serverProduct.price * item.quantity;

      verifiedOrderItems.push({
        product: serverProduct,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      });
    }

    // --------------------------------------------------------------------------
    // 4. SHIPPING TIER PRICING CALCULATION
    // --------------------------------------------------------------------------
    const tierConfig = SERVER_SHIPPING_CONFIG[shippingTierId] || SERVER_SHIPPING_CONFIG.standard;
    let shippingPrice = tierConfig.basePrice;

    // Free standard ground shipping on orders $150 and above
    if (shippingTierId === "standard" && verifiedSubtotal >= 150) {
      shippingPrice = 0;
    }

    const shippingTierRecord: ShippingTier = {
      id: shippingTierId,
      name: tierConfig.name,
      estimate: tierConfig.estimate,
      price: shippingPrice,
      description: tierConfig.description,
    };

    // --------------------------------------------------------------------------
    // 5. PROMO DISCOUNT VERIFICATION
    // --------------------------------------------------------------------------
    let discount = 0;
    if (promoCode === "NOVA20") {
      discount = +(verifiedSubtotal * 0.2).toFixed(2);
    } else if (promoCode === "WELCOME10") {
      discount = +(verifiedSubtotal * 0.1).toFixed(2);
    }

    // --------------------------------------------------------------------------
    // 6. TAX (8%) & FINAL VERIFIED TOTAL
    // --------------------------------------------------------------------------
    const taxableSubtotal = Math.max(0, verifiedSubtotal - discount);
    const tax = +(taxableSubtotal * 0.08).toFixed(2);
    const verifiedTotal = +(taxableSubtotal + shippingPrice + tax).toFixed(2);

    // --------------------------------------------------------------------------
    // 7. ORDER CODE GENERATION & RECORD LOGGING
    // --------------------------------------------------------------------------
    const orderNumber = `NV-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-NV-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const paymentInfoRecord: PaymentInfo = {
      method: paymentMethod,
      cardBrand: paymentMethod === "card" ? "Visa" : undefined,
      cardLast4: paymentMethod === "card" ? "4242" : undefined,
      cardHolder: address.fullName,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      trackingNumber,
      date: new Date().toISOString().split("T")[0],
      items: verifiedOrderItems,
      subtotal: verifiedSubtotal,
      discount,
      shipping: shippingPrice,
      shippingTier: shippingTierRecord,
      paymentInfo: paymentInfoRecord,
      tax,
      total: verifiedTotal,
      status: "Processing",
      shippingAddress: address,
      estimatedDelivery: deliveryDate,
    };

    // Save in server database memory
    SERVER_ORDERS_DATABASE.unshift(newOrder);

    // --------------------------------------------------------------------------
    // 8. RETURN HTTP 201 CREATED
    // --------------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Order successfully authorized and created on the backend.",
        order: newOrder,
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
      return NextResponse.json(
        {
          success: true,
          count: SERVER_ORDERS_DATABASE.length,
          orders: SERVER_ORDERS_DATABASE,
        },
        { status: 200 }
      );
    }

    const userOrders = SERVER_ORDERS_DATABASE.filter(
      (o) => o.shippingAddress.email.toLowerCase() === email
    );

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
      { success: false, error: "Internal Server Error fetching orders." },
      { status: 500 }
    );
  }
}
