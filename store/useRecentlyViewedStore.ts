// ==============================================================================
// FILE: store/useRecentlyViewedStore.ts
// ARCHITECTURE ROLE: Persistent User Browsing History State Store (Zustand)
//
// 🎓 BEGINNER'S GUIDE TO THIS STORE:
//   What does this file do?
//     Whenever a user looks at a product (by visiting its page or clicking Quick View),
//     this store saves that product's ID into the browser's memory (`localStorage`).
//     Then, at the bottom of the page, we can show a nice "Recently Viewed" section,
//     just like Amazon or Apple does!
//   Key Concepts Explained:
//     1. Deduplication: If you view the Headphones twice, we don't want two Headphones
//        in your history! So we remove the old entry first, then put the new one at the front.
//     2. Array Slicing: We only keep the last 8 viewed items (`.slice(0, 8)`) so the history
//        doesn't grow infinitely large.
//     3. `persist` Middleware: Zustand automatically saves this list into `localStorage`
//        under the key `"nova-recently-viewed"`. Even if you refresh the browser or restart
//        your computer, your recently viewed products stay saved!
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Maximum items to keep in browsing history
export const MAX_RECENTLY_VIEWED = 8;

interface RecentlyViewedStore {
  // --- STATE VALUES ---
  recentIds: string[]; // List of product IDs e.g. ["p1", "p5", "p2"]

  // --- ACTIONS (Methods that modify the state) ---
  addViewedProduct: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

// ==============================================================================
// ZUSTAND STORE CREATION WITH PERSISTENCE
// ==============================================================================
export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      // Default state: start with an empty history array
      recentIds: [],

      // --------------------------------------------------------------------------
      // ACTION: addViewedProduct(productId)
      // WHY USED: Adds a newly viewed product ID to the top of the history list.
      // HOW IT WORKS:
      //   1. Filters out any existing occurrence of this ID (Deduplication).
      //   2. Prepends the new ID at index 0 using array spread `[productId, ...filtered]`.
      //   3. Uses `.slice(0, MAX_RECENTLY_VIEWED)` to enforce an 8-item ceiling.
      // --------------------------------------------------------------------------
      addViewedProduct: (productId: string) => {
        set((state) => {
          // Remove ID if already in array to prevent duplicate cards
          const filtered = state.recentIds.filter((id) => id !== productId);

          // Place the newest ID at index 0 and keep max 8 items
          const updated = [productId, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

          return { recentIds: updated };
        });
      },

      // --------------------------------------------------------------------------
      // ACTION: clearRecentlyViewed()
      // Resets the browsing history array to empty.
      // --------------------------------------------------------------------------
      clearRecentlyViewed: () => set({ recentIds: [] }),
    }),
    {
      name: "nova-recently-viewed", // Unique key in browser localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
