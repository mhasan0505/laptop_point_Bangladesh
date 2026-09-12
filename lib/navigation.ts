export const ACCESSORY_CATEGORIES = [
  "Chargers & Adapters",
  "Routers",
  "Mouse & Keyboards",
  "Laptop Bags & Sleeves",
  "Headphones & Audio",
  "Cables & Docks",
  "Stands & Cooling Pads",
  "Accessories",
] as const;

export type AccessoryCategory = (typeof ACCESSORY_CATEGORIES)[number];
