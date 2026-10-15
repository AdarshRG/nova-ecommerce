// ==============================================================================
// FILE: app/page.tsx
// ARCHITECTURE ROLE: Home Page Route (`/`)
//
// 🎓 BEGINNER'S GUIDE TO THIS PAGE:
//   What is this file?
//     This is the main storefront homepage of our website (what users see when they visit
//     http://localhost:3000/).
//   How does it work?
//     It is a "React Server Component" (RSC).
//     Next.js runs this component on the server, fetches our products, and renders
//     the sub-components like blocks of Lego:
//       1. `<HeroSection />`: The big flagship hardware showcase at the top.
//       2. `<CategoriesGrid />`: The 4 department cards (Audio, Wearables, Smart Home, Accessories).
//       3. `<FeaturedProducts />`: The main catalog grid with search, sort, and filters.
//       4. `<RecentlyViewedSection />`: Shows items the user recently looked at.
//       5. `<ClientOverlays />`: Runs our interactive popups (Cart, Wishlist, Quick View, Search).
// ==============================================================================

import React from "react";
// Layout Components:
import Footer from "../components/layout/Footer";

// Homepage Content Section Components:
import HeroSection from "../components/home/HeroSection";
import CategoriesGrid from "../components/home/CategoriesGrid";
import FeaturedProducts from "../components/home/FeaturedProducts";
import RecentlyViewedSection from "../components/home/RecentlyViewedSection";

// Master Client Overlays Container:
import ClientOverlays from "../components/layout/ClientOverlays";

// Data Source:
import { CATEGORIES, PRODUCTS } from "../data/products";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Announcement Promo Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-2.5 px-4 text-center text-xs font-bold tracking-wide">
        🚀 Launch Special: Free Worldwide Express Shipping on Orders Over $99 | Use Code <span className="font-extrabold underline tracking-wider">NOVANEXT</span> for $15 OFF
      </div>

      {/* Global Client Overlays (Header, SearchModal, Toast, Cart, Wishlist, Compare, Quick View, Checkout) */}
      <ClientOverlays />

      {/* Main Container composing sub-sections */}
      <main className="flex-1">
        <HeroSection />
        <CategoriesGrid categories={CATEGORIES} />
        <FeaturedProducts products={PRODUCTS} />
        <RecentlyViewedSection />
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
