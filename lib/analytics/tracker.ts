"use client";

// Client-side unified tracker for Google Analytics 4 (gtag) and Meta Pixel (fbq).
// Safely executes in browser environments and ignores missing tracking tags without error.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export interface TrackItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}

/**
 * Track a pageview manually (useful for SPA navigation).
 */
export function trackPageView(url: string) {
  if (typeof window === "undefined") return;

  try {
    // GA4
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: url,
      });
    }

    // Google Tag Manager
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "page_view",
        page_location: url,
      });
    }

    // Meta Pixel
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  } catch (err) {
    console.debug("[tracker:trackPageView] Ignored error:", err);
  }
}

/**
 * Track viewing a product item.
 */
export function trackViewItem(item: TrackItem) {
  if (typeof window === "undefined") return;

  try {
    // GA4 View Item
    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item", {
        currency: "BDT",
        value: item.price,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            item_category: item.category || "Laptop",
          },
        ],
      });
    }

    // Google Tag Manager
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "BDT",
          value: item.price,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              item_category: item.category || "Laptop",
            },
          ],
        },
      });
    }

    // Meta Pixel ViewContent
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: item.name,
        content_ids: [item.id],
        content_type: "product",
        value: item.price,
        currency: "BDT",
      });
    }
  } catch (err) {
    console.debug("[tracker:trackViewItem] Ignored error:", err);
  }
}

/**
 * Track adding an item to the shopping cart.
 */
export function trackAddToCart(item: TrackItem) {
  if (typeof window === "undefined") return;

  const quantity = item.quantity ?? 1;

  try {
    // GA4 Add to Cart
    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        currency: "BDT",
        value: item.price * quantity,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity,
            item_category: item.category || "Laptop",
          },
        ],
      });
    }

    // Google Tag Manager
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          value: item.price * quantity,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity,
              item_category: item.category || "Laptop",
            },
          ],
        },
      });
    }

    // Meta Pixel AddToCart
    if (typeof window.fbq === "function") {
      window.fbq("track", "AddToCart", {
        content_name: item.name,
        content_ids: [item.id],
        content_type: "product",
        value: item.price * quantity,
        currency: "BDT",
      });
    }
  } catch (err) {
    console.debug("[tracker:trackAddToCart] Ignored error:", err);
  }
}

/**
 * Track initiating the checkout process.
 */
export function trackInitiateCheckout({
  items,
  totalValue,
}: {
  items: TrackItem[];
  totalValue: number;
}) {
  if (typeof window === "undefined") return;

  try {
    // GA4 Begin Checkout
    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "BDT",
        value: totalValue,
        items: items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
          item_category: i.category || "Laptop",
        })),
      });
    }

    // Google Tag Manager
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "BDT",
          value: totalValue,
          items: items.map((i) => ({
            item_id: i.id,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity || 1,
            item_category: i.category || "Laptop",
          })),
        },
      });
    }

    // Meta Pixel InitiateCheckout
    if (typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", {
        content_ids: items.map((i) => i.id),
        num_items: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
        value: totalValue,
        currency: "BDT",
      });
    }
  } catch (err) {
    console.debug("[tracker:trackInitiateCheckout] Ignored error:", err);
  }
}

/**
 * Track an e-commerce purchase completion.
 */
export function trackPurchase({
  orderId,
  items,
  totalValue,
  currency = "BDT",
}: {
  orderId: string;
  items: TrackItem[];
  totalValue: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  try {
    // GA4 Purchase
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: orderId,
        value: totalValue,
        currency,
        items: items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
          item_category: i.category || "Laptop",
        })),
      });
    }

    // Google Tag Manager
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          value: totalValue,
          currency,
          items: items.map((i) => ({
            item_id: i.id,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity || 1,
            item_category: i.category || "Laptop",
          })),
        },
      });
    }

    // Meta Pixel Purchase
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        content_ids: items.map((i) => i.id),
        content_type: "product",
        value: totalValue,
        currency,
        num_items: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      });
    }
  } catch (err) {
    console.debug("[tracker:trackPurchase] Ignored error:", err);
  }
}
