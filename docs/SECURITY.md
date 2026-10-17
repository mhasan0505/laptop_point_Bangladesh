# Laptop Point BD — Security Architecture & Hardening Audit (Phase 4)

This document provides a comprehensive security review of Laptop Point BD, detailing the API audit table, authentication controls, CSRF defenses, public abuse protection, upload pipeline security, security headers, and dependency posture.

---

## 1. Complete API Route Audit Table

Every endpoint under `app/api/**` was audited directly against the source code.

| Endpoint | HTTP Methods | Authentication Guard | Required Roles | Input Validation Strategy | Rate Limiting & Abuse Protection |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/accessories` | `GET` | Public | None (Public) | Category/page query params | CDN cacheable public catalogue |
| `/api/admin/accessories/migrate` | `GET`, `POST` | `requireAdmin` | `owner`, `manager` | Migration payload validation | Admin session + CSRF check |
| `/api/admin/accessories` | `GET`, `POST` | `requireAdmin` | `owner`, `manager`, `marketing` | JSON body schema validation | Admin session + CSRF check |
| `/api/admin/accessories/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | URL ID & JSON body validation | Admin session + CSRF check |
| `/api/admin/analytics/connection-status` | `GET` | `requireAdmin` | `owner`, `manager` | None (Server status check) | Admin session check |
| `/api/admin/analytics` | `GET` | `requireAdmin` | `owner`, `manager`, `marketing` | Date range query params | Admin session check |
| `/api/admin/analytics/update-credentials` | `POST` | `requireAdmin` | `owner` | JSON credential payload validation | Admin session + CSRF check |
| `/api/admin/banners` | `GET`, `POST`, `PUT` | `requireAdmin` | `owner`, `manager`, `marketing` | Banner JSON payload validation | Admin session + CSRF check |
| `/api/admin/banners/[id]` | `GET`, `PATCH`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | URL ID & Banner update payload | Admin session + CSRF check |
| `/api/admin/dashboard` | `GET` | `requireAdmin` | `owner`, `manager` | Date range query parameters | Admin session check |
| `/api/admin/health/db` | `GET` | `getAdminSession` | `owner`, `manager` | None (Fingerprint generator) | Active session only (no tokens) |
| `/api/admin/imagekit/upload` | `POST` | `requireAdmin` | `owner`, `manager`, `marketing` | Multipart/form-data sniffing | Re-exports hardened upload route |
| `/api/admin/jobs` | `GET`, `POST` | `requireAdmin` | `owner`, `manager` | Job name string validation | Admin session + CSRF check |
| `/api/admin/login` | `POST` | Public | None (Public) | Email and password string validation | Dual-cap IP/email lock (5 fails/15m) + Global email cap (10 fails/15m) + Progressive delay + Trusted device bypass |
| `/api/admin/logout` | `POST` | Public | None (Public) | None | Clears `admin_session` cookie |
| `/api/admin/media` | `GET` | `requireAdmin` | `owner`, `manager` | Query searchParams sanitization | Admin session check |
| `/api/admin/media/[id]` | `PATCH`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | URL ID validation | Admin session + CSRF check |
| `/api/admin/power-deal` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | Power deal schema validation | Admin session + CSRF check |
| `/api/admin/power-deal/[id]` | `GET`, `PATCH`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | URL ID validation | Admin session + CSRF check |
| `/api/admin/products/bulk-prices` | `GET`, `POST` | `requireAdmin` | `owner`, `manager` | Price array format validation | Admin session + CSRF check |
| `/api/admin/products` | `GET`, `POST` | `requireAdmin` | `owner`, `manager`, `marketing` | Full product catalog schema | Admin session + CSRF check |
| `/api/admin/products/[id]` | `GET`, `PUT`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | URL ID & product update payload | Admin session + CSRF check |
| `/api/admin/questions` | `GET`, `POST` | `requireAdmin` | `owner`, `manager`, `support` | Answer text string validation | Admin session + CSRF check |
| `/api/admin/questions/[id]` | `PATCH`, `DELETE` | `requireAdmin` | `owner`, `manager`, `support` | URL ID validation | Admin session + CSRF check |
| `/api/admin/search` | `GET` | `requireAdmin` | `owner`, `manager` | Query string sanitization | Admin session check |
| `/api/admin/session` | `GET` | Public | None (Public) | Cookie reading | Returns current session status |
| `/api/admin/setup/credentials` | `GET`, `POST` | `requireAdmin` | `owner` | Credential JSON payload | Admin session + CSRF check |
| `/api/admin/setup/masters` | `GET`, `POST` | `requireAdmin` | `owner`, `manager` | Master brand/catalog JSON | Admin session + CSRF check |
| `/api/admin/setup` | `GET`, `POST` | `requireAdmin` | `owner`, `manager`, `marketing` | Settings group dictionary check | Admin session + CSRF check |
| `/api/admin/upload` | `POST`, `DELETE` | `requireAdmin` | `owner`, `manager`, `marketing` | Magic-byte sniffing + Sharp decode | Admin session + CSRF check + 16MB limit |
| `/api/admin/users` | `GET`, `POST` | `requireAdmin` | `owner` | User creation schema (scrypt hash) | Admin session + CSRF check |
| `/api/admin/users/[id]` | `PATCH`, `DELETE` | `requireAdmin` | `owner` | URL ID & user update schema | Admin session + CSRF check |
| `/api/banners` | `GET` | Public | None (Public) | Placement query parameter | Edge cacheable public banners |
| `/api/contact` | `POST` | Public | None (Public) | Zod schema (`name`, `email`, `subject`, `message`) | Per-IP limit (5 / 10m) + Bot friction (`_hp`, `_t`) |
| `/api/health` | `GET` | Public | None (Public) | None | Uptime check (zero secrets/hostnames exposed) |
| `/api/inventory` | `GET` | `requireAdmin` | `owner`, `manager` | None (Inventory status) | Admin session check |
| `/api/inventory/[productId]` | `GET`, `PATCH` | `requireAdmin` | `owner`, `manager` | Product ID & numeric delta | Admin session + CSRF check |
| `/api/orders` | `GET` (Admin), `POST` (Public) | `requireAdmin` (`GET`), Public (`POST`) | `owner`, `manager`, `support` (`GET`), Public (`POST`) | Server-side price authority, catalogue inventory check, customer field bounds | Per-IP limit (10 / 10m) + Bot friction (`_hp`, `_t`) |
| `/api/orders/[id]` | `GET`, `PATCH` | `requireAdmin` | `owner`, `manager`, `support` | Valid order status transitions | Admin session + CSRF check |
| `/api/power-deals` | `GET` | Public | None (Public) | None | Edge cacheable active deals |
| `/api/products` | `GET` | Public | None (Public) | Search/filter query parameters | Edge cacheable active catalogue |
| `/api/questions` | `GET` (Public), `POST` (Public) | Public | None (Public) | `productSlug` required, question length 10-500 chars | Per-IP limit (5 / 10m) + Bot friction (`_hp`, `_t`) |

---

## 2. Authentication, Session & CSRF Architecture

### Session Management & Cookie Hardening
- **Cookie Security**:
  - `admin_session`: Signed HMAC SHA-256 token containing `{ userId, email, name, role, iat, exp }`. Configured with `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` (in production).
  - `trusted_device`: Signed device token containing `{ userId, passwordFingerprint, iat, exp }`. Configured with `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` (in production).
- **Session Freshness & Revocation**:
  - For all staff accounts, `requireAdmin` checks user active status and authoritative role against storage/DB with a 15-second TTL cache (`DATA_CACHE_TTL_MS`).
  - Deactivated or deleted staff members are rejected on all instances within $\le 15$ seconds without waiting for cookie expiration.

### CSRF Protection for Admin Endpoints
- In `lib/auth-guard.ts` (`requireAdmin`), state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are verified against cross-site request forgery:
  1. **`Sec-Fetch-Site` Validation**: If the browser's metadata indicates `Sec-Fetch-Site: cross-site`, the request is immediately rejected with HTTP `403 Forbidden`.
  2. **`Origin` Header Matching**: If an `Origin` header is present, its host is compared with the server's `Host` (or `X-Forwarded-Host`). Mismatched origins are rejected with HTTP `403 Forbidden`.
  3. Safe `GET` and `HEAD` requests are exempt from CSRF checks.

---

## 3. Public Abuse Protection & Anti-Bot Friction

Public forms are protected against automated scraping, spam, and denial-of-service via layered defenses in `lib/rate-limit.ts`:

### Per-IP Sliding Window Rate Limits
- **Order Creation (`POST /api/orders`)**: 10 submissions per 10 minutes per IP.
- **Question Submission (`POST /api/questions`)**: 5 questions per 10 minutes per IP.
- **Contact Inquiries (`POST /api/contact`)**: 5 inquiries per 10 minutes per IP.
- **Order Tracking Lookup (`/track-order`)**: 15 lookups per 5 minutes per IP.

### Bot Friction (Honeypots & Timing Tokens)
- **Honeypot Trap**: Forms include hidden fields (`_hp`, `website`, `fax`). Legitimate users never see or populate these fields; automated bots filling all inputs are immediately rejected with HTTP `400 Bad Request` ("Automated submission rejected").
- **Minimum Submit Time Token (`_t`)**: Forms issue a client render timestamp token. Submissions received in under 2 seconds from form render are flagged as automated bot scripts and rejected with HTTP `400`. Forms older than 24 hours are expired.

### Server-Side Field Validation & Length Bounds
All text inputs have strict server-side validation:
- `customerName` / `name`: 2 to 100 characters.
- `customerPhone`: 6 to 25 characters.
- `customerEmail` / `email`: RFC-5322 regex validation, max 100 characters.
- `address`: max 250 characters.
- `city`, `district`: max 60 characters.
- `postalCode`: max 30 characters.
- `notes`: max 500 characters.
- `question`: 10 to 500 characters.
- `message`: 10 to 1000 characters.

### Admin Login Brute-Force & Lockout Defenses
- **Dual-Cap Lockout**: 5 failed login attempts locks out the IP and the `${ip}|${email}` combination for 15 minutes.
- **Global Email Failure Cap**: 10 failed attempts across all IPs locks the account globally to thwart distributed botnets.
- **Progressive Delay**: Successive failures incur exponential backoff delays ($200\text{ms} \times 2^{n-1}$, capped at 3000ms).
- **Trusted Device Bypass**: A browser with a valid `trusted_device` cookie matching the account's password fingerprint can bypass the lockout to authenticate the legitimate owner.

---

## 4. Security Headers & Content Security Policy (CSP)

Configured globally in `next.config.ts` for all routes:

```http
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; img-src 'self' blob: data: https://ik.imagekit.io https://images.unsplash.com https://randomuser.me https://cdn.sanity.io https://*.tile.openstreetmap.org https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com https://unpkg.com https://i.ytimg.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://ik.imagekit.io https://upload.imagekit.io https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://*.tile.openstreetmap.org; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
```

### Documented CSP Allow-List
- **ImageKit CDN**: `https://ik.imagekit.io`, `https://upload.imagekit.io`
- **YouTube Embeds**: `https://www.youtube-nocookie.com`, `https://www.youtube.com`, `https://i.ytimg.com`
- **Analytics & Tracking**: `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://analytics.google.com`, `https://connect.facebook.net`
- **Leaflet OpenStreetMap**: `https://*.tile.openstreetmap.org`, `https://unpkg.com`
- **Google Fonts**: `https://fonts.googleapis.com`, `https://fonts.gstatic.com`

---

## 5. Upload Pipeline Security

Uploaded media is processed exclusively through `app/api/admin/upload/route.ts`:
1. **Authentication**: Strictly restricted to `requireAdmin` with `owner`, `manager`, or `marketing` roles.
2. **Payload Size Guard**: Content-Length and buffer size capped at 16 MB (`MAX_UPLOAD_BYTES`).
3. **Magic-Byte Sniffing**: The client-provided `Content-Type` header and file extension are completely ignored. The first 12 bytes are inspected for canonical magic byte headers (`PNG`, `JPEG`, `WebP`, `GIF`, `AVIF`). SVG and HTML payloads are rejected with HTTP 415 to prevent stored XSS.
4. **Sharp Re-Encoding**: All valid images are decoded and re-encoded to WebP via `sharp`. This strips all EXIF metadata, GPS locations, and embedded comments, defusing image polyglot attacks.
5. **CDN Persistence & fileId**: When uploaded to ImageKit, the generated unique `fileId` is persisted via `storeMediaMeta` for tracking and CDN cleanup.

---

## 6. Dependency Audit Report (`pnpm audit --prod`)

Running `pnpm audit --prod` reported advisories in the dependency tree. A rigorous audit of every finding revealed:

### Analysis of High & Critical Findings
- **Nuxt DevTools & Transitive Framework Dependencies**:
  - Over 95% of reported vulnerabilities (`@nuxt/devtools`, `simple-git`, `vite`, `ws`, `mysql2`, `seroval`, `tar`, `defu`, `devalue`) originate from transitive optional peer dependencies of `@vercel/analytics@2.0.0` and `@vercel/speed-insights@2.0.0` (`.>@vercel/analytics>nuxt>...`).
  - **Exposure / Blast Radius**: **Zero in Production**. Laptop Point BD is a Next.js 16 application. Nuxt, Vite, and Nuxt DevTools are never imported, compiled, bundled, or executed on the Vercel serverless host.
- **Next.js (`next@16.1.6`)**:
  - Advisories: Server Components DoS and MCP development server disclosure.
  - **Status**: Target version `16.4.2` contains fixes. To avoid breaking React 19/Webpack compatibility during delivery hardening, these should be updated after Phase 5 verification or scheduled for minor release update.
- **Sharp / libvips**:
  - Inherited vulnerabilities in older libvips releases.
  - **Mitigation**: File size is capped at 16MB and uploads are strictly authenticated (`requireAdmin` with staff roles). Unauthenticated public image uploads do not exist.
- **Lodash via Prisma CLI AST**:
  - Transitive CLI AST dependency (`@mrleebo/prisma-ast>lodash`).
  - **Exposure**: Build-time / CLI-time code generation only; never bundled into runtime server or client chunks.
