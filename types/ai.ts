// ==============================================================================
// FILE: types/ai.ts
// ARCHITECTURE ROLE: Centralized TypeScript Contracts for Applied AI, RAG & Tool Calling
//
// 🎓 BEGINNER'S GUIDE TO APPLIED AI IN FULL-STACK COMMERCE:
//   What is an AI Application Engineer?
//     Unlike traditional frontend/backend engineers who only pass static data,
//     a Full-Stack AI Application Engineer builds systems where Large Language Models (LLMs)
//     can:
//       1. REASON: Understand ambiguous natural language user inquiries.
//       2. RETRIEVE (RAG): Fetch real-time factual knowledge from our product database
//          so the AI never invents or "hallucinates" non-existent prices or products.
//       3. ACT (Tool Calling): Execute real programmatic actions (searching catalog,
//          comparing specs, tracking orders, adding items to bag).
//
//   Key Interfaces Defined Here:
//     • `ChatMessage`: Represents a message in the conversation (user, assistant, or system).
//     • `AIToolCall`: Structured payload describing an action invoked by the AI agent.
//     • `AISuggestedAction`: Actionable buttons rendered inside the chat UI for the user.
// ==============================================================================

import { Product } from "./product";

/**
 * MessageRole Type
 * Standard roles used in LLM conversational architectures (OpenAI, Anthropic, Gemini).
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * AIToolCall Interface
 * Represents an autonomous tool/function executed by the AI agent to retrieve data.
 */
export interface AIToolCall {
  toolName: "searchCatalog" | "compareSpecs" | "trackOrder" | "getActivePromos";
  arguments: Record<string, unknown>;
  output?: unknown;
}

/**
 * AISuggestedAction Interface
 * Clickable action buttons generated alongside the AI's natural language response.
 */
export interface AISuggestedAction {
  id: string;
  type: "add_to_cart" | "quick_view" | "track_order" | "apply_promo" | "navigate_slug";
  label: string;
  payload: {
    productId?: string;
    productSlug?: string;
    orderNumber?: string;
    promoCode?: string;
  };
}

/**
 * ChatMessage Interface
 * Complete record of a single conversational turn in the AI Shopping Copilot.
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: AIToolCall[];
  recommendedProducts?: Product[];
  suggestedActions?: AISuggestedAction[];
}

/**
 * AIChatRequest Interface
 * Payload sent from client frontend to the `/api/ai/chat` backend route.
 */
export interface AIChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  currentProductContext?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
  };
}

/**
 * AIChatResponse Interface
 * Structured JSON returned by the AI route handler to the client.
 */
export interface AIChatResponse {
  success: boolean;
  message: string;
  toolCalls?: AIToolCall[];
  recommendedProducts?: Product[];
  suggestedActions?: AISuggestedAction[];
  error?: string;
}
