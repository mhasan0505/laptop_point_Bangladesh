// Single source of truth for store pricing & business rules.
// Previously duplicated verbatim across contexts/CartContext.tsx,
// app/api/orders/route.ts, and the cart order-summary components.
// Keeping these in one module guarantees server-side validation always
// matches what the client cart displays.

export const TAX_RATE = 0.05; // 5% tax
export const SHIPPING_COST = 100; // 100 BDT flat shipping
export const FREE_SHIPPING_THRESHOLD = 50000; // Free shipping over 50,000 BDT

export interface PriceLineItem {
  /** API order items expose `unitPrice`; cart items expose `price`. */
  unitPrice?: number;
  price?: number;
  quantity: number;
}

/**
 * Compute the canonical subtotal, shipping, tax, and grand total for a set of
 * line items. Used by both the client cart and the API order validation so
 * they can never drift out of sync.
 */
export function computeOrderTotals(
  items: PriceLineItem[],
): { subtotal: number; tax: number; shipping: number; total: number } {
  const unitPriceOf = (item: PriceLineItem) =>
    item.unitPrice !== undefined ? item.unitPrice : (item.price ?? 0);
  const subtotal = items.reduce(
    (sum, item) => sum + unitPriceOf(item) * item.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}