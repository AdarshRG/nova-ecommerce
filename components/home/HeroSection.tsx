// ==============================================================================
// FILE: components/home/HeroSection.tsx
// ARCHITECTURE ROLE: Hero Showcase Section for Flagship Hardware Release
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted in `app/page.tsx` directly below `<Header />`.
//   2. Showcases flagship product release (`NOVA Sonic Wireless`).
//   3. Day 3 Update: Features interactive quick add CTA linked directly to `useCartStore`.
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { useCartStore } from "../../store/useCartStore";

export default function HeroSection() {
  const { addItem } = useCartStore();
  const flagshipProduct = PRODUCTS[0]; // NOVA Sonic Wireless

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 px-6 bg-slate-950 border-b border-slate-900">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Column: Hero Typography & CTA */}
        <div className="flex flex-col items-start gap-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
            2026 FLAGSHIP HARDWARE SERIES
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Pinnacle Sound. <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Zero Compromise.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            Experience studio-grade acoustic performance with custom 40mm titanium drivers, hybrid active noise cancellation, and 40-hour continuous battery life.
          </p>

          {/* Quick Specs Highlight Bar */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg py-2 border-y border-slate-800/80">
            <div>
              <span className="block text-xl font-black text-white">40 Hrs</span>
              <span className="text-[11px] text-slate-400 font-medium">Battery Life</span>
            </div>
            <div>
              <span className="block text-xl font-black text-violet-400">-38 dB</span>
              <span className="text-[11px] text-slate-400 font-medium">Hybrid ANC</span>
            </div>
            <div>
              <span className="block text-xl font-black text-emerald-400">BT 5.4</span>
              <span className="text-[11px] text-slate-400 font-medium">Spatial Audio</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
            <a
              href="#featured"
              className="px-7 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 font-bold text-white text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-95 text-center flex-1 sm:flex-none"
            >
              Explore Collection ↓
            </a>
            <button
              onClick={() => addItem(flagshipProduct)}
              className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-bold text-slate-200 text-sm transition-all hover:border-slate-700 active:scale-95 text-center flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <span>+ Add Flagship ($249.99)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Spotlight Card */}
        <div className="relative flex justify-center">
          <Link
            href={`/products/${flagshipProduct.slug}`}
            className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-violet-950/40"
          >
            {/* Header Badges */}
            <div className="flex justify-between items-start z-10">
              <span className="text-xs font-black uppercase tracking-widest text-violet-300 bg-violet-950/80 px-3 py-1 rounded-full border border-violet-700/50">
                Featured Release
              </span>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 line-through font-medium">
                  $299.99
                </span>
                <span className="text-2xl font-black text-white tracking-tight">
                  $249.99
                </span>
              </div>
            </div>

            {/* Product Center Visual */}
            <div className="my-10 text-center relative py-6">
              <div className="w-44 h-44 mx-auto rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-7xl shadow-2xl group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300 relative z-10">
                🎧
              </div>
            </div>

            {/* Product Footer Details */}
            <div className="border-t border-slate-800/80 pt-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                  {flagshipProduct.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-400 text-xs">★ ★ ★ ★ ★</span>
                  <span className="text-xs text-slate-400 font-semibold">
                    4.9 (142 reviews)
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
                View Details →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
