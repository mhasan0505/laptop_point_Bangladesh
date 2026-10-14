export type ShippingFeeInput = {
  shippingMethod?: string | null;
  city?: string | null;
};

export type DeliveryFeeRules = {
  deliveryInsideDhakaFee?: number;
  deliveryOutsideDhakaFee?: number;
  vipDeliveryFee?: number;
  deliveryZones?: Array<{ id: string; fee: number; active?: boolean }>;
};

/**
 * Calculates delivery fee based on commerce settings and customer order input.
 * Default rules:
 * - Standard delivery inside Dhaka: Free (৳0)
 * - Standard delivery outside Dhaka: Free (৳0) (configurable in commerce settings)
 * - VIP Courier: ৳500
 */
export function calculateDeliveryFee(
  rules: Partial<DeliveryFeeRules> | null | undefined,
  input: ShippingFeeInput
): number {
  const insideFee = Number(rules?.deliveryInsideDhakaFee ?? 0);
  const outsideFee = Number(rules?.deliveryOutsideDhakaFee ?? 0);
  const vipFee = Number(rules?.vipDeliveryFee ?? 500);

  const method = input.shippingMethod?.trim().toLowerCase();
  if (rules?.deliveryZones && method) {
    const matchedZone = rules.deliveryZones.find(
      (z) => z.id.toLowerCase() === method && z.active !== false
    );
    if (matchedZone) return matchedZone.fee;
  }

  if (method === "vip" || method === "express") {
    return vipFee;
  }

  const city = input.city?.trim().toLowerCase();
  const isOutside =
    (city !== undefined && city !== "" && city !== "dhaka") ||
    method === "outside" ||
    method === "outside_dhaka";

  return isOutside ? outsideFee : insideFee;
}
