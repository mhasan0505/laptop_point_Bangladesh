import test from "node:test";
import assert from "node:assert/strict";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { maskEmail, maskPhone, logger } = await import("../../lib/logger.ts");

test("Structured Logger & PII Protection (Phase 3)", async (t) => {
  await t.test("1. maskEmail masks username while preserving domain", () => {
    assert.equal(maskEmail("admin@laptoppointbd.com"), "a***n@laptoppointbd.com");
    assert.equal(maskEmail("ab@test.com"), "a***@test.com");
    assert.equal(maskEmail(""), "unknown");
    assert.equal(maskEmail(null), "unknown");
    assert.equal(maskEmail("invalid-email"), "***");
  });

  await t.test("2. maskPhone masks middle digits", () => {
    assert.equal(maskPhone("+8801712345678"), "+880****678");
    assert.equal(maskPhone("01712345678"), "0171****678");
    assert.equal(maskPhone("123"), "***");
    assert.equal(maskPhone(""), "unknown");
    assert.equal(maskPhone(null), "unknown");
  });

  await t.test("3. logOrderCreated produces PII-safe log entry", () => {
    let capturedLog = "";
    const origLog = console.log;
    console.log = (line) => { capturedLog = line; };

    try {
      logger.logOrderCreated({
        orderNumber: "ORD-99999-123",
        totalAmount: 45000,
        subtotal: 44850,
        shippingCost: 150,
        paymentMethod: "cod",
        itemCount: 2,
        customerEmail: "customer@example.com",
        customerPhone: "+8801700000000",
        city: "Dhaka",
      });

      assert.ok(capturedLog.includes("order_created"));
      assert.ok(capturedLog.includes("ORD-99999-123"));
      assert.ok(capturedLog.includes("c***r@example.com"));
      assert.ok(capturedLog.includes("+880****000"));
      // Raw PII must not appear
      assert.ok(!capturedLog.includes("customer@example.com"));
      assert.ok(!capturedLog.includes("+8801700000000"));
    } finally {
      console.log = origLog;
    }
  });

  await t.test("4. logLoginFailure records failure without passwords", () => {
    let capturedWarn = "";
    const origWarn = console.warn;
    console.warn = (line) => { capturedWarn = line; };

    try {
      logger.logLoginFailure({
        reason: "invalid_credentials",
        ip: "192.168.1.100",
        email: "attacker@domain.com",
        userAgent: "Mozilla/5.0",
      });

      assert.ok(capturedWarn.includes("login_failed"));
      assert.ok(capturedWarn.includes("192.168.1.100"));
      assert.ok(capturedWarn.includes("a***r@domain.com"));
      // Ensure no passwords field exists
      assert.ok(!capturedWarn.includes("password"));
    } finally {
      console.warn = origWarn;
    }
  });
});
