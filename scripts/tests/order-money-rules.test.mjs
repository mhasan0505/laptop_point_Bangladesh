import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const {
  computeOrderTotals,
  SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} = await import("../../lib/pricing.ts");

const { calculateDeliveryFee } = await import("../../lib/delivery.ts");

const {
  VALID_STATUSES,
  STOCK_RELEASING_STATUSES,
  isValidOrderStatus,
} = await import("../../lib/orders.ts");

const { computeOrderDocumentDetails } = await import("../../lib/order-document-helper.ts");

test("Order Money Rules & Pricing Authority", async (t) => {
  await t.test("1. computeOrderTotals calculates subtotal, tax, and free shipping correctly", () => {
    // Under free shipping threshold (< 50,000)
    const itemsUnder = [
      { unitPrice: 20000, quantity: 2 }, // 40,000 BDT
    ];
    const totalsUnder = computeOrderTotals(itemsUnder);
    assert.equal(totalsUnder.subtotal, 40000);
    assert.equal(totalsUnder.shipping, SHIPPING_COST); // 100 BDT
    assert.equal(totalsUnder.tax, 40000 * TAX_RATE); // 2,000 BDT
    assert.equal(totalsUnder.total, 40000 + 100 + 2000);

    // Over free shipping threshold (>= 50,000)
    const itemsOver = [
      { unitPrice: 35000, quantity: 2 }, // 70,000 BDT
    ];
    const totalsOver = computeOrderTotals(itemsOver);
    assert.equal(totalsOver.subtotal, 70000);
    assert.equal(totalsOver.shipping, 0, "Orders >= 50,000 BDT must receive free shipping");
    assert.equal(totalsOver.tax, 70000 * TAX_RATE);
    assert.equal(totalsOver.total, 70000 + 3500);

    // Tax-exempt commerce setting
    const totalsExempt = computeOrderTotals(itemsUnder, { taxRate: 0 });
    assert.equal(totalsExempt.tax, 0);
    assert.equal(totalsExempt.total, 40000 + SHIPPING_COST);
  });

  await t.test("2. calculateDeliveryFee respects zones and VIP express fees", () => {
    const rules = {
      deliveryInsideDhakaFee: 0,
      deliveryOutsideDhakaFee: 120,
      vipDeliveryFee: 500,
      deliveryZones: [
        { id: "dhaka", fee: 0, active: true },
        { id: "outside", fee: 150, active: true },
        { id: "custom_zone", fee: 200, active: true },
        { id: "inactive_zone", fee: 300, active: false },
      ],
    };

    // Inside Dhaka
    assert.equal(calculateDeliveryFee(rules, { city: "Dhaka" }), 0);

    // Outside Dhaka city
    assert.equal(calculateDeliveryFee(rules, { city: "Chittagong" }), 120);

    // VIP Express
    assert.equal(calculateDeliveryFee(rules, { shippingMethod: "vip" }), 500);
    assert.equal(calculateDeliveryFee(rules, { shippingMethod: "express" }), 500);

    // Explicit zone lookup
    assert.equal(calculateDeliveryFee(rules, { shippingMethod: "custom_zone" }), 200);

    // Inactive zone falls back
    assert.equal(calculateDeliveryFee(rules, { shippingMethod: "inactive_zone", city: "Dhaka" }), 0);
  });

  await t.test("3. Order status validation and stock release boundaries", () => {
    assert.equal(VALID_STATUSES.length, 6);
    assert.ok(isValidOrderStatus("Pending"));
    assert.ok(isValidOrderStatus("Processing"));
    assert.ok(isValidOrderStatus("Shipped"));
    assert.ok(isValidOrderStatus("Delivered"));
    assert.ok(isValidOrderStatus("Cancelled"));
    assert.ok(isValidOrderStatus("Returned"));

    // Invalid status rejected
    assert.equal(isValidOrderStatus("Unknown"), false);
    assert.equal(isValidOrderStatus("Refunded"), false);
    assert.equal(isValidOrderStatus(""), false);

    // Stock release guard
    assert.equal(STOCK_RELEASING_STATUSES.has("Cancelled"), true);
    assert.equal(STOCK_RELEASING_STATUSES.has("Returned"), true);
    assert.equal(STOCK_RELEASING_STATUSES.has("Shipped"), false);
    assert.equal(STOCK_RELEASING_STATUSES.has("Pending"), false);
  });

  await t.test("4. computeOrderDocumentDetails creates accurate accounting records", () => {
    // Unpaid Cash on Delivery
    const codPending = computeOrderDocumentDetails({
      status: "Pending",
      paymentMethod: "cod",
      totalAmount: 45000,
    });
    assert.equal(codPending.paidAmount, 0);
    assert.equal(codPending.balanceDue, 45000);
    assert.equal(codPending.payments.length, 0);

    // Delivered COD order
    const codDelivered = computeOrderDocumentDetails({
      status: "Delivered",
      paymentMethod: "cod",
      totalAmount: 45000,
    });
    assert.equal(codDelivered.paidAmount, 45000);
    assert.equal(codDelivered.balanceDue, 0);
    assert.equal(codDelivered.payments.length, 1);
    assert.equal(codDelivered.payments[0].label, "Cash On Delivery");

    // Prepaid bKash order
    const bkashPending = computeOrderDocumentDetails({
      status: "Processing",
      paymentMethod: "bkash",
      totalAmount: 32000,
    });
    assert.equal(bkashPending.paidAmount, 32000);
    assert.equal(bkashPending.balanceDue, 0);
    assert.equal(bkashPending.payments[0].label, "bKash");
  });
});
