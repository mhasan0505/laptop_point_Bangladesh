interface ProductMetaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  brand: string;
  rating?: number;
  reviewCount?: number;
  availability?: "InStock" | "OutOfStock";
  condition?: "NewCondition" | "RefurbishedCondition" | "UsedCondition";
  url: string;
}

export const ProductSchemaMeta: React.FC<ProductMetaProps> = ({
  name,
  description,
  image,
  price,
  currency = "BDT",
  brand,
  rating,
  reviewCount = 0,
  availability = "InStock",
  condition = "RefurbishedCondition",
  url,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: image,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url: url,
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "Laptop Point Bangladesh",
        url: "https://laptoppointbd.com",
      },
    },
    ...(condition && {
      condition: `https://schema.org/${condition}`,
    }),
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
      },
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ProductSchemaMeta;
