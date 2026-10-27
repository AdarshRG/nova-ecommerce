// ==============================================================================
// FILE: components/product/AddToCartButton.tsx
// ARCHITECTURE ROLE: Interactive Purchasing Panel with Color Swatches, Quantity Stepper & CTAs
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What does this component do?
//     This is the main purchasing control box on the Product Detail Page (PDP).
//     It gives the customer everything they need to buy the product:
//       1. A Color Swatch Picker to choose a finish (e.g. Space Black vs Silver).
//       2. A Quantity Stepper (- and + buttons) to choose how many to buy.
//       3. The primary "+ Add to Bag" button with price calculation and checkmark feedback.
//       4. Wishlist ("❤️") and Compare ("⇄") quick action buttons.
//   How does it log browsing history?
//     Inside a React `useEffect()` hook, it calls `addViewedProduct(product.id)`.
//     Because `useEffect()` runs once when the user opens the page, this automatically
//     records the product into the user's "Recently Viewed" history!
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCompareStore } from "../../store/useCompareStore";
import { useRecentlyViewedStore } from "../../store/useRecentlyViewedStore";
import { useAIStore } from "../../store/useAIStore";
import ColorSwatchPicker from "./ColorSwatchPicker";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  // Store Hooks
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();
  const { addViewedProduct } = useRecentlyViewedStore();
  const { askAboutProduct } = useAIStore();

  // Local React State
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize selected color to the first variant if available
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colorVariants && product.colorVariants.length > 0
      ? product.colorVariants[0].name
      : ""
  );

  // When the user views this page, record it in Recently Viewed history!
  useEffect(() => {
    setIsMounted(true);
    addViewedProduct(product.id);
  }, [product.id, addViewedProduct]);

  // Compute active states safely after hydration
  const isFavorited = isMounted ? isInWishlist(product.id) : false;
  const isCompared = isMounted ? isInCompare(product.id) : false;

  // Handler: Adds item to bag and shows 2-second checkmark feedback
  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Color Swatch Picker (rendered if product has multiple finishes) */}
      {product.colorVariants && product.colorVariants.length > 0 && (
        <ColorSwatchPicker
          variants={product.colorVariants}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      )}

      {/* 2. Quantity Selector + Add to Bag Button Row */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
        {/* Quantity Stepper (- / +) */}
        <div className="flex items-center justify-between border border-slate-800 bg-slate-950 rounded-2xl p-1.5 w-full sm:w-36 shrink-0">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 flex items-center justify-center font-black text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-sm"
            aria-label="Decrease Quantity"
          >
            -
          </button>
          <span className="text-sm font-black text-white px-2">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 flex items-center justify-center font-black text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-sm"
            aria-label="Increase Quantity"
          >
            +
          </button>
        </div>

        {/* Primary Add to Bag Button */}
        <button
          onClick={handleAdd}
          className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider text-white transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
            added
              ? "bg-emerald-600 shadow-emerald-600/30"
              : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/30 hover:scale-[1.01]"
          }`}
        >
          <span>
            {added
              ? "✓ Added to Bag!"
              : `+ Add to Bag — $${(product.price * quantity).toFixed(2)}`}
          </span>
        </button>

        {/* View Bag Quick Button */}
        <button
          onClick={openCart}
          className="px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-bold text-xs text-slate-300 transition-colors shrink-0"
        >
          View Bag 🛍️
        </button>
      </div>

      {/* 3. Wishlist & Comparison Quick Action Bar */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-xs">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border transition-all ${
            isFavorited
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <span>{isFavorited ? "❤️ Saved to Wishlist" : "🤍 Save to Wishlist"}</span>
        </button>

        <button
          type="button"
          onClick={() => toggleCompare(product)}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border transition-all ${
            isCompared
              ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <span>{isCompared ? "✓ In Compare Matrix" : "⇄ Add to Compare"}</span>
        </button>
      </div>

      {/* 4. Autonomous AI Copilot Consultation CTA */}
      <button
        type="button"
        onClick={() => askAboutProduct(product)}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-fuchsia-950/30 to-indigo-950/40 hover:from-violet-900/60 hover:to-indigo-900/60 border border-violet-800/50 hover:border-violet-500 text-xs font-bold text-violet-300 hover:text-white transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span className="text-sm group-hover:scale-125 transition-transform animate-pulse">✨</span>
        <span>Ask AI about {product.name} highlights & specs</span>
        <span>➔</span>
      </button>
    </div>
  );
}
