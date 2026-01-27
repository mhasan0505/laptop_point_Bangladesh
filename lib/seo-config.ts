// SEO Configuration for Bangladesh Market

export const SEO_CONFIG = {
  // Primary Keywords for Bangladesh
  keywords: {
    primary: [
      "used laptop Bangladesh",
      "used laptop Dhaka",
      "second hand laptop price",
      "HP EliteBook price Bangladesh",
      "Dell Latitude Bangladesh",
      "Lenovo ThinkPad price BD",
      "Microsoft Surface used",
      "laptop price Bangladesh",
      "buy laptop Dhaka",
      "original laptop Bangladesh",
    ],
    secondary: [
      "gaming laptop Bangladesh",
      "budget laptop Dhaka",
      "student laptop price",
      "office laptop Bangladesh",
      "laptop with warranty Dhaka",
      "certified laptop Bangladesh",
      "laptop warranty Bangladesh",
      "best laptop price BD",
      "laptop deals Bangladesh",
      "laptop discount Dhaka",
    ],
    longtail: [
      "best used laptop under 50000 Bangladesh",
      "where to buy used laptop in Dhaka",
      "HP laptop price in Bangladesh today",
      "Dell laptop used warranty",
      "Lenovo laptop with guarantee Dhaka",
      "original vs used laptop",
      "how to buy safe used laptop Bangladesh",
      "laptop warranty period Bangladesh",
      "laptop return policy Dhaka",
    ],
  },

  // Content Strategy
  contentTopics: [
    {
      title: "Best Used Laptops Under 50,000 BDT in Bangladesh",
      slug: "best-laptops-under-50000-bdt",
      keywords: [
        "laptop under 50000",
        "budget laptop Bangladesh",
        "affordable laptop",
      ],
    },
    {
      title: "Complete Guide to Buying Used Laptops in Bangladesh",
      slug: "guide-buying-used-laptops-bangladesh",
      keywords: [
        "how to buy used laptop",
        "safe laptop purchase",
        "laptop tips Bangladesh",
      ],
    },
    {
      title: "HP vs Dell vs Lenovo: Which Laptop to Choose",
      slug: "hp-dell-lenovo-comparison",
      keywords: [
        "laptop comparison",
        "best laptop brand",
        "laptop comparison Bangladesh",
      ],
    },
    {
      title: "Laptop Specifications Guide for Students & Professionals",
      slug: "laptop-specs-guide",
      keywords: [
        "laptop specifications",
        "RAM",
        "processor",
        "SSD",
        "laptop guide",
      ],
    },
    {
      title: "New vs Used Laptops: What You Need to Know",
      slug: "new-vs-used-laptops",
      keywords: ["new laptop", "used laptop", "difference"],
    },
    {
      title: "Gaming Laptops in Bangladesh: Price & Performance Guide",
      slug: "gaming-laptop-bangladesh",
      keywords: ["gaming laptop", "high performance laptop", "gaming specs"],
    },
    {
      title: "Best Laptops for Video Editing & Content Creation",
      slug: "laptops-video-editing",
      keywords: ["video editing laptop", "content creation", "rendering"],
    },
    {
      title: "Laptop Warranty & After-Sales Service in Bangladesh",
      slug: "laptop-warranty-guide",
      keywords: ["warranty", "after-sales service", "extended warranty"],
    },
  ],

  // Local Optimization for Bangladesh Districts
  locations: [
    "Dhaka",
    "Chittagong",
    "Sylhet",
    "Khulna",
    "Rajshahi",
    "Mymensingh",
    "Barisal",
    "Rangpur",
  ],

  // Meta Tags Configuration
  metaTags: {
    defaultTitle: "Laptop Point Bangladesh | Premium Used Laptops",
    defaultDescription:
      "Best source for premium used laptops in Bangladesh. HP, Dell, Lenovo, Microsoft Surface at unbeatable prices. Official warranty & free delivery.",
    twitterHandle: "@laptoppointbd",
    facebookPage: "https://www.facebook.com/laptoppointbd",
    instagramProfile: "https://www.instagram.com/laptoppointbd",
  },

  // Open Graph Images for Different Pages
  ogImages: {
    homepage: "https://laptoppointbd.com/og-image.jpg",
    shop: "https://laptoppointbd.com/og-shop.jpg",
    blog: "https://laptoppointbd.com/og-blog.jpg",
    product: "https://laptoppointbd.com/og-product.jpg",
  },

  // Link Building Targets
  linkBuildingTargets: [
    {
      site: "TechLaunch BD",
      category: "Tech News",
      url: "https://techlaunch.com.bd",
    },
    {
      site: "Gadget Masters",
      category: "Tech Reviews",
      url: "https://gadgetmasters.com.bd",
    },
    {
      site: "Digital Trends BD",
      category: "Tech Updates",
      url: "https://digitaltrendsbd.com",
    },
    {
      site: "Tech Blog Bangladesh",
      category: "Tutorials",
      url: "https://techblogbd.com",
    },
    {
      site: "YouTube Tech Channels",
      category: "Video Reviews",
      url: "https://youtube.com",
    },
  ],

  // Sitemap Configuration
  sitemapConfig: {
    defaultChangefreq: "daily",
    productChangefreq: "weekly",
    blogChangefreq: "daily",
    defaultPriority: "0.8",
    productPriority: "0.9",
    blogPriority: "0.7",
  },

  // Performance Targets (Core Web Vitals)
  performance: {
    targetLCP: 2.5, // Largest Contentful Paint (seconds)
    targetFID: 100, // First Input Delay (milliseconds)
    targetCLS: 0.1, // Cumulative Layout Shift
  },

  // Local Business Structured Data
  businessInfo: {
    name: "Laptop Point Bangladesh",
    phone: "+8801612182408",
    email: "info@laptoppoint.bd",
    address: "Dhaka, Bangladesh",
    country: "BD",
    currency: "BDT",
    priceRange: "৳20,000 - ৳150,000",
    businessHours: {
      monday: "09:00-21:00",
      tuesday: "09:00-21:00",
      wednesday: "09:00-21:00",
      thursday: "09:00-21:00",
      friday: "09:00-21:00",
      saturday: "09:00-21:00",
      sunday: "10:00-20:00",
    },
  },

  // Internal Linking Strategy
  internalLinking: {
    homepage: [
      { text: "Shop Laptops", url: "/shop" },
      { text: "Blog", url: "/blog" },
      { text: "Contact Us", url: "/contact" },
    ],
    productPage: [
      { text: "Similar Laptops", url: "/shop" },
      { text: "Comparison", url: "/compare" },
      { text: "Related Blog Posts", url: "/blog" },
    ],
    blogPage: [
      { text: "Read More Guides", url: "/blog" },
      { text: "Shop Related Products", url: "/shop" },
      { text: "Contact Support", url: "/contact" },
    ],
  },
};

// Image Optimization Configuration
export const imageOptimization = {
  formats: ["image/avif", "image/webp", "image/png"],
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xlarge: 2400,
  },
  altTextGuidelines: {
    product: "Brand Model Year - Used Laptop Price in Bangladesh",
    hero: "Premium Used & New Laptops - Laptop Point Bangladesh",
    category: "Used Laptop Category - Best Prices in Dhaka",
  },
};

// Mobile-First Configuration (Already implemented)
export const mobileOptimization = {
  viewportMeta: "width=device-width, initial-scale=1",
  maxPadding: "pb-20 lg:pb-0",
  mobileBarHeight: "h-16",
  touchTargetSize: "min-h-12 min-w-12",
};
