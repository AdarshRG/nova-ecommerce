// ==============================================================================
// FILE: scripts/run-tests.mjs
// ARCHITECTURE ROLE: Enterprise Automated Test Suite Orchestrator & CI/CD Runner
//
// 🎓 BEGINNER'S GUIDE TO AUTOMATED TEST RUNNERS:
//   What does this script do?
//     This is the central test runner invoked by GitHub Actions CI/CD workflows
//     and developers running `npm test`.
//     It automatically imports and runs all unit & integration test suites in `tests/`.
//     If all tests pass: It logs a summary and exits with code 0 (Success).
//     If any test fails: It logs the failure details and exits with code 1, which
//     immediately BLOCKS the pull request from being merged into production!
// ==============================================================================

import { run } from "node:test";
import { spec } from "node:test/reporters";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("🚀 STARTING NOVA STOREFRONT AUTOMATED TEST SUITE");
console.log("=======================================================\n");

const testFiles = [
  path.join(projectRoot, "tests", "validators.test.mjs"),
  path.join(projectRoot, "tests", "stripe.test.mjs"),
  path.join(projectRoot, "tests", "pricing.test.mjs"),
  path.join(projectRoot, "tests", "redis-cache.test.mjs"),
  path.join(projectRoot, "tests", "ai-chat.test.mjs"),
  path.join(projectRoot, "tests", "observability.test.mjs"),
];

const testStream = run({
  files: testFiles,
  concurrency: 1, // Sequential execution for deterministic results
});

testStream
  .compose(new spec())
  .pipe(process.stdout);

testStream.on("test:fail", (data) => {
  console.error(`\n❌ [TEST FAILURE]: ${data.name}`);
  process.exitCode = 1;
});

testStream.on("end", () => {
  if (process.exitCode === 1) {
    console.error("\n❌ Automated Test Suite FAILED! Resolve failing assertions before merging.\n");
  } else {
    console.log("\n✅ ALL AUTOMATED TEST SUITES PASSED! System is ready for production.\n");
  }
});
