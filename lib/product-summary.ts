import { Product } from "@/types/product";

/**
 * Strips marketing suffixes (e.g. "Business Laptop", "Ultrabook", spec dumps)
 * from the product title to yield the clean model name.
 */
export function cleanProductModelName(name: string): string {
  let cleaned = (name || "").trim();

  // 1. Cut off at comma or dash separator if specs follow
  if (cleaned.includes(",")) {
    cleaned = cleaned.split(",")[0].trim();
  }
  if (cleaned.includes(" - ")) {
    cleaned = cleaned.split(" - ")[0].trim();
  }

  // 2. Remove parenthetical specs like "(i5)", "(Ryzen)", "(i7 Edition)"
  cleaned = cleaned.replace(
    /\s*\((?:i[3579]|Ryzen|i[3579]\s+Edition|10th\s+Gen)[^)]*\)/gi,
    ""
  );

  // 3. Remove trailing spec dumps like "Core i5 10th Gen 14.1 FHD Laptop", "i7 8th Gen 16/256", "Ryzen 5 PRO 16/512"
  cleaned = cleaned.replace(
    /\s+(?:Core\s+i[3579]|i[3579]|Ryzen\s+[3579]|Intel\s+Core|\d+th\s+Gen|\d+\/\d+|\d+GB).*$/i,
    ""
  );

  // 4. Strip marketing suffixes
  const marketingSuffixes = [
    "Business Laptop",
    "Premium Ultrabook",
    "Ultrabook Laptop",
    "Ultrabook",
    "Mobile Workstation",
    "Workstation",
    "Education",
    "Business",
    "Metal Black",
    "Premium",
    "Laptop",
    "Edition",
  ];

  for (const suffix of marketingSuffixes) {
    const reg = new RegExp(`\\s+${suffix}$`, "i");
    cleaned = cleaned.replace(reg, "");
  }

  // Clean up any repeated loose numbers like trailing "14"
  cleaned = cleaned.replace(/\s+\d{2}$/, "");

  return cleaned.trim();
}

function getIndefiniteArticle(phrase: string): "a" | "an" {
  const trimmed = phrase.trim();
  // English phonetic rule: numbers starting with vowel sound when spoken (8, 11, 18, 80-89)
  if (/^(?:11(?:\.\d+)?|8(?:\.\d+)?|18(?:\.\d+)?|8\d(?:\.\d+)?)(?:\s|-|$)/.test(trimmed)) {
    return "an";
  }
  // Vowel letters (a, e, i, o, u)
  if (/^[aeiou]/i.test(trimmed)) {
    return "an";
  }
  return "a";
}

function formatRamSpec(rawRam: string): string {
  const cleaned = rawRam.trim();
  const parenMatch = cleaned.match(/\((.*?)\)/);
  if (!parenMatch) {
    return `${cleaned} RAM`;
  }
  const base = cleaned.replace(/\s*\(.*?\)/, "").trim();
  let paren = parenMatch[1].trim().toLowerCase();
  // Normalize "+ 1 slot" to ", 1 free slot"
  paren = paren.replace(/\s*\+\s*1\s*slot\b/i, ", 1 free slot");
  return `${base} RAM (${paren})`;
}

function formatSpecsClause(specs?: Product["specs"]): string {
  const parts: string[] = [];

  if (specs?.processor) {
    const cpu = specs.processor.replace(/\(.*?\)/g, "").trim();
    if (cpu) {
      const article = getIndefiniteArticle(cpu);
      parts.push(`${article} ${cpu} processor`);
    }
  }

  if (specs?.ram) {
    parts.push(formatRamSpec(specs.ram));
  }

  if (specs?.storage) {
    const storage = specs.storage.trim();
    const article = getIndefiniteArticle(storage);
    parts.push(`${article} ${storage}`);
  }

  if (parts.length === 0) return "";
  if (parts.length === 1) return ` with ${parts[0]}`;
  if (parts.length === 2) return ` with ${parts[0]} and ${parts[1]}`;
  return ` with ${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Deterministically generates a 2-3 sentence factual summary of a product
 * based on its verified hardware specifications and warranty terms.
 * Used for:
 * 1. Visible "Quick Verdict" on the product details page
 * 2. Meta description for SEO
 * 3. JSON-LD schema description for generative AI search engines
 *
 * Strict Rule: Plain facts only, NO marketing adjectives.
 */
export function generateProductSummary(product: Product): string {
  const modelName = cleanProductModelName(product.name);

  // 1. Processor, RAM, Storage clause
  const specsClause = formatSpecsClause(product.specs);

  // 2. Display
  const rawDisplay = product.specs?.display;
  let display = "";
  if (typeof rawDisplay === "string") {
    display = rawDisplay.trim();
  } else if (rawDisplay && typeof rawDisplay === "object") {
    const d = rawDisplay as { size?: string; resolution?: string };
    const size = (d.size || "").trim();
    const res = (d.resolution || "").trim();
    display = `${size} ${res}`.trim();
  }

  // Hyphenate the display size: e.g. "11.6 inch" or "11.6\"" -> "11.6-inch"
  display = display.replace(/(\d+(?:\.\d+)?)\s*(?:inch|")\b/gi, "$1-inch");
  display = display.replace(/(\d+(?:\.\d+)?)\s*inch/gi, "$1-inch");

  // 3. Condition Grade (Strictly capitalized, e.g. "Grade A")
  let grade = "Grade A";
  if (product.grade) {
    const clean = product.grade.replace(/^[Gg]rade\s*/, "").toUpperCase();
    grade = `Grade ${clean}`;
  } else if (product.condition && product.condition.length > 0) {
    const rawCond = product.condition[0].trim();
    if (/^[A-D]$/i.test(rawCond) || /^[Gg]rade\s*[A-D]$/i.test(rawCond)) {
      grade = `Grade ${rawCond.replace(/^[Gg]rade\s*/, "").toUpperCase()}`;
    } else {
      grade = rawCond;
    }
  }

  // Article selection ("a Grade A refurbished laptop")
  const gradeArticle = getIndefiniteArticle(grade);

  // Sentence 1: Device identity (clean model name), condition, and hardware specs
  const s1 = `The ${modelName} is ${gradeArticle} ${grade} refurbished laptop${specsClause}.`;

  // Sentence 2: Display and physical condition with proper indefinite article
  let s2 = `The unit is in ${grade} physical condition and has passed hardware diagnostics.`;
  if (display) {
    const displayArticle = getIndefiniteArticle(display);
    s2 = `It features ${displayArticle} ${display} display and has passed hardware diagnostics.`;
  }

  // Sentence 3: Warranty and local Dhaka showroom backing (kept as-is pending policy decision)
  const warrantyText =
    product.warranty || "15-day replacement warranty and 2-year service warranty";
  const s3 = `Covered by a ${warrantyText} from Laptop Point BD in Mirpur-10, Dhaka.`;

  return `${s1} ${s2} ${s3}`;
}
