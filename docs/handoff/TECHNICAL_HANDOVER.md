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
