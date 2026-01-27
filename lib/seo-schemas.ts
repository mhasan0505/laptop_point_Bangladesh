// Comprehensive SEO Schema Markup for Bangladesh E-Commerce Site

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://laptoppointbd.com/#organization",
  name: "Laptop Point Bangladesh",
  url: "https://laptoppointbd.com",
  logo: "https://laptoppointbd.com/logo.png",
  description:
    "Premium used laptops in Bangladesh with warranty and free delivery",
  image: "https://laptoppointbd.com/og-image.jpg",
  telephone: "+8801612182408",
  email: "info@laptoppoint.bd",
  areaServed: {
    "@type": "Country",
    name: "BD",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dhaka, Bangladesh",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+8801612182408",
    availableLanguage: ["en", "bn"],
    areaServed: "BD",
  },
  sameAs: [
    "https://www.facebook.com/laptoppointbd",
    "https://www.instagram.com/laptoppointbd",
    "https://www.whatsapp.com/catalog/8801612182408",
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
  "@type": "LocalBusiness",
  name: "Laptop Point Bangladesh",
  image: "https://laptoppointbd.com/og-image.jpg",
  description:
    "Best source for premium used laptops in Bangladesh. HP, Dell, Lenovo, Microsoft Surface at unbeatable prices.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
    addressLocality: "Dhaka",
    streetAddress: "Dhaka, Bangladesh",
  },
  telephone: "+8801612182408",
  priceRange: "৳20000 - ৳150000",
  sameAs: [
    "https://www.facebook.com/laptoppointbd",
    "https://www.instagram.com/laptoppointbd",
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
      ],
      opens: "09:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "10:00",
      closes: "20:00",
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
