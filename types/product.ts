export interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

export const Product = {};

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stockQty?: number;
  warranty?: string;
  youtubeUrl?: string;
  tags?: string[];
  /** Grouped specifications from the admin form; preferred over flat `specs` when present. */
  specGroups?: Record<string, Record<string, string>>;
  image: string | StaticImageData;
  images?: (string | StaticImageData)[];
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
    graphics?: string;
    battery?: string;
    weight?: string;
    touchscreen?: boolean;
    displayType?: string;
    os?: string;
    ports?: string[];
  };
  category?: string;
  features?: string[];
  condition?: string[];
  grade?: string;
  sku?: string;
  description?: {
    short: string;
    full: string;
  };
  slug: string;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  updated_at?: string | Date;
  updatedAt?: string | Date;
  created_at?: string | Date;
  createdAt?: string | Date;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  options: Record<string, string>;
  price: number;
  marketPrice?: number;
  stockQty?: number;
  stockStatus?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface ProductVariantOption {
  name: string;
  values: string[];
}
