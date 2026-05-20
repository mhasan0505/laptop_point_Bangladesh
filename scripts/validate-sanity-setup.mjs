/**
 * Sanity CMS Setup Validation Script
 *
 * Run this script to verify your Sanity CMS configuration is correct.
 *
 * Usage:
 *   node scripts/validate-sanity-setup.mjs
 */

import { createClient } from "next-sanity";
import { config } from "dotenv";
import { existsSync } from "fs";

// Load environment variables
config({ path: ".env.local" });

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_TOKEN",
];

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(message, color = "reset") {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logCheck(label, passed, details = "") {
  const icon = passed ? "✅" : "❌";
  const color = passed ? "green" : "red";
  log(`${icon} ${label}`, color);
  if (details) {
    log(`   ${details}`, "gray");
  }
}

async function validateSetup() {
  log("\n╔════════════════════════════════════════════╗", "blue");
  log("║   Sanity CMS Configuration Validator      ║", "blue");
  log("╚════════════════════════════════════════════╝\n", "blue");

  let allPassed = true;

  // Check 1: .env.local file exists
  log("1️⃣  Checking environment configuration...", "yellow");
  const envExists = existsSync(".env.local");
  logCheck(
    ".env.local file exists",
    envExists,
    envExists ? "Found at project root" : "Create .env.local from .env.example",
  );
  if (!envExists) {
    allPassed = false;
  }

  // Check 2: Required environment variables
  log("\n2️⃣  Checking environment variables...", "yellow");
  const missingVars = [];
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    const exists =
      !!value &&
      value !== "your_project_id" &&
      value !== "your_sanity_api_token";
    logCheck(
      varName,
      exists,
      exists
        ? `Set to: ${value.substring(0, 20)}...`
        : "Missing or using placeholder",
    );
    if (!exists) {
      missingVars.push(varName);
      allPassed = false;
    }
  }

  if (missingVars.length > 0) {
    log("\n   ⚠️  Update these variables in .env.local:", "red");
    missingVars.forEach((v) => log(`      - ${v}`, "gray"));
  }

  // Check 3: Sanity client connection
  log("\n3️⃣  Testing Sanity connection...", "yellow");
  if (missingVars.length === 0) {
    try {
      const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        token: process.env.SANITY_API_TOKEN,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
        useCdn: false,
      });

      const projects = await client.request({
        url: "/projects",
        method: "GET",
      });

      logCheck("Connection to Sanity API", true, "Successfully authenticated");
    } catch (error) {
      logCheck("Connection to Sanity API", false, `Error: ${error.message}`);
      allPassed = false;
    }
  } else {
    logCheck(
      "Connection to Sanity API",
      false,
      "Skipped - fix environment variables first",
    );
  }

  // Check 4: Schema deployment
  log("\n4️⃣  Checking schema deployment...", "yellow");
  if (missingVars.length === 0) {
    try {
      const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        token: process.env.SANITY_API_TOKEN,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
        useCdn: false,
      });

      // Try to fetch products (will fail if schema not deployed)
      const products = await client.fetch('*[_type == "product"][0...1]');

      logCheck(
        "Product schema deployed",
        true,
        `Found ${products.length} product(s)`,
      );

      if (products.length === 0) {
        log("   💡 Tip: Create your first product in Sanity Studio!", "yellow");
      }
    } catch (error) {
      if (error.message.includes("not found")) {
        logCheck(
          "Product schema deployed",
          false,
          "Run: pnpm sanity:deploy-schema",
        );
        allPassed = false;
      } else {
        logCheck("Product schema deployed", false, `Error: ${error.message}`);
        allPassed = false;
      }
    }
  } else {
    logCheck(
      "Product schema deployed",
      false,
      "Skipped - fix environment variables first",
    );
  }

  // Final summary
  log("\n╔════════════════════════════════════════════╗", "blue");
  if (allPassed) {
    log("║          ✅ All checks passed!            ║", "green");
    log("╚════════════════════════════════════════════╝\n", "blue");
    log("🎉 Your Sanity CMS is configured correctly!", "green");
    log("\nNext steps:", "yellow");
    log("  1. Start dev server: pnpm dev", "gray");
    log("  2. Access Studio: http://localhost:3000/studio", "gray");
    log("  3. Create your first product!", "gray");
  } else {
    log("║          ❌ Setup incomplete              ║", "red");
    log("╚════════════════════════════════════════════╝\n", "blue");
    log("⚠️  Please fix the issues above.", "red");
    log("\nSetup guide: docs/SANITY_CMS_SETUP.md", "yellow");
    log("Quick start: docs/SANITY_QUICK_START.md", "yellow");
  }

  log("");
  process.exit(allPassed ? 0 : 1);
}

// Run validation
validateSetup().catch((error) => {
  log("\n❌ Validation failed with error:", "red");
  log(error.message, "red");
  process.exit(1);
});
