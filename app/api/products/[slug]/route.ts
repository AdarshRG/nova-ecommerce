// ==============================================================================
// FILE: app/api/products/[slug]/route.ts
// ARCHITECTURE ROLE: RESTful Backend API Endpoint for Single Product by Slug (Database Layer)
//
// 🎓 BEGINNER'S GUIDE TO DYNAMIC ROUTE HANDLERS:
//   What is this endpoint?
//     This endpoint responds to: `GET /api/products/[slug]`
//     Example: `GET /api/products/nova-sonic-wireless`
//
//   How it works:
//     1. Next.js 16 passes dynamic route parameters as an async Promise in `context.params`.
//     2. We unwrap the slug and call `await db.product.findBySlug(slug)`.
//     3. If found, returns 200 OK with product data.
//     4. If not found, returns 404 Not Found.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Asynchronously unwrap dynamic route parameter
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Product slug parameter is missing." },
        { status: 400 }
      );
    }

    // 2. Query our Database Repository
    const product = await db.product.findBySlug(slug);

    // 3. Return 404 if not found in database
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with slug '${slug}' was not found in the database.`,
        },
        { status: 404 }
      );
    }

    // 4. Return 200 OK with product JSON
    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/products/[slug]:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error fetching product from database." },
      { status: 500 }
    );
  }
}
