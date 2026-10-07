// ==============================================================================
// FILE: components/home/ProductCard.tsx
// ARCHITECTURE ROLE: Enterprise Interactive Product Card UI Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Rendered inside `<FeaturedProducts />` or catalog grid arrays.
//   2. Subscribes to `useCartStore` (`addItem`) and `useWishlistStore` (`toggleWishlist`, `isInWishlist`).
//   3. Day 4 Update: Features interactive heart toggle (❤️ / 🤍) for persistent user wishlist management.
//   4. Prevents card navigation triggering when clicking heart button or "Add to Bag" button.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFavorited = isMounted ? isInWishlist(product.id) : false;

  // Calculate discount percentage if original MSRP exists
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // EVENT HANDLER: handleAddToCart(e)
  // Halts card navigation redirect while adding item and firing Toast alert.
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  // EVENT HANDLER: handleToggleWishlist(e)
  // Halts card navigation redirect while toggling favorite status.
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-violet-950/20 hover:-translate-y-1">
      {/* Clickable Card Link Body */}
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Product Visual Box */}
        <div className="relative h-52 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 flex items-center justify-center border-b border-slate-800/60 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-violet-600/5 group-hover:bg-violet-600/10 transition-colors duration-300" />

          {/* Badges Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Tag Badge */}
            {product.tag ? (
              <span className="bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-violet-400/30 shadow-sm">
                {product.tag}
              </span>
            ) : (
              <span />
            )}

            {/* Interactive Wishlist Heart Button */}
            <button
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all shadow-md active:scale-90 ${
                isFavorited
                  ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
              aria-label="Save to Wishlist"
            >
              {isFavorited ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Product Icon Visual Graphic */}
          <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 z-0">
            {product.icon}
          </div>

          {/* Stock Availability Pill */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                product.stockCount < 10
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />
            <span className="text-[10px] font-semibold text-slate-300">
              {product.stockCount < 10
                ? `Only ${product.stockCount} Left`
                : "In Stock"}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                {product.category}
              </span>

              {/* Customer Rating Stars */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs font-bold text-white">
                  {product.rating}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            <h3 className="font-bold text-white text-base mt-2 line-clamp-1 group-hover:text-violet-300 transition-colors">
              {product.name}
            </h3>

            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </Link>

      {/* Footer Price & Quick Add CTA */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-auto pt-4">
        <div className="flex flex-col">
          {product.originalPrice && (
            <span className="text-xs text-slate-500 line-through font-medium">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-black text-white tracking-tight">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center gap-1.5"
        >
          <span>+ Add to Bag</span>
        </button>
      </div>
    </div>
  );
}
