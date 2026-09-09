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
    href: "/shop",
    hasDropdown: true,
    submenu: [
      { name: "Business Laptops", href: "/shop?category=business" },
      { name: "Gaming Laptops", href: "/shop?category=gaming" },
      { name: "Professional", href: "/shop?category=professional" },
      { name: "Budget Friendly", href: "/shop?category=budget" },
    ],
  },
  { name: "Deals", href: "/deals", badge: "HOT" },
  {
    name: "Accessories",
    href: "/accessories",
    hasDropdown: true,
    submenu: [
      { name: "Chargers & Adapters", href: "/accessories/charger-and-adapter" },
      { name: "Routers", href: "/accessories/routers" },
      { name: "All Accessories", href: "/accessories" },
      { name: "Mouse & Keyboards", href: "/shop?category=accessories" },
      { name: "Laptop Bags & Sleeves", href: "/shop?category=accessories" },
    ],
  },
  { name: "Compare", href: "/compare" },
  { name: "Contact", href: "/contact" },
];
