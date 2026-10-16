# Catalogue Architecture & Data Flow

This document details how products and accessories are stored, updated, validated, and queried across the Laptop Point BD platform (`lp-new-version`).

---

## 1. Dual-Catalogue Architecture

The repository separates high-consideration laptop listings from standard accessories while providing unified administration.

```
                          ┌───────────────────────────┐
                          │   Admin Product Editor    │
                          │ ProductEditorForm / APIs  │
                          └─────────────┬─────────────┘
                                        │
                         Category Classification
                         (isAccessoryCategoryName)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [Laptop Category]                       [Accessory Category]
  (e.g., Laptop, Ultrabook, etc.)        (e.g., Chargers & Power, Keyboards...)
                    │                                       │
                    ▼                                       ▼
       app/api/admin/products                  lib/accessory-bridge.ts
                    │                                       │
                    ▼                                       ▼
          lib/products-storage.ts                 lib/accessories-storage.ts
                    │                                       │
      ┌─────────────┴─────────────┐           ┌─────────────┴─────────────┐
      ▼                           ▼           ▼                           ▼
Seed File:                  Overrides:    Seed File:                  Overrides:
app/data/products.json      Prisma DB     app/data/accessories.json   Prisma DB
                            (ProductOverride                          (ProductOverride
                             by id/sku)                                key: "system:accessory:<id>")
```

### 1.1 Laptop Catalogue
- **Base Seed**: `app/data/products.json`
- **Dynamic Overrides**: PostgreSQL table `ProductOverride` via Prisma (`prisma.productOverride`). Overrides are keyed by either the integer product ID or the product SKU string.
- **Data Access**: `lib/products-storage.ts`
  - `loadMergedRawProducts()` merges base JSON seed data with DB overrides.
  - `saveRawProduct(product)` persists changes as a serialized JSON record in `ProductOverride`.

### 1.2 Accessories Catalogue
- **Base Seed**: `app/data/accessories.json`
- **Dynamic Overrides**: PostgreSQL table `ProductOverride` with keys prefixed with `system:accessory:<id>` (or `system:accessories_manifest` for catalogue ordering).
- **Data Access**: `lib/accessories-storage.ts`
  - `listAccessories()` retrieves all internal accessory records (including draft/inactive).
  - `listPublicAccessories()` retrieves active, public-facing accessories with slugs.
  - `createAccessory(input)` / `updateAccessory(id, input)` persist records to DB overrides without mutating disk files on serverless hosts.

---

## 2. Admin Routing & Bridge (`accessory-bridge.ts`)

When an administrator submits a product from `/admin/products/new` or `/admin/products/[id]`, the API routes dynamically:

1. **Category Check**: `isAccessoryCategoryName(body.category)` in `lib/accessory-types.ts` tests the category string against all canonical accessory categories (e.g. `Chargers & Power`, `Keyboards`, `Mice`, `Monitors`, `Bags & Sleeves`, `Docks & Hubs`, `Cooling Pads`, `Accessories`, etc.).
2. **Bridge Conversion**: If it is an accessory category, `adminProductToAccessoryInput(body)` in `lib/accessory-bridge.ts` converts the form payload into an `AccessoryInput` structure:
   - Resolves category slug via `resolveAccessoryCategorySlug(body.category)`.
   - Extracts flat specs from `specGroups` or raw specs into string array.
   - Preserves YouTube video link, stock, pricing, and images.
3. **Storage Routing**:
   - Updates: Routed to `updateAccessory(id, accessoryInput)` in `lib/accessories-storage.ts`.
   - Creates: Routed to `createAccessory(accessoryInput)` in `lib/accessories-storage.ts`.
4. **SKU Uniqueness**:
   - `app/api/admin/products` validates that SKUs do not collide across **both** laptops and accessories before creating or renaming any product.

---

## 3. Product Fields & Storage Model

| Field | Form Field | Storage Location | Notes |
| :--- | :--- | :--- | :--- |
| **Numeric ID** | `id` | `RawProduct.id` | Auto-allocated (highest existing ID + 1). |
| **SKU** | `sku` | `RawProduct.sku` | Unique across both laptops and accessories (alphanumeric, dot, dash, underscore). |
| **Name & Brand** | `name`, `brand` | `RawProduct.name`, `RawProduct.brand` | Required for all products. |
| **Pricing** | `price`, `marketPrice` | `RawProduct.pricing` | `sale_price` and `market_price`. Discount % is auto-derived. |
| **Stock** | `stock` | `RawProduct.stock.quantity` | Quantity $\ge 0$. Status (`In Stock`, `Low Stock`, `Out of Stock`) is derived. |
| **Visibility** | `status` (`Active`/`Draft`/`Archived`) | `RawProduct.statusValue` | Storefront hides anything other than `active`. |
| **Grouped Specs** | Spec Groups Table | `RawProduct.specGroups` | Pruned of empty groups/keys. Blank values are never saved. |
| **Flat Specs** | Form derivation | `RawProduct.specs` | Derived via `groupsToFlat(specGroups)` for storefront filter backwards compatibility. |
| **YouTube URL** | YouTube field | `RawProduct.youtubeUrl` | Validated via `parseYoutubeId`. Emitted in Google `VideoObject` structured data. |
| **Variants** | Variants Section | `RawProduct.variants`, `RawProduct.variantOptions` | Gated behind `NEXT_PUBLIC_ENABLE_VARIANTS === "true"`. Stored data preserved. |
| **Warranty** | Warranty fields | `RawProduct.warranty` | Replacement, service, and parts warranty breakdown. |
| **Images** | Media Uploader | `RawProduct.images` | Processed WebP images hosted on ImageKit (or local uploads in dev). |

---

## 4. Status Rules & Storefront Invariants

### 4.1 Visibility Rules (`statusValue`)
- **`active`**: Product is visible on the public storefront, search results, category pages, and `sitemap.xml`.
- **`draft`**: Product is hidden from public storefront and search, accessible only via direct admin management.
- **`archived`**: Product is discontinued/hidden from public storefront, retained for order history and audit integrity.

### 4.2 Spec Integrity Rules (No Fake Placeholders)
- `components/product/ProductSpecTable.tsx` and `components/product/ProductDetailsClient.tsx` render **only** verified specifications provided in `specGroups` or `specs`.
- Hardcoded fallback values (such as "RAM Type DDR4", "14.0 Inch", "1920x1080 FHD", "M.2 PCIe NVMe SSD", "Upgradable up to 1TB/2TB", "Intel Integrated Graphics", "Wi-Fi Dual Band + Bluetooth", "Silver / Dark Ash Black", "100% Tested & Certified Hardware", "2 Years Free Service Warranty", "15 Days Replacement Guarantee") have been completely removed.
- If a laptop has no display or graphics data entered, that specific spec row or group is cleanly omitted rather than displaying misleading dummy data.

---

## 5. Media & Upload Security

- **Route**: `POST /api/admin/upload` & `DELETE /api/admin/upload`
- **Access Control**: Restricted to `owner`, `manager`, and `marketing` roles via `requireAdmin(request, { roles: [...] })`.
- **Validation**:
  - Magic byte sniffing (`sniffImage`) verifies true image bytes (PNG, JPEG, WebP, GIF, AVIF). Client-supplied MIME headers and file extensions are never trusted.
  - Re-encoded via Sharp to WebP format, stripping EXIF and GPS tracking data.
  - Payload capped at 16MB (request headers checked upfront for $413$).

---

## 6. Audit & Catalog Hygiene Script

Run the automated, read-only audit script at any time:
```bash
node scripts/audit-catalogue.mjs
```

The script inspects 10 integrity conditions:
1. Missing essential specs (Processor, RAM, Storage)
2. Negative or non-numeric stock
3. Zero or negative prices
4. Sale price > market price
5. Extreme discount percentages ($\ge 80\%$)
6. Duplicate SKUs (checked across both laptops and accessories)
7. Missing or placeholder image paths
8. Invalid or broken YouTube URL formats
9. Misfiled categories (e.g. accessories listed as laptops)
10. Orphaned DB overrides
