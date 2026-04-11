## Product Catalog Plan (Industry Standard)

Build a merchant-managed catalog system, not JSON-file editing.

### Phase 1 - Foundation (Database + Core APIs)

Goal: Move products from JSON/in-memory to PostgreSQL with stable CRUD.

- [x] Add Prisma models for `Product`, `ProductImage`, `ProductFeature`.
- [x] Link `Inventory.productId` to real product IDs (not JSON-only IDs).
- [x] Generate and apply migration for new catalog tables.
- [ ] Create admin catalog APIs:
  - [x] `GET /api/admin/products`
  - [x] `POST /api/admin/products`
  - [x] `GET /api/admin/products/[id]`
  - [x] `PATCH /api/admin/products/[id]`
  - [x] `DELETE /api/admin/products/[id]` (archive/soft delete)
- [x] Add server-side validation for create/update payloads.
- [x] Enforce unique checks: SKU and slug.
- [x] Write product audit logs on create/update/delete.
- [x] Add seed/migration script from `app/data/products.json` to database.

Definition of done (Phase 1):

- [x] Product list and details can be fetched fully from DB APIs.
- [x] Admin can create and update products without touching JSON files.
- [x] Existing order flow still works with price snapshots.

### Phase 2 - Admin UX + Media Pipeline

Goal: Let clients self-manage full product data safely from admin panel.

- [ ] Upgrade admin add/edit forms to support full product schema:
  - [x] basic info (name, SKU, brand, model, category)
  - [x] pricing (sale, market, discount, tax)
  - [x] stock inputs and inventory sync
  - [x] specs (CPU, RAM, storage, display, graphics, ports, weight, OS)
  - [x] descriptions (short + full)
  - [x] features array
  - [x] images list
- [x] Integrate image upload to cloud storage (Supabase Storage/S3/Cloudinary).
- [x] Save only image URLs/metadata in DB.
- [x] Add publish workflow statuses: `draft`, `review`, `published`, `archived`.
- [x] Add soft-delete and restore actions in admin.
- [x] Show validation and API errors clearly in admin UI.

Definition of done (Phase 2):

- [x] A client user can create and publish a product end-to-end from admin.
- [x] Product appears correctly on storefront after publish.
- [x] No product creation/edit requires developer code changes.

### Phase 3 - Security, Quality, and Operations

Goal: Production-hardening and operational reliability.

- [x] Implement RBAC roles: owner, manager, editor.
- [x] Protect all admin product APIs with authentication + authorization.
- [x] Add version history and rollback for product changes.
- [x] Add webhook/event hooks for downstream services (search/index, analytics).
- [x] Add search indexing flow (Meilisearch/Algolia/Elastic) and reindex jobs.
- [x] Add background jobs for image optimization and cache invalidation.
- [x] Add monitoring + alerting for catalog API failures.
- [x] Add integration tests for product CRUD, publish flow, and permission checks.
- [x] Add deployment checklist for env vars, storage keys, and migration safety.

Definition of done (Phase 3):

- [x] Catalog operations are role-secure, auditable, and recoverable.
- [x] Search/index updates are automated and reliable.
- [x] Team can deploy without breaking catalog or inventory behavior.

### Implementation Order (Suggested)

- [x] Complete all Phase 1 tasks first.
- [x] Deliver Phase 2 in two increments: form upgrade, then media upload.
- [x] Complete Phase 3 hardening before giving broad client access.
