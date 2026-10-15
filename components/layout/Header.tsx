// ==============================================================================
// FILE: components/layout/Header.tsx
// ARCHITECTURE ROLE: Sticky Top Navigation Header Component
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What does this component do?
//     This is the sticky navbar that stays at the top of your screen as you scroll.
//   Notice how it integrates multiple global features cleanly:
//     1. Brand Logo: Clicking "NOVA" takes you home.
//     2. Search Trigger: Clicking or pressing ⌘K opens the Quick Search Modal.
//     3. Compare Button: Shows up dynamically when you compare products (`⇄ Compare`).
//     4. Wishlist Button: Shows how many favorite items you saved (`❤️`).
//     5. Bag Button: Shows the total number of items in your cart (`🛍️`).
//     6. Customer Auth Button: If you are signed in, it shows your avatar initials;
//        if signed out, it shows a "Sign In" button!
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCompareStore } from "../../store/useCompareStore";
import { useAuthStore } from "../../store/useAuthStore";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  // Hydration safety flag
  const [isMounted, setIsMounted] = useState(false);

  // Zustand Store Selectors
  const { getTotalItems, openCart } = useCartStore();
  const { getTotalWishlistItems, openWishlist } = useWishlistStore();
  const { getCompareCount, openCompare } = useCompareStore();
  const { user, isAuthenticated, openAuthModal, openAccountDrawer } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute live counts safely after client mounts
  const totalCartItems = isMounted ? getTotalItems() : 0;
  const totalWishlistItems = isMounted ? getTotalWishlistItems() : 0;
  const totalCompareItems = isMounted ? getCompareCount() : 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* 1. Brand Logo & Title */}
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

        {/* 2. Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <a href="/#categories" className="hover:text-white transition-colors">
            Departments
          </a>
          <a href="/#featured" className="hover:text-white transition-colors">
            Featured
          </a>
          <a
            href="/#featured"
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>⚡ Deals</span>
          </a>
        </nav>

        {/* 3. Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Command-K (⌘K) Quick Search Button Trigger */}
          <button
            id="global-search-trigger"
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 hover:border-slate-700 transition-all cursor-pointer hover:text-white"
            aria-label="Quick Search"
          >
            <span>🔍 Search products...</span>
            <kbd className="text-[10px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Comparison Matrix Trigger (renders when items are in compare list) */}
          {totalCompareItems > 0 && (
            <button
              onClick={openCompare}
              aria-label="Open Comparison Matrix"
              className="relative p-2.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-700/60 transition-all text-violet-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              title="Open Side-by-Side Comparison"
            >
              <span className="text-sm font-bold">⇄</span>
              <span className="text-xs font-bold hidden sm:inline">Compare</span>
              <span className="min-w-4 h-4 px-1 rounded-full bg-violet-600 text-[10px] font-black text-white flex items-center justify-center shadow-md animate-pulse">
                {totalCompareItems}
              </span>
            </button>
          )}

          {/* Saved Favorites Wishlist Button */}
          <button
            onClick={openWishlist}
            aria-label="Open Saved Wishlist"
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-slate-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span className="text-lg">❤️</span>
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-[11px] font-black text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse">
                {totalWishlistItems}
              </span>
            )}
          </button>

          {/* Customer Profile / Sign In Button */}
          {isMounted && isAuthenticated && user ? (
            <button
              onClick={openAccountDrawer}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white font-bold transition-all active:scale-95"
              title="Open Account & Orders"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-[10px] flex items-center justify-center font-black">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold transition-all hover:text-white active:scale-95 flex items-center gap-1.5"
            >
              <span>👤</span>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Shopping Bag Button */}
          <button
            onClick={openCart}
            aria-label="Open Shopping Bag"
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-slate-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">🛍️</span>
            <span className="text-xs font-bold text-white hidden sm:inline">Bag</span>

            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-violet-600 text-[11px] font-black text-white flex items-center justify-center shadow-lg shadow-violet-600/40 animate-pulse">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
