/**
 * Single source of truth for Laptop Point BD Return & Refund Policy.
 * Used by:
 * 1. app/(main)/returns/page.tsx (visible on-page policy content)
 * 2. components/seo/ProductSchemaMeta.tsx (MerchantReturnPolicy JSON-LD schema)
 *
 * Guarantees that visible page content and schema values NEVER diverge.
 */
export const RETURN_POLICY_CONFIG = {
  // Schema attributes
  applicableCountry: "BD",
  returnPolicyCategory:
    "https://schema.org/MerchantReturnFiniteReturnWindow" as const,
  merchantReturnDays: 7,
  returnMethod: [
    "https://schema.org/ReturnInStore",
    "https://schema.org/ReturnByMail",
  ] as const,
  returnFees: "https://schema.org/FreeReturn" as const,
  refundType: "https://schema.org/FullRefund" as const,

  // Text values rendered on the returns page
  returnPeriodDays: 7,
  defectiveReplacementDays: 30,
  inspectionDays: "2-3 business days",
  refundProcessingDays: "5-7 business days",
} as const;

export type ReturnPolicyConfig = typeof RETURN_POLICY_CONFIG;
