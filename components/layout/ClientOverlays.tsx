// ==============================================================================
// FILE: components/layout/ClientOverlays.tsx
// ARCHITECTURE ROLE: Master Client State Overlays Container Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted inside Server Component pages (`app/page.tsx`, `app/products/[slug]/page.tsx`, `app/categories/[slug]/page.tsx`).
//   2. Marked with `'use client'` to manage interactive modal states across the entire application.
//   3. Composes all client-side overlays:
//      - `<Header />`: Sticky navigation header with search and counter badges.
//      - `<Toast />`: Interactive notification alert popups.
//      - `<CartDrawer />`: Slide-over shopping bag drawer.
//      - `<WishlistDrawer />`: Slide-over saved favorites drawer.
//      - `<ProductCompareDrawer />`: Multi-product specs matrix comparison modal & floating dock.
//      - `<SearchModal />`: Real-time Command-K (⌘K) quick search overlay.
//      - `<CheckoutModal />`: Shipping address validation & checkout modal.
// ==============================================================================

"use client";

import React, { useState } from "react";
import Header from "./Header";
import Toast from "../ui/Toast";
import CartDrawer from "../cart/CartDrawer";
import WishlistDrawer from "../wishlist/WishlistDrawer";
import CheckoutModal from "../checkout/CheckoutModal";
import SearchModal from "../catalog/SearchModal";
import ProductCompareDrawer from "../compare/ProductCompareDrawer";

export default function ClientOverlays() {
  // Modal visibility states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Sticky Navigation Header with Search Trigger */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Global Interactive Toast Notification Alert */}
      <Toast />

      {/* Slide-over Shopping Bag Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Slide-over Saved Favorites Wishlist Drawer */}
      <WishlistDrawer />

      {/* Multi-Product Specifications Comparison Matrix & Sticky Bottom Dock */}
      <ProductCompareDrawer />

      {/* Command-K (⌘K) Quick Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Shipping Address Validation & Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
