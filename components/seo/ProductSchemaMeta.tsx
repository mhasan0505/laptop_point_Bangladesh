import React from "react";
import { Product } from "@/types/product";
import { generateProductSummary } from "@/lib/product-summary";
import { RETURN_POLICY_CONFIG } from "@/lib/return-policy-config";
import { parseYoutubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";

export interface ProductSchemaMetaProps {
  product?: Product;
  name?: string;
  description?: string;
  image?: string | string[];
  price?: number;
  currency?: string;
  brand?: string;
  availability?: "InStock" | "OutOfStock";
  url?: string;
  sku?: string;
  condition?: string;
  youtubeUrl?: string;
  updatedAt?: string | Date;
}

export const ProductSchemaMeta: React.FC<ProductSchemaMetaProps> = ({
  product,
  name: propName,
  description: propDescription,
  image: propImage,
  price: propPrice,
  currency = "BDT",
  brand: propBrand,
  availability: propAvailability,
  url: propUrl,
  sku: propSku,
  condition: propCondition,
  youtubeUrl: propYoutubeUrl,
  updatedAt: propUpdatedAt,
}) => {
  const name = propName || product?.name || "";
  const sku = propSku || product?.sku || (product ? String(product.id) : "");
  const brandName = propBrand || product?.brand || "Laptop Point BD";

  // Description: Deterministic factual summary from helper or fallback
  const description =
    propDescription ||
    (product ? generateProductSummary(product) : "");

  // Absolute product URL
  const baseUrl = "https://laptoppointbd.com";
  const productUrl =
    propUrl || (product ? `${baseUrl}/product/${product.slug}` : baseUrl);

  // Images: Array of absolute URLs
  const rawImages: string[] = [];
  if (propImage) {
    if (Array.isArray(propImage)) {
      rawImages.push(...propImage);
    } else {
      rawImages.push(propImage);
    }
  } else if (product?.images && product.images.length > 0) {
    rawImages.push(
      ...product.images.map((img) =>
        typeof img === "string" ? img : img.src
      )
    );
  } else if (product?.image) {
    rawImages.push(
      typeof product.image === "string" ? product.image : product.image.src
    );
  }

  const absoluteImages = rawImages.map((img) => {
    const trimmed = img.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `${baseUrl}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  });

  const finalImages =
    absoluteImages.length > 0
      ? absoluteImages
      : [`${baseUrl}/icons/logo.png`];

  const price = propPrice ?? product?.price ?? 0;
  const inStock =
    propAvailability === "InStock"
      ? true
      : propAvailability === "OutOfStock"
      ? false
      : product
      ? product.inStock !== false &&
        (product.stockQty === undefined || product.stockQty > 0)
      : true;

  // Merchant Return Policy wired directly from shared config
  const merchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: RETURN_POLICY_CONFIG.applicableCountry,
    returnPolicyCategory: RETURN_POLICY_CONFIG.returnPolicyCategory,
    merchantReturnDays: RETURN_POLICY_CONFIG.merchantReturnDays,
    returnMethod: [...RETURN_POLICY_CONFIG.returnMethod],
    returnFees: RETURN_POLICY_CONFIG.returnFees,
    refundType: RETURN_POLICY_CONFIG.refundType,
  };

  const rawCondition =
    propCondition ||
    (Array.isArray(product?.condition) ? product.condition[0] : (product as unknown as { condition?: string })?.condition);

  const itemCondition =
    rawCondition === "New"
      ? "https://schema.org/NewCondition"
      : rawCondition === "Refurbished"
      ? "https://schema.org/RefurbishedCondition"
      : "https://schema.org/UsedCondition";

  // VideoObject JSON-LD when a valid YouTube link exists
  const ytUrl = propYoutubeUrl || product?.youtubeUrl;
  const ytId = parseYoutubeId(ytUrl);
  let videoObject: Record<string, unknown> | undefined = undefined;

  if (ytId) {
    const rawUpdated =
      propUpdatedAt ||
      product?.updatedAt ||
      product?.updated_at ||
      product?.createdAt ||
      product?.created_at;
    const uploadDate = rawUpdated ? new Date(rawUpdated).toISOString() : new Date().toISOString();

    videoObject = {
      "@type": "VideoObject",
      name: `${name} - Video Review & Demo`,
      description: description || `Watch overview and performance demonstration of ${name} at Laptop Point BD.`,
      thumbnailUrl: [youtubeThumbnail(ytId)],
      uploadDate,
      embedUrl: youtubeEmbedUrl(ytId),
    };
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku,
    description,
    image: finalImages,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    itemCondition,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: price.toString(),
      priceCurrency: currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition,
      seller: {
        "@type": "Organization",
        "@id": "https://laptoppointbd.com/#organization",
        name: "Laptop Point BD",
        url: "https://laptoppointbd.com",
      },
      hasMerchantReturnPolicy: merchantReturnPolicy,
    },
    ...(videoObject ? { subjectOf: videoObject } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": productUrl,
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
