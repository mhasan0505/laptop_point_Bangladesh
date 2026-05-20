import productsRaw from "@/app/data/products.json";
import { Product } from "@/types/product";
import { prisma } from "./prisma";
import { client } from "./sanity.client";

export async function getLiveProducts(): Promise<Product[]> {
  const isSanityConfigured =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "your_project_id";

  if (!isSanityConfigured) {
    return getFallbackProductsWithLiveStock();
  }

  try {
    const query = `*[_type == "product"] | order(_createdAt desc) {
      _id,
      name,
      sku,
      brand,
      category,
      price,
      originalPrice,
      salePrice,
      discount,
      rating,
      reviews,
      slug,
      specs,
      description,
      fullDescriptionText,
      features,
      condition,
      imageUrls,
      images[] {
        asset-> { url }
      }
    }`;

    const sanityProducts = await client.fetch<any[]>(query);

    if (!sanityProducts || sanityProducts.length === 0) {
      return getFallbackProductsWithLiveStock();
    }

    // Fetch real-time stock levels from Prisma
    const inventoryItems = await prisma.inventory.findMany();
    const inventoryMap = new Map(
      inventoryItems.map((item) => [item.productId, item]),
    );

    const mappedProducts: Product[] = sanityProducts.map((p) => {
      const inv = inventoryMap.get(p._id);
      const quantity = inv ? inv.quantity : p.stock || 0;
      const inStock = quantity > 0;

      const sanityImages =
        p.images?.map((img: any) => img.asset?.url).filter(Boolean) || [];
      const allImages =
        sanityImages.length > 0 ? sanityImages : p.imageUrls || [];
      const mainImage = allImages[0] || "/placeholder.jpg";
      const displayDetails = p.specs?.displayDetails;
      const displayText =
        typeof p.specs?.display === "string"
          ? p.specs.display
          : [
              displayDetails?.size,
              displayDetails?.resolution,
              displayDetails?.type,
              displayDetails?.touchscreen ? "Touchscreen" : undefined,
            ]
              .filter(Boolean)
              .join(" | ");
      const ports = Array.isArray(p.specs?.portsList)
        ? p.specs.portsList
        : p.specs?.ports;

      return {
        id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        originalPrice: p.originalPrice || p.salePrice || p.price,
        discount: p.discount || 0,
        rating: p.rating || 4.5,
        reviews: p.reviews || 10,
        inStock,
        image: mainImage,
        images: allImages.length > 0 ? allImages : [mainImage],
        specs: {
          processor: p.specs?.processor,
          ram: p.specs?.ram,
          storage: p.specs?.storage,
          display: displayText,
          graphics: p.specs?.graphics,
          battery: p.specs?.battery,
          weight: p.specs?.weight,
          os: p.specs?.os,
          ports,
        },
        category: p.category || "Laptop",
        features: p.features || [],
        condition: p.condition,
        sku: p.sku,
        description: {
          short:
            typeof p.description === "string"
              ? p.description
              : p.description?.short || "",
          full:
            p.fullDescriptionText ||
            (typeof p.description === "object"
              ? p.description?.full || ""
              : ""),
        },
        slug: p.slug?.current || "",
      };
    });

    return mappedProducts;
  } catch (error) {
    console.error("Error loading products from Sanity:", error);
    return getFallbackProductsWithLiveStock();
  }
}

async function getFallbackProductsWithLiveStock(): Promise<Product[]> {
  try {
    const inventoryItems = await prisma.inventory.findMany();
    const inventoryMap = new Map(
      inventoryItems.map((item) => [item.productId, item]),
    );

    return (productsRaw as any[]).map((product) => {
      const inv = inventoryMap.get(String(product.id));
      const quantity = inv ? inv.quantity : (product.stock?.quantity ?? 0);
      const inStock = quantity > 0;

      return {
        id: String(product.id),
        name: product.name,
        brand: product.brand,
        price: product.pricing?.sale_price || product.price || 0,
        originalPrice:
          product.pricing?.regular_price ||
          product.originalPrice ||
          product.price ||
          0,
        discount: product.pricing?.discount_percentage || 0,
        rating: product.rating || 4.5,
        reviews: product.reviews || 10,
        inStock,
        image: product.image?.src || product.image || "/placeholder.jpg",
        images: product.images || [],
        specs: product.specs || {},
        category: product.category || "Laptop",
        features: product.features || [],
        condition: product.condition || [],
        sku: product.sku,
        description: {
          short: product.description?.short || "",
          full: product.description?.full || "",
        },
        slug: product.slug || "",
      };
    });
  } catch (error) {
    // If the database is unavailable during build or deploy, fall back to
    // static stock from products.json without noisy logs.
    return (productsRaw as any[]).map((product) => ({
      id: String(product.id),
      name: product.name,
      brand: product.brand,
      price: product.pricing?.sale_price || product.price || 0,
      originalPrice:
        product.pricing?.regular_price ||
        product.originalPrice ||
        product.price ||
        0,
      discount: product.pricing?.discount_percentage || 0,
      rating: product.rating || 4.5,
      reviews: product.reviews || 10,
      inStock: (product.stock?.quantity ?? 0) > 0,
      image: product.image?.src || product.image || "/placeholder.jpg",
      images: product.images || [],
      specs: product.specs || {},
      category: product.category || "Laptop",
      features: product.features || [],
      condition: product.condition || [],
      sku: product.sku,
      description: {
        short: product.description?.short || "",
        full: product.description?.full || "",
      },
      slug: product.slug || "",
    }));
  }
}
