// ==============================================================================
// FILE: app/api/health/route.ts
// ARCHITECTURE ROLE: Cloud Health Check & Container Liveness/Readiness Probe
//
// 🎓 BEGINNER'S GUIDE TO HEALTH CHECKS & CLOUD OBSERVABILITY:
//   1. What is a Health Check Endpoint?
//      In modern cloud architecture (AWS ECS, Kubernetes, Docker, Vercel), servers are
//      monitored by automated "Load Balancers" and "Orchestrators".
//      Every 10 to 30 seconds, the load balancer calls `GET /api/health`.
//        • If the endpoint responds with HTTP 200 (Healthy): The server receives traffic.
//        • If the endpoint responds with HTTP 503 (Unhealthy) or fails: The load balancer
//          stops sending traffic and automatically restarts the damaged container!
//
//   2. What is the difference between a Liveness Probe and a Readiness Probe?
//      • Liveness Probe: "Is the server process alive?" (checks Node.js memory and uptime).
//      • Readiness Probe: "Can the server connect to the database and Redis cache?"
//        (checks if downstream services are ready to process real customer orders).
//
//   3. What telemetry does this endpoint report?
//      • Process uptime (in seconds)
//      • Memory consumption (Heap used vs Heap total)
//      • Database connectivity status
//      • Redis cache latency and hit/miss health
// ==============================================================================

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { redis } from "../../../lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Comprehensive container health check probe for Docker, Kubernetes, and AWS ALB.
 */
export async function GET() {
  const startTime = Date.now();

  // ----------------------------------------------------------------------------
  // 1. SYSTEM RESOURCE TELEMETRY
  // ----------------------------------------------------------------------------
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // ----------------------------------------------------------------------------
  // 2. DATABASE READINESS CHECK
  // ----------------------------------------------------------------------------
  let databaseStatus: "healthy" | "unhealthy" = "healthy";
  let databaseLatencyMs = 0;

  try {
    const dbStart = Date.now();
    // Test query against repository layer
    const products = await db.product.findMany();
    databaseLatencyMs = Date.now() - dbStart;

    if (!Array.isArray(products)) {
      databaseStatus = "unhealthy";
    }
  } catch (error) {
    console.error("[HEALTH CHECK] Database probe failed:", error);
    databaseStatus = "unhealthy";
  }

  // ----------------------------------------------------------------------------
  // 3. REDIS CACHE READINESS CHECK
  // ----------------------------------------------------------------------------
  let redisStatus: "healthy" | "unhealthy" = "healthy";
  let redisStats = null;

  try {
    // Quick write/read test key with 5s TTL
    const probeKey = "health:probe:test";
    await redis.set(probeKey, { ping: "pong" }, 5);
    const readBack = await redis.get<{ ping: string }>(probeKey);

    if (!readBack || readBack.ping !== "pong") {
      redisStatus = "unhealthy";
    }
    redisStats = redis.getStats();
  } catch (error) {
    console.error("[HEALTH CHECK] Redis probe failed:", error);
    redisStatus = "unhealthy";
  }

  // ----------------------------------------------------------------------------
  // 4. OVERALL HEALTH STATUS DETERMINATION
  // ----------------------------------------------------------------------------
  const isHealthy = databaseStatus === "healthy" && redisStatus === "healthy";
  const totalResponseTimeMs = Date.now() - startTime;

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptimeSeconds,
    responseTimeMs: totalResponseTimeMs,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsedMB: +(memory.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: +(memory.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: +(memory.rss / 1024 / 1024).toFixed(2),
      },
    },
    services: {
      database: {
        status: databaseStatus,
        latencyMs: databaseLatencyMs,
      },
      redis: {
        status: redisStatus,
        stats: redisStats,
      },
    },
  };

  // ----------------------------------------------------------------------------
  // 5. RETURN HTTP STATUS: 200 OK IF HEALTHY, 503 SERVICE UNAVAILABLE IF DEGRADED
  // ----------------------------------------------------------------------------
  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Response-Time": `${totalResponseTimeMs}ms`,
    },
  });
}
