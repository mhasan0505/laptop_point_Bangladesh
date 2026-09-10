// Shared order workflow rules used by both the collection and single-order
// API routes. Previously VALID_STATUSES and the stock-releasing set were
// re-declared (with divergent types) across the two handlers.

export const VALID_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;

export type OrderStatus = (typeof VALID_STATUSES)[number];

// Statuses that release stock back to inventory when reached.
export const STOCK_RELEASING_STATUSES = new Set<string>([
  "Cancelled",
  "Returned",
]);

export function isValidOrderStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}