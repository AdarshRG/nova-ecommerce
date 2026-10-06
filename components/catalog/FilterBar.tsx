// ==============================================================================
// FILE: components/catalog/FilterBar.tsx
// ARCHITECTURE ROLE: Interactive Search, Category Filtering & Sorting Control Bar
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Used by `<FeaturedProducts />` or catalog pages to let users dynamically filter catalog items.
//   2. Manages local state for `searchQuery`, `selectedCategory`, `sortBy`, and `inStockOnly`.
//   3. Passes state back to parent container via state callback props.
// ==============================================================================

"use client";

import React from "react";
import { CATEGORIES } from "../../data/products";

export interface FilterState {
  searchQuery: string;
  selectedCategory: string; // "all" or specific category name
  sortBy: "featured" | "price-low" | "price-high" | "rating";
  inStockOnly: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  totalResults: number;
}

export default function FilterBar({
  filters,
  onFilterChange,
  totalResults,
}: FilterBarProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-md">
      {/* Top Bar: Search Input & Sorting Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search headphones, smartwatches, light bars..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: "" })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown & In Stock Toggle */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* In Stock Only Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
              className="accent-violet-500 rounded cursor-pointer"
            />
            <span className="font-medium">In Stock Only</span>
          </label>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <span className="text-slate-500 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-slate-900 text-white">
                Featured
              </option>
              <option value="price-low" className="bg-slate-900 text-white">
                Price: Low to High
              </option>
              <option value="price-high" className="bg-slate-900 text-white">
                Price: High to Low
              </option>
              <option value="rating" className="bg-slate-900 text-white">
                Top Rated
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Category Filter Pills */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onFilterChange({ selectedCategory: "all" })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filters.selectedCategory === "all"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            All Products
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ selectedCategory: cat.name })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filters.selectedCategory === cat.name
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Counter Badge */}
        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="text-white font-bold">{totalResults}</span> products
        </div>
      </div>
    </div>
  );
}
