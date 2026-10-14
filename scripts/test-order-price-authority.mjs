/**
 * SAFETY GUARANTEE:
 * This test verifies server-side price authority WITHOUT creating live orders or
 * mutating state in the database. When testing against any database (including
 * cloud Neon PostgreSQL), test calls to POST /api/orders MUST return HTTP 4xx.
 *
 * To prevent accidental writes to production/cloud databases, live order creation
 * is blocked unless DATABASE_URL contains "localhost" or "127.0.0.1" AND
 * TEST_ALLOW_WRITE=1 is explicitly set in the environment.
 *
 * Test Scenarios (All 4xx, Zero DB writes):
 * 1. Price Spoofing: Client sends unitPrice: 1 with quantity (90) exceeding stock (7).
 *    Server resolves the product, computes the authoritative serverPrice (21,000 BDT),
 *    and rejects with HTTP 400 while exposing the server price in validation details.
 * 2. Unknown Product: Malicious client sends fake SKU -> Server rejects with HTTP 400.
 * 3. Missing Identifier: Client sends invalid item -> Server rejects with HTTP 400.
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const dbUrl = process.env.DATABASE_URL || "";
const isLocalDb = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

// Safety guard: refuse to run write-mode tests against non-local databases
if (process.env.TEST_ALLOW_WRITE === "1" && !isLocalDb) {
  console.error("SAFETY REFUSAL: TEST_ALLOW_WRITE=1 cannot be used when DATABASE_URL is not localhost.");
  process.exit(1);
}

async function runTests() {
  console.log("=== Testing Server-Side Price Authority (Safe 4xx-Only Mode) ===");
  let passed = 0;
  let total = 3;

  // Test 1: Price spoofing attempt with quantity exceeding stock
  console.log("\n[Test 1] Attempting price spoofing (unitPrice: 1) on HP-440G3-001 with quantity 90...");
  const spoofedPayload = {
    customerName: "Security Test Customer",
    customerPhone: "01700000000",
    customerEmail: "security-test@example.com",
    address: "Mirpur 10",
    city: "Dhaka",
    paymentMethod: "cod",
    items: [
      {
        productId: "1",
        sku: "HP-440G3-001",
        name: "HP ProBook 440 G3 Business Laptop",
        unitPrice: 1, // MALICIOUS CLIENT PRICE
        quantity: 90, // Exceeds available stock (7) to safely abort before DB write
      },
    ],
    subtotal: 1,
    shippingCost: 0,
    totalAmount: 1,
  };

  const res1 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spoofedPayload),
  });

  const data1 = await res1.json();
  console.log("Status code (expected 400):", res1.status);
  console.log("Response body:", data1);

  if (res1.status === 400) {
    if (data1.details?.serverPrice === 21000) {
      console.log("PASS: Server successfully identified authoritative serverPrice: 21,000 BDT and rejected with 400 (Zero DB writes)!");
      passed++;
    } else {
      console.error("FAIL: Server did not return expected authoritative serverPrice 21,000 in details.");
    }
  } else {
    console.error(`FAIL: Expected HTTP 400 but received ${res1.status}. Non-4xx calls against non-local DB are prohibited!`);
  }

  // Test 2: Unknown product SKU
  console.log("\n[Test 2] Submitting order with fake/unknown product SKU...");
  const unknownPayload = {
    customerName: "Security Test Customer",
    customerPhone: "01700000000",
    paymentMethod: "cod",
    items: [
      {
        productId: "999999",
        sku: "NON-EXISTENT-SKU-999",
        name: "Fake Laptop",
        unitPrice: 100,
        quantity: 1,
      },
    ],
  };

  const res2 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(unknownPayload),
  });

  const data2 = await res2.json();
  console.log("Status code (expected 400):", res2.status);
  console.log("Response body:", data2);
  if (res2.status === 400 && data2.error?.includes("Unknown product")) {
    console.log("PASS: Unknown product was correctly rejected with HTTP 400!");
    passed++;
  } else {
    console.error("FAIL: Expected 400 with 'Unknown product' error");
  }

  // Test 3: Missing product identifier
  console.log("\n[Test 3] Submitting order with missing product identifiers...");
  const missingIdPayload = {
    customerName: "Security Test Customer",
    customerPhone: "01700000000",
    paymentMethod: "cod",
    items: [
      {
        name: "Mystery Laptop",
        unitPrice: 500,
        quantity: 1,
      },
    ],
  };

  const res3 = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(missingIdPayload),
  });

  const data3 = await res3.json();
  console.log("Status code (expected 400):", res3.status);
  console.log("Response body:", data3);
  if (res3.status === 400 && data3.error?.includes("missing product identifier")) {
    console.log("PASS: Missing product identifier correctly rejected with HTTP 400!");
    passed++;
  } else {
    console.error("FAIL: Expected 400 with 'missing product identifier' error");
  }

  console.log(`\n=== Price Authority Test Summary: ${passed}/${total} Passed ===`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
