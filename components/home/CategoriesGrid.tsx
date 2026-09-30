import React from "react";
import { Category } from "../../types/product";

interface CategoriesGridProps {
  categories: Category[];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section id="categories" className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Browse Categories
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Handcrafted ecosystems for every requirement
          </p>
        </div>
        <a href="#" className="text-sm font-semibold text-violet-400 hover:text-violet-300">
          View All Categories →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cat.gradient} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg`}
            >
              {cat.name[0]}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{cat.itemCount} Products</p>
          </div>
        ))}
      </div>
    </section>
  );
}
