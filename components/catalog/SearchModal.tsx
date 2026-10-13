// ==============================================================================
// FILE: components/catalog/SearchModal.tsx
// ARCHITECTURE ROLE: Command-K (⌘K / Ctrl+K) Interactive Quick Search Modal Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted inside `<ClientOverlays />` to overlay globally across all routes.
//   2. Listens for global keyboard shortcuts (`⌘K`, `Ctrl+K`, `Escape`).
//   3. Filters `PRODUCTS` array in real-time as user types search queries.
//   4. Renders live product previews with thumbnail icons, categories, prices, ratings, and stock status.
//   5. Clicking any product result navigates to `/products/[slug]` and closes the search modal.
// ==============================================================================

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { CATEGORIES } from "../../data/products";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  // Local State: Search query text input & selected category filter pill
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Global Keyboard Listener: Opens search on ⌘K / Ctrl+K & closes on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal trigger via custom event dispatch or parent props
          const searchBtn = document.getElementById("global-search-trigger");
          if (searchBtn) searchBtn.click();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query string when modal opens or closes
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  // COMPUTED: Real-time product search filter algorithm
  const searchResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      // 1. Category Filter Pill check
      if (selectedCat !== "all" && product.category !== selectedCat) {
        return false;
      }

      // 2. Text query matching (Product Name, Category, Description, or Specs)
      if (!cleanQuery) return true;

      const matchName = product.name.toLowerCase().includes(cleanQuery);
      const matchCategory = product.category.toLowerCase().includes(cleanQuery);
      const matchDesc = product.description.toLowerCase().includes(cleanQuery);
      const matchSpecs = Object.values(product.specs).some((val) =>
        val.toLowerCase().includes(cleanQuery)
      );

      return matchName || matchCategory || matchDesc || matchSpecs;
    });
  }, [query, selectedCat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Dimmed Backdrop Overlay (Clicking closes modal) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal Panel Container */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-50 z-10 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Top Input Bar */}
        <div className="relative flex items-center border-b border-slate-800/80 pb-4">
          <span className="text-xl text-slate-400 mr-3">🔍</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search headphones, smartwatches, light bars..."
            className="w-full bg-transparent text-base sm:text-lg text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white text-xs mr-2"
            >
              ✕
            </button>
          )}
          <kbd className="text-[10px] font-bold bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 hidden sm:inline">
            ESC to close
          </kbd>
        </div>

        {/* Category Quick Pills Filter */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1 shrink-0">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCat === "all"
                ? "bg-violet-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            All Products
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCat === cat.name
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Live Results Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-sm font-bold text-white">No products found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another keyword like "Sonic", "Smartwatch", or "Wireless".
              </p>
            </div>
          ) : (
            searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="group bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition-all hover:bg-slate-900"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl ${product.imageBg} border border-slate-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {product.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400">★ {product.rating}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        In Stock ({product.stockCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Price & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-sm text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all text-sm">
                    →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>
            Showing <strong className="text-white">{searchResults.length}</strong> matching products
          </span>
          <span>Press <kbd className="bg-slate-900 border border-slate-800 px-1 rounded">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
}
