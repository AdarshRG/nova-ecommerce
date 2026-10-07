// ==============================================================================
// FILE: store/useWishlistStore.ts
// ARCHITECTURE ROLE: Persistent Client Wishlist & Favorites State Store (Zustand)
//
// ROUTE MAP & STATE FLOW:
//   1. Manages an array of saved product IDs (`wishlistIds`) in browser `localStorage`.
//   2. Subscribed to by `<ProductCard />` to render animated heart toggles (❤️ / 🤍).
//   3. Subscribed to by `<Header />` to render live saved wishlist badge count.
//   4. Subscribed to by `<WishlistDrawer />` to display saved items with "Move to Bag" buttons.
//
// WHY ZUSTAND PERSIST WAS CHOSEN:
//   Allows persistent cross-session favorites without requiring user login or backend APIs.
//   Components subscribe atomically, so toggling a wishlist heart only re-renders the heart icon.
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCartStore } from "./useCartStore";
import { PRODUCTS } from "../data/products";

// Contract interface for Wishlist Store state and action signatures
interface WishlistStore {
  // --- STATE VALUES ---
  wishlistIds: string[]; // Array of product IDs saved by the user e.g. ["p1", "p3"]
  isOpen: boolean;        // Boolean controlling whether Wishlist Drawer is visible

  // --- ACTIONS ---
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;

  // --- COMPUTED GETTERS ---
  getTotalWishlistItems: () => number;
}

// ==============================================================================
// ZUSTAND STORE CREATION WITH PERSIST MIDDLEWARE
// Storage key: "nova-wishlist-storage" in browser localStorage
// ==============================================================================
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      // Default state initialization
      wishlistIds: [],
      isOpen: false,

      // --------------------------------------------------------------------------
      // ACTION: toggleWishlist(productId)
      // WHY USED: Adds product ID to wishlist array if not present, or removes it if present.
      // HOW IT WORKS: Checks `state.wishlistIds.includes(productId)`. Updates array immutably
      //               and triggers a Toast notification alert via `useCartStore`.
      // --------------------------------------------------------------------------
      toggleWishlist: (productId: string) => {
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          const targetProduct = PRODUCTS.find((p) => p.id === productId);

          let updatedIds: string[];
          let message = "";

          if (exists) {
            updatedIds = state.wishlistIds.filter((id) => id !== productId);
            message = targetProduct
              ? `Removed "${targetProduct.name}" from your wishlist.`
              : "Removed item from wishlist.";
          } else {
            updatedIds = [...state.wishlistIds, productId];
            message = targetProduct
              ? `Saved "${targetProduct.name}" to your wishlist!`
              : "Saved item to wishlist!";
          }

          // Trigger toast notification through useCartStore helper
          useCartStore.getState().showToast(message, targetProduct, exists ? "info" : "success");

          return { wishlistIds: updatedIds };
        });
      },

      // --------------------------------------------------------------------------
      // GETTER METHOD: isInWishlist(productId)
      // WHY USED: Returns true if given productId is saved in the wishlist array.
      // --------------------------------------------------------------------------
      isInWishlist: (productId: string) => {
        return get().wishlistIds.includes(productId);
      },

      // --------------------------------------------------------------------------
      // ACTION: clearWishlist()
      // WHY USED: Clears all saved product IDs from the wishlist array.
      // --------------------------------------------------------------------------
      clearWishlist: () => set({ wishlistIds: [] }),

      // --------------------------------------------------------------------------
      // DRAWER VISIBILITY TOGGLES
      // --------------------------------------------------------------------------
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      // --------------------------------------------------------------------------
      // COMPUTED SELECTOR: getTotalWishlistItems()
      // WHY USED: Returns total count of saved wishlist items for the Header badge.
      // --------------------------------------------------------------------------
      getTotalWishlistItems: () => {
        return get().wishlistIds.length;
      },
    }),
    {
      name: "nova-wishlist-storage", // LocalStorage key name
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlistIds: state.wishlistIds }), // Persist only wishlist IDs array
    }
  )
);
