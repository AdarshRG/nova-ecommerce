// ==============================================================================
// FILE: components/layout/ClientOverlays.tsx
// ARCHITECTURE ROLE: Master Client State Overlays Container Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted inside Server Components (`app/page.tsx`, `app/products/[slug]/page.tsx`).
//   2. Day 5 Update: Integrates `<SearchModal />` for Command-K (⌘K) quick search,
//      and passes `onOpenSearch` trigger down to `<Header />`.
//   3. Composes all global client state overlays:
//      - `<Header />`: Sticky navigation header with search and counter badges.
//      - `<Toast />`: Interactive notification alert popups.
//      - `<CartDrawer />`: Slide-over shopping bag drawer.
//      - `<WishlistDrawer />`: Slide-over saved favorites drawer.
//      - `<CheckoutModal />`: Shipping address validation & checkout modal.
//      - `<SearchModal />`: Real-time Command-K quick search overlay.
// ==============================================================================

"use client";

import React, { useState } from "react";
import Header from "./Header";
import Toast from "../ui/Toast";
import CartDrawer from "../cart/CartDrawer";
import WishlistDrawer from "../wishlist/WishlistDrawer";
import CheckoutModal from "../checkout/CheckoutModal";
import SearchModal from "../catalog/SearchModal";

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
