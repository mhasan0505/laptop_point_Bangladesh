"use client";

import { ProductEditorForm } from "@/components/admin/ProductEditorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminProduct } from "@/lib/admin-data";
import { fetchAdminProductById, updateAdminProduct } from "@/lib/admin-products-api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
        <p className="text-xs text-muted-foreground font-semibold">
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-gray-500 text-sm">
              Product with ID <code className="bg-gray-100 px-2 py-0.5 rounded text-black font-semibold">{id}</code> could not be found or has been removed.
            </p>
            <div>
              <Link href="/admin/products">
                <Button className="bg-black text-white hover:bg-gray-800">
                  Return to Products List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProductEditorForm
      title={`Edit Product: ${product.name}`}
      subtitle="Update specifications, stock levels, variants, pricing, and media"
      submitLabel="Save Changes"
      initialProduct={product}
      onSubmitProductAction={(updated) => updateAdminProduct(id, updated)}
    />
  );
}
