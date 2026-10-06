// ==============================================================================
// FILE: store/useCartStore.ts
// ARCHITECTURE ROLE: Global Client State Management (Zustand Store with Persist Middleware)
//
// ROUTE MAP & STATE FLOW:
//   Day 3 Enhancements:
//     - Added `persist` middleware from `zustand/middleware` to serialize cart state to `localStorage`.
//     - Added interactive Toast Notification dispatch system (`toastNotification`, `showToast()`).
//     - Added Promo Code discount system (`appliedPromo`, `discountAmount`, `applyPromoCode()`).
//     - Added Free Express Shipping threshold calculator ($99 goal).
// ==============================================================================

import { create } from "zustand";   //Server->Bigcommerce api->Next js->Zustand->middleware->local storage->user refresh->data
import { persist, createJSONStorage } from "zustand/middleware";    //its the middleware that stores the data to local storage  so refresh page it will stay
import { Product, CartItem, ToastNotification } from "../types/product";

// Constant threshold for free shipping
export const FREE_SHIPPING_THRESHOLD = 99.0;

interface CartStore {
  // --- STATE VALUES ---
  items: CartItem[];                     // Array of products with selected quantities
  isOpen: boolean;                       // Slide-over cart drawer visibility toggle
  toastNotification: ToastNotification | null; // Current active toast alert message
  appliedPromo: string | null;           // Active promo code string (e.g. "NOVANEXT")
  discountAmount: number;                // Dollar discount applied from valid promo code

  // --- CART MUTATION ACTIONS ---
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // --- PROMO CODE ACTIONS ---
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // --- TOAST NOTIFICATION ACTIONS ---
  showToast: (message: string, product?: Product, type?: "success" | "info" | "warning") => void;
  hideToast: () => void;

  // --- COMPUTED SELECTORS (GETTERS) ---
  getTotalItems: () => number;
  getSubtotalPrice: () => number;
  getShippingFee: () => number;
  getFinalPrice: () => number;
  getFreeShippingRemaining: () => number;
  getFreeShippingPercent: () => number;
}

// ==============================================================================
// ZUSTAND STORE CREATION WITH PERSIST MIDDLEWARE
// WHY USED: Persists the user's cart in browser `localStorage` under key `"nova-cart-storage"`.
// ==============================================================================
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // --- Default State Initialization ---
      items: [],
      isOpen: false,
      toastNotification: null,
      appliedPromo: null,
      discountAmount: 0,

      // --------------------------------------------------------------------------
      // ACTION: addItem(product, quantity)
      // WHY USED: Adds product to cart & dispatches interactive toast notification.
      // --------------------------------------------------------------------------
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          let updatedItems: CartItem[];
          if (existingIndex > -1) {
            updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
          } else {
            updatedItems = [...state.items, { product, quantity }];
          }

          return {
            items: updatedItems,
            toastNotification: {
              id: Date.now().toString(),
              message: `Added "${product.name}" to your bag!`,
              product,
              type: "success",
            },
          };
        });
      },

      // --------------------------------------------------------------------------
      // ACTION: removeItem(productId)
      // WHY USED: Removes item line and shows removal toast alert.
      // --------------------------------------------------------------------------
      removeItem: (productId) => {
        set((state) => {
          const removedItem = state.items.find((i) => i.product.id === productId);
          return {
            items: state.items.filter((item) => item.product.id !== productId),
            toastNotification: removedItem
              ? {
                id: Date.now().toString(),
                message: `Removed "${removedItem.product.name}" from bag.`,
                type: "info",
              }
              : state.toastNotification,
          };
        });
      },

      // --------------------------------------------------------------------------
      // ACTION: updateQuantity(productId, quantity)
      // --------------------------------------------------------------------------
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // --------------------------------------------------------------------------
      // ACTION: clearCart()
      // --------------------------------------------------------------------------
      clearCart: () =>
        set({
          items: [],
          appliedPromo: null,
          discountAmount: 0,
          toastNotification: {
            id: Date.now().toString(),
            message: "Cart cleared.",
            type: "info",
          },
        }),

      // --------------------------------------------------------------------------
      // ACTIONS: Drawer visibility toggles
      // --------------------------------------------------------------------------
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // --------------------------------------------------------------------------
      // ACTION: applyPromoCode(code)
      // Validates and applies discount codes (e.g. "NOVANEXT" for $15 OFF or "SAVE10" for 10% OFF)
      // --------------------------------------------------------------------------
      applyPromoCode: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        const subtotal = get().getSubtotalPrice();

        if (cleanCode === "NOVANEXT") {
          const discount = 15.0;
          set({ appliedPromo: cleanCode, discountAmount: discount });
          get().showToast(`Promo code "NOVANEXT" applied! ($15.00 OFF)`, undefined, "success");
          return { success: true, message: "$15.00 Discount Applied!" };
        } else if (cleanCode === "SAVE10") {
          const discount = Number((subtotal * 0.1).toFixed(2));
          set({ appliedPromo: cleanCode, discountAmount: discount });
          get().showToast(`Promo code "SAVE10" applied! (10% OFF)`, undefined, "success");
          return { success: true, message: "10% Discount Applied!" };
        }

        return { success: false, message: "Invalid promo code. Try 'NOVANEXT'" };
      },

      removePromoCode: () => {
        set({ appliedPromo: null, discountAmount: 0 });
        get().showToast("Promo code removed.", undefined, "info");
      },

      // --------------------------------------------------------------------------
      // ACTIONS: Toast Notifications
      // --------------------------------------------------------------------------
      showToast: (message, product, type = "success") => {
        set({
          toastNotification: {
            id: Date.now().toString(),
            message,
            product,
            type,
          },
        });
      },

      hideToast: () => set({ toastNotification: null }),

      // --------------------------------------------------------------------------
      // COMPUTED SELECTORS (GETTERS)
      // --------------------------------------------------------------------------
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotalPrice();
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
      },

      getFinalPrice: () => {
        const subtotal = get().getSubtotalPrice();
        const shipping = get().getShippingFee();
        const discount = get().discountAmount;
        return Math.max(0, subtotal + shipping - discount);
      },

      getFreeShippingRemaining: () => {
        const subtotal = get().getSubtotalPrice();
        return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      },

      getFreeShippingPercent: () => {
        const subtotal = get().getSubtotalPrice();
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 100;
        return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
      },
    }),
    {
      name: "nova-cart-storage", // Unique key name in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        appliedPromo: state.appliedPromo,
        discountAmount: state.discountAmount,
      }), // Save items and active promo code, exclude temporary drawer visibility & toast state
    }
  )
);

