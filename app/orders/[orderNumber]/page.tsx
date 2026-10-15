// ==============================================================================
// FILE: app/orders/[orderNumber]/page.tsx
// ARCHITECTURE ROLE: Dynamic Server Route for Customer Order Confirmation & Tracking
//
// 🎓 BEGINNER'S GUIDE TO THIS PAGE:
//   What is this file?
//     This file represents a dynamic route in Next.js 16 App Router.
//     When a customer visits a URL like `/orders/NV-7842`:
//       1. Next.js matches the folder name `[orderNumber]` and passes `{ orderNumber: "NV-7842" }`
//          into the page component's `params` Promise.
//       2. The server component asynchronously unwraps `await params`.
//       3. It passes `orderNumber` into `<OrderTrackingView />`, which looks up the real
//          order from local customer storage and renders the live fulfillment milestone stepper!
//       4. `<ClientOverlays />` mounts the sticky navigation header and global shopping bag drawers.
// ==============================================================================

import React from "react";
import OrderTrackingView from "../../../components/orders/OrderTrackingView";
import ClientOverlays from "../../../components/layout/ClientOverlays";
import Footer from "../../../components/layout/Footer";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  // Next.js 16 Dynamic Route Parameter unwrapping
  const { orderNumber } = await params;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Global Client Overlays (Sticky Header, Toast, Cart Drawer, Wishlist, Account) */}
      <ClientOverlays />

      {/* Main Dynamic Order Tracking & Invoice Presentation */}
      <main className="flex-1">
        <OrderTrackingView orderNumber={orderNumber} />
      </main>

      {/* Global Storefront Footer */}
      <Footer />
    </div>
  );
}
