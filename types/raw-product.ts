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
    discount_percentage: number;
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
}