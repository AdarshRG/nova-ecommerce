// ==============================================================================
// FILE: store/useAuthStore.ts
// ARCHITECTURE ROLE: Customer Authentication, Session & Order History State Store (Zustand)
//
// 🎓 BEGINNER'S GUIDE TO THIS STORE:
//   What does this file do?
//     This store manages who is currently signed into the website, and keeps track of
//     their past order receipts!
//   How it works:
//     1. When a user logs in, `login(email, name)` creates a customer session.
//     2. When an order is placed in `<CheckoutModal />`, `addOrder(order)` saves the order receipt here.
//     3. Everything is saved to `localStorage` under `"nova-auth-storage"`, so you stay logged in
//        and your order receipts stay saved even if you refresh the browser!
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Order } from "../types/auth";
import { useCartStore } from "./useCartStore";

interface AuthStore {
  // --- STATE VALUES ---
  user: User | null;           // Currently signed-in customer (or null if logged out)
  isAuthenticated: boolean;    // Quick boolean helper
  orders: Order[];             // Past order history receipts
  isAuthModalOpen: boolean;    // Sign In / Register popup visibility
  isAccountDrawerOpen: boolean;// Slide-over account & order history drawer visibility

  // --- ACTIONS ---
  login: (email: string, name?: string) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openAccountDrawer: () => void;
  closeAccountDrawer: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Default state: start logged out with sample order history ready
      user: null,
      isAuthenticated: false,
      orders: [],
      isAuthModalOpen: false,
      isAccountDrawerOpen: false,

      // ------------------------------------------------------------------------
      // ACTION: login(email, name)
      // Creates a session for the customer and triggers a welcome toast alert
      // ------------------------------------------------------------------------
      login: (email: string, name?: string) => {
        const cleanEmail = email.trim();
        const userName = name?.trim() || cleanEmail.split("@")[0] || "Customer";

        const customerUser: User = {
          id: `usr-${Date.now()}`,
          name: userName,
          email: cleanEmail,
          memberTier: "Gold VIP",
          joinedDate: new Date().toISOString().split("T")[0],
        };

        set({
          user: customerUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });

        // Trigger welcome toast alert
        useCartStore.getState().showToast(
          `Welcome back, ${userName}! Signed in successfully.`,
          undefined,
          "success"
        );
      },

      // ------------------------------------------------------------------------
      // ACTION: logout()
      // Clears user session and closes account drawer
      // ------------------------------------------------------------------------
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAccountDrawerOpen: false,
        });

        useCartStore.getState().showToast(
          "You have been signed out.",
          undefined,
          "info"
        );
      },

      // ------------------------------------------------------------------------
      // ACTION: addOrder(order)
      // Records a new invoice receipt at the top of the customer's order history
      // ------------------------------------------------------------------------
      addOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },

      // Modal & Drawer visibility toggles
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      openAccountDrawer: () => set({ isAccountDrawerOpen: true }),
      closeAccountDrawer: () => set({ isAccountDrawerOpen: false }),
    }),
    {
      name: "nova-auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        orders: state.orders,
      }), // Persist user, auth state, and orders; exclude temporary popup booleans
    }
  )
);
