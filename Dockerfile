# ==============================================================================
# FILE: Dockerfile
# ARCHITECTURE ROLE: Enterprise Multi-Stage Containerization for Next.js 16 Standalone
#
# 🎓 BEGINNER'S GUIDE TO DOCKER & MULTI-STAGE BUILDS:
#   1. What is Docker?
#      Docker packages our application, its runtime (Node.js 20), operating system libraries
#      (Alpine Linux), and dependencies into a single immutable, portable box called a "Container Image".
#      It completely eliminates "it works on my machine" bugs because the exact same image runs
#      identically on your laptop, on AWS ECS, on Google Cloud, or on a Kubernetes cluster.
#
#   2. Why use a "Multi-Stage Build"?
#      A single-stage build copies everything (TypeScript compiler, build tools, devDependencies)
#      into the final container, creating bloated images of 1.2 GB+.
#      A Multi-Stage build acts like an assembly line with 3 separate stages:
#        • Stage 1 (`deps`): Installs dependencies.
#        • Stage 2 (`builder`): Compiles TypeScript and builds Next.js `.next/standalone`.
#        • Stage 3 (`runner`): Creates a clean, stripped-down Linux container, copying ONLY the
#          compiled production output.
#      Result: Final container image drops from 1.2GB to under ~120MB!
#
#   3. Why use a Non-Root User (`nextjs:nodejs`)?
#      By default, Docker runs processes as `root` (superadministrator). If a hacker finds
#      an exploit in a website, they could gain root access to the host server!
#      Creating and switching to an unprivileged user (`USER nextjs`) is a mandatory
#      security rule in enterprise cloud computing.
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Base Runtime Environment
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
# libc6-compat is needed for certain Node native extensions on Alpine Linux
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ------------------------------------------------------------------------------
# STAGE 2: Install Node.js Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy dependency definition files first
# Docker caches this layer: if package.json has not changed, npm install is skipped!
COPY package.json package-lock.json* ./

# Install dependencies using clean install if lockfile exists
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ------------------------------------------------------------------------------
# STAGE 3: Build the Next.js Application
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all project source code
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Compile TypeScript and generate the Next.js Standalone build
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 4: Production Runner Container (Minimal & Secure)
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a secure, non-privileged system group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public assets folder
COPY --from=builder /app/public ./public

# Automatically leverage Next.js standalone output trace
# This tiny folder contains ONLY the production server and traced node dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch from root to our restricted security user
USER nextjs

# Expose HTTP port 3000 to the container network
EXPOSE 3000

# Start the optimized lightweight Node.js server
CMD ["node", "server.js"]
