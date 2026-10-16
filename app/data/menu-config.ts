/**
 * Centralized Menu Configuration
 * Manage all navigation items, departments, and category menus here
 */

export interface SubMenuItem {
  name: string;
  href: string;
  icon?: string;
}

export interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  submenu?: SubMenuItem[];
  badge?: string;
}

export interface DepartmentSubSection {
  title: string;
  items: Array<{ name: string; href: string }>;
}

export interface DepartmentMenuItem {
  name: string;
  href: string;
  badge?: string;
  sub?: DepartmentSubSection[];
}

import { isCategoryHrefAvailable } from "@/lib/nav-filter";

/**
 * Main Navigation Links
 * Displayed in header and mobile menu
 */
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
    name: "Brands",
    href: "/shop",
    hasDropdown: true,
    submenu: [
      { name: "HP", href: "/shop?brand=HP", icon: "/brands/hp.png" },
      { name: "Dell", href: "/shop?brand=Dell", icon: "/brands/dell.png" },
      { name: "Lenovo", href: "/shop?brand=Lenovo", icon: "/brands/lenovo.png" },
      { name: "Microsoft", href: "/shop?brand=Microsoft", icon: "/brands/microsoft.png" },
      { name: "Asus", href: "/shop?brand=Asus", icon: "/brands/asus.png" },
      { name: "Acer", href: "/shop?brand=Acer", icon: "/brands/acer.png" },
      { name: "All Brands", href: "/shop", icon: "/brands/all-brands.png" },
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
  { name: "EMI", href: "/EMI" },
];

export const navigationLinks: NavItem[] = rawNavigationLinks
  .map((item) => ({
    ...item,
    submenu: item.submenu?.filter((s) => isCategoryHrefAvailable(s.href)),
  }))
  .filter((item) => isCategoryHrefAvailable(item.href) || (item.submenu && item.submenu.length > 0));

/**
 * Department Menu Items (All Departments Dropdown)
 * Displayed in header desktop view and mobile menu
 * Each item can have optional subsections for categorization
 */
const rawDepartmentMenuItems: DepartmentMenuItem[] = [
  {
    name: "Super Deals",
    href: "/deals",
    badge: "🔥",
  },
  {
    name: "Laptop",
    href: "/shop?category=Laptop",
    sub: [
      {
        title: "LAPTOPS",
        items: [
          { name: "All", href: "/shop?category=Laptop" },
          { name: "2 in 1 | 360", href: "/shop?category=Convertible%202-in-1" },
          { name: "Ultrabooks", href: "/shop?category=Ultrabook" },
          { name: "Workstations", href: "/shop?category=Workstation" },
        ],
      },
      {
        title: "BRANDS",
        items: [
          { name: "HP", href: "/shop?brand=HP" },
          { name: "Apple", href: "/shop?brand=Apple" },
          { name: "Dell", href: "/shop?brand=Dell" },
          { name: "Lenovo", href: "/shop?brand=Lenovo" },
          { name: "Acer", href: "/shop?brand=Acer" },
          { name: "Microsoft", href: "/shop?brand=Microsoft" },
          { name: "Toshiba", href: "/shop?brand=Toshiba" },
          { name: "MSI", href: "/shop?brand=MSI" },
          { name: "Asus", href: "/shop?brand=Asus" },
          { name: "Razer", href: "/shop?brand=Razer" },
        ],
      },
    ],
  },
  {
    name: "Tablets",
    href: "/shop?category=tablets",
    sub: [
      {
        title: "TABLETS",
        items: [
          { name: "All Tablets", href: "/shop?category=tablets" },
          { name: "Android Tablets", href: "/shop?category=android-tablets" },
          { name: "Windows Tablets", href: "/shop?category=windows-tablets" },
        ],
      },
    ],
  },
  { name: "Gadgets", href: "/shop?category=gadgets" },
  {
    name: "Laptop Accessories",
    href: "/accessories",
    sub: [
      {
        title: "ACCESSORIES",
        items: [
          { name: "Mouse & Keyboards", href: "/accessories?category=keyboards-mice" },
          { name: "Headphones & Audio", href: "/accessories?category=other" },
          { name: "Laptop Bags & Sleeves", href: "/accessories?category=bags-sleeves" },
          {
            name: "Chargers & Adapters",
            href: "/accessories?category=chargers-adapters",
          },
          { name: "Routers", href: "/accessories?category=routers-networking" },
        ],
      },
    ],
  },
  { name: "Accessories", href: "/accessories" },
  { name: "Shop", href: "/shop" },
];

export const departmentMenuItems: DepartmentMenuItem[] = rawDepartmentMenuItems
  .map((item) => {
    const filteredSub = item.sub
      ?.map((sec) => ({
        ...sec,
        items: sec.items.filter((subItem) => isCategoryHrefAvailable(subItem.href)),
      }))
      .filter((sec) => sec.items.length > 0);

    return {
      ...item,
      sub: filteredSub && filteredSub.length > 0 ? filteredSub : undefined,
    };
  })
  .filter((item) => {
    if (item.sub && item.sub.length > 0) return true;
    return isCategoryHrefAvailable(item.href);
  });
