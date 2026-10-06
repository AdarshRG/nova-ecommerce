// ==============================================================================
// FILE: components/layout/Header.tsx
// ARCHITECTURE ROLE: Sticky Glassmorphism Top Navigation Header Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted in `app/page.tsx` and `app/products/[slug]/page.tsx`.
//   2. Subscribes to Zustand `useCartStore` to calculate live item count (`getTotalItems()`).
//   3. Features client hydration safety check to prevent SSR mismatch during hydration.
//   4. Triggers slide-over `CartDrawer` when user clicks the shopping bag button.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../../store/useCartStore";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, openCart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = isMounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NOVA
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-violet-400 -mt-1">
              STOREFRONT 2026
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <a href="#featured" className="hover:text-white transition-colors">
            Featured
          </a>
          <a href="#categories" className="hover:text-white transition-colors">
            Categories
          </a>
          <a
            href="#featured"
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>⚡ Deals</span>
          </a>
        </nav>

        {/* Action Controls & Shopping Bag Button */}
        <div className="flex items-center gap-4">
          <a
            href="#featured"
            className="hidden sm:flex items-center gap-2.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 hover:border-slate-700 transition-all cursor-pointer"
          >
            <span>🔍 Search products...</span>
            <kbd className="text-[10px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </a>

          {/* Cart Bag Trigger */}
          <button
            onClick={openCart}
            aria-label="Open Shopping Bag"
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-slate-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">🛍️</span>
            <span className="text-xs font-bold text-white hidden sm:inline">Bag</span>

            {/* Live Count Badge */}
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-violet-600 text-[11px] font-black text-white flex items-center justify-center shadow-lg shadow-violet-600/40 animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
