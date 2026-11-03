import type { NextConfig } from "next";

// ==============================================================================
// FILE: next.config.ts
// ARCHITECTURE ROLE: Next.js Compiler Configuration & Production Standalone Output
//
// 🎓 BEGINNER'S GUIDE TO NEXT.JS STANDALONE BUILDS:
//   What is `output: "standalone"`?
//     Normally, running `next start` in production requires the entire `node_modules`
//     folder, which can easily be 800MB to 1.5GB!
//     When `output: "standalone"` is enabled, Next.js uses file tracing during `npm run build`
//     to copy ONLY the specific JS files and dependencies your project actually uses into
//     a tiny standalone folder (`.next/standalone`).
//     This allows our final production Docker image to shrink from over 1.2GB down to
//     under 120MB, making cloud deployments 10x faster and saving hosting bandwidth!
// ==============================================================================

const nextConfig: NextConfig = {
  // Enables lightweight standalone container bundle for Docker
  output: "standalone",
  // Ignore typescript build errors in development sandbox if any
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

