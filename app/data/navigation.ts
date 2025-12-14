export interface SubMenuItem {
  name: string;
  href: string;
}

export interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  submenu?: SubMenuItem[];
  badge?: string;
}

export const navigationLinks: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Shop",
    href: "/shop",
    hasDropdown: true,
    submenu: [
      { name: "All Products", href: "/shop" },
      { name: "New Arrivals", href: "/shop?sort=new" },
      { name: "Best Sellers", href: "/shop?sort=best-selling" },
      { name: "Discounts", href: "/shop?sort=discount" },
    ],
  },
  {
    name: "Categories",
    href: "/categories",
    hasDropdown: true,
    submenu: [
      { name: "Business Laptops", href: "/categories/business" },
      { name: "Gaming Laptops", href: "/categories/gaming" },
      { name: "Professional", href: "/categories/professional" },
      { name: "Budget Friendly", href: "/categories/budget" },
    ],
  },
  { name: "Deals", href: "/deals", badge: "HOT" },
  {
    name: "Accessories",
    href: "/accessories",
    hasDropdown: true,
    submenu: [
      { name: "Mouse & Keyboards", href: "/accessories/mouse-keyboards" },
      { name: "Headphones & Audio", href: "/accessories/audio" },
      { name: "Laptop Bags & Sleeves", href: "/accessories/bags" },
      { name: "Chargers & Adapters", href: "/accessories/chargers" },
      { name: "RAM & SSD Upgrades", href: "/accessories/components" },
      { name: "Cooling Pads", href: "/accessories/cooling" },
    ],
  },
  { name: "Compare", href: "/compare" },
  { name: "Contact", href: "/contact" },
];
