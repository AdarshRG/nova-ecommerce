// ==============================================================================
// FILE: components/wishlist/WishlistDrawer.tsx
// ARCHITECTURE ROLE: Interactive Client Wishlist Drawer Overlay Panel
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Rendered inside `app/page.tsx` and `app/products/[slug]/page.tsx`.
//   2. Subscribes to `useWishlistStore` to read saved `wishlistIds` and `isOpen` boolean.
//   3. Maps saved IDs to full product objects from `PRODUCTS` catalog.
//   4. Provides direct "Move to Bag" CTAs which add items to `useCartStore` and remove them from wishlist.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { PRODUCTS } from "../../data/products";

export default function WishlistDrawer() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    wishlistIds,
    isOpen,
    closeWishlist,
    toggleWishlist,
    clearWishlist,
  } = useWishlistStore();

  const { addItem, openCart } = useCartStore();

  // Hydration protection: prevent server/client storage hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  // Retrieve full Product objects matching saved wishlist IDs
  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  // Handler: Move item from Wishlist to Shopping Bag
  const handleMoveToBag = (product: (typeof PRODUCTS)[0]) => {
    addItem(product);
    toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeWishlist}
      />

      {/* Slide-Over Shell */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800/80 text-slate-50 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">❤️</span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Saved Favorites
              </h2>
              <span className="text-xs bg-rose-500/20 text-rose-400 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30">
                {savedProducts.length} {savedProducts.length === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={closeWishlist}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
              aria-label="Close Wishlist"
            >
              ✕
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl mb-4">
                  🤍
                </div>
                <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                  Save your favorite hardware gear by clicking the heart icon on any product card.
                </p>
                <button
                  onClick={closeWishlist}
                  className="mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              savedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center shadow-md hover:border-slate-700/80 transition-all"
                >
                  {/* Product Icon visual */}
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={closeWishlist}
                    className={`w-16 h-16 rounded-xl ${product.imageBg} flex items-center justify-center text-3xl shrink-0 border border-slate-800 hover:scale-105 transition-transform`}
                  >
                    {product.icon}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeWishlist}
                      className="block font-bold text-sm text-white truncate mt-0.5 hover:text-violet-300 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs font-black text-white mt-1 block">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleMoveToBag(product)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95"
                    >
                      + Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs text-center font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer controls */}
          {savedProducts.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  savedProducts.forEach((p) => addItem(p));
                  clearWishlist();
                  closeWishlist();
                  openCart();
                }}
                className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
              >
                Move All to Bag 🛍️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
