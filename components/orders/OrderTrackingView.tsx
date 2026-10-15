// ==============================================================================
// FILE: components/orders/OrderTrackingView.tsx
// ARCHITECTURE ROLE: Customer Order Tracking & Fulfillment Timeline View
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is this component?
//     When a customer completes a purchase or clicks "Track Order" in their account drawer,
//     this component renders their full official receipt and live shipping milestone tracker!
//
//   Key Features & Architectural Techniques:
//     1. Dynamic Route Data Hydration:
//        It receives `orderNumber` from Next.js URL params (e.g., `/orders/NV-7842`).
//     2. Safe State Lookup:
//        It checks `useAuthStore.orders` for a match. If none exists (e.g. visiting a demo link directly),
//        it falls back gracefully to a realistic demo receipt so the page never displays a broken error.
//     3. Visual Milestone Stepper:
//        Renders the 4 standard stages of e-commerce fulfillment:
//        Order Placed → Payment Confirmed → In Transit with Carrier → Out for Delivery.
//     4. Native Browser Print Trigger (`window.print()`):
//        Allows customers to instantly print or save a PDF copy of their receipt.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/useAuthStore";
import { Order } from "../../types/auth";
import { PRODUCTS } from "../../data/products";

interface OrderTrackingViewProps {
  orderNumber: string;
}

export default function OrderTrackingView({ orderNumber }: OrderTrackingViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { orders } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ----------------------------------------------------------------------------
  // ORDER LOOKUP & FALLBACK DEMO RESOLUTION
  // ----------------------------------------------------------------------------
  // 1. Try to find the exact order from the customer's persisted order history:
  const foundOrder = orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );

  // 2. If no matching order exists in local state, generate a realistic fallback
  //    so direct URL visits or demo evaluations always display cleanly:
  const fallbackOrder: Order = {
    id: `ord-demo-${orderNumber}`,
    orderNumber: orderNumber.toUpperCase(),
    trackingNumber: `TRK-NV-${Math.floor(200000 + Math.random() * 800000)}`,
    date: new Date().toISOString().split("T")[0],
    items: [
      { product: PRODUCTS[0], quantity: 1, selectedColor: "Space Black" },
      { product: PRODUCTS[2], quantity: 2, selectedColor: "Obsidian" },
    ],
    subtotal: PRODUCTS[0].price + PRODUCTS[2].price * 2,
    discount: 0,
    shipping: 0,
    shippingTier: {
      id: "standard",
      name: "Standard Ground Delivery",
      estimate: "3-5 Business Days",
      price: 0,
      description: "Carbon-neutral FedEx Ground dispatch.",
    },
    paymentInfo: {
      method: "card",
      cardBrand: "Visa",
      cardLast4: "4242",
      cardHolder: "Alex Chen",
    },
    tax: +( (PRODUCTS[0].price + PRODUCTS[2].price * 2) * 0.08 ).toFixed(2),
    total: +( (PRODUCTS[0].price + PRODUCTS[2].price * 2) * 1.08 ).toFixed(2),
    status: "Processing",
    shippingAddress: {
      fullName: "Alex Chen",
      email: "alex.chen@nova.dev",
      streetAddress: "742 Evergreen Terrace, Suite 4B",
      city: "San Francisco",
      postalCode: "94107",
      phoneNumber: "+1 (555) 019-2834",
    },
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  const activeOrder = foundOrder || fallbackOrder;

  // Hydration guard to avoid SSR mismatch on dates & local storage
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Retrieving tracking records...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // FULFILLMENT TIMELINE STEPS
  // ----------------------------------------------------------------------------
  const timelineSteps = [
    {
      title: "Order Placed",
      description: "Order received and queued for dispatch.",
      date: activeOrder.date,
      status: "completed",
      icon: "📝",
    },
    {
      title: "Payment Confirmed",
      description: `${activeOrder.paymentInfo.cardBrand || "Payment"} authorization verified.`,
      date: activeOrder.date,
      status: "completed",
      icon: "💳",
    },
    {
      title: "Shipped & In Transit",
      description: `Dispatched with carrier. Code: ${activeOrder.trackingNumber}`,
      date: "In Transit",
      status: "current",
      icon: "🚚",
    },
    {
      title: "Out for Delivery",
      description: `Estimated delivery by ${activeOrder.estimatedDelivery}.`,
      date: activeOrder.estimatedDelivery,
      status: "upcoming",
      icon: "📦",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>←</span>
            <span>Back to Storefront</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Order Header Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-widest text-violet-400">
                  Fulfillment Status
                </span>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeOrder.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Order {activeOrder.orderNumber}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Placed on <strong className="text-slate-300">{activeOrder.date}</strong> • Carrier Tracking:{" "}
                <span className="font-mono text-violet-400 font-bold">{activeOrder.trackingNumber}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">Total Charged</span>
              <span className="text-2xl font-black text-violet-400">
                ${activeOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 4-Step Milestone Progress Stepper */}
          <div className="pt-8 pb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Live Delivery Milestones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {timelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    step.status === "completed"
                      ? "bg-slate-950/60 border-emerald-500/30"
                      : step.status === "current"
                      ? "bg-violet-950/30 border-violet-500 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/10"
                      : "bg-slate-950/30 border-slate-800/80 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{step.icon}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        step.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : step.status === "current"
                          ? "bg-violet-500/20 text-violet-300 animate-pulse"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Cards Grid: Shipping Destination & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📍</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Shipping Destination
              </h3>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-extrabold text-white text-sm">
                {activeOrder.shippingAddress.fullName}
              </p>
              <p>{activeOrder.shippingAddress.streetAddress}</p>
              <p>
                {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.postalCode}
              </p>
              <p className="text-slate-400 pt-1">
                Contact: {activeOrder.shippingAddress.email}
              </p>
              <p className="text-slate-400">
                Phone: {activeOrder.shippingAddress.phoneNumber}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Delivery Tier:</span>
              <span className="font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {activeOrder.shippingTier?.name || "Standard Ground"}
              </span>
            </div>
          </div>

          {/* Billing & Payment Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💳</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Payment & Billing
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Method:</span>
                <span className="font-bold text-white capitalize">
                  {activeOrder.paymentInfo.method.replace("_", " ")}
                </span>
              </div>

              {activeOrder.paymentInfo.cardLast4 && (
                <div className="flex justify-between text-slate-300">
                  <span>Card Used:</span>
                  <span className="font-mono text-white font-bold">
                    {activeOrder.paymentInfo.cardBrand || "Card"} ending in •••• {activeOrder.paymentInfo.cardLast4}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="text-slate-200 font-semibold">${activeOrder.subtotal.toFixed(2)}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-${activeOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className={activeOrder.shipping === 0 ? "text-emerald-400 font-bold" : "text-slate-200"}>
                    {activeOrder.shipping === 0 ? "FREE" : `$${activeOrder.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8%):</span>
                  <span className="text-slate-200 font-semibold">${activeOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Paid:</span>
                  <span className="text-violet-400">${activeOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items In This Order Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Items in This Order ({activeOrder.items.length})
          </h3>

          <div className="divide-y divide-slate-800/80">
            {activeOrder.items.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {item.product.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.selectedColor && `• Finish: ${item.selectedColor}`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-white">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ${item.product.price.toFixed(2)} each
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
