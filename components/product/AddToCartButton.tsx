// ==============================================================================
// FILE: components/product/AddToCartButton.tsx
// ARCHITECTURE ROLE: Interactive Quantity Selector & CTA Button for Product Detail Pages
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Rendered inside dynamic route `app/products/[slug]/page.tsx`.
//   2. Manages quantity selection state (`quantity`) and checkmark feedback state (`added`).
//   3. Calls `addItem(product, quantity)` from `useCartStore` which fires global Toast.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { Product } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, openCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full">
      {/* Quantity Stepper */}
      <div className="flex items-center justify-between border border-slate-800 bg-slate-950 rounded-2xl p-1.5 w-full sm:w-36">
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

      {/* Main Add to Bag Button */}
      <button
        onClick={handleAdd}
        className={`flex-1 py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-wider text-white transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
          added
            ? "bg-emerald-600 shadow-emerald-600/30"
            : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/30 hover:scale-[1.01]"
        }`}
      >
        <span>{added ? "✓ Added to Bag!" : `+ Add to Bag — $${(product.price * quantity).toFixed(2)}`}</span>
      </button>

      {/* Quick View Bag Direct Action */}
      <button
        onClick={openCart}
        className="px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-bold text-xs text-slate-300 transition-colors"
      >
        View Bag 🛍️
      </button>
    </div>
  );
}
