import { getLiveLaptops } from "@/app/data/data";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const laptops = await getLiveLaptops();
  return laptops.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const laptops = await getLiveLaptops();
  const product = laptops.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = `${product.name} Price in BD | ${product.brand} Laptop`;
  const description =
    product.description?.short ||
    `Buy ${product.name} at the best price in Bangladesh. ${product.specs?.processor}, ${product.specs?.ram}, ${product.specs?.storage}. Official Warranty.`;
  const image =
    typeof product.image === "string" ? product.image : product.image.src;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const laptops = await getLiveLaptops();
  const product = laptops.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Related products (same brand or category)
  const relatedProducts = laptops
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.brand === product.brand || p.category === product.category)
    )
    .slice(0, 4);

  return (
    <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
  );
}
