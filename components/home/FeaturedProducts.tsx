// ==============================================================================
// FILE: components/home/FeaturedProducts.tsx
// ARCHITECTURE ROLE: Interactive Product Catalog Showcase Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Included inside `app/page.tsx` (Homepage).
//   2. Integrates `<FilterBar />` to provide real-time client search, category filtering, and sorting.
//   3. Maps filtered product arrays to `<ProductCard />` instances.
//   4. Shows clean fallback empty state when no items match the user's active search filter.
// ==============================================================================

"use client";

import React, { useState, useMemo } from "react";
import { Product } from "../../types/product";
import ProductCard from "./ProductCard";
import FilterBar, { FilterState } from "../catalog/FilterBar";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  // Local state holding active user filter criteria
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedCategory: "all",
    sortBy: "featured",
    inStockOnly: false,
  });

  // Handler to merge updated filter fields
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // COMPUTED: Filter & Sort product catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Search query matching name, description, or category
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchCategory = p.category.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCategory) return false;
        }

        // 2. Category selection filter
        if (
          filters.selectedCategory !== "all" &&
          p.category !== filters.selectedCategory
        ) {
          return false;
        }

        // 3. In stock only filter
        if (filters.inStockOnly && !p.inStock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 4. Sorting logic
        if (filters.sortBy === "price-low") return a.price - b.price;
        if (filters.sortBy === "price-high") return b.price - a.price;
        if (filters.sortBy === "rating") return b.rating - a.rating;
        return 0; // "featured" maintains default catalog order
      });
  }, [products, filters]);

  return (
    <section id="featured" className="py-16 px-6 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
            Hardware Catalog
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Explore Flagship Devices
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Engineered with high performance materials and continuous updates.
          </p>
        </div>

        {/* Reset Filters Quick Button if filters active */}
        {(filters.searchQuery ||
          filters.selectedCategory !== "all" ||
          filters.inStockOnly) && (
          <button
            onClick={() =>
              setFilters({
                searchQuery: "",
                selectedCategory: "all",
                sortBy: "featured",
                inStockOnly: false,
              })
            }
            className="text-xs font-bold text-violet-400 hover:text-violet-300 underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Filter & Search Controls Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalResults={filteredProducts.length}
      />

      {/* Product Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center my-8">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">
            No products found
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            We couldn't find any products matching "{filters.searchQuery}". Try searching for another keyword or clear your filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                searchQuery: "",
                selectedCategory: "all",
                sortBy: "featured",
                inStockOnly: false,
              })
            }
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
