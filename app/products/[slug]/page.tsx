// ==============================================================================
// FILE: app/products/[slug]/page.tsx
// ARCHITECTURE ROLE: Dynamic Route (Product Detail Page - PDP)
//
// ROUTE MAP & DATA FLOW:
//   User enters URL: http://localhost:3000/products/nova-sonic-wireless
//   1. Next.js App Router matches route pattern `/products/[slug]` to this file.
//   2. Next.js extracts `params` object containing `{ slug: "nova-sonic-wireless" }`.
//   3. `generateStaticParams()` runs at build time (`npm run build`) to find all product slugs
//      from `data/products.ts` and pre-render static HTML pages (SSG - Static Site Generation).
//   4. `ProductDetailPage()` calls `getProductBySlug(slug)` from `data/products.ts`.
//   5. Product details are rendered on the server (Server Component).
//   6. Interactive child components (`Header`, `CartDrawer`, `AddToCartButton`) handle client-side
//      Zustand cart state mutations (`store/useCartStore.ts`).
// ==============================================================================

// --- IMPORT RATIONALE ---
import React from "react";

// `Link` from "next/link":
// WHY USED: Performs client-side single-page navigation between pages.
// HOW CALLED: Used in breadcrumb links (`<Link href="/"> Home </Link>`) to navigate without triggering a full browser page refresh.
import Link from "next/link";

// `notFound` from "next/navigation":
// WHY USED: Standard Next.js function to halt execution and render the nearest 404 error page.
// HOW CALLED: Called dynamically inside `ProductDetailPage()` if `getProductBySlug(slug)` returns `undefined`.
import { notFound } from "next/navigation";

// Sub-components used to compose the PDP page layout:
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import CartDrawer from "../../../components/cart/CartDrawer";
import AddToCartButton from "../../../components/product/AddToCartButton";

// Data provider functions & catalog array from data layer:
// WHY USED: Supplies the raw product details (`getProductBySlug`) and all product items (`PRODUCTS`).
import { getProductBySlug, PRODUCTS } from "../../../data/products";

// ==============================================================================
// FUNCTION: generateStaticParams()
// WHY USED: Instructs Next.js during `npm run build` which dynamic route paths exist.
// HOW IT IS CALLED: Next.js calls this function automatically during compilation.
// RETURN VALUE: Array of objects matching dynamic route segment parameters: `[{ slug: "nova-sonic-wireless" }, ...]`.
// BENEFIT: Pre-renders every product page as static HTML (SSG) for 0ms database response latency and 100/100 SEO scores.
// ==============================================================================
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

// Interface defining asynchronous Page Props in Next.js 15/16 App Router
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ==============================================================================
// FUNCTION: ProductDetailPage({ params })
// WHY USED: Default export component rendering the Product Detail Page (PDP).
// HOW IT IS CALLED: Instantiated by Next.js App Router engine when a user visits `/products/[slug]`.
// SERVER/CLIENT TYPE: React Server Component (RSC) — executes on the Node.js server before sending HTML.
// ==============================================================================
export default async function ProductDetailPage({ params }: PageProps) {
  // Await the asynchronous `params` promise to extract the URL path segment `slug`
  const { slug } = await params;

  // Execute in-memory catalog lookup: searches PRODUCTS array for item matching slug
  const product = getProductBySlug(slug);

  // Guard Clause: If user visits an invalid URL like `/products/invalid-item`, trigger 404
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Slide-over cart drawer (Client Component managed by Zustand store) */}
      <CartDrawer />

      {/* Persistent Navigation Header */}
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Breadcrumb Navigation Bar */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-400">{product.category}</span>
          <span>/</span>
          <span className="text-violet-400 font-semibold">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Visual Box: Displays Product Badge & Large Graphic Icon */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden group">
            {product.tag && (
              <span className="absolute top-6 left-6 bg-violet-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                {product.tag}
              </span>
            )}
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-7xl shadow-2xl my-8 group-hover:scale-105 transition-transform duration-300">
              {product.icon}
            </div>
          </div>

          {/* Right Product Specifications & Purchasing Controls */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Indicators */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>
                <span className="h-3 w-px bg-slate-800" />
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock & Ready to Ship
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-3xl font-black text-white">
              ${product.price.toFixed(2)}
            </div>

            {/* Product Narrative Description */}
            <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-900 pt-4">
              {product.description}
            </p>

            {/* Bulleted Key Features List */}
            <div className="space-y-2 py-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Key Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-violet-400">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Add to Cart Component (Client Component) */}
            <div className="border-t border-slate-900 pt-6">
              <AddToCartButton product={product} />
            </div>

            {/* Detailed Technical Specifications Table */}
            <div className="border-t border-slate-900 pt-6 mt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Technical Specifications
              </h4>
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/80 text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3.5">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
