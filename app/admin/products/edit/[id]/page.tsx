"use client";

import { ProductEditorForm } from "@/components/admin/ProductEditorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchAdminProducts,
  updateAdminProduct,
} from "@/lib/admin-products-api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<
    Awaited<ReturnType<typeof fetchAdminProducts>>[number] | null
  >(null);

  useEffect(() => {
    fetchAdminProducts()
      .then((products) => {
        const matchedProduct = products.find((item) => item.id === id);
        if (!matchedProduct) {
          setNotFound(true);
          return;
        }
        setProduct(matchedProduct);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-black">Product Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              Product with ID {id} was not found.
            </p>
            <Link href="/admin/products">
              <Button>Return to Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProductEditorForm
      title="Edit Product"
      subtitle="Update product details using the richer catalog structure"
      submitLabel="Save Changes"
      initialProduct={product}
      onSubmitProductAction={(payload) => updateAdminProduct(id, payload)}
    />
  );
}
