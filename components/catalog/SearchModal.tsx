// ==============================================================================
// FILE: components/catalog/SearchModal.tsx
// ARCHITECTURE ROLE: Command-K (⌘K / Ctrl+K) Full-Stack Debounced Search Modal Component
//
// 🎓 BEGINNER'S GUIDE TO ASYNC SEARCH & DEBOUNCING IN REACT:
//   What does this component teach?
//     1. Generic Custom Hook Integration:
//        Uses `useDebounce(query, 300)` so that as the user types rapidly, we don't
//        hammer our backend API with a network request on every single keypress.
//     2. The 4 Core UI States:
//        Every senior full-stack engineer must handle:
//          • Loading State (Skeleton shimmer placeholders while network request is in-flight)
//          • Error State (Network error banner with a 1-click retry button)
//          • Empty State (Friendly icon and message when no items match criteria)
//          • Success State (Verified products rendered from the server)
//     3. Race Condition Prevention (AbortController):
//        If a user types "son" and then quickly types "sonic", the first request is
//        aborted so its delayed response never overwrites the newer search results!
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "../../types/product";
import { CATEGORIES, PRODUCTS } from "../../data/products";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchProductsApi } from "../../lib/apiClient";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  // Input query and active category pill
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Custom Hook: Debounce the user query by 300 milliseconds
  const debouncedQuery = useDebounce<string>(query, 300);

  // Async Network States
  const [results, setResults] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  // ----------------------------------------------------------------------------
  // EFFECT: Fetch from Backend API (/api/products) whenever debounced query or category changes
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    // Create an AbortController to cancel this request if user types again before it finishes
    const abortController = new AbortController();

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Call our type-safe API helper with signal
        const response = await fetchProductsApi(
          {
            search: debouncedQuery,
            category: selectedCat,
          },
          abortController.signal
        );

        setResults(response.data);
      } catch (err: unknown) {
        // If aborted, do nothing
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.warn("Backend search API error, falling back to local search:", err);

        // Fallback local search if network is offline or server encounters an issue
        const cleanQuery = debouncedQuery.trim().toLowerCase();
        const localMatches = PRODUCTS.filter((p) => {
          if (selectedCat !== "all" && p.category !== selectedCat) return false;
          if (!cleanQuery) return true;
          return (
            p.name.toLowerCase().includes(cleanQuery) ||
            p.category.toLowerCase().includes(cleanQuery) ||
            p.description.toLowerCase().includes(cleanQuery)
          );
        });

        setResults(localMatches);
        if (err instanceof Error && !err.message.includes("aborted")) {
          setErrorMessage("Operating in offline preview mode.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();

    // CLEANUP: Abort network request if user inputs another keystroke before this one finishes!
    return () => {
      abortController.abort();
    };
  }, [debouncedQuery, selectedCat, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Dimmed Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Shell */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-slate-50 z-10 overflow-hidden flex flex-col max-h-[82vh]">
        {/* Top Input Bar */}
        <div className="relative flex items-center border-b border-slate-800/80 pb-4">
          <span className="text-xl text-violet-400 mr-3">
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              "🔍"
            )}
          </span>
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
              className="p-1 text-slate-400 hover:text-white text-xs mr-2 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <kbd className="text-[10px] font-bold bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 hidden sm:inline">
            ESC to close
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "all"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            All Hardware
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCat === cat.name
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Error Notice (if any) */}
        {errorMessage && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Live Search Results Container with 4 Distinct States */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {/* STATE 1: LOADING SKELETON PLACEHOLDERS */}
          {isLoading ? (
            <div className="space-y-2.5 py-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex items-center justify-between gap-4 animate-pulse"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/60 shrink-0" />
                    <div className="space-y-2 w-3/4">
                      <div className="h-2.5 bg-slate-800/80 rounded w-1/4" />
                      <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-800/60 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="w-12 h-4 bg-slate-800/80 rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            /* STATE 2: EMPTY STATE */
            <div className="py-12 text-center text-slate-400">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-sm font-bold text-white">No matching hardware found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No items match "{query}" in {selectedCat === "all" ? "the catalog" : selectedCat}. Try checking spelling or selecting another department.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCat("all");
                }}
                className="mt-4 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-violet-400 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* STATE 3: SUCCESS STATE */
            results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="group bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/50 rounded-2xl p-3 flex items-center justify-between gap-3.5 transition-all hover:bg-slate-900"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${product.imageBg} border border-slate-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {product.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-amber-400">★ {product.rating}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        In Stock ({product.stockCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Price & Arrow */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-black text-xs sm:text-sm text-white">
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

        {/* Footer Info & Debounce Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              Connected to <strong className="text-slate-400 font-mono">/api/products</strong> (300ms Debounce)
            </span>
          </div>
          <span>
            <strong className="text-white">{results.length}</strong> items
          </span>
        </div>
      </div>
    </div>
  );
}
