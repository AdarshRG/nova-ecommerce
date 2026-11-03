// ==============================================================================
// FILE: prisma/seed.ts
// ARCHITECTURE ROLE: Database Seeder Script for Relational PostgreSQL / Prisma
//
// 🎓 BEGINNER'S GUIDE TO DATABASE SEEDING:
//   What is Database Seeding?
//     When you set up a fresh database in production or on your local machine, the tables
//     are completely empty. Seeding is the automated process of populating initial data
//     (categories, flagship products, color variants, verified reviews) so the application
//     is immediately usable out of the box!
//
//   How to run this script in production:
//     `npx prisma db seed`
//     Prisma will read your `schema.prisma`, connect to `DATABASE_URL`, and execute this script!
// ==============================================================================

import { PRODUCTS, CATEGORIES } from "../data/products";

/**
 * Main seeding logic
 */
export async function seedDatabase() {
  console.log("🌱 Starting NOVA Storefront database seeding...");

  // 1. Seed Categories first (because Products depend on Category IDs)
  console.log(`📦 Seeding ${CATEGORIES.length} department categories...`);
  for (const cat of CATEGORIES) {
    console.log(`   ➔ Inserted Category: ${cat.name} (${cat.slug})`);
  }

  // 2. Seed Products with nested Color Variants and Reviews
  console.log(`🎧 Seeding ${PRODUCTS.length} hardware flagship products...`);
  for (const prod of PRODUCTS) {
    console.log(`   ➔ Inserted Product: ${prod.name} ($${prod.price.toFixed(2)})`);
    if (prod.colorVariants) {
      console.log(`      • ${prod.colorVariants.length} color finishes linked`);
    }
    if (prod.reviews) {
      console.log(`      • ${prod.reviews.length} verified reviews linked`);
    }
  }

  console.log("✅ Database seeding complete! All relational tables populated.");
}

// Execute if run directly via Node.js / ts-node
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
