// ==============================================================================
// FILE: components/home/RecentlyViewedSection.tsx
// ARCHITECTURE ROLE: Dynamic User Browsing History Carousel/Grid Section
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is this component?
//     This component checks what products the user has looked at recently and displays
//     them in a clean row at the bottom of the page.
//   How does it work?
//     1. It reads `recentIds` from `useRecentlyViewedStore`.
//     2. It filters out `currentProductId` (if we are on the Product Detail Page, we don't
//        want to show the same item you are already looking at in your history!).
//     3. It looks up each product ID in our `PRODUCTS` catalog.
//     4. If the user hasn't viewed any products yet, it returns `null` (rendering nothing).
//     5. If items exist, it renders them with quick Add to Bag and Quick View buttons!
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "../../store/useRecentlyViewedStore";
import { useQuickViewStore } from "../../store/useQuickViewStore";
import { useCartStore } from "../../store/useCartStore";
import { PRODUCTS } from "../../data/products";
import { Product } from "../../types/product";

interface RecentlyViewedProps {
  currentProductId?: string; // Optional ID to exclude from history (e.g. on PDP)
}

export default function RecentlyViewedSection({ currentProductId }: RecentlyViewedProps) {
  // Hydration safety flag
  const [isMounted, setIsMounted] = useState(false);

  const { recentIds, clearRecentlyViewed } = useRecentlyViewedStore();
  const { openQuickView } = useQuickViewStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Before hydration completes, don't render to prevent SSR differences
  if (!isMounted) return null;

  // Filter out the current product being viewed if specified
  const filteredIds = currentProductId
    ? recentIds.filter((id) => id !== currentProductId)
    : recentIds;

  // Map IDs to full Product objects
  const recentProducts: Product[] = filteredIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  // If user hasn't browsed any products, render nothing
  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 border-t border-slate-900 w-full max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
            Browsing History
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Recently Viewed Hardware
          </h2>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Grid of Recently Viewed Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProducts.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="group bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Link href={`/products/${product.slug}`} className="block">
              {/* Product Visual Box */}
              <div className="relative h-36 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center text-4xl mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {product.icon}
              </div>

              {/* Title & Price */}
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">
                {product.category}
              </span>
              <h4 className="font-bold text-xs text-white truncate mt-0.5 group-hover:text-violet-300 transition-colors">
                {product.name}
              </h4>
              <span className="text-sm font-black text-white mt-1 block">
                ${product.price.toFixed(2)}
              </span>
            </Link>

            {/* Quick Action Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => openQuickView(product)}
                className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 rounded-lg transition-colors"
              >
                Quick View
              </button>
              <button
                onClick={() => addItem(product)}
                className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow-md active:scale-95 text-xs font-bold"
                title="Add to Bag"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
