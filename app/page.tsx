// ==============================================================================
// FILE: app/page.tsx
// ARCHITECTURE ROLE: Home Page Route (`/`)
//
// ROUTE MAP & COMPONENT COMPOSITION:
//   Visiting http://localhost:3000/ executes this file.
//   1. This file is a React Server Component (RSC) that runs on Node.js server.
//   2. Imports data arrays (`CATEGORIES`, `PRODUCTS`) from `data/products.ts`.
//   3. Composes sub-components:
//      - `<CartDrawer />`: Client-side slide-over drawer (Zustand state).
//      - `<Header />`: Navigation header with real-time cart badge.
//      - `<HeroSection />`: Hero banner showcasing flagship product.
//      - `<CategoriesGrid />`: Rendered category cards.
//      - `<FeaturedProducts />`: Rendered product cards with Add-to-Cart buttons.
//      - `<Footer />`: Site footer.
// ==============================================================================

import React from "react";
// Layout Components:
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Homepage Content Section Components:
import HeroSection from "../components/home/HeroSection";
import CategoriesGrid from "../components/home/CategoriesGrid";
import FeaturedProducts from "../components/home/FeaturedProducts";

// Client Cart Drawer Component:
import CartDrawer from "../components/cart/CartDrawer";

// Data Source:
import { CATEGORIES, PRODUCTS } from "../data/products";

// ==============================================================================
// FUNCTION: Home()
// WHY USED: Main page component for the `/` URL route.
// HOW IT IS CALLED: Executed automatically by Next.js App Router engine.
// SERVER/CLIENT TYPE: React Server Component (RSC) — zero client JS bundle penalty for page container.
// ==============================================================================
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Slide-over Cart Drawer (Client Component) */}
      <CartDrawer />

      {/* Announcement Promo Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
        🚀 Launch Special: Free Worldwide Express Shipping on Orders Over $99 | Use Code <span className="font-bold underline">NOVANEXT</span>
      </div>

      {/* Navigation Header */}
      <Header />

      {/* Main Container composing sub-sections */}
      <main className="flex-1">
        <HeroSection />
        <CategoriesGrid categories={CATEGORIES} />
        <FeaturedProducts products={PRODUCTS} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
