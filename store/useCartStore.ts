// ==============================================================================
// FILE: store/useCartStore.ts
// ARCHITECTURE ROLE: Global Client State Management (Zustand Store)
//
// ROUTE MAP & STATE FLOW:
//   This store acts as the single source of truth for all cart actions across the app:
//     - Invoked by `<ProductCard />` when user clicks "Add to Cart" on Homepage.
//     - Invoked by `<AddToCartButton />` when user adds items from Product Detail Pages.
//     - Subscribed to by `<Header />` to calculate real-time item badge count (`getTotalItems()`).
//     - Subscribed to by `<CartDrawer />` to render item list, quantity counters, and subtotal.
//
// WHY ZUSTAND WAS CHOSEN:
//   Unlike React Context (which triggers full sub-tree re-renders on any state change),
//   Zustand uses atomic subscriptions. Components only re-render when their specific selected field changes.
// ==============================================================================

import { create } from "zustand";
import { Product, CartItem } from "../types/product";

// Interface contract defining state values and mutation action signatures
interface CartStore {
  // --- STATE VALUES ---
  items: CartItem[]; // Array of products with their selected quantities
  isOpen: boolean;    // Boolean controlling whether the slide-over cart drawer is visible

  // --- MUTATION ACTIONS ---
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // --- COMPUTED SELECTORS (GETTERS) ---
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ==============================================================================
// FUNCTION: create<CartStore>((set, get) => ({ ... }))
// WHY USED: Initializes a central Zustand hook (`useCartStore`) accessible from any Client Component.
// PARAMETERS:
//   - `set`: Function used to immutably update the store state and trigger UI updates.
//   - `get`: Function used to read current state values synchronously inside actions/selectors.
// HOW IT IS CALLED: Imported into React components via `const { items, addItem } = useCartStore();`.
// ==============================================================================
export const useCartStore = create<CartStore>((set, get) => ({
  // Default state initialization
  items: [],
  isOpen: false,

  // ACTION: addItem(product, quantity)
  // WHY USED: Adds a product to the cart array. If product already exists, increments its quantity.
  // HOW IT WORKS: Searches `state.items` for matching `product.id`. Updates or appends item and opens cart drawer (`isOpen: true`).
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        // Item exists -> immutable array update replacing target item quantity
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
        return { items: updatedItems, isOpen: true };
      }

      // Item does not exist -> append new CartItem entry
      return {
        items: [...state.items, { product, quantity }],
        isOpen: true,
      };
    });
  },

  // ACTION: removeItem(productId)
  // WHY USED: Completely removes a product line item from the cart.
  // HOW IT WORKS: Filters out items matching `productId`.
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  // ACTION: updateQuantity(productId, quantity)
  // WHY USED: Modifies quantity for an item (e.g. clicking '+' or '-' buttons in CartDrawer).
  // HOW IT WORKS: If quantity drops to 0 or below, delegates to `removeItem()`. Otherwise maps updated quantity.
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

  // ACTION: clearCart()
  // WHY USED: Resets cart items to an empty array (used after checkout or clicking "Clear").
  clearCart: () => set({ items: [] }),

  // ACTIONS: Drawer visibility toggles
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // COMPUTED SELECTOR: getTotalItems()
  // WHY USED: Sums up total quantity of all items (e.g., 2 headphones + 1 watch = 3 total items).
  // HOW IT IS CALLED: Executed by `<Header />` to render the badge count.
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  // COMPUTED SELECTOR: getTotalPrice()
  // WHY USED: Computes monetary subtotal by multiplying `price * quantity` for each item.
  // HOW IT IS CALLED: Executed by `<CartDrawer />` to display checkout subtotal.
  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },
}));
