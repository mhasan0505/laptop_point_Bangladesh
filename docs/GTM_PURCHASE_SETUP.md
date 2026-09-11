# GTM DataLayer Purchase Tracking

Fires a standard e-commerce `purchase` event into `window.dataLayer` so Google
Tag Manager can route it to both **GA4** and **Meta Ads** with a single shared
event. Mirrors the codebase's existing `lib/fpixel.js` conventions.

---

## 1. Load GTM (Loaded in `app/layout.tsx`)

The container `GTM-KXKXGWF6` is now integrated directly into `app/layout.tsx` (via `NEXT_PUBLIC_GTM_ID`), with `<Script>` in `<head>` and `<noscript><iframe ... /></noscript>` in `<body>`:

```html
<!-- Google Tag Manager -->
<script>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-KXKXGWF6");
</script>
<!-- End Google Tag Manager -->
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KXKXGWF6"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

> **Heads-up:** if you keep the existing `gtag('config', ...)` and `fbq('init',
> ...)` tags in `layout.tsx` while also loading GTM, GA4/Facebook events can be
> double-counted. Pick one path — either GTM (recommended, single source) or the
> direct snippets — or configure GTM to send to the same GA4 property and Meta
> pixel while disabling the direct snippets.

---

## 2. The purchase event snippet

To place on the **checkout success** step. This is the exact `dataLayer.push`
GTM listens for (standard GA4 `purchase` event schema so no custom tag needed):

```html
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: "ORD-12345678-001",
      value: 128450.0,
      tax: 6120.95,
      shipping: 100,
      currency: "BDT",
      coupon: "SAVE10",
      payment_type: "bKash",
      items: [
        {
          item_id: "LP-HP-840G3",
          item_name: "HP EliteBook 840 G3 Ultrabook",
          price: 48200,
          quantity: 1,
        },
        {
          item_id: "ACC-CHARGER-65W",
          item_name: "65W USB-C Charger",
          price: 2850,
          quantity: 2,
        },
      ],
    },
  });
</script>
```

### Firing from the checkout component

Instead of a raw `<script>` tag, call the helper from `lib/gtm.js` when the
order API responds successfully. In `app/(main)/checkout/page.tsx`, inside the
`onSubmit` handler right after the response is ok (near `setOrderPlaced(true)`):

```ts
import { trackPurchase } from "@/lib/gtm";

// inside onSubmit, after the successful response:
trackPurchase({
  transactionId: result.orderNumber ?? "",
  value: getCartTotal(),
  tax: getCartTotal() * 0.05, // only if you surface tax separately
  shipping: getShipping(),
  currency: "BDT",
  items: items.map((item) => ({
    item_id: item.id.toString(),
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  })),
});
```

Fire it **once**, only when `orderPlaced` transitions to `true` (not on every
render) to avoid duplicate purchase events in GA4.

---

## 3. GTM configuration

1. **GA4**: create a Google Analytics: GA4 event tag, trigger = **Custom
   Event** name `purchase`. Enable "Send Ecommerce Data" / ensure the Data
   Layer variable `ecommerce` is mapped so `transaction_id`, `value`, and
   `items` flow to GA4.
2. **Meta Ads**: create a Meta Pixel / Conversions API tag, trigger = Custom
   Event `purchase`. Map `value` → `value`, `currency` → `currency`, and
   `item_id` array → `content_ids`.

## Key files

| File              | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `app/layout.tsx`  | GTM container snippet (or direct GA4/pixel) |
| `lib/gtm.js`      | `trackPurchase` / `trackViewItem` helpers |
| `checkout/page.tsx` | Fires `purchase` on order success         |

## Currency note

This is a Bangladesh store — always send `currency: "BDT"`. GA4 requires
`value` + `currency` together; Meta maps them to its own purchase parameters.