// ==============================================================================
// FILE: components/layout/ClientOverlays.tsx
// ARCHITECTURE ROLE: Master Client State Overlays Container Component
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   Why does this component exist?
//     In Next.js, our main pages (`app/page.tsx` and `app/products/[slug]`) are
//     "React Server Components" (RSC). They run on the server to generate super fast HTML.
//     However, interactive popups (Cart, Wishlist, Search, Compare, Quick View, and Auth)
//     need to run on the client side in the browser.
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
import AuthModal from "../auth/AuthModal";
import AccountDrawer from "../auth/AccountDrawer";
import AICopilotDrawer from "../ai/AICopilotDrawer";

export default function ClientOverlays() {
  // Modal visibility states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* 1. Sticky Navigation Header with Quick Search trigger */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 2. Global Toast Notification Alerts */}
      <Toast />

      {/* 3. Slide-over Shopping Bag Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* 4. Slide-over Saved Favorites Wishlist Drawer */}
      <WishlistDrawer />

      {/* 5. Customer Sign In / Register Modal */}
      <AuthModal />

      {/* 6. Customer Account Profile & Order History Drawer */}
      <AccountDrawer />

      {/* 7. Product Quick View Inspection Modal */}
      <QuickViewModal />

      {/* 8. Multi-Product Specifications Comparison Matrix & Sticky Bottom Dock */}
      <ProductCompareDrawer />

      {/* 9. Command-K (⌘K) Quick Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 10. Shipping Address Validation & Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* 11. Autonomous AI Shopping Copilot Slide-Over Drawer */}
      <AICopilotDrawer />
    </>
  );
}
