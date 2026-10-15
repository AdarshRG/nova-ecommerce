// ==============================================================================
// FILE: app/products/[slug]/page.tsx
// ARCHITECTURE ROLE: Dynamic Route (Product Detail Page - PDP)
//
// 🎓 BEGINNER'S GUIDE TO THIS PAGE:
//   What happens when a user clicks a product?
//     1. Next.js sees a URL like `/products/nova-sonic-wireless`.
//     2. It matches the `[slug]` folder name to this file!
//     3. The function `generateStaticParams()` pre-renders every single product into
//        super fast static HTML at build time (SSG - Static Site Generation).
//     4. `ProductDetailPage()` finds the product matching the slug from our database catalog.
//     5. It renders the specs, customer reviews, purchasing panel, related hardware,
//        and the user's recently viewed browsing history!
// ==============================================================================

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Layout & UI Components
import Footer from "../../../components/layout/Footer";
import AddToCartButton from "../../../components/product/AddToCartButton";
import ProductCard from "../../../components/home/ProductCard";
import ProductReviews from "../../../components/product/ProductReviews";
import RecentlyViewedSection from "../../../components/home/RecentlyViewedSection";
import ClientOverlays from "../../../components/layout/ClientOverlays";

// Data Access
import { getProductBySlug, PRODUCTS } from "../../../data/products";

// ==============================================================================
// FUNCTION: generateStaticParams()
// Pre-renders every dynamic product page into static HTML (SSG) for 0ms load speed.
// ==============================================================================
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  // Await the asynchronous route params object
  const { slug } = await params;

  // Find product by slug
  const product = getProductBySlug(slug);

  // If slug doesn't exist, trigger 404
  if (!product) {
    notFound();
  }

  // Calculate percentage discount from original MSRP
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // Find 3 recommended related products from catalog (excluding current item)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).concat(PRODUCTS.filter((p) => p.id !== product.id)).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Global Client Overlays (Header, Search, Cart, Wishlist, Compare, Quick View) */}
      <ClientOverlays />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb Navigation Bar */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/categories/${product.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
            className="hover:text-white transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-violet-400 font-bold">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Product Visual Box */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            {/* Promotional Badges Bar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              {product.tag && (
                <span className="bg-violet-600/90 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-violet-400/30">
                  {product.tag}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Central Icon Visual Graphic */}
            <div className="w-64 h-64 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-8xl shadow-2xl my-10 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
              {product.icon}
            </div>

            {/* Trust Badges Bar */}
            <div className="w-full pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 font-semibold">
              <div>🚚 Express 2-Day Shipping</div>
              <div>🛡️ 2-Year Warranty</div>
              <div>🔄 30-Day Free Returns</div>
            </div>
          </div>

          {/* Right Product Specifications & Purchasing Controls */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
                {product.category}
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Ratings & Inventory Indicators */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                  <span className="text-amber-400 text-sm">★ ★ ★ ★ ★</span>
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-slate-400 font-medium">
                    ({product.reviewCount} customer reviews)
                  </span>
                </div>

                <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock ({product.stockCount} units available)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
              <span className="text-4xl font-black text-white tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-slate-500 line-through font-medium">
                  MSRP ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Product Narrative Description */}
            <p className="text-slate-300 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Key Hardware Highlights */}
            <div className="space-y-2 py-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Hardware Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                {product.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl"
                  >
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Add to Cart & Swatch Component */}
            <div className="border-t border-slate-800/80 pt-6">
              <AddToCartButton product={product} />
            </div>

            {/* Technical Specifications Table */}
            <div className="border-t border-slate-800/80 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Technical Specifications
              </h4>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3.5">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Product Reviews Component */}
        <ProductReviews product={product} />

        {/* Recommended Products Section */}
        <section className="mt-20 pt-12 border-t border-slate-900">
          <div className="mb-8">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
              Recommended Hardware
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Complete Your Setup
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>

        {/* Recently Viewed Browsing History Bar */}
        <RecentlyViewedSection currentProductId={product.id} />
      </main>

      <Footer />
    </div>
  );
}
