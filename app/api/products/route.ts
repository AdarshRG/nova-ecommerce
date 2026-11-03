// ==============================================================================
// FILE: app/api/products/route.ts
// ARCHITECTURE ROLE: High-Performance Caching RESTful API Endpoint (Redis Cache-Aside Pattern)
//
// 🎓 BEGINNER'S GUIDE TO THE CACHE-ASIDE PATTERN:
//   How does this endpoint work?
//     1. Check Cache: Constructs a unique key like `catalog:s=sonic:c=audio:srt=featured`.
//     2. Cache HIT: If Redis contains the data, returns it immediately (<2ms latency)
//        with the header `X-Cache: HIT`. No database query is made!
//     3. Cache MISS: If Redis doesn't have it, queries PostgreSQL/Prisma (`db.product.findMany()`),
//        stores the result in Redis with a 60-second TTL, and returns with `X-Cache: MISS`.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db, ProductQueryFilters } from "../../../lib/db";
import { redis, cacheKeys } from "../../../lib/redis";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Extract URL search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const sort = (searchParams.get("sort") || "featured") as ProductQueryFilters["sort"];

    // 2. Generate deterministic cache key
    const cacheKey = cacheKeys.catalog(search, category, sort);

    // --------------------------------------------------------------------------
    // 3. STEP 1: CHECK REDIS CACHE (Cache-Aside Pattern)
    // --------------------------------------------------------------------------
    const cachedData = await redis.get<Record<string, unknown>>(cacheKey);

    if (cachedData) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json(cachedData, {
        status: 200,
        headers: {
          "X-Cache": "HIT",
          "X-Response-Time": `${responseTime}ms`,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    // --------------------------------------------------------------------------
    // 4. STEP 2: CACHE MISS ➔ QUERY DATABASE LAYER
    // --------------------------------------------------------------------------
    const { products, totalCount } = await db.product.findMany({
      search,
      category,
      sort,
    });

    const responsePayload = {
      success: true,
      count: products.length,
      totalCatalog: totalCount,
      filtersApplied: {
        search: search || null,
        category: category || null,
        sort,
      },
      data: products,
    };

    // --------------------------------------------------------------------------
    // 5. STEP 3: STORE IN REDIS WITH 60-SECOND TTL
    // --------------------------------------------------------------------------
    await redis.set(cacheKey, responsePayload, 60);

    const responseTime = Date.now() - startTime;
    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "X-Cache": "MISS",
        "X-Response-Time": `${responseTime}ms`,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
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
