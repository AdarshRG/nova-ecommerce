// ==============================================================================
// FILE: components/cart/CartDrawer.tsx
// ARCHITECTURE ROLE: Interactive Enterprise Client Shopping Bag (Slide-Over Drawer)
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Rendered inside `app/page.tsx` and `app/products/[slug]/page.tsx`.
//   2. Day 3 Enhancements:
//      - Handles hydration safety guard for Zustand `localStorage` persistence.
//      - Features dynamic Free Shipping progress bar ($99 target).
//      - Supports promo code discounts (e.g. `NOVANEXT` for $15 OFF).
//      - Calculates subtotal, shipping fee, discount, and final total.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "../../store/useCartStore";

export default function CartDrawer() {
  const [isMounted, setIsMounted] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    appliedPromo,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    getSubtotalPrice,
    getShippingFee,
    getFinalPrice,
    getFreeShippingRemaining,
    getFreeShippingPercent,
    getTotalItems
  } = useCartStore();

  // Hydration safety: set `isMounted` to true after client mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  const subtotal = getSubtotalPrice();
  const shipping = getShippingFee();
  const finalPrice = getFinalPrice();
  const freeShippingRemaining = getFreeShippingRemaining();
  const freeShippingPercent = getFreeShippingPercent();
  const totalItemsCount = getTotalItems();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    if (!promoInput.trim()) return;

    const result = applyPromoCode(promoInput);
    if (!result.success) {
      setPromoError(result.message);
    } else {
      setPromoInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Slide-Over Drawer Shell */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800/80 text-slate-50 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛍️</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Your Shopping Bag</h2>
              <span className="text-xs bg-violet-600/20 text-violet-400 font-bold px-2.5 py-0.5 rounded-full border border-violet-500/30">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
              aria-label="Close Bag"
            >
              ✕
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {items.length > 0 && (
            <div className="bg-slate-900 p-4 border-b border-slate-800/80">
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-slate-300">
                  {freeShippingRemaining === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span>🎉</span> You unlocked Free Express Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-white">${freeShippingRemaining.toFixed(2)}</strong> more for Free Express Shipping
                    </span>
                  )}
                </span>
                <span className="text-violet-400 font-bold">
                  {freeShippingPercent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item Scrollable List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl mb-4">
                  🛍️
                </div>
                <h3 className="text-lg font-bold text-white">Your bag is empty</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                  Looks like you haven't added any NOVA gear yet. Explore our catalog and upgrade your setup today.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center shadow-md hover:border-slate-700/80 transition-all"
                >
                  {/* Item Image / Graphic */}
                  <div
                    className={`w-16 h-16 rounded-xl ${item.product.imageBg} flex items-center justify-center text-3xl shrink-0 border border-slate-800`}
                  >
                    {item.product.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {item.product.category}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate mt-0.5">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold flex items-center justify-center text-slate-300 transition-colors"
                        aria-label="Decrease Quantity"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold flex items-center justify-center text-slate-300 transition-colors"
                        aria-label="Increase Quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors p-1"
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                    <span className="font-black text-sm text-white tracking-tight">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Order Summary & Checkout Section */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
              {/* Promo Code Input Form */}
              <div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span>🏷️</span> Code "{appliedPromo}" (-${discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. NOVANEXT)"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-400 font-bold" : "text-slate-200 font-semibold"}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-violet-400">${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-3 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs rounded-xl font-bold transition-colors"
                >
                  Clear Bag
                </button>
                <button className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 font-black text-white text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <span>Checkout Now</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
