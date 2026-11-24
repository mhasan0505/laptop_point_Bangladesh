# ☁️ Cloudflare R2 Asset Storage & CDN Guide

This project is fully configured for **Cloudflare R2** with **$0 egress fees**, edge caching, and zero-risk asset migration.

---

## 1. Quick Setup in Cloudflare Dashboard

### Step 1: Create Your R2 Bucket
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, click **R2** (or **Storage > R2**).
3. Click **Create bucket**.
4. Name your bucket: `laptoppoint-assets` (or your preferred name) and select **Automatic** location.
5. Click **Create bucket**.

### Step 2: Connect a Custom Domain (or Enable Public URL)
1. In your new bucket page, navigate to the **Settings** tab.
2. Scroll down to **Public access** &rarr; **Custom Domains**.
3. Click **Connect Domain** and enter a subdomain (e.g. `assets.laptoppoint.com.bd` or `media.laptoppoint.com.bd`).
4. Follow the prompt to connect it (Cloudflare configures the DNS record and free SSL automatically).
   *(Alternatively, under **R2.dev subdomain**, click **Allow Access** to get a public `https://pub-xxxx.r2.dev` testing URL).*

### Step 3: Generate R2 API Credentials
1. Go back to the main **R2** page in Cloudflare.
2. On the right side, click **Manage R2 API Tokens**.
3. Click **Create API token**.
4. Set Permissions: **Object Read & Write**.
5. Specify bucket: Apply to `laptoppoint-assets` (or all buckets).
6. Click **Create API Token**.
7. Copy the values:
   - **Account ID** (visible on the R2 dashboard or right sidebar)
   - **Access Key ID**
   - **Secret Access Key**

---

## 2. Environment Variables

Add the following to your `.env.production` (and `.env.local` for local dev):

```env
# ==============================================================================
# CLOUDFLARE REVERSE PROXY & R2 ASSET STORAGE
# ==============================================================================
TRUSTED_PROXY=cloudflare
STORAGE_PROVIDER=r2

R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="laptoppoint-assets"

# Custom Domain (or pub-xxxx.r2.dev)
R2_PUBLIC_URL="https://assets.laptoppoint.com.bd"
NEXT_PUBLIC_R2_PUBLIC_URL="https://assets.laptoppoint.com.bd"
```

---

## 3. Migration Commands (Safe & Automated)

Four automated scripts are ready in `package.json`:

### 🛡️ Step 1: Create a Safety Backup (Zero Risk)
```bash
pnpm r2:backup
```
* Safely copies all 314 asset files (63+ MB) from `public/products`, `public/brands`, `public/Hero`, etc., into a timestamped local backup folder (`backups/public-assets-<date>/`).

### 🧪 Step 2: Dry Run (Simulate Migration)
```bash
pnpm r2:migrate:dry
```
* Scans all local images, prepares the S3 keys, and simulates the upload without making changes to R2.

### 🚀 Step 3: Run the Migration
```bash
pnpm r2:migrate
```
* Uploads all assets to your Cloudflare R2 bucket with 1-year Cloudflare Edge Cache headers (`Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable`).
* Automatically skips any file that already exists in R2 with matching size (saves Class A write quota).
* Generates `app/data/r2-migration-manifest.json`.

### 🔍 Step 4: Verify Remote Health
```bash
pnpm r2:verify
```
* Performs concurrent HTTP requests against Cloudflare R2 to guarantee that every single image returns `200 OK` with valid content headers.

---

## 4. How Existing Product URLs Continue Working

You **do not** need to edit hundreds of product URLs in `products.json` or database tables!

Next.js is configured with automatic rewrites in [next.config.ts](file:///C:/Users/Laptop%20Point%20BD/.gemini/antigravity/worktrees/laptop_point_Bangladesh/cloudflare_r2_asset_storage/next.config.ts):
```typescript
{
  source: "/products/:path*",
  destination: "https://assets.laptoppoint.com.bd/products/:path*",
},
{
  source: "/uploads/:path*",
  destination: "https://assets.laptoppoint.com.bd/uploads/:path*",
}
```
Any `<Image src="/products/hp/.../main.jpg" />` in your app will automatically stream directly from Cloudflare R2!

---

## 5. Admin Panel Uploads & Deletes

When an admin uploads a product image via the admin dashboard:
1. Image is processed into WebP via Sharp.
2. Uploads directly to Cloudflare R2 (`uploads/<timestamp>-<name>.webp`).
3. Returned URL points to your Cloudflare R2 CDN domain.
4. Deleting an asset via the admin panel automatically removes it from Cloudflare R2 and clears metadata.
