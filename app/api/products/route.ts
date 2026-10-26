// ==============================================================================
// FILE: app/api/products/route.ts
// ARCHITECTURE ROLE: RESTful Backend API Endpoint for Product Catalog Filtering & Sorting
//
// 🎓 BEGINNER'S GUIDE TO THIS BACKEND ROUTE HANDLER:
//   What is a Next.js Route Handler?
//     In Next.js App Router, any file named `route.ts` inside the `app/api/` folder
//     becomes a real HTTP backend API endpoint!
//     This endpoint answers requests sent to: `GET /api/products`
//
//   Why have a Backend API when we already had static data?
//     1. Separation of Concerns: The frontend asks for data; the backend manages and filters it.
//     2. Scalability: When we connect a real database (PostgreSQL / MongoDB), the frontend
//        doesn't change at all—it keeps calling this same API!
//     3. Mobile & Third-Party Apps: A mobile app or external client can call `/api/products`
//        and receive clean JSON data.
//
//   Query Parameters Supported:
//     - `?search=sonic`        ➔ Filters products by name or description
//     - `?category=Audio`      ➔ Filters products by category department
//     - `?sort=price-asc`      ➔ Sorts by price lowest to highest
//     - `?sort=price-desc`     ➔ Sorts by price highest to lowest
//     - `?sort=rating`         ➔ Sorts by customer star rating
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "../../../data/products";
import { Product } from "../../../types/product";

/**
 * GET Handler for /api/products
 * Reads URL search query parameters and returns filtered, sorted product JSON.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract URL search parameters from the incoming HTTP request
    // Example: /api/products?search=audio&sort=price-asc
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const category = searchParams.get("category")?.toLowerCase().trim() || "";
    const sort = searchParams.get("sort") || "featured";

    // 2. Clone the catalog array into a working list
    let filteredProducts: Product[] = [...PRODUCTS];

    // 3. Apply Search Filter if requested
    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search)
      );
    }

    // 4. Apply Category Department Filter if requested
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((product) =>
        product.category.toLowerCase().includes(category)
      );
    }

    // 5. Apply Sorting Algorithm
    switch (sort) {
      case "price-asc":
        // Lowest price first
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        // Highest price first
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        // Highest rated first
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        // Most reviewed first
        filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // "featured" retains standard catalog order
        break;
    }

    // 6. Return a successful 200 OK JSON response with cache headers
    return NextResponse.json(
      {
        success: true,
        count: filteredProducts.length,
        totalCatalog: PRODUCTS.length,
        filtersApplied: {
          search: search || null,
          category: category || null,
          sort,
        },
        data: filteredProducts,
      },
      {
        status: 200,
        headers: {
          // Instruct browsers and CDNs to cache response for 60 seconds (Cache-Control)
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    // Graceful error handling for server exceptions
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error fetching product catalog.",
      },
      { status: 500 }
    );
  }
}
