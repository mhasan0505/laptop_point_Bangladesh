# Laptop Point BD — Master Delivery Plan & Status Tracker

This document tracks all 10 phases required to make Laptop Point BD fully deliverable to the client. Progress and acceptance status are tracked here directly so verification does not depend on chat history or external session logs.

---

## Master Progress Summary

| Phase | Milestone Name | Status | Key Deliverables & Verifications |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Production Persistence (Highest Risk) | **Done** (Pending DB run) | All 9 JSON stores DB-backed; EROFS simulated read-only test passing (`fd5cda9`). Acceptance pending real staging DB run. |
| **Phase 1b** | Cache Coherence & Staging Guard | **Done** | Shared `TtlCache<T>` (15s), staging-guard SHA-256 fingerprinting, docker staging compose (`374f0ee`). |
| **Phase 1c** | Health DB Hardening & Audit | **Done** | `GET /api/admin/health/db` hardened (owner/manager session only, no tokens/headers), test suite (`541cb33`). |
| **Phase 2** | Environments, Config & Secrets | **Done** | Full `.env.example`, `lib/env.ts` Zod validator, `instrumentation.ts`, unit tests, git secret audit, bundle leak scan on prod `.next` passing (`a675742`). |
| **Phase 3** | Build, Deploy & Runtime Health | **Done** | `pnpm build` passed, route budget verified, `GET /api/health`, error boundaries (`app/error.tsx`, `not-found.tsx`, `global-error.tsx`, `admin/error.tsx`), CI workflow, structured logs (`lib/logger.ts`). |
| **Phase 4** | Security Hardening Pass | **In Progress** | API route audit table (`docs/SECURITY.md`), rate limiting, CSRF, security headers, upload sniffing/sharp, audit. |
| **Phase 5** | Catalogue, Orders & Money | **Pending** | Catalogue audit, order lifecycle end-to-end on staging, invoice/challan A4 print, checkout calculations. |
| **Phase 6** | Content, Legal & Brand Readiness | **Pending** | Placeholder audit, policy pages rendered from DB, Store Profile single source of truth, WhatsApp/forms. |
| **Phase 7** | UX, A11y, Performance, SEO | **Pending** | Responsive QA (375-1536px), axe accessibility audit, Lighthouse mobile scores, meta tags/sitemap/robots. |
| **Phase 8** | Data Safety, Backups & Ops | **Pending** | Backup/restore runbook & script, seed guard, Vercel cron jobs, uptime monitoring, admin audit trail. |
| **Phase 9** | Client Handoff Package | **In Progress** | `ADMIN_GUIDE.md`, `DAILY_CHECKLIST.md`, `WEEKLY_CHECKLIST.md`, `TROUBLESHOOTING.md`, `TECHNICAL_HANDOVER.md`. |
| **Phase 10** | Final Verification & Release Gate | **Pending** | Final release report (`RELEASE_REPORT.md`), full test pass, go/no-go recommendation. |

---

## Detailed Phase Breakdown & Acceptance Criteria

### Phase 1 — Production Persistence (Highest Risk)
- [x] Document and fix source of truth for: `products.json`, `accessories.json`, `banners.json`, `power-deals.json`, `questions.json`, `settings.json`, `admin-users.json`, `media-meta.json`, `job-runs.json`, `catalog-masters.json`.
- [x] Database-backed path for all previously file-only stores (`KeyValueStore`/`ProductOverride` with `system:<name>`).
- [x] Read-only filesystem test: `scripts/test-readonly-persistence.mjs` verifying persistence under read-only conditions.
- [x] Staff accounts persist in DB with hashed passwords; break-glass owner login preserved.
- [ ] **Open Requirement**: Run `scripts/test-readonly-persistence.mjs --acceptance` against a real staging database and attach output before closing Phase 1 in release report.

### Phase 1b — Cross-Instance Cache Coherence & PostgreSQL Staging
- [x] Shared TTL cache helper (`lib/cache/ttl-cache.ts`) with default 15s TTL (`DATA_CACHE_TTL_MS`).
- [x] Security freshness alignment: staff user active status and roles re-checked within $\le 15$s.
- [x] Staging PostgreSQL infrastructure: `docker-compose.staging.yml`, `staging:up` / `staging:down`.
- [x] Staging guard with SHA-256 host fingerprinting (`scripts/lib/staging-guard.mjs`).

### Phase 1c — Health DB Hardening & Header Token Audit
- [x] Hardened `GET /api/admin/health/db`: requires active admin session (owner/manager only).
- [x] Removed token authentication and credential reuse. Returns only SHA-256 fingerprint.
- [x] Test suite: `scripts/tests/health-db.test.mjs` (6/6 passing).
- [x] Full codebase audit confirmed zero other endpoints compare headers to secret env vars.

### Phase 2 — Environments, Configuration, and Secrets
- [x] Comprehensive `.env.example` documenting all 24+ environment variables.
- [x] Startup validation module (`lib/env.ts`, Zod): fails fast in production for missing DB, missing `TRUSTED_PROXY`, weak/default passwords (`admin@123`), short session secrets (< 32 chars).
- [x] Invoked at server boot via root `instrumentation.ts` (`register()` hook).
- [x] Git history audit (`git log -S`): verified no production secrets committed to repository.
- [x] Environment separation matrix (Dev / Staging / Production) and ImageKit folder isolation documented in `docs/handoff/TECHNICAL_HANDOVER.md`.
- [x] Bundle leak scan on production `.next` output (`.next/static` and `.next/server`): verified zero secrets leaked.

### Phase 3 — Build, Deploy, and Runtime Health
- [x] Stopped process on port 3000 and verified `pnpm validate:images` and `pnpm build` passed with exit code 0.
- [x] Route table and bundle budget verified (all pages $\le 135$ kB gzipped first load, well below 250 kB target).
- [x] Production bundle secret leak audit executed on fresh `.next` artifacts with 0 leaks found.
- [x] Verified `pnpm start` against production build (boots in < 1s, verified fail-fast on missing envs and 200 on valid envs).
- [x] Public `GET /api/health` endpoint implemented (DB connection check, ImageKit status, env status, no secrets) and unit tested (`scripts/tests/health-api.test.mjs`).
- [x] GitHub Actions workflow extended (`.github/workflows/ci.yml` running install, `prisma:generate`, `tsc`, `pnpm test`, `pnpm lint`, `validate:images`, `pnpm build`).
- [x] Error handling: `app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx`, and admin error boundary `app/admin/error.tsx` implemented without stack trace leaks.
- [x] Structured server logging without PII (`lib/logger.ts`) integrated into order creation, admin login, and media upload routes. Tested in `scripts/tests/logger.test.mjs`.

### Phase 4 — Security Hardening Pass
- [ ] Complete API route audit table in `docs/SECURITY.md`.
- [ ] Rate limiting & anti-abuse on public endpoints (`/api/orders`, `/api/questions`, newsletter/contact, `/api/admin/login`).
- [ ] Security headers in `next.config.ts` (CSP report-only allow-list, HSTS, frame-ancestors, etc.).
- [ ] Cookie hardening (`HttpOnly`, `SameSite=Lax`, `Secure`) and admin CSRF protection.
- [ ] Upload pipeline security: MIME sniffing, 16 MB limit, sharp re-encode, `fileId` storage.
- [ ] `pnpm audit --prod` and staff lockout verification.

### Phase 5 — Catalogue, Orders, and Money Correctness
- [ ] Run catalogue audit scripts and fix code causes; create client admin steps for data anomalies.
- [ ] Full order lifecycle on staging: creation, stock decrement, status transitions, cancellation restock with `InventoryLog`.
- [ ] A4 Invoice and Challan formatting (BDT, Store Profile details, accessory line rendering).
- [ ] Checkout money rules: server prices, free shipping, tax, payment instructions matching Commerce settings.
- [ ] Customer order lookup (`/track-order` day-one build).
- [ ] Draft/archived product visibility enforcement.

### Phase 6 — Content, Legal, and Brand Readiness
- [ ] Audit and remove placeholder/mock content, fake ratings, and unverified badges.
- [ ] Legal pages (`/privacy`, `/terms`, `/returns`, `/shipping`) rendered from Admin Policies with last-updated dates.
- [ ] Single source of truth for Store Profile (name, logo, favicon, phone, address).
- [ ] Real WhatsApp and Messenger links from Store Profile.

### Phase 7 — UX, Accessibility, Performance, and SEO
- [ ] Responsive QA across 375px, 768px, 1280px, 1536px breakpoints.
- [ ] Automated accessibility audit (axe-core) with keyboard navigation pass.
- [ ] Lighthouse mobile audits ($\ge 85$ Performance, $\ge 95$ Accessibility, Best Practices, SEO).
- [ ] SEO audit: canonicals, OpenGraph, JSON-LD schemas, robots.txt, sitemap.xml.
- [ ] Admin UX: fast loading, empty/loading/error states, confirmation toasts.

### Phase 8 — Data Safety, Backups, and Operations
- [ ] Automated database backup script (`scripts/backup-db.mjs`) and restore runbook.
- [ ] Idempotent seed script with production destructive safety guards.
- [ ] Scheduled background jobs via Vercel Cron.
- [ ] Health monitoring and order failure alerting.
- [ ] Admin audit trail logging for price/stock/order modifications.

### Phase 9 — Client Handoff Package
- [ ] `ADMIN_GUIDE.md`: Step-by-step client management workflows.
- [ ] `DAILY_CHECKLIST.md` and `WEEKLY_CHECKLIST.md`.
- [ ] `TROUBLESHOOTING.md`.
- [ ] `TECHNICAL_HANDOVER.md`: Architecture, env vars, rollback, tests, limitations.
- [ ] `ACCEPTANCE_CHECKLIST.md`: Formal client sign-off checklist.
- [ ] `CREDENTIALS_TRANSFER.md`: Credential rotation handover template.

### Phase 10 — Final Verification & Release Gate
- [ ] Full test pass (`tsc`, `pnpm test`, lint, `scripts/check-all.mjs`).
- [ ] Public and admin route smoke test on production build.
- [ ] Produce `docs/handoff/RELEASE_REPORT.md` with go/no-go recommendation.

---

## Owner / Client-Only Action Items

1. Cancel test order `ORD-13583666-609` and confirm `HP-440G3-001` stock is 7.
2. Delete leftover test accessories (`TEST-ACC-*`) in Admin → Accessories; click "Move to Accessories" for the Vention laptop stand.
3. Re-enter specs and YouTube link for products 45 and 46; correct price anomalies; set real stock and photos for the six seeded chargers.
4. Provide final business copy: policies, warranty wording, delivery promises, About text, real testimonials with permission, real product photos.
5. Set production environment variables (`TRUSTED_PROXY=vercel` on Vercel, `IMAGEKIT_PRIVATE_KEY`, strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`) and rotate any password that was ever `admin@123`.
6. Transfer accounts (hosting, database, ImageKit, domain, analytics, Pixel, Search Console) and sign the acceptance checklist.
