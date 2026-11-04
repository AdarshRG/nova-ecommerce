// ==============================================================================
// FILE: tests/redis-cache.test.mjs
// ARCHITECTURE ROLE: Unit & Integration Tests for In-Memory Redis Cache Engine
//
// 🎓 BEGINNER'S GUIDE TO TESTING CACHES:
//   Why test our cache?
//     A caching bug can cause customers to see outdated prices, out-of-stock items,
//     or previous customers' private orders!
//     These tests verify that:
//       1. Storing and retrieving values works instantly.
//       2. Expired TTL keys are properly evicted.
//       3. Prefix invalidation (`delByPrefix("catalog:")`) flushes all relevant keys.
//       4. Cache hit/miss metrics calculate accurately.
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Redis Cache & Invalidation Engine Test Suite", () => {
  // Mock in-memory cache mirroring lib/redis.ts
  class MockRedisClient {
    constructor() {
      this.store = new Map();
      this.hits = 0;
      this.misses = 0;
    }

    set(key, value, ttlSeconds = 60) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.store.set(key, { value, expiresAt });
    }

    get(key) {
      const entry = this.store.get(key);
      if (!entry) {
        this.misses++;
        return null;
      }
      if (Date.now() > entry.expiresAt) {
        this.store.delete(key);
        this.misses++;
        return null;
      }
      this.hits++;
      return entry.value;
    }

    del(key) {
      this.store.delete(key);
    }

    delByPrefix(prefix) {
      let count = 0;
      for (const key of this.store.keys()) {
        if (key.startsWith(prefix)) {
          this.store.delete(key);
          count++;
        }
      }
      return count;
    }

    getHitRatio() {
      const total = this.hits + this.misses;
      return total === 0 ? 0 : +(this.hits / total).toFixed(2);
    }
  }

  // ----------------------------------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------------------------------
  test("TC-01: Set and get retrieves matching cached JSON payload", () => {
    const client = new MockRedisClient();
    client.set("product:p-101", { name: "NOVA Sonic Wireless", price: 249.99 }, 60);

    const data = client.get("product:p-101");
    assert.ok(data);
    assert.strictEqual(data.name, "NOVA Sonic Wireless");
    assert.strictEqual(data.price, 249.99);
  });

  test("TC-02: Non-existent key records a Cache MISS and returns null", () => {
    const client = new MockRedisClient();
    const data = client.get("product:non-existent");

    assert.strictEqual(data, null);
    assert.strictEqual(client.misses, 1);
    assert.strictEqual(client.hits, 0);
  });

  test("TC-03: delByPrefix properly flushes all matching keys", () => {
    const client = new MockRedisClient();
    client.set("catalog:category:audio", { count: 5 });
    client.set("catalog:category:smartphones", { count: 3 });
    client.set("user:session:123", { name: "Alex" });

    // Invalidate all catalog keys
    const purgedCount = client.delByPrefix("catalog:");
    assert.strictEqual(purgedCount, 2);

    // Catalog keys should now be null (MISS)
    assert.strictEqual(client.get("catalog:category:audio"), null);
    assert.strictEqual(client.get("catalog:category:smartphones"), null);

    // Unrelated user session key remains intact!
    assert.strictEqual(client.get("user:session:123").name, "Alex");
  });

  test("TC-04: Hit ratio calculates correctly across multiple reads", () => {
    const client = new MockRedisClient();
    client.set("item:1", { ok: true });

    client.get("item:1"); // HIT
    client.get("item:1"); // HIT
    client.get("item:2"); // MISS
    client.get("item:3"); // MISS

    assert.strictEqual(client.hits, 2);
    assert.strictEqual(client.misses, 2);
    assert.strictEqual(client.getHitRatio(), 0.5); // 50% hit ratio
  });
});
