// ==============================================================================
// FILE: store/useAIStore.ts
// ARCHITECTURE ROLE: Zustand Client State Store for Autonomous AI Copilot Session
//
// 🎓 BEGINNER'S GUIDE TO AI STATE STORES:
//   What is this store?
//     This store manages the live conversation between the customer and our AI Copilot.
//   Key Responsibilities:
//     1. Keeps track of message history (`messages`).
//     2. Manages loading states (`isGenerating`) while the AI backend runs RAG & tool calls.
//     3. Dispatches HTTP POST requests to `/api/ai/chat`.
//     4. Lets any button on the website (like "✨ Ask AI about this product" on a PDP)
//        open the AI drawer with pre-loaded context!
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatMessage, AIChatResponse, MessageRole } from "../types/ai";
import { Product } from "../types/product";

interface AIStore {
  // State
  isOpen: boolean;
  isGenerating: boolean;
  messages: ChatMessage[];
  activeProductContext: Product | null;

  // Actions
  openAICopilot: () => void;
  closeAICopilot: () => void;
  toggleAICopilot: () => void;
  sendMessage: (content: string) => Promise<void>;
  askAboutProduct: (product: Product) => void;
  clearChat: () => void;
}

// Initial welcoming message from the AI Copilot
const INITIAL_AI_MESSAGE: ChatMessage = {
  id: "msg-welcome-01",
  role: "assistant",
  content:
    "👋 Hello! I am **NOVA Cortex AI**, your intelligent shopping concierge.\n\nI can retrieve real-time inventory from our catalog, compare hardware specifications side-by-side, unlock active discount codes, or track your shipment. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  suggestedActions: [
    {
      id: "init-act-1",
      type: "apply_promo",
      label: "🎟️ Show Discount Coupons",
      payload: { promoCode: "NOVA20" },
    },
    {
      id: "init-act-2",
      type: "quick_view",
      label: "🎧 Best ANC Headphones?",
      payload: { productSlug: "nova-sonic-wireless" },
    },
  ],
};

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isGenerating: false,
      messages: [INITIAL_AI_MESSAGE],
      activeProductContext: null,

      openAICopilot: () => set({ isOpen: true }),
      closeAICopilot: () => set({ isOpen: false }),
      toggleAICopilot: () => set((state) => ({ isOpen: !state.isOpen })),

      // ------------------------------------------------------------------------
      // ACTION: askAboutProduct(product)
      // Opens the AI Copilot and prompts the AI with specific product context
      // ------------------------------------------------------------------------
      askAboutProduct: (product: Product) => {
        set({
          isOpen: true,
          activeProductContext: product,
        });

        // Automatically send a contextual starter question
        get().sendMessage(
          `Can you tell me more about ${product.name}? What are its key highlights and is it worth buying?`
        );
      },

      // ------------------------------------------------------------------------
      // ACTION: sendMessage(userText)
      // Appends user message and calls the backend RAG & Tool Calling API
      // ------------------------------------------------------------------------
      sendMessage: async (userText: string) => {
        if (!userText.trim() || get().isGenerating) return;

        const currentMessages = get().messages;
        const activeContext = get().activeProductContext;

        const newUserMessage: ChatMessage = {
          id: `msg-user-${Date.now()}`,
          role: "user",
          content: userText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Immediately update UI with the user's message and start spinner
        set({
          messages: [...currentMessages, newUserMessage],
          isGenerating: true,
        });

        try {
          // Prepare conversation payload for the RAG API
          const apiPayload = {
            messages: [...currentMessages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            currentProductContext: activeContext
              ? {
                  id: activeContext.id,
                  name: activeContext.name,
                  slug: activeContext.slug,
                  price: activeContext.price,
                  category: activeContext.category,
                }
              : undefined,
          };

          // Dispatch network call to our headless AI Route Handler
          const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayload),
          });

          const data: AIChatResponse = await response.json();

          if (response.ok && data.success) {
            const assistantMessage: ChatMessage = {
              id: `msg-ai-${Date.now()}`,
              role: "assistant",
              content: data.message,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              toolCalls: data.toolCalls,
              recommendedProducts: data.recommendedProducts,
              suggestedActions: data.suggestedActions,
            };

            set((state) => ({
              messages: [...state.messages, assistantMessage],
              isGenerating: false,
            }));
          } else {
            throw new Error(data.error || "Failed to receive AI response.");
          }
        } catch (error) {
          console.error("AI Copilot request error:", error);

          // Graceful conversational error fallback
          const errorMessage: ChatMessage = {
            id: `msg-err-${Date.now()}`,
            role: "assistant",
            content:
              "I apologize, but I encountered a momentary hiccup communicating with our reasoning service. Please try asking again or select one of the suggested prompts below!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          set((state) => ({
            messages: [...state.messages, errorMessage],
            isGenerating: false,
          }));
        }
      },

      clearChat: () => {
        set({
          messages: [INITIAL_AI_MESSAGE],
          activeProductContext: null,
        });
      },
    }),
    {
      name: "nova-ai-copilot-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
      }), // Persist message history across page navigation; exclude transient popup booleans
    }
  )
);
