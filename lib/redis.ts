// ==============================================================================
// FILE: lib/redis.ts
// ARCHITECTURE ROLE: Enterprise In-Memory & Redis-Compatible Caching Engine
//
// 🎓 BEGINNER'S GUIDE TO REDIS & AI RESPONSE CACHING:
//   What is Redis?
//     Redis is an ultra-fast, in-memory key-value database.
//     While PostgreSQL reads data from computer disks (SSD) taking ~50-100ms,
//     Redis keeps everything in RAM (Random Access Memory), returning data in ~1-3ms!
//
//   Why is Redis ESSENTIAL for a Full-Stack AI Application Engineer?
//     1. LLMs are Slow & Expensive:
//        Calling an LLM API (like GPT-4 or Gemini) takes 1.5 to 3.0 seconds and costs money
//        for every input/output token.
//        If 500 customers ask "What are your best ANC headphones under $300?", calling the LLM
//        500 times wastes money and makes the UI slow.
//        By caching AI responses in Redis with a 10-minute TTL, Customer 2 through 500 get
//        an INSTANT response in 2ms with $0 token cost!
//     2. Relational Database Offloading:
//        Product catalogs change infrequently. Caching catalog queries in Redis relieves
//        PostgreSQL from executing identical SELECT queries thousands of times per minute.
//
//   Core Patterns Implemented Here:
//     • Cache-Aside Pattern (Lazy Loading):
//       Check cache first; if cache MISS, query database, store in cache with TTL, return data.
//     • TTL (Time-To-Live):
//       Keys automatically expire after a set time (e.g. 60 seconds) so stale data is purged.
//     • Cache Invalidation:
//       Purges cached keys immediately when an inventory webhook or order creation happens.
// ==============================================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  keysCount: number;
  hitRatio: string;
}

/**
 * High-Performance In-Memory Redis Store
 * Runs in RAM with automated TTL expiration, simulating Upstash / AWS ElastiCache.
 */
class RedisClient {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  /**
   * Retrieves a typed value from cache if it exists and has not expired.
   *
   * @param key Unique cache key (e.g. "catalog:all:featured")
   * @returns The cached value T, or null if cache MISS / expired
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if TTL has expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Stores a value in the cache with a Time-To-Live (TTL) in seconds.
   *
   * @param key Unique cache key
   * @param value Data payload to cache (JSON-serializable)
   * @param ttlSeconds Expiration duration in seconds (default: 60s)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Deletes a specific key from cache (Cache Invalidation)
   */
  async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * Deletes all keys matching a prefix (e.g. "catalog:*")
   */
  async delByPrefix(prefix: string): Promise<number> {
    let deletedCount = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Flushes the entire cache
   */
  async flush(): Promise<void> {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns observability metrics for performance profiling
   */
  getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    const ratio = total === 0 ? "0.0%" : `${((this.hits / total) * 100).toFixed(1)}%`;

    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.store.size,
      hitRatio: ratio,
    };
  }

  /**
   * Alias for getMetrics() for health checks and telemetry probes
   */
  getStats(): CacheMetrics {
    return this.getMetrics();
  }
}

// Global Singleton to preserve cache during Next.js Hot Module Reloading (HMR)
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: RedisClient | undefined;
}

export const redis = globalThis.__redisClient || new RedisClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redisClient = redis;
}

// ------------------------------------------------------------------------------
// STANDARDIZED CACHE KEY GENERATOR UTILITIES
// ------------------------------------------------------------------------------
export const cacheKeys = {
  /**
   * Key for product catalog search and filter queries
   * Example: "catalog:search=sonic&cat=audio&sort=price-asc"
   */
  catalog: (search: string = "", category: string = "", sort: string = "featured"): string => {
    return `catalog:s=${search.toLowerCase()}:c=${category.toLowerCase()}:srt=${sort}`;
  },

  /**
   * Key for single product detail
   * Example: "product:slug:nova-sonic-wireless"
   */
  productSlug: (slug: string): string => {
    return `product:slug:${slug.toLowerCase()}`;
  },

  /**
   * Key for AI reasoning prompt queries (Semantic Cache)
   * Example: "ai:prompt:what_are_your_best_anc_headphones"
   */
  aiPrompt: (prompt: string): string => {
    const normalized = prompt
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 60);
    return `ai:prompt:${normalized}`;
  },

  /**
   * Prefix for all catalog keys (used for bulk invalidation)
   */
  catalogPrefix: "catalog:",
};
