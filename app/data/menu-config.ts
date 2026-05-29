/**
 * Centralized Menu Configuration
 * Manage all navigation items, departments, and category menus here
 */

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

/**
 * Main Navigation Links
 * Displayed in header and mobile menu
 */
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
  // {
  //   name: "Categories",
  //   href: "/shop",
  //   hasDropdown: true,
  //   submenu: [
  //     { name: "Business Laptops", href: "/shop?category=business" },
  //     { name: "Gaming Laptops", href: "/shop?category=gaming" },
  //     { name: "Professional", href: "/shop?category=professional" },
  //     { name: "Budget Friendly", href: "/shop?category=budget" },
  //   ],
  // },
  { name: "Deals", href: "/deals", badge: "HOT" },
  {
    name: "Accessories",
    href: "/accessories",
    hasDropdown: true,
    submenu: [
      { name: "Mouse & Keyboards", href: "/accessories/mouse-keyboards" },
      { name: "Headphones & Audio", href: "/accessories/audio" },
      { name: "Laptop Bags & Sleeves", href: "/accessories/bags" },
      { name: "Chargers & Adapters", href: "/accessories/charger-and-adapter" },
      { name: "Routers", href: "/accessories/routers" },
    ],
  },
  { name: "Compare", href: "/compare" },
  { name: "Contact", href: "/contact" },
  { name: "EMI", href: "/EMI" },
];

/**
 * Department Menu Items (All Departments Dropdown)
 * Displayed in header desktop view and mobile menu
 * Each item can have optional subsections for categorization
 */
export const departmentMenuItems: DepartmentMenuItem[] = [
  {
    name: "Super Deals",
    href: "/deals",
    badge: "🔥",
  },
  {
    name: "Laptop",
    href: "/shop?category=laptop",
    sub: [
      {
        title: "LAPTOPS",
        items: [
          { name: "All", href: "/shop?category=laptop" },
          { name: "2 in 1 | 360", href: "/shop?category=2in1" },
          { name: "Latest Collection", href: "/shop?category=latest" },
          { name: "Low or Mid Budget", href: "/shop?category=budget" },
        ],
      },
      {
        title: "BRANDS",
        items: [
          { name: "HP", href: "/shop?brand=hp" },
          { name: "Apple", href: "/shop?brand=apple" },
          { name: "Dell", href: "/shop?brand=dell" },
          { name: "Lenovo", href: "/shop?brand=lenovo" },
          { name: "Acer", href: "/shop?brand=acer" },
          { name: "Microsoft", href: "/shop?brand=microsoft" },
          { name: "Toshiba", href: "/shop?brand=toshiba" },
          { name: "MSI", href: "/shop?brand=msi" },
          { name: "Asus", href: "/shop?brand=asus" },
          { name: "Razer", href: "/shop?brand=razer" },
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
          { name: "Mouse & Keyboards", href: "/accessories/mouse-keyboards" },
          { name: "Headphones & Audio", href: "/accessories/audio" },
          { name: "Laptop Bags & Sleeves", href: "/accessories/bags" },
          {
            name: "Chargers & Adapters",
            href: "/accessories/charger-and-adapter",
          },
          { name: "Routers", href: "/accessories/routers" },
        ],
      },
    ],
  },
  { name: "Accessories", href: "/accessories" },
  { name: "Shop", href: "/shop" },
];
