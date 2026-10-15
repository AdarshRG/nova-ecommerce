// ==============================================================================
// FILE: components/catalog/QuickViewModal.tsx
// ARCHITECTURE ROLE: Interactive Client Quick View Inspection Modal
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is this component?
//     This is a popup window that lets users inspect a product's full specs, pick a color finish,
//     adjust quantities, and add items to their shopping bag without navigating away from the page!
//   How does it work step-by-step?
//     1. It reads `isOpen` and `selectedProduct` from `useQuickViewStore`.
//     2. If `isOpen === false` or `selectedProduct === null`, it returns `null` (rendering nothing).
//     3. If open, it renders an animated glassmorphism overlay.
//     4. It uses local React state (`useState`) to manage:
//        - `quantity`: how many items the user wants to buy.
//        - `selectedColor`: which color swatch is currently active.
//        - `added`: a 2-second checkmark animation when added to bag.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuickViewStore } from "../../store/useQuickViewStore";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCompareStore } from "../../store/useCompareStore";
import ColorSwatchPicker from "../product/ColorSwatchPicker";

export default function QuickViewModal() {
  // Extract values and actions from our global stores
  const { selectedProduct, isOpen, closeQuickView } = useQuickViewStore();
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  // Local Component State
  // `useState(1)` initializes the quantity counter to 1
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [added, setAdded] = useState(false);

  // Whenever a new product is opened in Quick View, reset the state
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setAdded(false);
      // Default to the first color variant if available
      if (selectedProduct.colorVariants && selectedProduct.colorVariants.length > 0) {
        setSelectedColor(selectedProduct.colorVariants[0].name);
      } else {
        setSelectedColor("");
      }
    }
  }, [selectedProduct]);

  // Guard Clause: If the modal is closed or no product is selected, render nothing
  if (!isOpen || !selectedProduct) return null;

  const product = selectedProduct;

  // Calculate percentage savings from original MSRP price
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Handler: Add to cart with chosen quantity and color finish
  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Dimmed Background Backdrop (Clicking outside closes modal) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeQuickView}
      />

      {/* Main Modal Shell Container */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-slate-50 z-10 overflow-hidden">
        {/* Top Close Button ("✕") */}
        <button
          onClick={closeQuickView}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-20 text-xs"
          aria-label="Close Quick View"
        >
          ✕
        </button>

        {/* 2-Column Responsive Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: Visual Graphic Display */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group">
            {/* Promotional Badges Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              {product.tag && (
                <span className="bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  {product.tag}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Product Center Visual Icon */}
            <div className="text-8xl my-8 transform group-hover:scale-105 transition-transform duration-300">
              {product.icon}
            </div>

            {/* Inventory Status Pill */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.stockCount < 10 ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span>
                {product.stockCount < 10
                  ? `Low Stock: Only ${product.stockCount} remaining`
                  : `In Stock: ${product.stockCount} units available`}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Specifications & Purchasing Controls */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-800/50">
                {product.category}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
                {product.name}
              </h2>

              {/* Star Ratings */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-amber-400 font-bold">★ {product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-2.5 bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-2xl font-black text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through font-medium">
                  MSRP ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {product.description}
            </p>

            {/* Color Swatch Picker */}
            {product.colorVariants && (
              <ColorSwatchPicker
                variants={product.colorVariants}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}

            {/* Quantity Stepper & Add To Bag Controls */}
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Stepper (- / +) */}
                <div className="flex items-center border border-slate-800 bg-slate-900 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    added
                      ? "bg-emerald-600 shadow-emerald-600/30"
                      : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/30"
                  }`}
                >
                  {added ? "✓ Added to Bag!" : `+ Add to Bag — $${(product.price * quantity).toFixed(2)}`}
                </button>
              </div>

              {/* Auxiliary Quick Action Buttons: Wishlist & Compare */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-colors ${
                    isFavorited
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{isFavorited ? "❤️ Saved" : "🤍 Save to Wishlist"}</span>
                </button>

                <button
                  onClick={() => toggleCompare(product)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-colors ${
                    isCompared
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{isCompared ? "✓ In Compare Matrix" : "⇄ Add to Compare"}</span>
                </button>
              </div>
            </div>

            {/* View Full Product Page Link */}
            <div className="pt-2 text-center">
              <Link
                href={`/products/${product.slug}`}
                onClick={closeQuickView}
                className="text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Product Specifications & Customer Reviews</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
