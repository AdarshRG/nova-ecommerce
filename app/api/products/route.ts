// ==============================================================================
// FILE: app/api/products/route.ts
// ARCHITECTURE ROLE: RESTful Backend API Endpoint for Product Catalog (Backed by Database Layer)
//
// 🎓 BEGINNER'S GUIDE TO DATABASE-DRIVEN ROUTE HANDLERS:
//   What is this endpoint?
//     This endpoint answers HTTP `GET /api/products`.
//     Instead of manipulating arrays directly in the route handler, it delegates queries
//     to our centralized Database Service layer (`lib/db.ts`).
//
//   Why delegate to `db.product.findMany()`?
//     1. Clean Architecture: Keeps the HTTP layer thin (parsing request params and returning JSON).
//     2. Scalability: When connecting to PostgreSQL via Prisma, only `lib/db.ts` interacts with the ORM.
//     3. Testability: You can easily mock `db` without spinning up HTTP servers.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db, ProductQueryFilters } from "../../../lib/db";

/**
 * GET Handler for /api/products
 * Reads URL search query parameters, delegates to database repository, and returns JSON.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract URL search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const sort = (searchParams.get("sort") || "featured") as ProductQueryFilters["sort"];

    // 2. Query our Database Repository Layer
    const { products, totalCount } = await db.product.findMany({
      search,
      category,
      sort,
    });

    // 3. Return JSON response with Cache-Control headers for Edge CDN caching
    return NextResponse.json(
      {
        success: true,
        count: products.length,
        totalCatalog: totalCount,
        filtersApplied: {
          search: search || null,
          category: category || null,
          sort,
        },
        data: products,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error fetching product catalog from database.",
      },
      { status: 500 }
    );
  }
}
