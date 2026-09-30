// ==============================================================================
// FILE: components/product/AddToCartButton.tsx
// ARCHITECTURE ROLE: Interactive Quantity Selector & CTA Button for Product Detail Pages
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Included inside dynamic route `app/products/[slug]/page.tsx`.
//   2. Marked with `'use client'` because it manages local component state (`quantity`, `added`)
//      and dispatches items to `store/useCartStore.ts`.
//   3. When user clicks "+", "-" or "Add to Cart", local state updates and global Zustand store updates.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  // `useCartStore`: Extracts `addItem` action
  const { addItem } = useCartStore();

  // Local React State: Manages selected item quantity and button success animation feedback
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // EVENT HANDLER: handleAdd()
  // WHY USED: Adds product with selected quantity into Zustand store and shows 2-second checkmark feedback.
  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* Quantity Selector (- / +) */}
      <div className="flex items-center border border-slate-800 bg-slate-900 rounded-xl p-1 w-fit">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          -
        </button>
        <span className="w-10 text-center font-bold text-white text-sm">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="w-10 h-10 flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          +
        </button>
      </div>

      {/* Primary Add To Cart Button */}
      <button
        onClick={handleAdd}
        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
          added
            ? "bg-emerald-600 shadow-emerald-600/30"
            : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/30 hover:scale-[1.01]"
        }`}
      >
        {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
      </button>
    </div>
  );
}
