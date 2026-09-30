// ==============================================================================
// FILE: components/home/ProductCard.tsx
// ARCHITECTURE ROLE: Interactive Product Card UI Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Included inside `components/home/FeaturedProducts.tsx`.
//   2. Marked with `'use client'` because it listens to user clicks and invokes `addItem(product)`
//      from `store/useCartStore.ts`.
//   3. Contains `<Link href={`/products/${product.slug}`}>` so clicking the card navigates the browser
//      to the dynamic Product Detail Page route (`/products/[slug]`).
//   4. `handleAddToCart(e)` uses `e.preventDefault()` so clicking "Add to Cart" adds the item to the
//      Zustand cart store WITHOUT navigating away from the homepage.
// ==============================================================================

"use client";

import React from "react";
// `Link` from "next/link": Performs client-side routing to `/products/[slug]`
import Link from "next/link";
import { Product } from "../../types/product";
// `useCartStore` from "../../store/useCartStore": Mutates global cart state
import { useCartStore } from "../../store/useCartStore";

interface ProductCardProps {
  product: Product;
}

// ==============================================================================
// FUNCTION: ProductCard({ product })
// WHY USED: Renders individual product card in grids.
// HOW IT IS CALLED: Called by `FeaturedProducts` inside a `.map()` loop: `<ProductCard key={p.id} product={p} />`.
// ==============================================================================
export default function ProductCard({ product }: ProductCardProps) {
  // Extract `addItem` action from Zustand store
  const { addItem } = useCartStore();

  // EVENT HANDLER: handleAddToCart(e)
  // WHY USED: Adds product to cart without triggering the parent `<Link>` navigation.
  // HOW IT WORKS: `e.preventDefault()` halts link redirection; `addItem(product)` dispatches item to store.
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300 group">
      {/* Clickable Card Body navigating to `/products/[slug]` */}
      <Link href={`/products/${product.slug}`} className="block">
        {/* Visual Graphic Box */}
        <div className={`h-48 ${product.imageBg} relative p-4 flex items-center justify-center`}>
          {product.tag && (
            <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              {product.tag}
            </span>
          )}
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {product.icon}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-bold text-white text-base mt-1 line-clamp-1 group-hover:text-violet-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs font-semibold text-slate-300">
              {product.rating}
            </span>
            <span className="text-xs text-slate-500">
              ({product.reviewCount} reviews)
            </span>
          </div>
        </div>
      </Link>

      {/* Footer Price & Add To Cart Button */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-2">
        <span className="text-lg font-extrabold text-white">
          ${product.price.toFixed(2)}
        </span>
        <button
          onClick={handleAddToCart}
          className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all active:scale-95 shadow-md shadow-violet-600/20"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
