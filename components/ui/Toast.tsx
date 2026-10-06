// ==============================================================================
// FILE: components/ui/Toast.tsx
// ARCHITECTURE ROLE: Interactive Client Toast Alert Component
//
// ROUTE MAP & STATE FLOW:
//   1. Subscribes to `toastNotification` and `hideToast()` from `store/useCartStore.ts`.
//   2. Mounted inside `app/layout.tsx` or `app/page.tsx` so it overlays globally across all routes.
//   3. Auto-dismisses after 4 seconds using a standard `setTimeout` hook.
//   4. Provides direct "View Bag" button to open the slide-over `CartDrawer`.
// ==============================================================================

"use client";

import React, { useEffect } from "react";
import { useCartStore } from "../../store/useCartStore";

export default function Toast() {
  const { toastNotification, hideToast, openCart } = useCartStore();

  // Auto-dismiss timer logic: clear notification after 4000ms
  useEffect(() => {
    if (!toastNotification) return;

    const timer = setTimeout(() => {
      hideToast();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastNotification, hideToast]);

  if (!toastNotification) return null;

  const { message, product, type } = toastNotification;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Status Badge / Product Thumbnail */}
          {product ? (
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-700/50">
              {product.icon}
            </div>
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                type === "success"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}
            >
              ✓
            </div>
          )}

          {/* Message Text */}
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
              {type === "success" ? "Cart Updated" : "System Alert"}
            </p>
            <p className="text-xs text-slate-200 font-medium line-clamp-2">
              {message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {product && (
            <button
              onClick={() => {
                hideToast();
                openCart();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              View Bag
            </button>
          )}

          {/* Close X Button */}
          <button
            onClick={hideToast}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
            aria-label="Close Notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
