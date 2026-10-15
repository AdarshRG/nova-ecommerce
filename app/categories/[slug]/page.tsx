// ==============================================================================
// FILE: app/categories/[slug]/page.tsx
// ARCHITECTURE ROLE: Dynamic Department Route (Category Page - PLP)
//
// ROUTE MAP & DATA FLOW:
//   User enters URL: http://localhost:3000/categories/audio-tech
//   1. Next.js App Router matches dynamic route segment `/categories/[slug]` to this file.
//   2. `generateStaticParams()` runs at build time (`npm run build`) to discover all category slugs
//      from `data/products.ts` and pre-render static HTML pages (SSG - Static Site Generation).
//   3. `CategoryPage()` calls `getCategoryBySlug(slug)` and `getProductsByCategory(category.name)`.
//   4. Renders responsive department header, breadcrumb navigation, and interactive catalog grid.
//   5. Mounts `<ClientOverlays />` to provide global Cart, Wishlist, Compare matrix, and Search drawers.
// ==============================================================================

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Layout & UI Components
import Footer from "../../../components/layout/Footer";
import FeaturedProducts from "../../../components/home/FeaturedProducts";
import ClientOverlays from "../../../components/layout/ClientOverlays";

// Data Access
import { CATEGORIES, getCategoryBySlug, getProductsByCategory } from "../../../data/products";

// ==============================================================================
// FUNCTION: generateStaticParams()
// WHY USED: Pre-renders every category route into static HTML (SSG) during compilation.
// RETURN VALUE: Array of slug params e.g. [{ slug: "audio-tech" }, { slug: "wearables" }, ...]
// ==============================================================================
export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

// Interface defining dynamic route parameters
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ==============================================================================
// FUNCTION: CategoryPage({ params })
// SERVER/CLIENT TYPE: React Server Component (RSC) — executes on server with 0 client JS penalty.
// ==============================================================================
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Retrieve category entity by slug
  const category = getCategoryBySlug(slug);

  // If slug is invalid (e.g. /categories/unknown), trigger Next.js 404 page
  if (!category) {
    notFound();
  }

  // Fetch all products matching this category department
  const categoryProducts = getProductsByCategory(category.name);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Global Client Overlays (Header, SearchModal, Toast, Cart, Wishlist, Compare Matrix) */}
      <ClientOverlays />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Breadcrumb Navigation Bar */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/#categories" className="hover:text-white transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-violet-400 font-bold">{category.name}</span>
        </nav>

        {/* Category Department Hero Header Banner */}
        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 mb-12 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold mb-4">
              <span>Department</span>
              <span>•</span>
              <span>{categoryProducts.length} Flagship Models</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {category.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              {category.description}
            </p>

            {/* Department Feature Highlights */}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Express 2-Day Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-violet-400 font-bold">✓</span>
                <span>2-Year Comprehensive Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">✓</span>
                <span>Side-by-Side Specs Comparison</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid with Real-time Search, Sort & Stock Filtering */}
        <FeaturedProducts products={categoryProducts} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
