// ==============================================================================
// FILE: app/api/orders/route.ts
// ARCHITECTURE ROLE: Enterprise Order Processing & Server-Side Security Endpoint
//
// 🎓 BEGINNER'S GUIDE TO SECURE BACKEND ORDER PROCESSING:
//   Why must orders be processed on the Backend Server?
//     Rule #1 of Web Security: "NEVER TRUST THE CLIENT."
//     If the frontend calculates the price and sends `total: $10`, a hacker could open
//     their browser DevTools, edit JavaScript, and send `total: $0.01`!
//
//   What does this Backend Route Handler do?
//     1. Receives the checkout payload: items, address, and delivery speed.
//     2. SERVER-SIDE PRICE VERIFICATION:
//        It queries each product directly from the server catalog and recalculates the
//        real price. Any client-side price tampering is completely ignored!
//     3. Validates required address and contact fields.
//     4. Generates an official server-certified Order ID (`NV-XXXX`) and tracking number.
//     5. Calculates verified sales tax (8%) and final total.
//     6. Returns HTTP 201 Created with the verified order receipt!
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "../../../data/products";
import { Order, ShippingTier, PaymentInfo } from "../../../types/auth";
import { CartItem, AddressFormData } from "../../../types/product";

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
 * Receives customer checkout data, verifies pricing against server catalog, and logs order.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON body sent from client
    const body = await request.json();
    const { items, address, shippingTierId, paymentMethod, promoCode } = body;

    // 2. Validate Cart Items presence
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cannot process an empty order bag." },
        { status: 400 }
      );
    }

    // 3. Validate Address Data
    const addr = address as AddressFormData;
    if (
      !addr ||
      !addr.fullName?.trim() ||
      !addr.email?.trim() ||
      !addr.streetAddress?.trim() ||
      !addr.city?.trim() ||
      !addr.postalCode?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required shipping address fields (Name, Email, Street, City, ZIP).",
        },
        { status: 400 }
      );
    }

    // 4. SERVER-SIDE RECALCULATION & FRAUD PREVENTION:
    // Look up each item in the official server catalog to determine genuine unit price.
    let verifiedSubtotal = 0;
    const verifiedOrderItems: CartItem[] = [];

    for (const item of items) {
      const serverProduct = PRODUCTS.find((p) => p.id === item.product.id);
      if (!serverProduct) {
        return NextResponse.json(
          {
            success: false,
            error: `Product with ID '${item.product.id}' is invalid or no longer available.`,
          },
          { status: 400 }
        );
      }

      // Check warehouse stock on the server
      if (!serverProduct.inStock) {
        return NextResponse.json(
          {
            success: false,
            error: `${serverProduct.name} is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      const verifiedQuantity = Math.max(1, Math.floor(item.quantity || 1));
      verifiedSubtotal += serverProduct.price * verifiedQuantity;

      verifiedOrderItems.push({
        product: serverProduct,
        quantity: verifiedQuantity,
        selectedColor: item.selectedColor,
      });
    }

    // 5. Calculate Server-Verified Shipping Tier Price
    const tierConfig = SERVER_SHIPPING_CONFIG[shippingTierId] || SERVER_SHIPPING_CONFIG.standard;
    let shippingPrice = tierConfig.basePrice;

    // Free standard ground shipping on orders $150 and above
    if (shippingTierId === "standard" && verifiedSubtotal >= 150) {
      shippingPrice = 0;
    }

    const shippingTierRecord: ShippingTier = {
      id: (shippingTierId as "standard" | "express" | "overnight") || "standard",
      name: tierConfig.name,
      estimate: tierConfig.estimate,
      price: shippingPrice,
      description: tierConfig.description,
    };

    // 6. Calculate Server Promo Discount
    let discount = 0;
    if (promoCode === "NOVA20") {
      discount = +(verifiedSubtotal * 0.2).toFixed(2);
    } else if (promoCode === "WELCOME10") {
      discount = +(verifiedSubtotal * 0.1).toFixed(2);
    }

    // 7. Calculate Server Tax (8%) & Final Verified Total
    const taxableSubtotal = Math.max(0, verifiedSubtotal - discount);
    const tax = +(taxableSubtotal * 0.08).toFixed(2);
    const verifiedTotal = +(taxableSubtotal + shippingPrice + tax).toFixed(2);

    // 8. Generate Unique Order Receipt Identifiers
    const orderNumber = `NV-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-NV-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const paymentInfoRecord: PaymentInfo = {
      method: paymentMethod || "card",
      cardBrand: paymentMethod === "card" ? "Visa" : undefined,
      cardLast4: paymentMethod === "card" ? "4242" : undefined,
      cardHolder: addr.fullName,
    };

    // 9. Construct the Official Order Record
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
      shippingAddress: addr,
      estimatedDelivery: deliveryDate,
    };

    // Save in server database memory
    SERVER_ORDERS_DATABASE.unshift(newOrder);

    // 10. Return HTTP 201 Created response
    return NextResponse.json(
      {
        success: true,
        message: "Order successfully authorized and created on the backend.",
        order: newOrder,
      },
      { status: 201 }
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
