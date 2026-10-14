import { isCategoryHrefAvailable } from "./nav-filter";
// ─── Navigation & Menu Data for Laptop Point BD ─────────────────────────

export type NavLink = {
  label: string;
  href: string;
  icon?: string;
  submenu?: NavLink[];
};

export type CategorySubItem = {
  name: string;
  href: string;
  icon?: string;
};

export type CategoryItemData = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  hasChevron?: boolean;
  subitems?: CategorySubItem[];
};

// ─── Screenshot-Exact Category Items for "SHOP BY CATEGORIES" ───────────────
const rawShopCategories: CategoryItemData[] = [
  {
    id: "all-laptop",
    label: "All Laptop",
    href: "/shop",
    hasChevron: true,
    subitems: [
      { name: "Gaming Laptops", href: "/shop?category=gaming-laptops" },
      { name: "Ultrabooks & Slim", href: "/shop?category=Ultrabook" },
      { name: "Business Workstations", href: "/shop?category=Workstation" },
      { name: "Student & Everyday", href: "/shop?category=budget" },
      { name: "2-in-1 Touch Laptops", href: "/shop?category=Convertible%202-in-1" },
      { name: "MacBook Pro & Air", href: "/shop?brand=Apple" },
      { name: "Microsoft Surface", href: "/shop?brand=Microsoft" },
      { name: "Asus ROG & TUF", href: "/shop?brand=Asus" },
      { name: "Lenovo Legion & ThinkPad", href: "/shop?brand=Lenovo" },
      { name: "HP Omen & Victus", href: "/shop?brand=HP" },
      { name: "Dell Alienware & XPS", href: "/shop?brand=Dell" },
    ],
  },
  {
    id: "microsoft",
    label: "Microsoft",
    href: "/shop?brand=Microsoft",
    icon: "/icons/windows.png",
  },
  {
    id: "apple",
    label: "Apple",
    href: "/shop?brand=Apple",
    icon: "/icons/apple.png",
    hasChevron: true,
    subitems: [
      { name: "MacBook", href: "/shop?brand=Apple" },
      { name: "Mac Mini", href: "/shop?brand=Apple" },
      { name: "Mac Studio", href: "/shop?brand=Apple" },
      { name: "IMac", href: "/shop?brand=Apple" },
      { name: "IPad", href: "/shop?brand=Apple" },
      { name: "Mac Pro", href: "/shop?brand=Apple" },
      { name: "IPhone", href: "/shop?brand=Apple" },
      { name: "Studio Display", href: "/accessories?category=Monitor" },
      { name: "Apple Watch", href: "/accessories" },
      { name: "Accessories", href: "/accessories" },
    ],
  },
  {
    id: "asus",
    label: "Asus",
    href: "/shop?brand=Asus",
    icon: "/icons/asus.png",
  },
  {
    id: "lenovo",
    label: "Lenovo",
    href: "/shop?brand=Lenovo",
    icon: "/icons/lenovo.png",
  },
  {
    id: "acer",
    label: "Acer",
    href: "/shop?brand=Acer",
    icon: "/icons/acer.png",
  },
  {
    id: "hp",
    label: "HP",
    href: "/shop?brand=HP",
    icon: "/icons/hp.png",
  },
  {
    id: "dell",
    label: "Dell",
    href: "/shop?brand=Dell",
    icon: "/icons/dell.png",
  },
  {
    id: "razer",
    label: "Razer",
    href: "/shop?brand=Razer",
    icon: "/icons/razer.png",
  },
  {
    id: "msi",
    label: "MSI",
    href: "/shop?brand=MSI",
    icon: "/icons/msi.png",
  },
  {
    id: "logitech",
    label: "Logitech",
    href: "/accessories?brand=Logitech",
    icon: "/icons/mouse.png",
  },
  {
    id: "gigabyte",
    label: "Gigabyte",
    href: "/shop?brand=Gigabyte",
    icon: "/icons/gigabyte.png",
  },
  {
    id: "handheld-gaming-pc",
    label: "Handheld Gaming PC",
    href: "/shop?category=Handheld%20Gaming%20PC",
    hasChevron: true,
    subitems: [
      { name: "ASUS ROG Ally X", href: "/shop?category=Handheld%20Gaming%20PC" },
      { name: "Valve Steam Deck OLED", href: "/shop?category=Handheld%20Gaming%20PC" },
      { name: "Lenovo Legion Go", href: "/shop?category=Handheld%20Gaming%20PC" },
      { name: "MSI Claw A1M", href: "/shop?category=Handheld%20Gaming%20PC" },
      { name: "Handheld Docks & Hubs", href: "/accessories" },
      { name: "Hard-Shell Cases & Grips", href: "/accessories" },
    ],
  },
  {
    id: "desktop",
    label: "Desktop",
    href: "/shop?category=Desktop",
    hasChevron: true,
    // Screenshot 1 exact list:
    subitems: [
      { name: "NUC Mini PCs", href: "/shop?category=Desktop" },
      { name: "All in One PC", href: "/shop?category=Desktop" },
      { name: "Brand PC", href: "/shop?category=Desktop" },
      { name: "Monitor", href: "/accessories?category=Monitor" },
      { name: "Motherboard", href: "/shop" },
      { name: "Graphics Card", href: "/shop" },
      { name: "SSD", href: "/shop" },
      { name: "RAM", href: "/shop" },
      { name: "Keyboards", href: "/accessories?category=Keyboard" },
      { name: "Mouse", href: "/accessories?category=Mouse" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    href: "/accessories",
    hasChevron: true,
    // Screenshot 2 exact list:
    subitems: [
      { name: "Gaming Accessories", href: "/accessories" },
      { name: "Hubs and Docks", href: "/accessories" },
      { name: "Laptop Bags", href: "/accessories?category=bags-sleeves" },
      { name: "Laptop Sleeve", href: "/accessories?category=bags-sleeves" },
      { name: "Laptop Stand", href: "/accessories?category=Laptop%20Stand" },
      { name: "Keyboards", href: "/accessories?category=keyboards-mice" },
      { name: "RAM", href: "/shop" },
      { name: "Mouse", href: "/accessories?category=keyboards-mice" },
      { name: "Portable SSD", href: "/accessories?category=storage" },
      { name: "Router", href: "/accessories?category=routers-networking" },
      { name: "Headphone", href: "/accessories?category=Audio" },
      { name: "Graphics Tablet", href: "/accessories" },
      { name: "Gaming Controller", href: "/accessories" },
    ],
  },
  {
    id: "smartphone",
    label: "SmartPhone",
    href: "/shop?category=SmartPhone",
  },
  {
    id: "smart-band",
    label: "Smart Band",
    href: "/shop?category=Smart%20Band",
  },
  {
    id: "2026-laptops",
    label: "2026 Laptops",
    href: "/shop?tag=2026",
  },
  {
    id: "budget-range",
    label: "Budget Range",
    href: "/shop?category=budget",
  },
];

export const SHOP_CATEGORIES: CategoryItemData[] = rawShopCategories
  .map((item) => ({
    ...item,
    subitems: item.subitems?.filter((s) => isCategoryHrefAvailable(s.href)),
  }))
  .filter((item) => {
    if (item.subitems && item.subitems.length > 0) return true;
    return isCategoryHrefAvailable(item.href);
  });

// ─── Screenshot 4: Apple Dropdown Items ─────────────────────────────────────
export const APPLE_DROPDOWN_ITEMS = [
  { name: "MacBook", href: "/shop?brand=Apple" },
  { name: "Mac Mini", href: "/shop?brand=Apple" },
  { name: "Mac Studio", href: "/shop?brand=Apple" },
  { name: "IMac", href: "/shop?brand=Apple" },
  { name: "IPad", href: "/shop?brand=Apple" },
  { name: "Mac Pro", href: "/shop?brand=Apple" },
  { name: "IPhone", href: "/shop?brand=Apple" },
  { name: "Studio Display", href: "/accessories?category=Monitor" },
  { name: "Apple Watch", href: "/accessories" },
  { name: "Accessories", href: "/accessories" },
];

// ─── Screenshot 5: Gaming Laptops Dropdown Items ────────────────────────────
export const GAMING_LAPTOPS_DROPDOWN_ITEMS = [
  { name: "Asus", href: "/shop?brand=Asus&category=gaming-laptops" },
  { name: "Lenovo", href: "/shop?brand=Lenovo&category=gaming-laptops" },
  { name: "HP", href: "/shop?brand=HP&category=gaming-laptops" },
  { name: "Acer", href: "/shop?brand=Acer&category=gaming-laptops" },
  { name: "Dell", href: "/shop?brand=Dell&category=gaming-laptops" },
  { name: "MSI", href: "/shop?brand=MSI&category=gaming-laptops" },
  { name: "Razer", href: "/shop?brand=Razer&category=gaming-laptops" },
  { name: "Gigabyte", href: "/shop?brand=Gigabyte&category=gaming-laptops" },
  { name: "Handheld Gaming PC", href: "/shop?category=Handheld%20Gaming%20PC" },
];

// ─── Microsoft Dropdown Items ───────────────────────────────────────────────
export const MICROSOFT_DROPDOWN_ITEMS = [
  { name: "Surface Pro", href: "/shop?brand=Microsoft" },
  { name: "Surface Laptop", href: "/shop?brand=Microsoft" },
  { name: "Surface Laptop Studio", href: "/shop?brand=Microsoft" },
  { name: "Surface Go", href: "/shop?brand=Microsoft" },
  { name: "Surface Duo", href: "/shop?brand=Microsoft" },
  { name: "Surface Hub", href: "/shop?brand=Microsoft" },
  { name: "Surface Accessories", href: "/accessories" },
];

// ─── Accessories Dropdown Items ────────────────────────────────────────────
const rawAccessoriesNavItems = [
  { name: "Gaming Accessories", href: "/accessories" },
  { name: "Hubs and Docks", href: "/accessories" },
  { name: "Laptop Bags & Sleeves", href: "/accessories?category=bags-sleeves" },
  { name: "Laptop Stands & Cooling", href: "/accessories?category=Laptop%20Stand" },
  { name: "Keyboards & Mouse", href: "/accessories?category=keyboards-mice" },
  { name: "Fast Chargers & Adapters", href: "/accessories?category=chargers-adapters" },
  { name: "Portable SSD & Storage", href: "/accessories?category=storage" },
  { name: "Headphones & Audio", href: "/accessories?category=Audio" },
  { name: "Monitors & Displays", href: "/accessories?category=Monitor" },
];

export const ACCESSORIES_NAV_ITEMS = rawAccessoriesNavItems.filter((item) =>
  isCategoryHrefAvailable(item.href)
);

// ─── Budget Range Filter Items ─────────────────────────────────────────────
export const BUDGET_RANGE_ITEMS = [
  { name: "Under ৳30,000", href: "/shop?maxPrice=30000" },
  { name: "৳30,000 – ৳50,000", href: "/shop?minPrice=30000&maxPrice=50000" },
  { name: "৳50,000 – ৳80,000", href: "/shop?minPrice=50000&maxPrice=80000" },
  { name: "৳80,000 – ৳120,000", href: "/shop?minPrice=80000&maxPrice=120000" },
  { name: "Above ৳120,000", href: "/shop?minPrice=120000" },
];

// ─── Legacy/Supporting Types ────────────────────────────────────────────────
export type CategorySubGroup = {
  title: string;
  items: CategorySubItem[];
};

export type CategoryItem = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  href: string;
  subgroups: CategorySubGroup[];
  featured?: {
    title: string;
    desc: string;
    img: string;
    href: string;
    badge?: string;
  };
};

export type BrandGridItem = {
  name: string;
  logo: string;
  laptop: string;
  href: string;
  badge: string;
  series: string[];
};

export type LaptopCategoryGroup = {
  title: string;
  items: {
    name: string;
    icon: string;
    href: string;
  }[];
};

export type FeaturedLaptopItem = {
  title: string;
  spec: string;
  img: string;
  href: string;
};

export type AccessorySectionGroup = {
  title: string;
  icon: string;
  items: {
    name: string;
    href: string;
  }[];
};

export type ComponentItem = {
  name: string;
  icon: string;
  href: string;
};

export type SupportItem = {
  label: string;
  href: string;
  icon: string;
};

// ─── All Categories 2-Level Mega Flyout Data ─────────────────────────────────

const rawAllCategoriesWithSubmenus: CategoryItem[] = [
  {
    id: "laptops",
    label: "All Laptops",
    desc: "Gaming, Ultrabooks & Business",
    icon: "/icons/dell-laptops.png",
    href: "/shop",
    subgroups: [
      {
        title: "Top Brands",
        items: [
          { name: "Apple MacBook", href: "/shop?brand=Apple", icon: "/icons/apple.png" },
          { name: "Dell Laptops", href: "/shop?brand=Dell", icon: "/icons/dell.png" },
          { name: "HP Laptops", href: "/shop?brand=HP", icon: "/icons/hp.png" },
          { name: "Lenovo ThinkPad", href: "/shop?brand=Lenovo", icon: "/icons/lenovo.png" },
          { name: "Microsoft Surface", href: "/shop?brand=Microsoft", icon: "/icons/windows.png" },
          { name: "Asus ROG & ZenBook", href: "/shop?brand=Asus", icon: "/icons/asus.png" },
          { name: "MSI Gaming", href: "/shop?brand=MSI", icon: "/icons/msi.png" },
          { name: "Razer Blade", href: "/shop?brand=Razer", icon: "/icons/razer.png" },
        ],
      },
      {
        title: "By Series & Lineup",
        items: [
          { name: "ThinkPad X1 & T-Series", href: "/shop?brand=Lenovo" },
          { name: "Dell XPS & Latitude", href: "/shop?brand=Dell" },
          { name: "HP Spectre & Omen", href: "/shop?brand=HP" },
          { name: "Asus ROG Strix & Zephyrus", href: "/shop?brand=Asus" },
          { name: "MacBook Pro 14\" & 16\"", href: "/shop?brand=Apple" },
          { name: "MacBook Air 13\" & 15\"", href: "/shop?brand=Apple" },
          { name: "Surface Laptop 5 & 6", href: "/shop?brand=Microsoft" },
        ],
      },
      {
        title: "By Usage & Form",
        items: [
          { name: "Dedicated Gaming Laptops", href: "/shop?category=gaming-laptops" },
          { name: "Ultra-Thin Portables", href: "/shop?category=Ultrabook" },
          { name: "Business Workstations", href: "/shop?category=Workstation" },
          { name: "Student & Everyday", href: "/shop?category=budget" },
          { name: "2-in-1 Touch Convertibles", href: "/shop?category=Convertible%202-in-1" },
          { name: "Handheld Gaming Consoles", href: "/shop?category=Handheld%20Gaming%20PC" },
        ],
      },
    ],
    featured: {
      title: "ThinkPad X1 Carbon Gen 12",
      desc: "Intel Core Ultra 7 · 14\" 2.8K OLED · 32GB RAM",
      img: "/icons/lenovo-laptops.png",
      href: "/shop?brand=Lenovo",
      badge: "Enterprise Flagship",
    },
  },
  {
    id: "desktops",
    label: "Desktops & Workstations",
    desc: "Brand PCs, Custom & All-in-One",
    icon: "/icons/pc.png",
    href: "/shop?category=Desktop",
    subgroups: [
      {
        title: "Form Factors",
        items: [
          { name: "High-Performance Gaming PCs", href: "/shop?category=Desktop" },
          { name: "Enterprise Brand PCs", href: "/shop?category=Desktop" },
          { name: "All-in-One Touch PCs", href: "/shop?category=Desktop" },
          { name: "Mini PCs & NUC Units", href: "/shop?category=Desktop" },
          { name: "Certified Creator Workstations", href: "/shop?category=Desktop" },
        ],
      },
      {
        title: "Brand Desktops",
        items: [
          { name: "Apple Mac Studio & Mac mini", href: "/shop?brand=Apple" },
          { name: "Dell OptiPlex & Precision", href: "/shop?brand=Dell" },
          { name: "HP Pavilion & OMEN Desktop", href: "/shop?brand=HP" },
          { name: "Lenovo ThinkCentre Workstations", href: "/shop?brand=Lenovo" },
          { name: "Asus ROG Gaming Towers", href: "/shop?brand=Asus" },
        ],
      },
      {
        title: "Upgrades & Parts",
        items: [
          { name: "High-Bandwidth DDR5 Memory", href: "/shop" },
          { name: "Dedicated GeForce RTX GPUs", href: "/shop" },
          { name: "Liquid AIO CPU Coolers", href: "/shop" },
          { name: "Ultra-Fast NVMe SSD Drives", href: "/shop" },
        ],
      },
    ],
    featured: {
      title: "Apple Mac Studio M2 Max",
      desc: "Compact Powerhouse for 8K Video Editing & 3D Render",
      img: "/icons/mac-studio.png",
      href: "/shop?brand=Apple",
      badge: "Studio Pro",
    },
  },
  {
    id: "apple",
    label: "Apple Mac & Ecosystem",
    desc: "MacBook, Mac mini, Studio & iMac",
    icon: "/icons/imac.png",
    href: "/shop?brand=Apple",
    subgroups: [
      {
        title: "Mac Computers",
        items: [
          { name: "MacBook Pro 14\" & 16\" (M3/M4)", href: "/shop?brand=Apple" },
          { name: "MacBook Air 13\" & 15\" (M2/M3)", href: "/shop?brand=Apple" },
          { name: "Mac mini M2 / M4 Pro", href: "/shop?brand=Apple" },
          { name: "Mac Studio M2 Max / Ultra", href: "/shop?brand=Apple" },
          { name: "iMac 24\" 4.5K Retina Display", href: "/shop?brand=Apple" },
        ],
      },
      {
        title: "Smart Devices",
        items: [
          { name: "iPad Pro M4 & iPad Air M2", href: "/shop?brand=Apple" },
          { name: "iPhone 15 & 16 Pro Max", href: "/shop?brand=Apple" },
          { name: "Apple Watch Ultra & Series 10", href: "/shop?brand=Apple" },
          { name: "AirPods Pro & AirPods Max", href: "/shop?brand=Apple" },
        ],
      },
      {
        title: "Official Accessories",
        items: [
          { name: "Magic Keyboard with Touch ID", href: "/accessories" },
          { name: "Magic Mouse & Magic Trackpad", href: "/accessories" },
          { name: "Apple Studio Display 27\" 5K", href: "/accessories?category=Monitor" },
          { name: "Thunderbolt 4 Pro Cables", href: "/accessories" },
        ],
      },
    ],
    featured: {
      title: "MacBook Pro 16\" M3 Max",
      desc: "Liquid Retina XDR · 36GB Unified Memory · Space Black",
      img: "/icons/macbook-pro.png",
      href: "/shop?brand=Apple",
      badge: "Top Choice",
    },
  },
  {
    id: "monitors",
    label: "Monitors & Displays",
    desc: "4K, UltraWide & Gaming Panels",
    icon: "/icons/monitor.png",
    href: "/accessories?category=Monitor",
    subgroups: [
      {
        title: "By Resolution & Panel",
        items: [
          { name: "4K UHD Ultra-Sharp Displays", href: "/accessories?category=Monitor" },
          { name: "2K QHD 165Hz–240Hz Gaming", href: "/accessories?category=Monitor" },
          { name: "34\"–49\" UltraWide Curved Panels", href: "/accessories?category=Monitor" },
          { name: "OLED & Mini-LED HDR Panels", href: "/accessories?category=Monitor" },
          { name: "Full HD 1080p Essential Monitors", href: "/accessories?category=Monitor" },
        ],
      },
      {
        title: "By Use Case",
        items: [
          { name: "Esports High-Refresh Displays", href: "/accessories?category=Monitor" },
          { name: "Color-Accurate Creator Panels", href: "/accessories?category=Monitor" },
          { name: "Dual-Monitor USB-C Dock Setups", href: "/accessories?category=Monitor" },
          { name: "Ergonomic Height-Adjustable Pivot", href: "/accessories?category=Monitor" },
        ],
      },
      {
        title: "Top Brands",
        items: [
          { name: "Dell UltraSharp Series", href: "/accessories?category=Monitor" },
          { name: "LG UltraGear Gaming", href: "/accessories?category=Monitor" },
          { name: "ASUS ROG & ProArt Displays", href: "/accessories?category=Monitor" },
          { name: "Samsung Odyssey Curved", href: "/accessories?category=Monitor" },
        ],
      },
    ],
    featured: {
      title: "Dell UltraSharp 32\" 4K Hub",
      desc: "IPS Black Technology · 90W USB-C Power Delivery",
      img: "/icons/monitor.png",
      href: "/accessories?category=Monitor",
      badge: "4K HDR",
    },
  },
  {
    id: "handhelds",
    label: "Handheld Gaming PCs",
    desc: "Steam Deck, ROG Ally, Legion Go",
    icon: "/icons/computer-game.png",
    href: "/shop?category=Handheld%20Gaming%20PC",
    subgroups: [
      {
        title: "Flagship Consoles",
        items: [
          { name: "ASUS ROG Ally X (Z1 Extreme)", href: "/shop?category=Handheld%20Gaming%20PC" },
          { name: "Valve Steam Deck OLED", href: "/shop?category=Handheld%20Gaming%20PC" },
          { name: "Lenovo Legion Go 8.8\" 144Hz", href: "/shop?category=Handheld%20Gaming%20PC" },
          { name: "MSI Claw A1M Handheld", href: "/shop?category=Handheld%20Gaming%20PC" },
          { name: "Ayaneo & GPD Win Consoles", href: "/shop?category=Handheld%20Gaming%20PC" },
        ],
      },
      {
        title: "Essential Upgrades",
        items: [
          { name: "Multi-Port Handheld Docks with HDMI", href: "/accessories" },
          { name: "2230 M.2 NVMe SSD 1TB/2TB", href: "/shop" },
          { name: "High-Speed A2 MicroSD Cards", href: "/accessories" },
          { name: "Hard-Shell Protective Cases", href: "/accessories" },
        ],
      },
      {
        title: "Controls & Power",
        items: [
          { name: "Wireless Bluetooth Gamepads", href: "/accessories" },
          { name: "65W–100W High-Capacity Power Banks", href: "/accessories" },
          { name: "Tempered Glass Screen Protectors", href: "/accessories" },
          { name: "Silicone Ergonomic Grips", href: "/accessories" },
        ],
      },
    ],
    featured: {
      title: "ASUS ROG Ally X Gaming",
      desc: "AMD Ryzen Z1 Extreme · 24GB LPDDR5X · 1TB SSD · 80Wh",
      img: "/icons/computer-game.png",
      href: "/shop?category=Handheld%20Gaming%20PC",
      badge: "Hot Deal",
    },
  },
  {
    id: "keyboards-mice",
    label: "Keyboards & Mice",
    desc: "Mechanical, Wireless & Ergonomic",
    icon: "/icons/mouse.png",
    href: "/accessories?category=Keyboard",
    subgroups: [
      {
        title: "Keyboards",
        items: [
          { name: "Custom Hot-Swap Mechanical", href: "/accessories?category=Keyboard" },
          { name: "Low-Profile Wireless Keyboards", href: "/accessories?category=Keyboard" },
          { name: "RGB Esports Gaming Keyboards", href: "/accessories?category=Keyboard" },
          { name: "Ergonomic Split Work Keyboards", href: "/accessories?category=Keyboard" },
          { name: "Compact 60% & 75% Layouts", href: "/accessories?category=Keyboard" },
        ],
      },
      {
        title: "Mice & Pointing",
        items: [
          { name: "Ultralight Wireless Gaming Mice", href: "/accessories?category=Mouse" },
          { name: "Precision Productivity Mice", href: "/accessories?category=Mouse" },
          { name: "Ergonomic Vertical Mice", href: "/accessories?category=Mouse" },
          { name: "Precision Wireless Trackpads", href: "/accessories?category=Mouse" },
        ],
      },
      {
        title: "Top Peripherals Brands",
        items: [
          { name: "Logitech MX Master & G Series", href: "/accessories?category=Mouse" },
          { name: "Razer Optical Gaming Gear", href: "/accessories?category=Keyboard" },
          { name: "Keychron Mechanical Keyboards", href: "/accessories?category=Keyboard" },
          { name: "Custom PBT Keycaps & Desk Mats", href: "/accessories" },
        ],
      },
    ],
    featured: {
      title: "Logitech MX Master 3S Wireless",
      desc: "8K DPI Any-Surface Tracking · Quiet Clicks · MagSpeed Scroll",
      img: "/icons/mouse.png",
      href: "/accessories?category=Mouse",
      badge: "Editor's Pick",
    },
  },
  {
    id: "accessories",
    label: "Computer Accessories",
    desc: "Docks, Chargers, Hubs & Stands",
    icon: "/icons/computer-accessories.png",
    href: "/accessories",
    subgroups: [
      {
        title: "Laptop Essentials",
        items: [
          { name: "Waterproof Laptop Backpacks", href: "/accessories?category=Laptop%20Bag" },
          { name: "Premium Leather & Neoprene Sleeves", href: "/accessories?category=Laptop%20Bag" },
          { name: "Adjustable Aluminum Stands", href: "/accessories?category=Laptop%20Stand" },
          { name: "Quiet High-Flow Cooling Pads", href: "/accessories?category=Cooling%20Pad" },
          { name: "Protective Body Skins & Covers", href: "/accessories?category=Laptop%20Skin" },
        ],
      },
      {
        title: "Power & Docks",
        items: [
          { name: "Thunderbolt 4 Dual-Display Docks", href: "/accessories" },
          { name: "65W–140W GaN Fast Chargers", href: "/accessories?category=Charger%20%26%20Adapter" },
          { name: "Multi-Port USB-C Hubs (10-in-1)", href: "/accessories" },
          { name: "Universal Replacement Laptop Power", href: "/accessories?category=Charger%20%26%20Adapter" },
        ],
      },
      {
        title: "Audio & Webcams",
        items: [
          { name: "4K HDR Streaming Webcams", href: "/accessories?category=Webcam" },
          { name: "Noise-Cancelling Headsets", href: "/accessories?category=Audio" },
          { name: "Cardioid Studio USB Mics", href: "/accessories?category=Audio" },
          { name: "Bluetooth Desktop Soundbars", href: "/accessories?category=Audio" },
        ],
      },
    ],
    featured: {
      title: "Thunderbolt 4 Pro Dock Station",
      desc: "Dual 4K @ 60Hz Support · 100W PD Output · 11 Expansion Ports",
      img: "/icons/computer-accessories.png",
      href: "/accessories",
      badge: "Pro Dock",
    },
  },
  {
    id: "components",
    label: "Components & Upgrades",
    desc: "RAM, NVMe SSD, GPUs & Boards",
    icon: "/icons/accessories.png",
    href: "/shop",
    subgroups: [
      {
        title: "Memory & Storage",
        items: [
          { name: "DDR4 & DDR5 Laptop / Desktop RAM", href: "/shop" },
          { name: "Gen4 & Gen5 NVMe M.2 SSDs", href: "/shop" },
          { name: "High-Capacity SATA SSDs & HDDs", href: "/shop" },
          { name: "External Rugged Portable SSDs", href: "/accessories" },
        ],
      },
      {
        title: "Core Processors & GPUs",
        items: [
          { name: "GeForce RTX 40-Series Dedicated GPUs", href: "/shop" },
          { name: "Intel Core 14th Gen & Core Ultra CPUs", href: "/shop" },
          { name: "AMD Ryzen 7000 & 9000 Series", href: "/shop" },
        ],
      },
      {
        title: "Motherboards & Cooling",
        items: [
          { name: "Intel Z790 / B760 Gaming Motherboards", href: "/shop" },
          { name: "AMD AM5 X670 / B650 Motherboards", href: "/shop" },
          { name: "Liquid 240mm / 360mm AIO Coolers", href: "/shop" },
          { name: "Modular 80+ Gold Power Supplies", href: "/shop" },
        ],
      },
    ],
    featured: {
      title: "Samsung 990 PRO 2TB NVMe M.2",
      desc: "7,450 MB/s Read Speed with Custom Heat-sink Shield",
      img: "/icons/pc.png",
      href: "/shop",
      badge: "Speed King",
    },
  },
];

export const ALL_CATEGORIES_WITH_SUBMENUS: CategoryItem[] = rawAllCategoriesWithSubmenus
  .map((cat) => ({
    ...cat,
    subgroups: cat.subgroups
      .map((sg) => ({
        ...sg,
        items: sg.items.filter((item) => isCategoryHrefAvailable(item.href)),
      }))
      .filter((sg) => sg.items.length > 0),
  }))
  .filter((cat) => {
    if (cat.subgroups.length > 0) return true;
    return isCategoryHrefAvailable(cat.href);
  });

// ─── Header Search Categories ────────────────────────────────────────────────

export const SEARCH_CATEGORIES = [
  "All Categories",
  "Laptops",
  "Accessories",
  "Components",
  "Monitors",
  "Gaming Handhelds",
];

// ─── Horizontal Nav Items ────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { key: "brands", label: "Brands" },
  { key: "laptops", label: "Laptops" },
  { key: "accessories", label: "Accessories" },
  { key: "components", label: "Components" },
  { key: "deals", label: "Deals / Offers", accent: true },
  { key: "support", label: "Support" },
];

// ─── Brands Grid Data ─────────────────────────────────────────────────────────

export const BRANDS_GRID: BrandGridItem[] = [
  {
    name: "Dell",
    logo: "/icons/dell.png",
    laptop: "/icons/dell-laptops.png",
    href: "/shop?brand=Dell",
    badge: "Popular",
    series: ["XPS", "Alienware", "Latitude", "Inspiron"],
  },
  {
    name: "HP",
    logo: "/icons/hp.png",
    laptop: "/icons/hp-laptops.png",
    href: "/shop?brand=HP",
    badge: "Top Rated",
    series: ["Spectre", "Omen", "Victus", "EliteBook"],
  },
  {
    name: "Lenovo",
    logo: "/icons/lenovo.png",
    laptop: "/icons/lenovo-laptops.png",
    href: "/shop?brand=Lenovo",
    badge: "Enterprise",
    series: ["ThinkPad", "Legion", "Yoga", "IdeaPad"],
  },
  {
    name: "Apple",
    logo: "/icons/apple.png",
    laptop: "/icons/macbook-pro.png",
    href: "/shop?brand=Apple",
    badge: "Flagship",
    series: ["MacBook Pro", "MacBook Air", "Mac Studio", "iMac"],
  },
  {
    name: "Microsoft",
    logo: "/icons/windows.png",
    laptop: "/icons/microsoft-laptops.png",
    href: "/shop?brand=Microsoft",
    badge: "Touch",
    series: ["Surface Pro", "Surface Laptop", "Surface Studio"],
  },
  {
    name: "Asus",
    logo: "/icons/asus.png",
    laptop: "/icons/asus-laptops.png",
    href: "/shop?brand=Asus",
    badge: "Gaming",
    series: ["ROG Strix", "Zephyrus", "TUF Gaming", "ZenBook"],
  },
  {
    name: "Acer",
    logo: "/icons/acer.png",
    laptop: "/icons/acer-laptops.png",
    href: "/shop?brand=Acer",
    badge: "Value",
    series: ["Predator", "Nitro", "Swift", "Aspire"],
  },
  {
    name: "MSI",
    logo: "/icons/msi.png",
    laptop: "/icons/msi-laptops.png",
    href: "/shop?brand=MSI",
    badge: "Extreme",
    series: ["Titan", "Raider", "Stealth", "Cyborg"],
  },
  {
    name: "Razer",
    logo: "/icons/razer.png",
    laptop: "/icons/razer-laptops.png",
    href: "/shop?brand=Razer",
    badge: "Luxury",
    series: ["Blade 14", "Blade 16", "Blade 18"],
  },
  {
    name: "Gigabyte",
    logo: "/icons/gigabyte.png",
    laptop: "/icons/computer-game.png",
    href: "/shop?brand=Gigabyte",
    badge: "Creator",
    series: ["AORUS", "AERO", "G-Series"],
  },
];

// ─── Laptops Dropdown Data ───────────────────────────────────────────────────

const rawLaptopCategories: LaptopCategoryGroup[] = [
  {
    title: "Flagship Brands",
    items: [
      { name: "Apple MacBook", icon: "/icons/apple.png", href: "/shop?brand=Apple" },
      { name: "Dell Laptops", icon: "/icons/dell.png", href: "/shop?brand=Dell" },
      { name: "HP Laptops", icon: "/icons/hp.png", href: "/shop?brand=HP" },
      { name: "Lenovo ThinkPad", icon: "/icons/lenovo.png", href: "/shop?brand=Lenovo" },
      { name: "Microsoft Surface", icon: "/icons/windows.png", href: "/shop?brand=Microsoft" },
      { name: "Asus ROG & ZenBook", icon: "/icons/asus.png", href: "/shop?brand=Asus" },
      { name: "MSI Gaming Laptops", icon: "/icons/msi.png", href: "/shop?brand=MSI" },
      { name: "Razer Blade", icon: "/icons/razer.png", href: "/shop?brand=Razer" },
    ],
  },
  {
    title: "By Form & Usage",
    items: [
      { name: "Gaming Laptops", icon: "/icons/computer-game.png", href: "/shop?category=gaming-laptops" },
      { name: "Ultra-Thin & Portables", icon: "/icons/macbook-air.png", href: "/shop?category=Ultrabook" },
      { name: "Business & Workstations", icon: "/icons/dell-laptops.png", href: "/shop?category=Workstation" },
      { name: "Student & Budget", icon: "/icons/hp-laptops.png", href: "/shop?category=budget" },
      { name: "Handheld Gaming PCs", icon: "/icons/computer-game.png", href: "/shop?category=Handheld%20Gaming%20PC" },
      { name: "Desktop & All-in-One", icon: "/icons/pc.png", href: "/shop?category=Desktop" },
    ],
  },
];

export const LAPTOP_CATEGORIES: LaptopCategoryGroup[] = rawLaptopCategories
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => isCategoryHrefAvailable(item.href)),
  }))
  .filter((group) => group.items.length > 0);

export const FEATURED_LAPTOPS: FeaturedLaptopItem[] = [
  {
    title: "MacBook Pro M3 Max",
    spec: "Liquid Retina XDR · Sub-16hr Battery",
    img: "/icons/macbook-pro.png",
    href: "/shop?brand=Apple",
  },
  {
    title: "Dell XPS 16 OLED",
    spec: "Intel Core Ultra 9 · CNC Aluminum",
    img: "/icons/dell-laptops.png",
    href: "/shop?brand=Dell",
  },
  {
    title: "ThinkPad X1 Carbon Gen 12",
    spec: "Ultra-lightweight · MIL-SPEC Tested",
    img: "/icons/lenovo-laptops.png",
    href: "/shop?brand=Lenovo",
  },
  {
    title: "Asus ROG Zephyrus G16",
    spec: "RTX 4090 · 240Hz Nebula Display",
    img: "/icons/asus-laptops.png",
    href: "/shop?brand=Asus",
  },
];

// ─── Accessories Dropdown Data ───────────────────────────────────────────────

const rawAccessoriesSections: AccessorySectionGroup[] = [
  {
    title: "For Laptop",
    icon: "/icons/accessories.png",
    items: [
      { name: "Laptop Bags & Sleeves", href: "/accessories?category=bags-sleeves" },
      { name: "Fast Chargers & Power Adapters", href: "/accessories?category=chargers-adapters" },
      { name: "Cooling Pads & Fan Stands", href: "/accessories?category=Cooling%20Pad" },
      { name: "Ergonomic Aluminum Stands", href: "/accessories?category=Laptop%20Stand" },
      { name: "Protective Skins & Covers", href: "/accessories?category=Laptop%20Skin" },
    ],
  },
  {
    title: "For Desktop & Workspace",
    icon: "/icons/computer-accessories.png",
    items: [
      { name: "Mechanical & Wireless Keyboards", href: "/accessories?category=keyboards-mice" },
      { name: "Precision Gaming & Office Mice", href: "/accessories?category=keyboards-mice" },
      { name: "4K UHD & Studio Monitors", href: "/accessories?category=Monitor" },
      { name: "Streaming Webcams & Microphones", href: "/accessories?category=Webcam" },
      { name: "High-Fidelity Audio & Headsets", href: "/accessories?category=Audio" },
    ],
  },
  {
    title: "Storage & Expansion",
    icon: "/icons/pc.png",
    items: [
      { name: "Thunderbolt 4 & USB-C Docks", href: "/accessories" },
      { name: "External High-Speed SSDs", href: "/accessories" },
      { name: "Flash Drives & Memory Cards", href: "/accessories" },
      { name: "High-Bandwidth Display Cables", href: "/accessories" },
    ],
  },
];

export const ACCESSORIES_SECTIONS: AccessorySectionGroup[] = rawAccessoriesSections
  .map((sec) => ({
    ...sec,
    items: sec.items.filter((item) => isCategoryHrefAvailable(item.href)),
  }))
  .filter((sec) => sec.items.length > 0);

// ─── Components Data ─────────────────────────────────────────────────────────

export const COMPONENTS_LIST: ComponentItem[] = [
  { name: "High-Speed DDR4 / DDR5 RAM", icon: "/icons/computer-accessories.png", href: "/shop" },
  { name: "NVMe M.2 & SATA SSD / HDD", icon: "/icons/accessories.png", href: "/shop" },
  { name: "Dedicated Gaming Graphics Cards", icon: "/icons/computer-game.png", href: "/shop" },
  { name: "Intel & AMD Processors", icon: "/icons/pc.png", href: "/shop" },
  { name: "Performance Motherboards", icon: "/icons/computer-accessories.png", href: "/shop" },
  { name: "Liquid & Air Cooling Solutions", icon: "/icons/computer-accessories.png", href: "/shop" },
];

// ─── Support Data ────────────────────────────────────────────────────────────

export const SUPPORT_MENU: SupportItem[] = [
  { label: "Warranty & Return Policy", href: "/returns", icon: "/icons/accessories.png" },
  { label: "Official Service Center", href: "/contact", icon: "/icons/pc.png" },
  { label: "Contact Us About Your Order", href: "/contact", icon: "/icons/computer-accessories.png" },
  { label: "Direct Customer Helpline", href: "/contact", icon: "/icons/computer-game.png" },
];

// ─── Announcements ───────────────────────────────────────────────────────────

export const ANNOUNCEMENTS: string[] = [
  "🚚  Free Express Delivery Inside Dhaka on orders above ৳5,000",
  "📞  Direct Hotline: +880 1830-515157 | Open Daily 10am–8pm",
  "🛡️  Full Warranty & Replacement Guarantee on All Products",
  "✉️  info@laptoppointbd.com | Mirpur-10, Dhaka",
];

// ─── Shared Catalog Helper ───────────────────────────────────────────────────



export const ACCESSORY_CATEGORIES = [
  "Laptop Bag",
  "Charger & Adapter",
  "Cooling Pad",
  "Laptop Stand",
  "Laptop Skin",
  "Keyboard",
  "Mouse",
  "Monitor",
  "Webcam",
  "Audio",
  "Networking",
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
