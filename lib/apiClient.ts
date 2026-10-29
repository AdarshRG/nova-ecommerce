// ==============================================================================
// FILE: lib/apiClient.ts
// ARCHITECTURE ROLE: Centralized, Type-Safe HTTP Client & API Request Wrapper
//
// 🎓 BEGINNER'S GUIDE TO ENTERPRISE API CLIENTS:
//   Why shouldn't you call raw `fetch()` directly inside every React component?
//     1. Lack of Standard Error Handling:
//        In JavaScript, `fetch()` does NOT throw an error on HTTP 404 or 500!
//        It only throws on network failure. You must manually check `response.ok`.
//     2. Repetitive Boilerplate:
//        Parsing JSON, adding `Content-Type` headers, and building query parameters
//        creates hundreds of duplicate lines of code.
//     3. Cancellation & Race Conditions:
//        Using an `AbortSignal` allows the client to cancel an in-flight network request
//        when a newer request is triggered (e.g. while the user is typing in a search bar).
// ==============================================================================

import { Product } from "../types/product";

/**
 * Custom ApiError Class
 * Attaches HTTP status codes and error payloads to standard Error objects.
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic request helper function with built-in response checking and JSON parsing.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(endpoint, config);

  // 1. Verify HTTP status code (200-299)
  if (!response.ok) {
    let errorMessage = `HTTP Request failed with status ${response.status}`;
    let errorData = null;

    try {
      errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Response body wasn't JSON; use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // 2. Parse and return typed JSON payload
  return (await response.json()) as T;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "rating" | "reviews";
}

export interface ProductsApiResponse {
  success: boolean;
  count: number;
  totalCatalog: number;
  data: Product[];
}

/**
 * Type-Safe Catalog Query API
 * Calls GET /api/products with dynamic query parameters and optional AbortSignal.
 */
export async function fetchProductsApi(
  params: ProductQueryParams = {},
  signal?: AbortSignal
): Promise<ProductsApiResponse> {
  // Construct URL query string using Web Standard URLSearchParams
  const query = new URLSearchParams();

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);

  const queryString = query.toString();
  const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

  return apiRequest<ProductsApiResponse>(endpoint, { signal });
}
