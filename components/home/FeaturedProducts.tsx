import React from "react";
import { Product } from "../../types/product";
import ProductCard from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section id="featured" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-slate-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trending Hardware
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Top rated flagship devices this season
          </p>
        </div>
        <button className="text-sm font-semibold text-violet-400 hover:text-violet-300">
          Explore Catalog →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
