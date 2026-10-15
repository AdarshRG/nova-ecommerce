// ==============================================================================
// FILE: components/home/CategoriesGrid.tsx
// ARCHITECTURE ROLE: Interactive Category Exploration Grid Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted in `app/page.tsx` on the root homepage route.
//   2. Displays department cards for: Audio & Tech, Wearables, Smart Home, Accessories.
//   3. Day 6 Update: Cards now link directly to dynamic category department pages (`/categories/[slug]`)
//      using client-side Next.js `<Link>` routing.
// ==============================================================================

import React from "react";
import Link from "next/link";
import { Category } from "../../types/product";

interface CategoriesGridProps {
  categories: Category[];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section id="categories" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-slate-900">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
            Ecosystem Departments
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Browse By Category
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Engineered gear built for high performance and everyday durability.
          </p>
        </div>
      </div>

      {/* Categories Responsive 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative rounded-3xl border border-slate-800 bg-slate-900/80 p-6 overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/20 block"
          >
            {/* Top Department Letter Badge with Gradient */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${cat.gradient} flex items-center justify-center text-white font-black text-xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}
            >
              {cat.name[0]}
            </div>

            {/* Department Title */}
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
              {cat.name}
            </h3>

            {/* Department Description */}
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {cat.description}
            </p>

            {/* Bottom Row: Item count and View Department Arrow */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                {cat.itemCount} Items Available
              </span>
              <span className="text-violet-400 font-bold group-hover:translate-x-1 transition-transform">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
