"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black">Edit Product</h1>
          <p className="text-gray-500">Editing product #{id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <span className="text-xl">🛠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Work in Progress
            </h3>
            <p className="text-gray-500 max-w-sm mt-2">
              The product editing form is currently being implemented. Check
              back soon!
            </p>
            <Link href="/admin/products" className="mt-6">
              <Button>Return to Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
