import { type Product } from "./products";

/**
 * CPU Tier Classification
 * 1: Entry / Celeron / Pentium
 * 2: Core i3 / Ryzen 3
 * 3: Core i5 / Ryzen 5 / Apple M1/M2/M3 base
 * 4: Core i7 / Ryzen 7 / Apple M Pro
 * 5: Core i9 / Ryzen 9 / Apple M Max
 */
export function getCpuTier(cpu: string): number {
  if (!cpu) return 3;
  const c = cpu.toLowerCase();
  if (/i7|ryzen\s*7/i.test(c)) return 4;
  if (/i5|ryzen\s*5|m1|m2|m3/i.test(c)) return 3;
  if (/i3|ryzen\s*3/i.test(c)) return 2;
  if (/i9|ryzen\s*9/i.test(c)) return 5;
  if (/pentium|celeron|athlon/i.test(c)) return 1;
  return 3;
}

/**
 * Extract generation number if present (e.g. 8th Gen -> 8, i5-1135G7 -> 11, Ryzen 5 4650U -> 4)
 */
export function getCpuGen(cpu: string): number | null {
  if (!cpu) return null;
  const m1 = cpu.match(/(\d{1,2})(?:th|st|nd|rd)\s*gen/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = cpu.match(/i[3579]-(\d{1,2})\d{2,3}/i);
  if (m2) return parseInt(m2[1], 10);
  const m3 = cpu.match(/ryzen\s*[3579]\s*(?:pro\s*)?(\d)\d{3}/i);
  if (m3) return parseInt(m3[1], 10);
  return null;
}

/**
 * Extract RAM capacity in GB
 */
export function getRamGB(ram: string): number {
  if (!ram) return 8;
  const m = ram.match(/(\d+)\s*gb/i);
  return m ? parseInt(m[1], 10) : 8;
}

/**
 * Extract storage capacity in GB
 */
export function getStorageGB(storage: string): number {
  if (!storage) return 256;
  if (/1\s*tb|1024/i.test(storage)) return 1024;
  if (/2\s*tb|2048/i.test(storage)) return 2048;
  const m = storage.match(/(\d+)\s*gb/i);
  return m ? parseInt(m[1], 10) : 256;
}

/**
 * Score how closely a candidate matches the target configuration.
 * Prioritizes different brands while matching CPU tier, generation, RAM, storage, and price bracket.
 */
export function scoreProductSimilarity(target: Product, candidate: Product): number {
  if (candidate.id === target.id) return -9999;
  let score = 0;

  const isDifferentBrand = candidate.brand.toLowerCase() !== target.brand.toLowerCase();
  // Strong preference for cross-brand alternatives as requested
  if (isDifferentBrand) {
    score += 80;
  }

  // CPU Tier (Core i5 vs Ryzen 5, etc.)
  const targetTier = getCpuTier(target.cpu);
  const candTier = getCpuTier(candidate.cpu);
  if (targetTier === candTier) {
    score += 45;
  } else if (Math.abs(targetTier - candTier) === 1) {
    score += 15;
  }

  // Generation match
  const targetGen = getCpuGen(target.cpu);
  const candGen = getCpuGen(candidate.cpu);
  if (targetGen && candGen) {
    const diff = Math.abs(targetGen - candGen);
    if (diff === 0) score += 20;
    else if (diff <= 1) score += 12;
    else if (diff <= 2) score += 5;
  }

  // RAM Match
  const targetRam = getRamGB(target.ram);
  const candRam = getRamGB(candidate.ram);
  if (targetRam === candRam) {
    score += 35;
  } else {
    score -= Math.abs(targetRam - candRam) * 4;
  }

  // Storage Match
  const targetStorage = getStorageGB(target.storage);
  const candStorage = getStorageGB(candidate.storage);
  if (targetStorage === candStorage) {
    score += 25;
  } else if (targetStorage > 0 && candStorage > 0) {
    const ratio = Math.max(targetStorage, candStorage) / Math.min(targetStorage, candStorage);
    if (ratio <= 2) score += 10;
  }

  // Price Proximity
  if (
    typeof target.price === "number" &&
    typeof candidate.price === "number" &&
    target.price > 0 &&
    candidate.price > 0
  ) {
    const diffRatio = Math.abs(candidate.price - target.price) / target.price;
    if (diffRatio <= 0.15) score += 30;
    else if (diffRatio <= 0.30) score += 18;
    else if (diffRatio <= 0.50) score += 8;
  }

  return score;
}

/**
 * Returns concise badge text explaining why candidate matches target configuration
 */
export function getMatchReason(target: Product, candidate: Product): string {
  const targetRam = getRamGB(target.ram);
  const candRam = getRamGB(candidate.ram);
  const targetStorage = getStorageGB(target.storage);
  const candStorage = getStorageGB(candidate.storage);
  const targetTier = getCpuTier(target.cpu);
  const candTier = getCpuTier(candidate.cpu);

  if (targetRam === candRam && targetStorage === candStorage && targetTier === candTier) {
    return "Same Specs Rival";
  }
  if (targetRam === candRam && targetStorage === candStorage) {
    return `Same ${candidate.ram} · ${candidate.storage.replace(/\s*SSD/i, "")}`;
  }
  if (targetTier === candTier && targetRam === candRam) {
    return `Similar CPU · ${candidate.ram}`;
  }
  if (candidate.brand.toLowerCase() !== target.brand.toLowerCase()) {
    return `${candidate.brand} Alternative`;
  }
  return "Similar Spec";
}

/**
 * Finds top products with same/similar configuration from DIFFERENT brands.
 * If possible, diversifies across different rival brands.
 */
export function getSimilarConfigProducts(
  target: Product,
  all: Product[],
  limit = 4
): Product[] {
  const scored = all
    .filter((p) => p.id !== target.id)
    .map((p) => ({ product: p, score: scoreProductSimilarity(target, p) }))
    .sort((a, b) => b.score - a.score);

  const results: Product[] = [];
  const brandSeen = new Set<string>();

  // Pass 1: Top scoring product from each distinct DIFFERENT brand
  for (const item of scored) {
    if (results.length >= limit) break;
    const b = item.product.brand.toLowerCase();
    if (b !== target.brand.toLowerCase() && !brandSeen.has(b)) {
      results.push(item.product);
      brandSeen.add(b);
    }
  }

  // Pass 2: Additional top scoring products from different brands
  for (const item of scored) {
    if (results.length >= limit) break;
    const b = item.product.brand.toLowerCase();
    if (b !== target.brand.toLowerCase() && !results.some((r) => r.id === item.product.id)) {
      results.push(item.product);
    }
  }

  // Pass 3: Fallback (any high scoring product, in case catalog has single brand)
  for (const item of scored) {
    if (results.length >= limit) break;
    if (!results.some((r) => r.id === item.product.id)) {
      results.push(item.product);
    }
  }

  return results.slice(0, limit);
}

/**
 * Finds products from the SAME brand for the bottom section ("More from HP")
 */
export function getSameBrandRelated(
  target: Product,
  all: Product[],
  limit = 4
): Product[] {
  return all
    .filter((p) => p.id !== target.id && p.brand.toLowerCase() === target.brand.toLowerCase())
    .slice(0, limit);
}
