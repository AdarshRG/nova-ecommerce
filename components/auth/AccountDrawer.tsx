// ==============================================================================
// FILE: components/auth/AccountDrawer.tsx
// ARCHITECTURE ROLE: Customer Account Profile & Past Order History Drawer
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is this component?
//     When a customer is signed in, clicking on their profile button in the top navigation bar
//     slides out this panel from the right side of the screen.
//   What does it show?
//     1. User Profile Details: The customer's name, email, avatar initials, and VIP tier.
//     2. Real Order History: An invoice receipt list of every purchase they have made,
//        including the items bought, delivery status badges ("Delivered" / "Processing"),
//        and total amount paid.
//     3. Log Out Button: Allows the user to sign out cleanly.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/useAuthStore";

export default function AccountDrawer() {
  // Client hydration flag
  const [isMounted, setIsMounted] = useState(false);

  // Extract auth state and actions from store
  const {
    user,
    orders,
    isAccountDrawerOpen,
    closeAccountDrawer,
    logout,
  } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Guard Clause: Only render if client is mounted and drawer is open
  if (!isMounted || !isAccountDrawerOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeAccountDrawer}
      />

      {/* Slide-Over Shell Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800/80 text-slate-50 flex flex-col shadow-2xl">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👤</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Customer Account</h2>
            </div>
            <button
              onClick={closeAccountDrawer}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Profile Card Summary */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-4">
              {/* Avatar Initials Circle */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-violet-600/30 shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white truncate">
                    {user.name}
                  </h3>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    {user.memberTier}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Member since {user.joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Past Order History Section */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Order Receipts ({orders.length})
              </h4>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm font-bold text-white">No orders yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  When you complete a purchase, your invoice receipt and delivery tracking will appear here.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  {/* Order Top Bar: Number & Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-white">{order.orderNumber}</span>
                      <span className="text-slate-500 text-[10px] block">{order.date}</span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        order.status === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[200px]">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-bold text-white shrink-0">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total Paid */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-bold">
                    <span className="text-slate-400">Total Paid</span>
                    <span className="text-violet-400 text-sm font-black">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Track Order Action Link */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {order.trackingNumber || `TRK-${order.orderNumber}`}
                    </span>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      onClick={closeAccountDrawer}
                      className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors group"
                    >
                      <span>Track Order & Invoice</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Log Out Button */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/60">
            <button
              onClick={logout}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
