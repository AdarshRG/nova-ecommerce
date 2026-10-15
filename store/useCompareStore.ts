// ==============================================================================
// FILE: store/useCompareStore.ts
// ARCHITECTURE ROLE: Global Side-by-Side Product Comparison State Management (Zustand)
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Subscribed to by `<ProductCard />` to render active comparison indicator ("⇄ Compare").
//   2. Subscribed to by `<ProductCompareDrawer />` to render side-by-side spec comparison table.
//   3. Subscribed to by sticky floating comparison bar at bottom of viewport.
//   4. Uses `persist` middleware to retain compared items in `localStorage` across page reloads.
//
// ARCHITECTURAL DESIGN RATIONALE:
//   - Max Limit: Enforces a strict maximum of 4 products (`MAX_COMPARE_LIMIT = 4`) to preserve
//     optimal horizontal responsive matrix layouts on desktop and mobile screens.
//   - Cross-Store Integration: Automatically fires interactive `showToast()` alerts from `useCartStore`
//     when users add or remove compared hardware devices.
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "../types/product";
import { useCartStore } from "./useCartStore";

// Maximum items permitted in the comparison matrix simultaneously
export const MAX_COMPARE_LIMIT = 4;

// Interface contract defining state values and mutation actions
interface CompareStore {
  // --- STATE VALUES ---
  compareList: Product[]; // Array of products actively compared (max 4)
  isOpen: boolean;        // Boolean controlling visibility of comparison modal matrix

  // --- ACTIONS ---
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  openCompare: () => void;
  closeCompare: () => void;

  // --- COMPUTED SELECTORS ---
  getCompareCount: () => number;
}

// ==============================================================================
// STORE INITIALIZATION WITH LOCALSTORAGE PERSISTENCE
// ==============================================================================
export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      // Default state initialization
      compareList: [],
      isOpen: false,

      // --------------------------------------------------------------------------
      // ACTION: addToCompare(product)
      // WHY USED: Adds a product to comparison list if within limit and not already added.
      // RETURNS: true if added, false if prevented by limit or duplicate.
      // --------------------------------------------------------------------------
      addToCompare: (product: Product) => {
        const { compareList } = get();

        // 1. Guard against duplicate addition
        if (compareList.some((p) => p.id === product.id)) {
          useCartStore.getState().showToast(
            `"${product.name}" is already in comparison matrix.`,
            product,
            "info"
          );
          return false;
        }

        // 2. Guard against exceeding max 4 items limit
        if (compareList.length >= MAX_COMPARE_LIMIT) {
          useCartStore.getState().showToast(
            `Compare limit reached (max ${MAX_COMPARE_LIMIT} items). Remove an item to add this.`,
            undefined,
            "warning"
          );
          return false;
        }

        // 3. Add product and trigger confirmation toast
        set((state) => ({
          compareList: [...state.compareList, product],
        }));

        useCartStore.getState().showToast(
          `Added "${product.name}" to comparison table (${get().compareList.length}/${MAX_COMPARE_LIMIT})`,
          product,
          "success"
        );

        return true;
      },

      // --------------------------------------------------------------------------
      // ACTION: removeFromCompare(productId)
      // WHY USED: Removes a specific product from comparison array by ID.
      // --------------------------------------------------------------------------
      removeFromCompare: (productId: string) => {
        const target = get().compareList.find((p) => p.id === productId);

        set((state) => ({
          compareList: state.compareList.filter((p) => p.id !== productId),
        }));

        if (target) {
          useCartStore.getState().showToast(
            `Removed "${target.name}" from comparison.`,
            undefined,
            "info"
          );
        }
      },

      // --------------------------------------------------------------------------
      // ACTION: toggleCompare(product)
      // WHY USED: Convenient toggle button action for card buttons (adds if absent, removes if present).
      // --------------------------------------------------------------------------
      toggleCompare: (product: Product) => {
        if (get().isInCompare(product.id)) {
          get().removeFromCompare(product.id);
        } else {
          get().addToCompare(product);
        }
      },

      // --------------------------------------------------------------------------
      // ACTION: clearCompare()
      // WHY USED: Clears all compared items from the matrix.
      // --------------------------------------------------------------------------
      clearCompare: () => {
        set({ compareList: [] });
        useCartStore.getState().showToast(
          "Comparison list cleared.",
          undefined,
          "info"
        );
      },

      // --------------------------------------------------------------------------
      // HELPER: isInCompare(productId)
      // WHY USED: Checks if a product ID exists inside active comparison array.
      // --------------------------------------------------------------------------
      isInCompare: (productId: string) => {
        return get().compareList.some((p) => p.id === productId);
      },

      // --------------------------------------------------------------------------
      // DRAWER TOGGLES
      // --------------------------------------------------------------------------
      openCompare: () => set({ isOpen: true }),
      closeCompare: () => set({ isOpen: false }),

      // --------------------------------------------------------------------------
      // COMPUTED SELECTOR: getCompareCount()
      // --------------------------------------------------------------------------
      getCompareCount: () => {
        return get().compareList.length;
      },
    }),
    {
      name: "nova-compare-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ compareList: state.compareList }), // Exclude temporary isOpen state
    }
  )
);
