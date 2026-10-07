// ==============================================================================
// FILE: components/layout/ClientOverlays.tsx
// ARCHITECTURE ROLE: Master Client State Overlays Container Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Included inside Server Components (`app/page.tsx`, `app/products/[slug]/page.tsx`).
//   2. Marked with `'use client'` directive to manage overlay modal visibility states.
//   3. Composes all global client state popups:
//      - `<Toast />`: Interactive notification alert popup.
//      - `<CartDrawer />`: Slide-over shopping bag drawer.
//      - `<WishlistDrawer />`: Slide-over saved favorites drawer.
//      - `<CheckoutModal />`: Shipping address validation & checkout modal.
// ==============================================================================

"use client";

import React, { useState } from "react";
import Toast from "../ui/Toast";
import CartDrawer from "../cart/CartDrawer";
import WishlistDrawer from "../wishlist/WishlistDrawer";
import CheckoutModal from "../checkout/CheckoutModal";

export default function ClientOverlays() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      {/* Global Interactive Toast Notification Alert */}
      <Toast />

      {/* Slide-over Shopping Bag Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Slide-over Saved Favorites Wishlist Drawer */}
      <WishlistDrawer />

      {/* Shipping Address Validation & Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
