// ==============================================================================
// FILE: components/compare/ProductCompareDrawer.tsx
// ARCHITECTURE ROLE: Interactive Multi-Product Specifications Comparison Matrix Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted inside `<ClientOverlays />` to be universally accessible across all routes.
//   2. Subscribes to `useCompareStore` (`compareList`, `isOpen`, `removeFromCompare`, `clearCompare`).
//   3. Subscribes to `useCartStore` (`addItem`) to enable instant direct checkout additions.
//   4. Renders two distinct UI states:
//      a) Floating Sticky Bottom Dock: Visible whenever 1+ items are queued for comparison.
//      b) Full Comparison Modal Matrix: Fullscreen overlay providing side-by-side technical specs tables.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCompareStore, MAX_COMPARE_LIMIT } from "../../store/useCompareStore";
import { useCartStore } from "../../store/useCartStore";

export default function ProductCompareDrawer() {
  // Hydration safety flag to prevent server/client localStorage mismatches
  const [isMounted, setIsMounted] = useState(false);

  // Zustand State & Selectors
  const {
    compareList,
    isOpen,
    removeFromCompare,
    clearCompare,
    openCompare,
    closeCompare,
  } = useCompareStore();

  const { addItem } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Extract all unique specification keys across all currently compared items
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap((p) => Object.keys(p.specs || {})))
  );

  return (
    <>
      {/* =========================================================================
          PART 1: STICKY FLOATING BOTTOM DOCK (Visible when items are in compare list)
          ========================================================================= */}
      {compareList.length > 0 && !isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-violet-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-4">
            {/* Left: Summary text & item thumbnails */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2 shrink-0">
                {compareList.map((product) => (
                  <div
                    key={product.id}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl shadow-md"
                    title={product.name}
                  >
                    {product.icon}
                  </div>
                ))}
              </div>

              <div className="min-w-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>⇄</span> Comparing {compareList.length} of {MAX_COMPARE_LIMIT} items
                </span>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  {compareList.map((p) => p.name).join(" vs ")}
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={openCompare}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>View Matrix</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PART 2: FULLSIDE COMPARISON MATRIX MODAL OVERLAY
          ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          {/* Dimmed Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={closeCompare}
          />

          {/* Main Modal Shell */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-50 z-10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
                  Head-to-Head Hardware Matrix
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1.5">
                  Product Comparison ({compareList.length}/{MAX_COMPARE_LIMIT})
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearCompare}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                >
                  Clear Matrix
                </button>
                <button
                  onClick={closeCompare}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
                  aria-label="Close Comparison"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Matrix Table Body */}
            <div className="flex-1 overflow-auto p-6">
              {compareList.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-5xl mb-4">⇄</div>
                  <h3 className="text-lg font-bold text-white">No products in comparison</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                    Click the "⇄ Compare" button on any product card in the catalog to add items side-by-side.
                  </p>
                  <button
                    onClick={closeCompare}
                    className="mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="min-w-[640px]">
                  {/* Grid Columns Header: 1 Label Column + N Product Columns */}
                  <div
                    className="grid gap-4 items-start pb-6 border-b border-slate-800/80"
                    style={{
                      gridTemplateColumns: `200px repeat(${compareList.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    {/* Empty top-left cell */}
                    <div className="font-bold text-xs text-slate-500 uppercase tracking-wider pt-4">
                      Overview & Pricing
                    </div>

                    {/* Product Cards Top Row */}
                    {compareList.map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-slate-700"
                      >
                        {/* Remove X from compare */}
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 text-xs"
                          title="Remove from comparison"
                        >
                          ✕
                        </button>

                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mb-3 shadow-md">
                            {product.icon}
                          </div>
                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                            {product.category}
                          </span>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeCompare}
                            className="font-bold text-xs text-white mt-1 line-clamp-2 hover:text-violet-300"
                          >
                            {product.name}
                          </Link>
                          <div className="mt-2 text-base font-black text-white">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Quick Add to Bag */}
                        <button
                          onClick={() => addItem(product)}
                          className="mt-3 w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                          + Add to Bag
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Specification Row: Customer Rating */}
                  <div
                    className="grid gap-4 py-3 border-b border-slate-800/60 text-xs items-center"
                    style={{
                      gridTemplateColumns: `200px repeat(${compareList.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-slate-400">Customer Rating</span>
                    {compareList.map((p) => (
                      <span key={p.id} className="font-semibold text-amber-400">
                        ★ {p.rating} <span className="text-slate-500 text-[11px]">({p.reviewCount} reviews)</span>
                      </span>
                    ))}
                  </div>

                  {/* Specification Row: Stock Status */}
                  <div
                    className="grid gap-4 py-3 border-b border-slate-800/60 text-xs items-center"
                    style={{
                      gridTemplateColumns: `200px repeat(${compareList.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-slate-400">Stock Availability</span>
                    {compareList.map((p) => (
                      <span
                        key={p.id}
                        className={p.inStock ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}
                      >
                        {p.inStock ? `In Stock (${p.stockCount} units)` : "Sold Out"}
                      </span>
                    ))}
                  </div>

                  {/* Dynamic Technical Specs Rows */}
                  {allSpecKeys.map((specKey) => (
                    <div
                      key={specKey}
                      className="grid gap-4 py-3 border-b border-slate-800/60 text-xs items-center"
                      style={{
                        gridTemplateColumns: `200px repeat(${compareList.length}, minmax(180px, 1fr))`,
                      }}
                    >
                      <span className="font-bold text-slate-400">{specKey}</span>
                      {compareList.map((p) => (
                        <span key={p.id} className="font-medium text-slate-200">
                          {p.specs[specKey] || "—"}
                        </span>
                      ))}
                    </div>
                  ))}

                  {/* Key Features Bullet Points Row */}
                  <div
                    className="grid gap-4 py-4 text-xs items-start"
                    style={{
                      gridTemplateColumns: `200px repeat(${compareList.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-slate-400 pt-1">Key Features</span>
                    {compareList.map((p) => (
                      <ul key={p.id} className="space-y-1 text-slate-300">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-violet-400 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
