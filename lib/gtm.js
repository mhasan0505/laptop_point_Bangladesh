// GTM dataLayer helpers — push standard e-commerce events that Google Tag
// Manager tags (GA4 and Meta Ads) read from window.dataLayer.
//
// Mirrors the structure of lib/fpixel.js so the checkout can fire both the
// fbq purchase and the GTM purchase in one place.

// Ensure the dataLayer array exists (GTM normally creates it on load, but a
// safety net avoids a race if an event fires before the container loads).
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Push a standard GA4 "purchase" event to the dataLayer.
 *
 * GTM wiring:
 *  - GA4: an event tag triggered on the "purchase" event, mapping
 *    transaction_id / value / currency / items to the GA4 event parameters.
 *  - Meta Ads: a Purchase tag listening to the same event, forwarding value,
 *    currency, and item IDs to the Meta pixel / Conversions API.
 *
 * @param {Object} order - normalized order payload.
 * @param {string} order.transactionId - e.g. "ORD-12345678-001".
 * @param {number} order.value - grand total (must match client + server calc).
 * @param {string} order.currency - ISO code, "BDT".
 * @param {Array} order.items - line items with {item_id, item_name, price, quantity}.
 * @param {string} [order.coupon]
 * @param {string} [order.paymentType]
 */
export const trackPurchase = (order) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: order.transactionId,
      value: order.value,
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      currency: order.currency || "BDT",
      coupon: order.coupon || undefined,
      payment_type: order.paymentType || undefined,
      items: order.items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
};

/**
 * Track a view of a product to the dataLayer ("view_item").
 */
export const trackViewItem = (product) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: product.currency || "BDT",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
    },
  });
};

/** Track "add_to_cart" to the dataLayer. */
export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: product.currency || "BDT",
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity,
        },
      ],
    },
  });
};