/**
 * Smart Search utility for the Admin Dashboard
 * Supports:
 * - Exact ID search (e.g. "1", "#1", "id:1")
 * - Exact SKU search and partial SKU match
 * - Multi-word / token search (e.g. "hp 840", "dell 7490", "lenovo x1")
 * - Brand, Model, Processor & Specs matching
 * - Relevance ranking so the exact matching product is always shown at the top
 */

export function searchAdminProducts<
  T extends {
    id: string | number;
    name: string;
    brand?: string;
    model?: string;
    category?: string;
    sku?: string;
    specs?: {
      processor?: string;
      ram?: string;
      storage?: string;
      display?: string;
      [key: string]: any;
    };
  },
>(items: T[], searchTerm: string, filterCategory: string = "All"): T[] {
  let filtered = items;
  if (filterCategory && filterCategory !== "All") {
    filtered = filtered.filter((p) => p.category === filterCategory);
  }

  const rawTerm = (searchTerm || "").trim();
  if (!rawTerm) return filtered;

  const cleanTerm = rawTerm.toLowerCase();

  // Explicit ID search: "#1", "id:1", or pure integer matching an ID
  const isExplicitId = cleanTerm.startsWith("#") || cleanTerm.startsWith("id:");
  const numericId = cleanTerm.replace(/^(id:|\#)/, "").trim();
  const isPureNumber = /^\d+$/.test(numericId);

  if (isExplicitId && isPureNumber) {
    const exact = filtered.filter((p) => String(p.id) === numericId);
    if (exact.length > 0) return exact;
  }

  const tokens = cleanTerm.split(/\s+/).filter(Boolean);
  const normalize = (str: string) =>
    (str || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedQuery = normalize(cleanTerm);

  const scored: Array<{ product: T; score: number }> = [];

  for (const product of filtered) {
    const pId = String(product.id);
    const pName = product.name || "";
    const pBrand = product.brand || "";
    const pModel = product.model || "";
    const pSku = product.sku || "";
    const pProcessor = product.specs?.processor || "";
    const pRam = product.specs?.ram || "";
    const pStorage = product.specs?.storage || "";

    const nameLower = pName.toLowerCase();
    const skuLower = pSku.toLowerCase();
    const brandLower = pBrand.toLowerCase();
    const modelLower = pModel.toLowerCase();
    const processorLower = pProcessor.toLowerCase();

    // Composite searchable string
    const searchable =
      `${pId} ${pName} ${pBrand} ${pModel} ${pSku} ${pProcessor} ${pRam} ${pStorage}`.toLowerCase();
    const normSearchable = normalize(searchable);

    // Every token must match somewhere in the product info
    const allTokensMatch = tokens.every((token) => {
      // For very short tokens (1-2 chars, e.g. "1", "g3", "i5")
      if (token.length <= 2) {
        if (pId === token) return true;
        const wordRegex = new RegExp(`\\b${token}\\b`, "i");
        return (
          wordRegex.test(nameLower) ||
          wordRegex.test(skuLower) ||
          wordRegex.test(brandLower) ||
          wordRegex.test(modelLower) ||
          wordRegex.test(processorLower)
        );
      }

      const normToken = normalize(token);
      return (
        searchable.includes(token) ||
        (normToken && normSearchable.includes(normToken))
      );
    });

    if (!allTokensMatch) continue;

    // Relevance scoring
    let score = 0;

    // 1. Exact ID match (top priority)
    if (pId === cleanTerm || (isPureNumber && pId === numericId)) {
      score += 5000;
    }

    // 2. Exact SKU match
    if (skuLower === cleanTerm || normalize(pSku) === normalizedQuery) {
      score += 3000;
    } else if (skuLower.includes(cleanTerm)) {
      score += 800;
    }

    // 3. Exact Name match
    if (nameLower === cleanTerm) {
      score += 2000;
    } else if (nameLower.startsWith(cleanTerm)) {
      score += 1000;
    } else if (nameLower.includes(cleanTerm)) {
      score += 500;
    }

    // 4. Model match
    if (modelLower && (modelLower === cleanTerm || modelLower.includes(cleanTerm))) {
      score += 400;
    }

    // 5. Tokens in name
    const tokensInName = tokens.filter(
      (t) => nameLower.includes(t) || normalize(pName).includes(normalize(t)),
    );
    score += (tokensInName.length / tokens.length) * 300;

    // 6. Processor match
    if (processorLower && processorLower.includes(cleanTerm)) {
      score += 200;
    }

    // 7. Brand match
    if (brandLower === cleanTerm) {
      score += 100;
    }

    scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.product);
}
