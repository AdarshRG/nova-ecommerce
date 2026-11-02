// ==============================================================================
// FILE: middleware.ts
// ARCHITECTURE ROLE: Next.js Edge Middleware & Global HTTP Security Headers
//
// 🎓 BEGINNER'S GUIDE TO NEXT.JS MIDDLEWARE:
//   Where does Middleware run?
//     Next.js Middleware runs at the "Edge"—BEFORE a request reaches any page,
//     component, or API Route Handler!
//     Think of it as the security guard stationed at the front gate of your building.
//
//   Key Responsibilities of this Middleware:
//     1. Injects OWASP-Recommended Security Headers:
//        • `X-Frame-Options: DENY`: Prevents Clickjacking attacks (stopping malicious
//          websites from embedding your store in an invisible <iframe> to steal clicks).
//        • `X-Content-Type-Options: nosniff`: Prevents browsers from guessing (sniffing)
//          file MIME types, blocking executable script attacks disguised as images.
//        • `Strict-Transport-Security` (HSTS): Enforces encrypted HTTPS connections.
//     2. Global Request Performance Timing:
//        Computes execution latency and returns an `X-Response-Time` header for observability.
//     3. Route Matching:
//        Uses a `matcher` config so static files (images, fonts, CSS) bypass middleware for 0ms overhead.
// ==============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startTime = Date.now();

  // Create response object
  const response = NextResponse.next();

  // ----------------------------------------------------------------------------
  // 1. INJECT OWASP ENTERPRISE SECURITY HEADERS
  // ----------------------------------------------------------------------------
  // Prevent iframe clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME-sniffing vulnerabilities
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy: Send full URL on same origin, only domain on cross-origin
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HTTPS via HTTP Strict Transport Security (HSTS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Content-Security-Policy (CSP) Basics: Disallow unsafe framing and restricted plugins
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );

  // ----------------------------------------------------------------------------
  // 2. OBSERVABILITY: Response Timing Header
  // ----------------------------------------------------------------------------
  const duration = Date.now() - startTime;
  response.headers.set("X-Response-Time", `${duration}ms`);

  return response;
}

// ------------------------------------------------------------------------------
// MATCHER CONFIGURATION
// Specifies which routes this middleware executes on.
// Excludes static files, Next.js internal chunks, and images for maximum speed!
// ------------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
