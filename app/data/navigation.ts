import { isCategoryHrefAvailable } from "@/lib/nav-filter";

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

const rawNavigationLinks: NavItem[] = [
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
      { name: "Business Workstations", href: "/shop?category=Workstation" },
      { name: "Ultrabooks & Slim", href: "/shop?category=Ultrabook" },
      { name: "2-in-1 Convertibles", href: "/shop?category=Convertible%202-in-1" },
      { name: "All Laptops", href: "/shop?category=Laptop" },
    ],
  },
  { name: "Deals", href: "/deals", badge: "HOT" },
  {
    name: "Accessories",
    href: "/accessories",
    hasDropdown: true,
    submenu: [
      { name: "Chargers & Adapters", href: "/accessories?category=chargers-adapters" },
      { name: "Routers", href: "/accessories?category=routers-networking" },
      { name: "All Accessories", href: "/accessories" },
      { name: "Mouse & Keyboards", href: "/accessories?category=keyboards-mice" },
      { name: "Laptop Bags & Sleeves", href: "/accessories?category=bags-sleeves" },
    ],
  },
  { name: "Compare", href: "/compare" },
  { name: "Contact", href: "/contact" },
];

export const navigationLinks: NavItem[] = rawNavigationLinks
  .map((item) => ({
    ...item,
    submenu: item.submenu?.filter((s) => isCategoryHrefAvailable(s.href)),
  }))
  .filter((item) => isCategoryHrefAvailable(item.href) || (item.submenu && item.submenu.length > 0));
