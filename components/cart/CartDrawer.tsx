// ==============================================================================
// FILE: components/cart/CartDrawer.tsx
// ARCHITECTURE ROLE: Interactive Client-Side Cart Overlay (Slide-Over Drawer)
//
// ROUTE MAP & COMPONENT FLOW:
//   1. This file is imported into `app/page.tsx` and `app/products/[slug]/page.tsx`.
//   2. Marked with `'use client'` directive because it relies on client-side state hooks (`useCartStore`).
//   3. Reads `isOpen` boolean from `useCartStore`. If `false`, renders nothing (`null`).
//   4. If `true`, slides in from right edge over a dimmed backdrop overlay.
//   5. Triggers `updateQuantity`, `removeItem`, `clearCart`, or `closeCart` actions on user interaction.
// ==============================================================================

"use client"; // Required: Allows client-side React hooks and event listeners (onClick)

import React from "react";
// WHY IMPORTED: Accesses global cart state values (`items`, `isOpen`) and store mutation methods.
import { useCartStore } from "../../store/useCartStore";

// ==============================================================================
// FUNCTION: CartDrawer()
// WHY USED: Main functional component rendering the shopping cart drawer.
// HOW IT IS CALLED: Rendered at top of root pages (`<CartDrawer />`).
// ==============================================================================
export default function CartDrawer() {
  // Extract state properties and action functions from Zustand hook
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCartStore();

  // Guard Clause: Render nothing when drawer is closed to keep DOM light
  if (!isOpen) return null;

  // Calculate dynamic subtotal
  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Overlay Backdrop: Clicking this backdrop invokes `closeCart()` */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-Over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-50 flex flex-col shadow-2xl">
          
          {/* Drawer Title Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
              <span className="text-xs bg-violet-500/20 text-violet-400 font-semibold px-2 py-0.5 rounded-full border border-violet-500/30">
                {items.length} items
              </span>
            </div>
            {/* Close Button: Calls `closeCart()` */}
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Item Scrollable List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Conditional Rendering: Render Empty State if no items in cart */}
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  Looks like you haven't added any NOVA gear to your bag yet.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              // Map over `items` array to display individual CartItem rows
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex gap-4 items-center"
                >
                  <div className={`w-16 h-16 rounded-lg ${item.product.imageBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {item.product.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    {/* Quantity Controls (- / + buttons) */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-300"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Delete Button */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                    >
                      🗑️
                    </button>
                    <span className="font-bold text-sm text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary (Rendered only if items exist) */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-violet-400">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs rounded-xl font-semibold transition-colors"
                >
                  Clear
                </button>
                <button className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all">
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
