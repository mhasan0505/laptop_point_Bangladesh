# Credentials & Account Transfer Template

> [!CAUTION]
> **Zero Real Secrets in Repository**: This document contains NO real passwords, database connection strings, or API private keys. It is a secure operational transfer template and checklist for the store owner.
> 
> When transferring ownership, share credentials ONLY through an encrypted password manager (such as Bitwarden, 1Password, or Proton Pass) or via one-time secure links (e.g. 1Password Psst or Bitwarden Send). Never send plain passwords via unencrypted WhatsApp or standard email.

---

## 1. Third-Party Account Ownership Transfer

The following service accounts manage your live website infrastructure and must be transferred to the business owner's email address:

| Service / Provider | Purpose | Owner Email on Account | Access Level to Transfer | Transferred Date & Verified |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel** | Web Application Hosting & Serverless Platform | `owner@laptoppointbd.com` | Primary Team Owner | `[ ] Pending` |
| **Neon / PostgreSQL** | Primary Production Database Cluster | `owner@laptoppointbd.com` | Project Admin / Billing Owner | `[ ] Pending` |
| **ImageKit.io** | High-Speed CDN & Product Photo Storage | `owner@laptoppointbd.com` | Master Account Owner | `[ ] Pending` |
| **Domain Registrar** (e.g., Namecheap / GoDaddy / Cloudflare) | DNS Authority for `laptoppointbd.com` | `owner@laptoppointbd.com` | Primary Account Holder | `[ ] Pending` |
| **Google Search Console** | SEO, Sitemap Submission & Google Search Health | `owner@laptoppointbd.com` | Verified Domain Owner | `[ ] Pending` |
| **Google Tag Manager / GA4** | Web Traffic & Visitor Analytics (`GTM-KXKXGWF6`) | `owner@laptoppointbd.com` | Administrator | `[ ] Pending` |
| **Meta Business Suite / Pixel** | Facebook Ad Tracking (`1676...`) | `owner@laptoppointbd.com` | Business Account Admin | `[ ] Pending` |
| **SMS Gateway Provider** | Transactional SMS Alerts (when activated) | `owner@laptoppointbd.com` | Account Owner / Sender ID | `[ ] Pending` |

---

## 2. Production Environment Variables Rotation Checklist

Before public launch, the following server environment variables must be rotated in the **Vercel Project Settings → Environment Variables**:

### 1. `DATABASE_URL`
- **Current State**: Dedicated cloud PostgreSQL connection.
- **Action**: Rotate the database user password in your Neon console and update the Vercel variable.
- **Format**: `postgresql://<user>:<strong-password>@<host>/<database>?sslmode=require`

### 2. `ADMIN_PASSWORD` (Master Break-Glass Admin Password)
- **Action**: Rotate to a strong, high-entropy password (minimum 16 characters including uppercase, numbers, and symbols).
- **CRITICAL**: Never leave this set to any default or previous development password (such as `admin@123`).

### 3. `ADMIN_SESSION_SECRET`
- **Action**: Generate a fresh, random 64-character hexadecimal key used to encrypt staff session cookies.
- **Command to generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 4. `CRON_SECRET`
- **Action**: Set a secure bearer authentication token to protect `/api/cron` background jobs from unauthorized public requests.
- **Command to generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
  ```

### 5. `IMAGEKIT_PRIVATE_KEY` & `IMAGEKIT_PUBLIC_KEY`
- **Action**: Obtain directly from ImageKit Developer Options (`https://imagekit.io/dashboard/developer/api-keys`).
- **Never expose**: The `IMAGEKIT_PRIVATE_KEY` must never be given a `NEXT_PUBLIC_` prefix.

### 6. `TRUSTED_PROXY`
- **Production Setting**: Must be set to `vercel` on production Vercel hosting to ensure customer IP rate-limiting accurately reads the true client IP from `x-forwarded-for`.

---

## 3. Credential Handover Sign-Off

I, the store owner of Laptop Point BD, confirm that I have received administrative control of the accounts and verified that all production passwords and API keys have been rotated to our private, secure management.

- **Store Owner Name**: ___________________________
- **Signature**: ___________________________
- **Date**: ___________________________
