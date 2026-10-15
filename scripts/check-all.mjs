/**
 * Master Verification Test Runner for Laptop Point BD
 *
 * Runs all validation suites in strict order:
 *  1. TypeScript compilation (tsc --noEmit -p .)
 *  2. 4xx-only server price-authority test (scripts/test-order-price-authority.mjs)
 *  3. Admin & staff authentication, RBAC 403 checks & token separation (scripts/test-staff-login.mjs)
 *  4. Image upload pipeline smoke test (scripts/test-uploads.mjs)
 *  5. Catalogue creation & validation smoke test (scripts/test-catalog-create.mjs)
 *  6. ImageKit deletion & 409 conflict unit tests (scripts/test-imagekit-deletions.mjs)
 *
 * USAGE:
 *   node --env-file=.env.local scripts/check-all.mjs
 *
 * REQUIREMENTS:
 *   - Local dev server must be running on http://localhost:3000 (TEST_URL).
 *   - ADMIN_EMAIL and ADMIN_PASSWORD must be set in process.env (read from .env.local).
 *   - Refuses to run against non-localhost targets for safety.
 *   - Exits non-zero immediately upon any test failure.
 */

import { spawnSync } from "child_process";
import path from "path";
import process from "process";

const BASE = process.env.TEST_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

console.log("==================================================================");
console.log("   LAPTOP POINT BD — AUTOMATED VERIFICATION SUITE RUNNER");
console.log("==================================================================");
console.log(`Target URL: ${BASE}`);

// Safety check: require local server
if (!/localhost|127\.0\.0\.1/.test(BASE)) {
  console.error(`\n[FATAL] Safety refusal: check-all only runs against localhost (got: ${BASE})`);
  process.exit(1);
}

// Ensure credentials
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("\n[FATAL] Missing credentials: ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.");
  console.error("Run with: node --env-file=.env.local scripts/check-all.mjs");
  process.exit(1);
}

const steps = [
  {
    name: "TypeScript Compilation Check (tsc --noEmit)",
    cmd: process.execPath,
    args: ["--max-old-space-size=4096", "./node_modules/typescript/bin/tsc", "--noEmit", "-p", "."],
  },
  {
    name: "Server-Side Price Authority Safe 4xx-Only Test",
    cmd: process.execPath,
    args: ["scripts/test-order-price-authority.mjs"],
  },
  {
    name: "Staff Login, RBAC 403 Guards & Trusted Token Separation Test",
    cmd: process.execPath,
    args: ["scripts/test-staff-login.mjs"],
  },
  {
    name: "Upload Pipeline & MIME/Extension Validation Test",
    cmd: process.execPath,
    args: ["scripts/test-uploads.mjs"],
  },
  {
    name: "Catalogue Create & Validation Smoke Test",
    cmd: process.execPath,
    args: ["scripts/test-catalog-create.mjs"],
  },
  {
    name: "ImageKit Deletions & 409 In-Use Protection Unit Test",
    cmd: process.execPath,
    args: ["scripts/test-imagekit-deletions.mjs"],
  },
];

let totalSteps = steps.length;
let passedSteps = 0;

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  console.log(`\n------------------------------------------------------------------`);
  console.log(`[Step ${i + 1}/${totalSteps}] ${step.name}`);
  console.log(`------------------------------------------------------------------`);

  const result = spawnSync(step.cmd, step.args, {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    console.error(`\n[FAILURE] Step ${i + 1} (${step.name}) failed with exit code ${result.status}.`);
    console.error("Aborting test runner.");
    process.exit(result.status || 1);
  }

  passedSteps++;
  console.log(`[SUCCESS] Step ${i + 1} passed.`);
}

console.log("\n==================================================================");
console.log(`   ALL ${passedSteps}/${totalSteps} AUTOMATED TEST SUITES PASSED SUCCESSFULLY!`);
console.log("==================================================================");
process.exit(0);
