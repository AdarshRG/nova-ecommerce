// ==============================================================================
// FILE: components/home/ProductCard.tsx
// ARCHITECTURE ROLE: Enterprise Interactive Product Card UI Component
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What does this component do?
//     This component renders each individual product card in our grids.
//   Notice how it handles multiple user actions seamlessly:
//     1. Card Navigation: Clicking the card takes you to the full product page (`/products/[slug]`).
//     2. "Quick View" Button: Opens a preview modal without leaving the page.
//     3. "⇄ Compare" Button: Adds the item to your side-by-side comparison dock.
//     4. "❤️ Wishlist" Button: Saves the item to your favorites.
//     5. "+ Add to Bag" Button: Puts the item directly in your shopping cart.
//   How do we prevent button clicks from accidentally opening the product link?
//     We use `e.preventDefault()`!
//     In normal HTML, if a button is inside an `<a href="...">` link, clicking the button
//     would also trigger the link. `e.preventDefault()` stops that bubbling so only the
//     button action runs!
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCompareStore } from "../../store/useCompareStore";
import { useQuickViewStore } from "../../store/useQuickViewStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Client hydration flag to prevent server/client storage rehydration mismatches
  const [isMounted, setIsMounted] = useState(false);

  // Store Hooks: Accessing state actions from our global stores
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();
  const { openQuickView } = useQuickViewStore();

  // Once mounted in the browser, enable reading client-side storage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute active state flags safely after client mounts
  const isFavorited = isMounted ? isInWishlist(product.id) : false;
  const isCompared = isMounted ? isInCompare(product.id) : false;

  // Calculate percentage discount from MSRP original price
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // EVENT HANDLER 1: Add product to shopping bag
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    addItem(product);
  };

  // EVENT HANDLER 2: Toggle product in wishlist
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    toggleWishlist(product.id);
  };

  // EVENT HANDLER 3: Toggle product in comparison matrix
  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    toggleCompare(product);
  };

  // EVENT HANDLER 4: Open product in Quick View modal
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    openQuickView(product);
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-violet-950/20 hover:-translate-y-1 relative">
      {/* Clickable Card Link Body navigating to PDP `/products/[slug]` */}
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Visual Graphic Header Box */}
        <div className="relative h-52 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 flex items-center justify-center border-b border-slate-800/60 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-violet-600/5 group-hover:bg-violet-600/10 transition-colors duration-300" />

          {/* Top Badges & Actions Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Tag Badge (BEST SELLER / NEW ARRIVAL) */}
            {product.tag ? (
              <span className="bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-violet-400/30 shadow-sm">
                {product.tag}
              </span>
            ) : (
              <span />
            )}

            {/* Quick Action Buttons: Compare + Wishlist Heart */}
            <div className="flex items-center gap-1.5">
              {/* Compare Toggle Button */}
              <button
                onClick={handleToggleCompare}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 ${
                  isCompared
                    ? "bg-violet-600 text-white border border-violet-400"
                    : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title={isCompared ? "Remove from comparison" : "Add to comparison"}
              >
                <span>⇄</span>
                <span className="hidden sm:inline">{isCompared ? "Compared" : "Compare"}</span>
              </button>

              {/* Wishlist Heart Toggle Button */}
              <button
                onClick={handleToggleWishlist}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all shadow-md active:scale-90 ${
                  isFavorited
                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
                    : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
                aria-label="Save to Wishlist"
              >
                {isFavorited ? "❤️" : "🤍"}
              </button>
            </div>
          </div>

          {/* Product Center Visual Icon */}
          <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 z-0">
            {product.icon}
          </div>

          {/* Quick View Hover Button (Appears smoothly when hovering over the card) */}
          <div className="absolute inset-x-4 bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button
              onClick={handleQuickView}
              className="w-full py-2 bg-slate-950/95 hover:bg-slate-900 border border-slate-700/80 text-white text-xs font-bold rounded-xl shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>👁️ Quick View</span>
            </button>
          </div>

          {/* Bottom Left Stock Inventory Availability Pill (hidden on hover when Quick View button shows) */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 group-hover:opacity-0 transition-opacity">
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

          {/* Discount Pill in bottom right (hidden on hover when Quick View button shows) */}
          {discountPercent > 0 && (
            <div className="absolute bottom-3 right-3 z-10 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm group-hover:opacity-0 transition-opacity">
              Save {discountPercent}%
            </div>
          )}
        </div>

        {/* Content Details Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                {product.category}
              </span>

              {/* Verified Customer Star Rating */}
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

            {/* Small Color Swatches preview indicator if variants exist */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/40">
                <span className="text-[10px] text-slate-500 font-medium">Colors:</span>
                <div className="flex items-center gap-1">
                  {product.colorVariants.map((c) => (
                    <span
                      key={c.name}
                      className="w-2.5 h-2.5 rounded-full border border-slate-700"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Footer Price & Add To Bag CTA Button */}
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
