// ==============================================================================
// FILE: components/home/ProductCard.tsx
// ARCHITECTURE ROLE: Enterprise Interactive Product Card UI Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Rendered inside `<FeaturedProducts />` or catalog grids.
//   2. Displays product MSRP discounts, stock availability pills, star ratings, and category badges.
//   3. Navigates to `/products/[slug]` on card click while preserving direct "Add to Cart" button actions.
//   4. Day 3 Update: Triggers interactive Toast Notification via `addItem(product)` in Zustand store.
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  // Calculate discount percentage if original MSRP exists
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // EVENT HANDLER: handleAddToCart(e)
  // WHY USED: Halts card navigation redirect while adding item and firing Toast alert.
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-violet-950/20 hover:-translate-y-1">
      {/* Clickable Card Link */}
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Product Visual Container */}
        <div className="relative h-52 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 flex items-center justify-center border-b border-slate-800/60 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-violet-600/5 group-hover:bg-violet-600/10 transition-colors duration-300" />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Tag Badge (BEST SELLER / NEW ARRIVAL) */}
            {product.tag ? (
              <span className="bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-violet-400/30 shadow-sm">
                {product.tag}
              </span>
            ) : (
              <span />
            )}

            {/* Discount Pill Badge */}
            {discountPercent > 0 && (
              <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
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

        {/* Product Details Section */}
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

      {/* Footer Price & Quick Add Button */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-auto pt-4">
        {/* Price Display (Current + Original MSRP Strikethrough) */}
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

        {/* Add to Cart CTA Button */}
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
