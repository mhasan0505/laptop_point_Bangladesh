import { Product } from "@/types/product";
import { prisma } from "./prisma";
import { client } from "./sanity.client";

export async function getLiveProducts(): Promise<Product[]> {
  const isSanityConfigured =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "your_project_id";

  if (!isSanityConfigured) {
    return [];
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
      return [];
    }

    // Fetch real-time stock levels only for the products we have
    const sanityIds = sanityProducts.map((p) => p._id as string);
    const inventoryItems = await prisma.inventory.findMany({
      where: { productId: { in: sanityIds } },
    });
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
    return [];
  }
}
