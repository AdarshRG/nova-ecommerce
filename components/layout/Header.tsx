// ==============================================================================
// FILE: components/layout/Header.tsx
// ARCHITECTURE ROLE: Sticky Top Navigation Bar Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Included inside `app/page.tsx` and `app/products/[slug]/page.tsx`.
//   2. Marked with `'use client'` because it subscribes to `useCartStore`.
//   3. Calls `getTotalItems()` to render real-time badge count over the cart icon button.
//   4. Calls `openCart()` when user clicks cart icon to open `<CartDrawer />`.
// ==============================================================================

"use client";

import React from "react";
// `Link` from "next/link": Navigates back to home page `/`
import Link from "next/link";
// `useCartStore` from "../../store/useCartStore": Subscribes to total items & drawer trigger action
import { useCartStore } from "../../store/useCartStore";

export default function Header() {
  // Extract total item counter and open cart drawer trigger from Zustand store
  const { getTotalItems, openCart } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo Link to Home `/` */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            NOVA
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">
            Shop
          </Link>
          <a href="#categories" className="hover:text-white transition-colors">
            Categories
          </a>
          <a href="#featured" className="hover:text-white transition-colors">
            Featured
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Deals
          </a>
        </nav>

        {/* Action Controls & Cart Trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-700 transition-colors">
            <span>🔍 Search products...</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </div>

          {/* Cart Button: Invokes `openCart()` on click */}
          <button
            onClick={openCart}
            aria-label="Open Shopping Cart"
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-slate-200 hover:scale-105"
          >
            🛒
            {/* Animated Badge Counter rendered when totalItems > 0 */}
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-600 text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
