import { formatBDT } from "@/lib/format";

export interface DiscountInfo {
  percent: number;
  savings: number;
  savingsFormatted: string;
}

const warnedSkus = new Set<string>();

/**
 * Validates discount and returns formatted savings if valid (1% to 60%).
 * Guards against mistyped data (e.g. 91% discount where market price was mistyped).
 */
export function getValidDiscount(
  price: number,
  originalPrice?: number,
  sku?: string
): DiscountInfo | null {
  if (!originalPrice || originalPrice <= 0 || originalPrice <= price) {
    return null;
  }

  const rawPercent = Math.round((1 - price / originalPrice) * 100);

  // Guard: percent between 1 and 60
  if (rawPercent < 1 || rawPercent > 60) {
    if (process.env.NODE_ENV !== "production" && sku && !warnedSkus.has(sku)) {
      warnedSkus.add(sku);
      console.warn(
        `[pricing-display] Implausible discount guarded: SKU "${sku}" calculated at ${rawPercent}% (price: ৳${price}, originalPrice: ৳${originalPrice}). Suppressing discount display.`
      );
    }
    return null;
  }

  const savings = originalPrice - price;
  return {
    percent: rawPercent,
    savings,
    savingsFormatted: `Save ${formatBDT(savings)}`,
  };
}
