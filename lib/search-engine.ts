/**
 * Shared Search Engine for Laptop Point BD
 * Provides tokenized matching, unit normalization (16gb vs 16 gb),
 * singular/plural stemming, and relevance ranking across products and accessories.
 */

export interface SearchableItem {
  id?: string | number;
  name?: string | null;
  slug?: string | null;
  brand?: string | null;
  brandRel?: { name?: string | null; slug?: string | null } | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  categoryRel?: { name?: string | null; slug?: string | null } | null;
  condition?: string | null;
  description?: string | null;
  fullDescription?: string | null;
  features?: string[] | null;
  tags?: string[] | null;
  specs?: any;
  cpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  os?: string | null;
  screen?: string | null;
  price?: number | null;
  stockQty?: number | null;
  stockStatus?: string | null;
  featured?: boolean | null;
  variants?: any[] | null;
  image?: string;
  images?: string[];
}

/**
 * Tokenize user query into clean lowercase words without punctuation.
 */
export function tokenizeSearchQuery(query: string | null | undefined): string[] {
  if (!query) return [];
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\d\s]/g, " ")
    .trim();
  return normalized.split(/\s+/).filter(Boolean);
}

/**
 * Split text into distinct lowercase words.
 */
export function extractSearchWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\d\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Build searchable text corpus for a product or accessory.
 * Includes name, brand, model, sku, categories, specs, features, tags, and memory unit expansions.
 */
export function buildProductSearchCorpus(item: SearchableItem): {
  raw: string;
  words: string[];
} {
  const parts: string[] = [];

  if (item.name) parts.push(item.name);
  if (item.brand) parts.push(item.brand);
  if (item.brandRel?.name) parts.push(item.brandRel.name);
  if (item.model) parts.push(item.model);
  if (item.sku) parts.push(item.sku);
  if (item.category) parts.push(item.category);
  if (item.categoryRel?.name) parts.push(item.categoryRel.name);
  if (item.condition) parts.push(item.condition);
  if (item.cpu) parts.push(item.cpu);
  if (item.ram) parts.push(item.ram);
  if (item.storage) parts.push(item.storage);
  if (item.screen) parts.push(item.screen);
  if (item.os) parts.push(item.os);

  if (Array.isArray(item.features)) {
    parts.push(...item.features);
  }
  if (Array.isArray(item.tags)) {
    parts.push(...item.tags);
  }

  // Deep inspect specs JSON
  if (item.specs && typeof item.specs === "object") {
    for (const group of Object.values(item.specs)) {
      if (group && typeof group === "object") {
        for (const [key, val] of Object.entries(group as Record<string, any>)) {
          if (key) parts.push(key);
          if (val !== null && val !== undefined) parts.push(String(val));
        }
      }
    }
  }

  // Inspect variants
  if (Array.isArray(item.variants)) {
    for (const v of item.variants) {
      if (v?.sku) parts.push(v.sku);
      if (v?.options && typeof v.options === "object") {
        for (const val of Object.values(v.options as Record<string, any>)) {
          if (val !== null && val !== undefined) parts.push(String(val));
        }
      }
    }
  }

  if (item.description) parts.push(item.description);
  if (item.fullDescription) parts.push(item.fullDescription);

  const raw = parts.join(" ").toLowerCase();

  // Add memory/storage unit expansions (e.g. "16gb" <-> "16 gb", "512gb" <-> "512 gb", "1tb" <-> "1 tb")
  const memoryExpanded = raw.replace(/(\d+)\s*(gb|tb|mb|ghz)/gi, (_, num, unit) => {
    return `${num}${unit} ${num} ${unit}`;
  });

  // Punctuation spaced (hyphens, slashes, underscores)
  const punctuationSpaced = raw.replace(/[-_/,.:]/g, " ");

  const combined = `${raw} ${memoryExpanded} ${punctuationSpaced}`;
  const words = extractSearchWords(combined);

  return { raw: combined, words };
}

/**
 * Check if a single query token matches within the product's corpus words.
 * Handles exact whole-word matching, plurals/singulars, numbers/model prefixes,
 * and guarded substring matches for longer tokens.
 */
export function matchTokenAgainstCorpus(
  corpusWords: string[],
  rawCorpus: string,
  token: string
): boolean {
  if (!token) return true;

  // 1. Exact whole word match
  if (corpusWords.includes(token)) return true;

  // 2. Singular / Plural forms
  // token "stand" <-> word "stands", token "stands" <-> word "stand"
  if (token.endsWith("s") && corpusWords.includes(token.slice(0, -1))) return true;
  if (corpusWords.includes(token + "s")) return true;
  if (token.endsWith("es") && corpusWords.includes(token.slice(0, -2))) return true;
  if (corpusWords.includes(token + "es")) return true;
  if (token.endsWith("ies") && corpusWords.includes(token.slice(0, -3) + "y")) return true;
  if (token.endsWith("y") && corpusWords.includes(token.slice(0, -1) + "ies")) return true;

  // Irregular plurals
  if (token === "mouse" && corpusWords.includes("mice")) return true;
  if (token === "mice" && corpusWords.includes("mouse")) return true;

  // 3. Numbered tech codes or model suffixes (e.g. "i5", "i7", "m1", "840", "t490", "3050", "16gb")
  if (/\d/.test(token)) {
    const matchDigitBound = corpusWords.some((w) => {
      if (w === token) return true;
      if (w.startsWith(token) || w.endsWith(token)) return true;
      return false;
    });
    if (matchDigitBound) return true;
  }

  // 4. For longer tokens (length >= 4), allow substring match if not a false-positive
  if (token.length >= 4) {
    const hasSubstr = corpusWords.some((w) => {
      if (w.includes(token)) {
        // Prevent false positives: "stand" matching "standard"
        if (token === "stand" && w.startsWith("standard")) return false;
        // Prevent URL domain false positives
        if (w.startsWith("http")) return false;
        return true;
      }
      return false;
    });
    if (hasSubstr) return true;
  }

  return false;
}

/**
 * Checks whether an item matches all tokens in the query.
 */
export function matchesSearchQuery(
  item: SearchableItem,
  query: string | null | undefined
): boolean {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return true;

  const { words, raw } = buildProductSearchCorpus(item);
  return tokens.every((tok) => matchTokenAgainstCorpus(words, raw, tok));
}

/**
 * Calculate relevance score for ranking.
 * Higher score = more relevant match.
 */
export function calculateSearchRelevance(
  item: SearchableItem,
  query: string | null | undefined,
  tokens?: string[]
): number {
  if (!query) return 0;
  const qLower = query.toLowerCase().trim();
  if (!qLower) return 0;

  const queryTokens = tokens ?? tokenizeSearchQuery(query);

  let score = 0;
  const nameLower = (item.name || "").toLowerCase();
  const brandLower = (item.brand || item.brandRel?.name || "").toLowerCase();
  const modelLower = (item.model || "").toLowerCase();
  const skuLower = (item.sku || "").toLowerCase();
  const catLower = (item.category || item.categoryRel?.name || "").toLowerCase();
  const descLower = (item.description || "").toLowerCase();

  const nameWords = extractSearchWords(nameLower);
  const brandWords = extractSearchWords(brandLower);
  const modelWords = extractSearchWords(modelLower);
  const skuWords = extractSearchWords(skuLower);
  const catWords = extractSearchWords(catLower);

  // Exact full query match in title
  if (nameLower.includes(qLower)) {
    score += 120;
    if (nameLower.startsWith(qLower)) score += 40;
  }

  // Exact full query match in brand or model or SKU
  if (brandLower.includes(qLower)) score += 60;
  if (modelLower.includes(qLower)) score += 50;
  if (skuLower.includes(qLower)) score += 70;

  // Token level scoring
  for (const tok of queryTokens) {
    // Title matches
    if (nameWords.includes(tok)) {
      score += 45; // exact whole word in title
    } else if (nameLower.includes(tok)) {
      score += 25;
    }

    // Brand matches
    if (brandWords.includes(tok)) {
      score += 35;
    } else if (brandLower.includes(tok)) {
      score += 20;
    }

    // Model matches
    if (modelWords.includes(tok)) {
      score += 30;
    } else if (modelLower.includes(tok)) {
      score += 15;
    }

    // SKU matches
    if (skuWords.includes(tok)) {
      score += 35;
    } else if (skuLower.includes(tok)) {
      score += 20;
    }

    // Category matches
    if (catWords.includes(tok)) {
      score += 20;
    } else if (catLower.includes(tok)) {
      score += 10;
    }

    // Description matches
    if (descLower.includes(tok)) {
      score += 4;
    }
  }

  // Stock availability bonus
  if (item.stockStatus === "In Stock" || (item.stockQty !== null && item.stockQty !== undefined && item.stockQty > 0)) {
    score += 5;
  }

  // Featured bonus
  if (item.featured) {
    score += 2;
  }

  return score;
}

/**
 * Filter and sort items by relevance descending.
 */
export function filterAndRankBySearch<T extends SearchableItem>(
  items: T[],
  query: string | null | undefined
): T[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return items;

  const matched: { item: T; relevance: number }[] = [];

  for (const item of items) {
    const { words, raw } = buildProductSearchCorpus(item);
    const matchesAll = tokens.every((tok) => matchTokenAgainstCorpus(words, raw, tok));
    if (matchesAll) {
      const relevance = calculateSearchRelevance(item, query, tokens);
      matched.push({ item, relevance });
    }
  }

  matched.sort((a, b) => b.relevance - a.relevance);
  return matched.map((m) => m.item);
}
