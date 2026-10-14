import { getLiveLaptops } from "@/app/data/data";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import ProductSchemaMeta from "@/components/seo/ProductSchemaMeta";
import { generateProductSummary } from "@/lib/product-summary";
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
  const description = generateProductSummary(product);
  const image =
    typeof product.image === "string" ? product.image : product.image.src;

  return {
    title,
    description,
    alternates: {
      canonical: `https://laptoppointbd.com/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://laptoppointbd.com/product/${slug}`,
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

  const summary = generateProductSummary(product);

  // Related products (same brand or category for bottom grid)
  const relatedProducts = laptops
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.brand === product.brand || p.category === product.category)
    )
    .slice(0, 4);

  // Sidebar products (for right column Related Products list)
  const sidebarProducts = laptops
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  return (
    <>
      <ProductSchemaMeta product={product} />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
        sidebarProducts={sidebarProducts}
        summary={summary}
      />
    </>
  );
}
