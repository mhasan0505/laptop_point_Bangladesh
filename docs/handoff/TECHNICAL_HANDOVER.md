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


