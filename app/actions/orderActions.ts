// ==============================================================================
// FILE: app/actions/orderActions.ts
// ARCHITECTURE ROLE: Next.js 16 / React 19 Server Actions Layer
//
// 🎓 BEGINNER'S GUIDE TO SERVER ACTIONS:
//   What is a Server Action (`"use server"`)?
//     In modern Next.js 16 and React 19, you don't always have to create a separate
//     REST API endpoint and write `fetch("/api/...")`.
//     Instead, by placing `"use server"` at the top of a file, any exported function
//     runs EXCLUSIVELY on the server (Node.js environment)!
//
//   Why is this amazing?
//     1. Direct Function Call: Your frontend React component can simply `import { submitOrderAction }`
//        and call it like an ordinary asynchronous function (`await submitOrderAction(...)`)!
//     2. Type Safety: TypeScript types flow effortlessly between frontend and backend without
//        manual JSON encoding and decoding.
//     3. Security: Code inside this file has access to server environment secrets, databases,
//        and API keys that are NEVER sent to the user's browser.
// ==============================================================================

"use server";

import { PRODUCTS } from "../../data/products";
import { Order, ShippingTier, PaymentInfo } from "../../types/auth";
import { CartItem, AddressFormData } from "../../types/product";

export interface OrderActionPayload {
  items: CartItem[];
  address: AddressFormData;
  shippingTierId: "standard" | "express" | "overnight";
  paymentMethod: "card" | "apple_pay" | "paypal";
  promoCode?: string;
}

export interface OrderActionResult {
  success: boolean;
  order?: Order;
  error?: string;
}

/**
 * Server Action: submitOrderAction
 * Runs securely on the server to validate items, compute totals, and create an order.
 */
export async function submitOrderAction(
  payload: OrderActionPayload
): Promise<OrderActionResult> {
  try {
    const { items, address, shippingTierId, paymentMethod, promoCode } = payload;

    // 1. Validation on the server
    if (!items || items.length === 0) {
      return { success: false, error: "Shopping bag cannot be empty." };
    }

    if (!address.fullName || !address.email || !address.streetAddress) {
      return { success: false, error: "Please complete all required shipping fields." };
    }

    // 2. Server-side price calculation (Zero-Trust Security)
    let subtotal = 0;
    const verifiedItems: CartItem[] = [];

    for (const item of items) {
      const genuineProduct = PRODUCTS.find((p) => p.id === item.product.id);
      if (!genuineProduct) {
        return { success: false, error: `Invalid product in bag: ${item.product.name}` };
      }
      subtotal += genuineProduct.price * item.quantity;
      verifiedItems.push({
        product: genuineProduct,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      });
    }

    // 3. Shipping fee calculation
    let shippingPrice = 15.0;
    if (shippingTierId === "standard") {
      shippingPrice = subtotal >= 150 ? 0 : 15.0;
    } else if (shippingTierId === "express") {
      shippingPrice = 25.0;
    } else if (shippingTierId === "overnight") {
      shippingPrice = 45.0;
    }

    const shippingTier: ShippingTier = {
      id: shippingTierId,
      name:
        shippingTierId === "standard"
          ? "Standard Ground Delivery"
          : shippingTierId === "express"
          ? "Express Priority Air"
          : "Next-Day Morning Rush",
      estimate:
        shippingTierId === "standard"
          ? "3-5 Business Days"
          : shippingTierId === "express"
          ? "1-2 Business Days"
          : "Tomorrow by 10:30 AM",
      price: shippingPrice,
      description: "Carbon-neutral verified carrier dispatch.",
    };

    // 4. Promo code calculation
    let discount = 0;
    if (promoCode === "NOVA20") {
      discount = +(subtotal * 0.2).toFixed(2);
    } else if (promoCode === "WELCOME10") {
      discount = +(subtotal * 0.1).toFixed(2);
    }

    // 5. Tax & Total calculation
    const tax = +((subtotal - discount) * 0.08).toFixed(2);
    const total = +(subtotal - discount + shippingPrice + tax).toFixed(2);

    // 6. Generate order receipt
    const orderNumber = `NV-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-NV-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const paymentInfo: PaymentInfo = {
      method: paymentMethod,
      cardBrand: paymentMethod === "card" ? "Visa" : undefined,
      cardLast4: paymentMethod === "card" ? "4242" : undefined,
      cardHolder: address.fullName,
    };

    const order: Order = {
      id: `ord-sa-${Date.now()}`,
      orderNumber,
      trackingNumber,
      date: new Date().toISOString().split("T")[0],
      items: verifiedItems,
      subtotal,
      discount,
      shipping: shippingPrice,
      shippingTier,
      paymentInfo,
      tax,
      total,
      status: "Processing",
      shippingAddress: address,
      estimatedDelivery: deliveryDate,
    };

    // Simulate database write operation
    return {
      success: true,
      order,
    };
  } catch (err) {
    console.error("Error executing submitOrderAction:", err);
    return {
      success: false,
      error: "Server Action failed to process order.",
    };
  }
}

/**
 * Server Action: subscribeNewsletterAction
 * Demonstrates handling customer newsletter subscriptions on the server.
 */
export async function subscribeNewsletterAction(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email")?.toString().trim();

  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  // Simulate server database insert delay
  await new Promise((res) => setTimeout(res, 500));

  return {
    success: true,
    message: `Thank you for subscribing! VIP member perks sent to ${email}.`,
  };
}
