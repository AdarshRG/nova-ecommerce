// ==============================================================================
// FILE: app/api/products/[slug]/route.ts
// ARCHITECTURE ROLE: RESTful Backend API Endpoint for Single Product by Slug
//
// 🎓 BEGINNER'S GUIDE TO DYNAMIC ROUTE HANDLERS:
//   What is this endpoint?
//     This endpoint responds to: `GET /api/products/[slug]`
//     Example: `GET /api/products/nova-sonic-wireless`
//
//   How does dynamic routing work in Next.js 16 Route Handlers?
//     1. Next.js maps the `[slug]` folder in the file path to the URL segment.
//     2. In Next.js 16, dynamic params in Route Handlers are passed asynchronously as a Promise:
//        `context: { params: Promise<{ slug: string }> }`
//     3. We `await context.params` to retrieve the slug safely.
//     4. If found, returns 200 OK with product details.
//     5. If not found, returns 404 Not Found with a helpful error message.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "../../../../data/products";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Asynchronously unwrap the dynamic route parameter
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Product slug parameter is missing." },
        { status: 400 }
      );
    }

    // 2. Query the product from our database layer
    const product = getProductBySlug(slug);

    // 3. Return 404 if product does not exist
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with slug '${slug}' was not found in the catalog.`,
        },
        { status: 404 }
      );
    }

    // 4. Return 200 OK with product data
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
      { success: false, error: "Internal Server Error fetching product." },
      { status: 500 }
    );
  }
}
