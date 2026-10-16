export interface RawProduct {
  id: number;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  grade: string;
  pricing: {
    currency: string;
    sale_price: number;
    market_price: number;
    discount_percentage?: number;
    tax_included: boolean;
  };
  stock: {
    status: string;
    quantity: number;
  };
  specs: {
    processor: string;
    ram: string;
    storage: string;
    display: {
      size: string;
      resolution: string;
      type: string;
      touchscreen: boolean;
    };
    graphics: string;
    ports: string[];
    weight: string;
    os: string;
  };
  description: {
    short: string;
    full: string;
  };
  features: string[];
  images: string[];

  // ── Optional fields written by the admin product form ──────────────────
  /** Full grouped specifications exactly as entered in the admin form. */
  specGroups?: Record<string, Record<string, string>>;
  /** Public YouTube link (watch / youtu.be / shorts). */
  youtubeUrl?: string;
  tags?: string[];
  featured?: boolean;
  /** "active" shows on the storefront; "draft" and "archived" are hidden. */
  statusValue?: "active" | "draft" | "archived";
  subCategory?: string;
  warranty?: { period?: string; type?: string; details?: string };
  variantOptions?: Array<{ name: string; values: string[] }>;
  variants?: Array<Record<string, unknown>>;
}

export const isRawProduct = (obj: unknown): obj is RawProduct =>
  typeof obj === "object" && obj !== null && "sku" in obj && "name" in obj;

