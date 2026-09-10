# Database & API

- Wants the Prisma schema to maintain correct relational integrity with appropriate PostgreSQL indexes on frequently filtered/searched columns (e.g., Order search fields, foreign-key relation lookups on InventoryUnit) to support filter/search paths and avoid N+1 query risks. Confidence: 0.8
- Values keeping the Prisma datasource/schema and config consistent (e.g., connection URL in prisma.config.ts, not a stale `url` in schema) so `prisma validate`, `prisma generate`, and `prisma migrate` run cleanly. Confidence: 0.8
- Prefers minimizing duplicated server/client business logic and JSON payload sizes in API routes and Server Actions (e.g., putting shared pricing/order constants in a common module so server validation needs no duplicated constants). Confidence: 0.7