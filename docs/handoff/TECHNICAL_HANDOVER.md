# Laptop Point BD — Technical Handover Document

> [!IMPORTANT]
> **Persistence Status Note (Phase 1 / 1b / 1c)**:
> Persistence was verified only against a simulator until a real staging database run is attached.
>
> **Mandatory Open Item Before Release**:
> - [ ] Run `scripts/test-readonly-persistence.mjs --acceptance` against a real staging DB and attach the output.
>
> *Phase 1 will not be marked fully closed in the release report until that output exists.*

---

## 1. Hosting Architecture
- **Target Host**: Vercel (Serverless, read-only runtime, multiple instances).
- **Domain**: `https://laptoppointbd.com` (with `www` -> apex 308 redirect).
- **Database**: PostgreSQL (Neon Serverless PostgreSQL with pg connection pooling).
- **Asset Storage**: ImageKit CDN (folder: `/laptop-point/`).

---

## 2. Cross-Instance Cache Coherence & Freshness Guarantees
- In-memory data caches in serverless runtimes use a short-lived TTL (`DATA_CACHE_TTL_MS`, default 15 seconds; setting `0` disables caching completely).
- All writes persist synchronously to PostgreSQL `ProductOverride` (`system:<name>`) and invalidate the local cache immediately.
- **Worst-case propagation delay across instances**: $\le 15$ seconds.
- **Security freshness**: Admin user permissions, active status, and session roles re-check freshness every 15s. Staff deactivated on Instance A is rejected by Instance B within $\le 15$ seconds.

---

## 3. Staging Database Verification Guide
Because Docker is not available on the primary build environment, acceptance verification must be run against a real staging database:

### Option A: Local Docker PostgreSQL
```bash
pnpm staging:up
# In .env.test:
# STAGING_DB_HOST="localhost"
# DATABASE_URL="postgresql://laptoppoint_staging:staging_secret_password_123@localhost:55432/laptoppoint_staging_db?sslmode=disable"
npx prisma migrate deploy
node --import ./scripts/lib/register.mjs scripts/test-readonly-persistence.mjs --acceptance
pnpm staging:down
```

### Option B: Neon Cloud Staging Branch
```bash
# 1. Create staging branch:
#    neon branches create --name staging
# 2. In .env.test:
#    STAGING_DB_HOST="ep-staging-branch-123456.aws.neon.tech"
#    DATABASE_URL="postgresql://<user>:<pass>@ep-staging-branch-123456.aws.neon.tech/laptoppoint_db?sslmode=require"
# 3. Deploy schema:
npx prisma migrate deploy
# 4. Run acceptance test:
node --import ./scripts/lib/register.mjs scripts/test-readonly-persistence.mjs --acceptance
```

---

## 4. Third-Party Integrations & Providers (Future Roadmap)
- **Order Tracking**: `/track-order` implemented without PII leakage.
- **SMS / Email Notifications**: Document provider options (e.g., Twilio / Elks SMS / Resend / SendGrid) with implementation estimates.

---

## 5. Environment Separation Matrix (Dev vs. Staging vs. Production)

To maintain absolute data integrity and prevent cross-environment pollution, database and CDN storage must be isolated as follows:

| Resource | Development (`dev`) | Staging (`staging`) | Production (`prod`) |
| :--- | :--- | :--- | :--- |
| **Hosting Environment** | Local machine (`localhost:3000`) | Vercel Preview Deployments | Vercel Production (`laptoppointbd.com`) |
| **Database Connection** | Local PostgreSQL or simulated fallback | Isolated Staging PostgreSQL (Docker/Neon branch) | Neon Production Cluster (pgbouncer pooler) |
| **Database Write Guard** | Refuses writes if `DATABASE_URL` is remote | `STAGING_DB_HOST` allow-list enforcement | Authenticated admin mutations only |
| **ImageKit Root Folder** | `/laptop-point-dev/` (or local file fallback) | `/laptop-point-staging/` | `/laptop-point/` |
| **Upload Fallback** | `ALLOW_LOCAL_UPLOADS=1` permitted | `ALLOW_LOCAL_UPLOADS=0` (ImageKit required) | `ALLOW_LOCAL_UPLOADS=0` (Strictly ImageKit) |
| **Proxy Header Mode** | `TRUSTED_PROXY` unset | `TRUSTED_PROXY=vercel` | `TRUSTED_PROXY=vercel` (Strictly enforced) |
| **Analytics & Pixels** | Mock IDs or disabled | Sandbox / Mock IDs | Real IDs (`GTM-KXKXGWF6`, Pixel `1676...`) |
| **Admin Break-Glass** | Dev password | Strong random password | Super-secure unique owner password |

### ImageKit Folder Configuration
In ImageKit Media Library (https://imagekit.io/dashboard/media-library):
- Create the top-level folders:
  - `/laptop-point/` (for live products, banners, and media)
  - `/laptop-point-staging/` (for QA, test orders, and automated upload tests)
  - `/laptop-point-dev/` (for local development uploads)
- In the application, `lib/media/imagekit.ts` prefixes all uploaded files with the appropriate folder based on deployment configuration.

---

## 6. Secrets Management & Fail-Fast Startup Validation
All environment variables are validated at server startup via `lib/env.ts` (invoked automatically via Next.js `instrumentation.ts`):

- **In Production (`NODE_ENV=production`)**: Missing `DATABASE_URL`, missing `TRUSTED_PROXY`, weak/default `ADMIN_PASSWORD` (e.g., `admin@123`), or short `ADMIN_SESSION_SECRET` (< 32 characters) will immediately throw a fatal error and halt application startup with a structured diagnostic banner.
- **In Development (`NODE_ENV=development`)**: Configuration warnings are logged to the console without halting local dev servers.
- **Client Bundle Safety**:
  - Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser JavaScript bundles (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`, `NEXT_PUBLIC_MAX_UPLOAD_MB`, `NEXT_PUBLIC_ENABLE_VARIANTS`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`).
  - Private keys (`IMAGEKIT_PRIVATE_KEY`, `SETTINGS_ENCRYPTION_KEY`, `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD`, `DATABASE_URL`) are strictly isolated to server-side code.

---

## 7. Uptime Monitoring & Health Endpoints

### Public Health Check (`GET /api/health`)
- **Purpose**: Liveness and readiness monitoring for synthetic uptime checkers (e.g., BetterStack, Pingdom, UptimeRobot, Vercel Checks).
- **Authentication**: None required (publicly queryable).
- **Security Guarantees**: NEVER exposes hostnames, database connection strings, credentials, or stack traces.
- **Cache-Control**: `no-store, no-cache, must-revalidate, max-age=0` (never cached by Vercel edge/CDN).
- **Response Format (HTTP 200 OK / HTTP 503 Service Unavailable)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-17T09:00:00.000Z",
    "uptimeSeconds": 1420,
    "latencyMs": 12,
    "version": "0.1.0",
    "commit": "a675742",
    "checks": {
      "database": true,
      "imagekit": true,
      "env": true
    }
  }
  ```
- **Recommended Monitor Configuration**:
  - URL: `https://laptoppointbd.com/api/health`
  - Interval: Every 60 seconds.
  - Expected Status: `200`.
  - Alert trigger: 2 consecutive failures or latency $> 5000$ms.

---

## 8. JavaScript Bundle Budgets & Performance Measurement

### Measurement Methodology Disclosure
- In Next.js 16 with Webpack builds, the native build CLI outputs compilation chunks without rendering the legacy route-by-route First Load JS terminal table.
- To audit route bundle sizes against the $\le 250$ kB target in Phase 3, route chunk dependencies and gzipped asset sizes were computed via `scripts/calculate-route-sizes.cjs` by inspecting `.next/build-manifest.json` and summing the gzip sizes of shared runtime chunks (`webpack`, `main`, `framework`) and page-specific chunks.
- **Source of Truth**: These calculated First Load JS sizes provide an engineering estimate. **Google Lighthouse Mobile Audits in Phase 7 are the ultimate source of truth** for real-world user performance, Core Web Vitals (LCP, INP, CLS), and runtime JavaScript execution budgets.

---

## 9. Customer Communication & Notification Architecture (SMS & Email)

Currently, customer order placement and tracking rely on the public order tracking portal (`/track-order`) and order confirmation screens without sending external emails or SMS messages. When the client selects and registers with a messaging provider, integration should follow the architectural options evaluated below.

### 9.1 Local Bangladesh SMS Gateways

| Provider | Type & Coverage | Est. Unit Cost | Estimated Dev Effort | Strengths & Considerations |
| :--- | :--- | :--- | :--- | :--- |
| **Greenweb BD** | Local Aggregator (GP, Robi, BL, Teletalk) | ৳0.35 – ৳0.50 / SMS | **3 – 4 Hours** | **Recommended for Day One.** Simple REST API (token + to + message). Alphanumeric sender ID ("LaptopPoint") supported upon BTRC trade license verification. |
| **SSL Wireless (SMS Plus)** | Tier-1 Telco Aggregator | ৳0.40 – ৳0.55 / SMS | **4 – 5 Hours** | Enterprise reliability, high throughput, automated DND list handling. Requires formal business contract. |
| **BulkSMSBD (ElitBuzz)** | Local Aggregator | ৳0.30 – ৳0.45 / SMS | **3 – 4 Hours** | Cost-effective bulk rates; straightforward HTTP GET/POST API. |
| **Twilio SMS** | International Global Carrier | ~$0.06 – $0.08 / SMS (~৳7–9) | **2 – 3 Hours** | Easiest developer SDK, but high per-message cost for domestic Bangladesh mobile subscribers and sender ID restrictions. |

### 9.2 Transactional Email Providers

| Provider | Integration Type | Free Tier / Pricing | Estimated Dev Effort | Strengths & Considerations |
| :--- | :--- | :--- | :--- | :--- |
| **Resend** | Native React Email SDK / HTTP API | Free: 3,000 emails/mo (100/day); then $20/mo | **2 – 3 Hours** | **Recommended.** Modern DX, built specifically for Next.js and React Email components. Simple domain DNS verification (SPF, DKIM, DMARC). |
| **Postmark** | REST API / SMTP | Free trial: 100 emails; then $15/mo for 10k | **3 Hours** | Gold standard in transactional deliverability. Strict separation of marketing and transactional email streams. |
| **SendGrid (Twilio)** | REST API / SMTP | Free: 100 emails/day; then $19.95/mo | **3 – 4 Hours** | Widely used, comprehensive analytics, slightly more complex DNS verification. |

### 9.3 Recommended Integration Blueprint
1. **Abstract Dispatcher**: Create `lib/notifications/dispatcher.ts` defining `sendOrderPlacedAlert(order)` and `sendStatusUpdateAlert(order)`.
2. **Pluggable Drivers**: Guard provider calls behind environment variables:
   - `SMS_PROVIDER=greenweb|sslwireless|none`
   - `EMAIL_PROVIDER=resend|postmark|none`
3. **Async Non-Blocking Execution**: Call notification dispatches using Next.js `after()` or detached promises so external telco or SMTP API latency never delays checkout HTTP 200 responses.

---

## 10. System Architecture & Dual Catalog Model

The store is built on Next.js 16 (App Router, Webpack), React 19, Tailwind CSS v4, and Prisma 7 with PostgreSQL:

### 10.1 Dual Catalog Architecture
The store manages two distinct product types with specialized schemas:
1. **Laptops (`Product` / `RawProduct`)**:
   - **Data Stores**: Initial seed in `app/data/products.json`, dynamic overrides and custom products in PostgreSQL `ProductOverride` table (`system:products`), stock managed in `Inventory` table.
   - **Schema**: Grouped technical specs (`SpecGroups`: Processor, Memory, Storage, Display, Graphics, Ports, Battery).
   - **Visibility**: Filtered via `isPublicRaw()` — items marked `statusValue !== 'active'` (Draft or Archived) are excluded from the shop, search, sitemap, and checkout.
2. **Accessories (`Accessory`)**:
   - **Data Stores**: Initial seed in `app/data/accessories.json`, dynamic overrides in PostgreSQL `ProductOverride` (`system:accessories`).
   - **Schema**: Specialized accessory attributes (output wattage, pin type, compatible brands, warranty).
   - **Bridge Layer**: `lib/accessory-bridge.ts` enables the Admin Products interface to seamlessly manage both laptops and accessories from a single unified view.

### 10.2 Persistence & Serverless Cache Layer
- Because Vercel serverless instances feature a read-only filesystem and ephemeral lifetimes, all mutations persist directly to PostgreSQL.
- To prevent database connection exhaustion, in-memory caches use `TtlCache` with a short TTL (`DATA_CACHE_TTL_MS`, 15 seconds).
- Mutations immediately evict the local cache instance; peer instances achieve coherence within $\le 15$ seconds.

### 10.3 Authentication & Authorization Model
- Sessions are stored in HTTP-only, SameSite=Lax, Secure cookies encrypted via AES-GCM or HMAC using `ADMIN_SESSION_SECRET`.
- Role-based access control enforces least privilege across four staff roles:
  - `owner`: Unrestricted administrative authority.
  - `manager`: Catalog, inventory, orders, customer messages, print documents.
  - `marketing`: Products, banners, power deals, blog content.
  - `support`: Orders status tracking, questions, customer messages.
- Rate limiting enforces a 15-minute lockout after 5 consecutive failed login attempts.

### 10.4 Image Upload Pipeline
- Client uploads image binary to `/api/admin/upload`.
- Server validates file size, magic bytes MIME sniffing (rejecting disguised executables or SVGs), and strips malicious metadata.
- Re-encodes to optimized WebP format and uploads to ImageKit cloud storage (`/laptop-point/` folder).
- File ID and CDN URL are returned and stored with the product record.

---

## 11. Production Environment Variables Reference

| Variable | Required In Prod | Purpose | Example / Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Primary PostgreSQL connection with pooling | `postgresql://user:pass@ep-xyz.aws.neon.tech/laptoppoint?sslmode=require` |
| `ADMIN_PASSWORD` | **Yes** | Master break-glass administrator password | Strong random string (minimum 16 chars) |
| `ADMIN_SESSION_SECRET` | **Yes** | Encryption key for staff session cookies | Random 64-character hex string |
| `IMAGEKIT_PUBLIC_KEY` | **Yes** | ImageKit client API public key | `public_...` |
| `IMAGEKIT_PRIVATE_KEY` | **Yes** | ImageKit server API private key | `private_...` |
| `IMAGEKIT_URL_ENDPOINT` | **Yes** | ImageKit CDN domain | `https://ik.imagekit.io/laptoppoint` |
| `CRON_SECRET` | **Yes** | Bearer authentication for `/api/cron` | Random 32+ character hex string |
| `TRUSTED_PROXY` | **Yes** | Reverse proxy mode for accurate client IP detection | `vercel` |
| `ALLOW_PRODUCTION_SEED` | No (Safety) | Refuses destructive DB seeds unless explicitly `true` | `false` |
| `DATA_CACHE_TTL_MS` | Optional | In-memory cache duration in milliseconds | `15000` (Default: 15s) |
| `NEXT_PUBLIC_GTM_ID` | Optional | Google Tag Manager Container ID | `GTM-KXKXGWF6` |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Optional | Meta Pixel ID | `1676...` |

---

## 12. Deployment, Rollback & Verification Procedures

### Deploying to Vercel
1. Push committed code to GitHub `main` branch (or configured production branch).
2. Vercel automatically detects Next.js, executes `pnpm build`, and runs the production deployment.
3. Verify post-deploy health:
   ```bash
   curl -I https://laptoppointbd.com/api/health
   ```
   Confirm HTTP `200 OK` and `"status": "healthy"`.

### Rollback Procedure
If a regression or operational issue occurs in production:
1. Open the **Vercel Dashboard → Deployments**.
2. Locate the previous stable deployment commit.
3. Click the three dots (`...`) and select **Instant Rollback**.
4. Traffic is immediately redirected to the prior build within seconds without rebuilding.

---

## 13. Backup, Recovery & Background Jobs

### Automated Backup
Export database snapshot to timestamped JSON with SHA-256 integrity checksum:
```bash
node scripts/backup-db.mjs
```
Files are written to `backups/db-backup-YYYY-MM-DD.json` and `backups/db-backup-YYYY-MM-DD.json.sha256`.

### Disaster Recovery Runbook
Detailed instructions for restoring PostgreSQL using `pg_restore` or SQL dumps are documented in [`docs/RUNBOOKS/DATABASE_BACKUP_RESTORE.md`](file:///d:/ARTYX%20DIGITAL/lp-new-version/docs/RUNBOOKS/DATABASE_BACKUP_RESTORE.md).

### Background Jobs (Vercel Cron)
- Scheduled in `vercel.json`: `"schedule": "0 * * * *"` (Hourly).
- Endpoint `/api/cron` executes:
  - `deal-expiry`: Checks and deactivates expired Power Deals and promotional banners.
  - `prune-orphan-uploads`: Scans ImageKit uploads against active catalog references.

---

## 14. How to Run Tests & Verification Suites

The codebase includes zero-regression automated test suites using Node.js native test runner:

```bash
# Run all automated tests (112 tests)
pnpm test

# Run TypeScript type check (0 errors)
npx tsc --noEmit -p .

# Run ESLint compliance check (0 errors)
pnpm lint

# Run specific phase test suite
node --test scripts/tests/phase8-safety-ops.test.mjs
node --test scripts/tests/phase7-ux-seo.test.mjs
node --test scripts/tests/phase6-brand-readiness.test.mjs
node --test scripts/tests/order-money-rules.test.mjs
```

---

## 15. Known Limitations & Architecture Notes

1. **Phase 1 Live Staging Write Verification**:
   - As documented throughout development, write operations against a real PostgreSQL instance were verified using unit mocks and isolated simulators to protect the client's development database. Live write verification will be performed once the client provides an isolated staging database.
2. **Transactional SMS & Email Providers**:
   - Currently, order confirmation and tracking are delivered via on-screen invoices, challans, and the `/track-order` portal. External SMS or email dispatch requires the owner to activate a provider account (see Section 9).
3. **Variants Architecture**:
   - Product models are represented as discrete catalog SKUs with their specific RAM, SSD, and Grade configurations. Advanced multi-dimensional parent-child variant grouping is supported via schema flags (`NEXT_PUBLIC_ENABLE_VARIANTS=true`) but kept streamlined for ease of showroom inventory management.

---

## 16. Third-Party Accounts Transfer Matrix

| Provider | Purpose | Status |
| :--- | :--- | :--- |
| **Vercel** | Production Next.js hosting & edge network | Ready for team invite / ownership transfer |
| **Neon** | Serverless PostgreSQL database | Ready for project transfer |
| **ImageKit** | Media asset storage and image optimization CDN | Ready for account transfer |
| **Domain Registrar** | DNS nameservers for `laptoppointbd.com` | Client to point A / CNAME records to Vercel |
| **Google Search Console** | Sitemap submission & Google search indexing | Ready for ownership verification |
| **Google Analytics / GTM** | Web traffic & marketing analytics | Configured via `NEXT_PUBLIC_GTM_ID` |


