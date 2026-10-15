// ==============================================================================
// FILE: store/useQuickViewStore.ts
// ARCHITECTURE ROLE: Global Quick View Modal State Management (Zustand)
//
// 🎓 BEGINNER'S GUIDE TO THIS STORE:
//   What is "Quick View"?
//     On an e-commerce website, when you are browsing a list of 20 products, you might
//     want to see more details of one item without having to wait for a whole new page to load.
//     When you click "Quick View", a sleek popup modal appears right over the catalog!
//   How does this store work?
//     1. Any component (like `<ProductCard />`) calls `openQuickView(product)`.
//     2. This store sets `selectedProduct = product` and `isOpen = true`.
//     3. It also automatically tells `useRecentlyViewedStore` to log that product into your browsing history!
//     4. The `<QuickViewModal />` component is listening to this store, so it instantly appears on screen.
// ==============================================================================

import { create } from "zustand";
import { Product } from "../types/product";
import { useRecentlyViewedStore } from "./useRecentlyViewedStore";

interface QuickViewStore {
  // --- STATE VALUES ---
  selectedProduct: Product | null; // The product currently being viewed in the popup modal
  isOpen: boolean;                 // Whether the popup modal is currently open

  // --- ACTIONS ---
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  // Default values when the app starts
  selectedProduct: null,
  isOpen: false,

  // ----------------------------------------------------------------------------
  // ACTION: openQuickView(product)
  // Opens the popup modal with the chosen product, and records it in browsing history.
  // ----------------------------------------------------------------------------
  openQuickView: (product: Product) => {
    // Automatically record this item in browsing history
    useRecentlyViewedStore.getState().addViewedProduct(product.id);

    set({
      selectedProduct: product,
      isOpen: true,
    });
  },

  // ----------------------------------------------------------------------------
  // ACTION: closeQuickView()
  // Closes the modal and resets the selected product.
  // ----------------------------------------------------------------------------
  closeQuickView: () => {
    set({
      selectedProduct: null,
      isOpen: false,
    });
  },
}));
