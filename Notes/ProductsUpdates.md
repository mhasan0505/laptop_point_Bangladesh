## Product Catalog Plan (Industry Standard)

Build a merchant-managed catalog system, not JSON-file editing.

### Phase 1 - Foundation (Database + Core APIs)

Goal: Move products from JSON/in-memory to PostgreSQL with stable CRUD.

- [ ] Add Prisma models for `Product`, `ProductImage`, `ProductFeature`.
- [ ] Link `Inventory.productId` to real product IDs (not JSON-only IDs).
- [ ] Generate and apply migration for new catalog tables.
- [ ] Create admin catalog APIs:
  - [ ] `GET /api/admin/products`
  - [ ] `POST /api/admin/products`
  - [ ] `GET /api/admin/products/[id]`
  - [ ] `PATCH /api/admin/products/[id]`
  - [ ] `DELETE /api/admin/products/[id]` (archive/soft delete)
- [ ] Add server-side validation for create/update payloads.
- [ ] Enforce unique checks: SKU and slug.
- [ ] Write product audit logs on create/update/delete.
- [ ] Add seed/migration script from `app/data/products.json` to database.

Definition of done (Phase 1):

- [ ] Product list and details can be fetched fully from DB APIs.
- [ ] Admin can create and update products without touching JSON files.
- [ ] Existing order flow still works with price snapshots.

### Phase 2 - Admin UX + Media Pipeline

Goal: Let clients self-manage full product data safely from admin panel.

- [ ] Upgrade admin add/edit forms to support full product schema:
  - [ ] basic info (name, SKU, brand, model, category)
  - [ ] pricing (sale, market, discount, tax)
  - [ ] stock inputs and inventory sync
  - [ ] specs (CPU, RAM, storage, display, graphics, ports, weight, OS)
  - [ ] descriptions (short + full)
  - [ ] features array
  - [ ] images list
- [ ] Integrate image upload to cloud storage (Supabase Storage/S3/Cloudinary).
- [ ] Save only image URLs/metadata in DB.
- [ ] Add publish workflow statuses: `draft`, `review`, `published`, `archived`.
- [ ] Add soft-delete and restore actions in admin.
- [ ] Show validation and API errors clearly in admin UI.

Definition of done (Phase 2):

- [ ] A client user can create and publish a product end-to-end from admin.
- [ ] Product appears correctly on storefront after publish.
- [ ] No product creation/edit requires developer code changes.

### Phase 3 - Security, Quality, and Operations

Goal: Production-hardening and operational reliability.

- [ ] Implement RBAC roles: owner, manager, editor.
- [ ] Protect all admin product APIs with authentication + authorization.
- [ ] Add version history and rollback for product changes.
- [ ] Add webhook/event hooks for downstream services (search/index, analytics).
- [ ] Add search indexing flow (Meilisearch/Algolia/Elastic) and reindex jobs.
- [ ] Add background jobs for image optimization and cache invalidation.
- [ ] Add monitoring + alerting for catalog API failures.
- [ ] Add integration tests for product CRUD, publish flow, and permission checks.
- [ ] Add deployment checklist for env vars, storage keys, and migration safety.

Definition of done (Phase 3):

- [ ] Catalog operations are role-secure, auditable, and recoverable.
- [ ] Search/index updates are automated and reliable.
- [ ] Team can deploy without breaking catalog or inventory behavior.

### Implementation Order (Suggested)

- [ ] Complete all Phase 1 tasks first.
- [ ] Deliver Phase 2 in two increments: form upgrade, then media upload.
- [ ] Complete Phase 3 hardening before giving broad client access.
