CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sanityId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'active',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "specs" JSONB,
    "warranty" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_sanityId_key" ON "Product"("sanityId");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_status_idx" ON "Product"("status");
