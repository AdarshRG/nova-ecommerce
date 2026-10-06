// ==============================================================================
// FILE: app/page.tsx
// ARCHITECTURE ROLE: Home Page Route (`/`)
//
// ROUTE MAP & COMPONENT COMPOSITION:
//   Visiting http://localhost:3000/ executes this file.
//   1. React Server Component (RSC) running on Node.js server.
//   2. Day 3 Update: Integrates `<Toast />` component for global client notifications,
//      interactive search/filter catalog section, and polished e-commerce UI design.
// ==============================================================================

import React from "react";
// Layout Components:
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Homepage Content Section Components:
import HeroSection from "../components/home/HeroSection";
import CategoriesGrid from "../components/home/CategoriesGrid";
import FeaturedProducts from "../components/home/FeaturedProducts";

// Client State Overlays:
import CartDrawer from "../components/cart/CartDrawer";
import Toast from "../components/ui/Toast";

// Data Source:
import { CATEGORIES, PRODUCTS } from "../data/products";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Global Interactive Toast Notification (Client Component) */}
      <Toast />

      {/* Slide-over Cart Drawer (Client Component) */}
      <CartDrawer />

      {/* Announcement Promo Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-2.5 px-4 text-center text-xs font-bold tracking-wide">
        🚀 Launch Special: Free Worldwide Express Shipping on Orders Over $99 | Use Code <span className="font-extrabold underline tracking-wider">NOVANEXT</span> for $15 OFF
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
