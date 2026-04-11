-- CreateTable: Product catalog models
-- Phase 1: Foundation - Product, ProductImage, ProductFeature, ProductAuditLog

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "legacyId" TEXT,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'Used',
    "grade" TEXT,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "marketPrice" DOUBLE PRECISION NOT NULL,
    "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxIncluded" BOOLEAN NOT NULL DEFAULT true,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "displaySize" TEXT,
    "displayResolution" TEXT,
    "displayType" TEXT,
    "touchscreen" BOOLEAN NOT NULL DEFAULT false,
    "graphics" TEXT,
    "ports" TEXT[],
    "weight" TEXT,
    "os" TEXT,
    "descriptionShort" TEXT,
    "descriptionFull" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductFeature" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductFeature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductAuditLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedFields" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductAuditLog_pkey" PRIMARY KEY ("id")
);

-- Unique & index constraints on Product
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- Index constraints on child tables
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX "ProductFeature_productId_idx" ON "ProductFeature"("productId");
CREATE INDEX "ProductAuditLog_productId_idx" ON "ProductAuditLog"("productId");
CREATE INDEX "ProductAuditLog_createdAt_idx" ON "ProductAuditLog"("createdAt");

-- Foreign keys for ProductImage, ProductFeature, ProductAuditLog
ALTER TABLE "ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductFeature"
    ADD CONSTRAINT "ProductFeature_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductAuditLog"
    ADD CONSTRAINT "ProductAuditLog_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Clear stale Inventory rows so the new FK constraint can be applied cleanly.
-- The seed script will re-create all Inventory rows linked to real Product IDs.
DELETE FROM "Inventory";

-- Add FK from Inventory.productId → Product.id
ALTER TABLE "Inventory"
    ADD CONSTRAINT "Inventory_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
