import { StaticImageData } from "next/image";

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
  };
  category?: string;
  features?: string[];
  condition?: string[];
  sku?: string;
  description?: {
    short: string;
    full: string;
  };
  slug: string;
}
