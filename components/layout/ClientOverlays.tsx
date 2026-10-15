// ==============================================================================
// FILE: components/layout/ClientOverlays.tsx
// ARCHITECTURE ROLE: Master Client State Overlays Container Component
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   Why does this component exist?
//     In Next.js, our main pages (`app/page.tsx` and `app/products/[slug]`) are
//     "React Server Components" (RSC). They run on the Node.js server so they can generate
//     fast HTML with zero JavaScript download weight.
//     However, interactive popups (like our Cart Drawer, Wishlist Drawer, Search Modal,
//     Compare Matrix, and Quick View Modal) NEED to run in the user's browser because
//     they react to clicks, keystrokes, and animations.
//     By putting all client-side popups inside this single `'use client'` wrapper,
//     our pages stay fast and clean on the server!
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
import QuickViewModal from "../catalog/QuickViewModal";

export default function ClientOverlays() {
  // Modal visibility states managed locally
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* 1. Sticky Navigation Header with Quick Search trigger */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 2. Global Toast Notification Alerts (e.g. "Added to bag", "Promo applied") */}
      <Toast />

      {/* 3. Slide-over Shopping Bag Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* 4. Slide-over Saved Favorites Wishlist Drawer */}
      <WishlistDrawer />

      {/* 5. Product Quick View Inspection Modal */}
      <QuickViewModal />

      {/* 6. Multi-Product Specifications Comparison Matrix & Sticky Bottom Dock */}
      <ProductCompareDrawer />

      {/* 7. Command-K (⌘K) Quick Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 8. Shipping Address Validation & Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
