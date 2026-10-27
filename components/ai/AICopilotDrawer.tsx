// ==============================================================================
// FILE: components/ai/AICopilotDrawer.tsx
// ARCHITECTURE ROLE: Headless AI Shopping Assistant Slide-over Interface
//
// 🎓 BEGINNER'S GUIDE TO BUILDING AN AI COPILOT INTERFACE:
//   What makes this an "AI Application"?
//     Unlike a standard dumb chatbot that just outputs plain text, this component:
//       1. Displays autonomous "Tool Calling" badges (e.g. `searchCatalog`, `trackOrder`).
//       2. Renders LIVE INTERACTIVE PRODUCT CARDS inside the message stream.
//          Customers can click "Add to Bag" or "Quick View" right from the AI's recommendation!
//       3. Dispatches suggested action buttons (e.g., applying discount codes to checkout).
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAIStore } from "../../store/useAIStore";
import { useCartStore } from "../../store/useCartStore";
import { useQuickViewStore } from "../../store/useQuickViewStore";
import { useCompareStore } from "../../store/useCompareStore";
import { AISuggestedAction } from "../../types/ai";
import { Product } from "../../types/product";

export default function AICopilotDrawer() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand Store Selectors
  const {
    isOpen,
    isGenerating,
    messages,
    closeAICopilot,
    sendMessage,
    clearChat,
  } = useAIStore();

  const { addItem, applyPromoCode, showToast } = useCartStore();
  const { openQuickView } = useQuickViewStore();
  const { openCompare } = useCompareStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll chat stream to the newest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isOpen]);

  if (!isMounted || !isOpen) return null;

  // Form submission handler
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userText = inputValue;
    setInputValue("");
    await sendMessage(userText);
  };

  // ----------------------------------------------------------------------------
  // HANDLER: Execute AI Suggested Action Chips
  // ----------------------------------------------------------------------------
  const handleActionClick = (action: AISuggestedAction) => {
    switch (action.type) {
      case "add_to_cart":
        if (action.payload.productId) {
          // Find product from recommended products in chat messages
          const product = messages
            .flatMap((m) => m.recommendedProducts || [])
            .find((p) => p.id === action.payload.productId);

          if (product) {
            addItem(product, 1);
            showToast(`Added ${product.name} to shopping bag via AI Copilot!`, product, "success");
          }
        }
        break;

      case "quick_view":
        if (action.payload.productId) {
          const product = messages
            .flatMap((m) => m.recommendedProducts || [])
            .find((p) => p.id === action.payload.productId);

          if (product) {
            closeAICopilot();
            openQuickView(product);
          }
        }
        break;

      case "track_order":
        if (action.payload.orderNumber) {
          closeAICopilot();
          router.push(`/orders/${action.payload.orderNumber}`);
        }
        break;

      case "apply_promo":
        if (action.payload.promoCode) {
          const result = applyPromoCode(action.payload.promoCode);
          if (result.success) {
            showToast(result.message, undefined, "success");
          } else {
            showToast(result.message, undefined, "warning");
          }
        }
        break;

      case "navigate_slug":
        closeAICopilot();
        openCompare();
        break;

      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeAICopilot}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 text-slate-50 flex flex-col shadow-2xl">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-violet-600/30">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    NOVA Cortex AI
                  </h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/40">
                    RAG Copilot
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Autonomous Shopping Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Clear conversation"
              >
                🗑️
              </button>
              <button
                onClick={closeAICopilot}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conversation Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Message Bubble Container */}
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  {/* Tool Execution Badge (Demonstrates Applied AI tool calls) */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2.5 pb-2 border-b border-slate-800 flex items-center gap-1.5 text-[10px] text-violet-300 font-mono">
                      <span>⚡</span>
                      <span>Executed tool: {msg.toolCalls[0].toolName}()</span>
                    </div>
                  )}

                  {/* Message Markdown-style Content */}
                  <div className="whitespace-pre-line space-y-1.5">{msg.content}</div>

                  {/* Embedded Recommended Product Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 block">
                        Verified Catalog Recommendations:
                      </span>
                      {msg.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl shrink-0">{p.icon}</span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-[11px] truncate">
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-violet-400 font-semibold">
                                ${p.price.toFixed(2)} • ★ {p.rating}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                addItem(p, 1);
                                showToast(`Added ${p.name} to bag via AI!`, p, "success");
                              }}
                              className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"
                            >
                              + Add
                            </button>
                            <button
                              onClick={() => {
                                closeAICopilot();
                                openQuickView(p);
                              }}
                              className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 rounded-lg"
                              title="Quick View"
                            >
                              🔍
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clickable AI Action Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className="px-2.5 py-1 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 border border-violet-700/50 text-[10px] font-bold text-violet-300 hover:text-white transition-all active:scale-95"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 block text-right mt-1.5">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* AI Reasoning Loading Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-violet-400 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 w-fit animate-pulse">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                <span>NOVA Cortex is reasoning & searching catalog...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => sendMessage("What are your best ANC headphones under $300?")}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              🎧 Best ANC under $300
            </button>
            <button
              onClick={() => sendMessage("Compare NOVA Sonic Wireless vs Pulse")}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              ⚡ Compare Flagships
            </button>
            <button
              onClick={() => sendMessage("Do you have any discount codes?")}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              🎟️ Discount Codes
            </button>
            <button
              onClick={() => sendMessage("Where is order NV-8492?")}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              📦 Track Order NV-8492
            </button>
          </div>

          {/* Input Bar Form */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AI anything about our catalog..."
              disabled={isGenerating}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 flex items-center justify-center shrink-0"
              title="Send to AI Copilot"
            >
              <span>➔</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
