// Comprehensive SEO Schema Markup for Bangladesh E-Commerce Site

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Store"],
  "@id": "https://laptoppointbd.com/#organization",
  name: "Laptop Point BD",
  url: "https://laptoppointbd.com",
  logo: "https://laptoppointbd.com/icons/logo.png",
  description:
    "Showroom and retailer of certified refurbished, pre-owned and new laptops in Mirpur-10, Dhaka-1216, Bangladesh.",
  image: "https://laptoppointbd.com/icons/logo.png",
  telephone: "+880 1612-182408",
  email: "info@laptoppointbd.com",
  areaServed: {
    "@type": "Country",
    name: "BD",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Madbar Mansion, Shop-08, Mirpur-10",
    addressLocality: "Dhaka",
    postalCode: "1216",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+880 1612-182408",
    availableLanguage: ["en", "bn"],
    areaServed: "BD",
  },
  sameAs: [
    "https://www.facebook.com/laptoppointbd",
    "https://www.instagram.com/laptop_point.bd/",
    "https://www.tiktok.com/@laptop.point.bd",
    "https://www.youtube.com/@LaptopPointBD",
  ],
  priceRange: "৳ ৳ ৳",
};

export const productSchema = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  brand: string;
  rating?: number;
  reviewCount?: number;
  availability?: "InStock" | "OutOfStock";
  condition?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.image,
  brand: {
    "@type": "Brand",
    name: product.brand,
  },
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: product.currency || "BDT",
    availability: `https://schema.org/${product.availability || "InStock"}`,
    url: "https://laptoppointbd.com",
  },
  ...(product.condition && {
    condition: `https://schema.org/${product.condition}`,
  }),
  ...(product.rating && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
    },
  }),
});

export const faqSchema = (
  faqs: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const breadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Store"],
  "@id": "https://laptoppointbd.com/#organization",
  name: "Laptop Point BD",
  url: "https://laptoppointbd.com",
  image: "https://laptoppointbd.com/icons/logo.png",
  logo: "https://laptoppointbd.com/icons/logo.png",
  description:
    "Showroom and retailer of certified refurbished, pre-owned and new laptops in Mirpur-10, Dhaka-1216, Bangladesh.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
    addressLocality: "Dhaka",
    postalCode: "1216",
    streetAddress: "Madbar Mansion, Shop-08, Mirpur-10",
  },
  telephone: "+880 1612-182408",
  priceRange: "৳ ৳ ৳",
  sameAs: [
    "https://www.facebook.com/laptoppointbd",
    "https://www.instagram.com/laptop_point.bd/",
    "https://www.tiktok.com/@laptop.point.bd",
    "https://www.youtube.com/@LaptopPointBD",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "21:00",
    },
  ],
};

export const articleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    "@type": "Organization",
    name: article.author || "Laptop Point Bangladesh",
  },
  publisher: {
    "@type": "Organization",
    name: "Laptop Point Bangladesh",
    logo: {
      "@type": "ImageObject",
      url: "https://laptoppointbd.com/logo.png",
    },
  },
});

export const eCommerceSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Used Laptops in Bangladesh",
  url: "https://laptoppointbd.com",
  description:
    "Shop the best collection of used laptops from top brands like HP, Dell, Lenovo, and Microsoft in Bangladesh.",
};
