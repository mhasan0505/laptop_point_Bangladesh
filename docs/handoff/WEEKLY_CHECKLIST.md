# Weekly Operations & Maintenance Checklist

Perform these routine checks once per week (recommended: Thursday afternoon or Saturday morning) to maintain high sales momentum, catalog accuracy, and system health.

---

## 📋 1. Physical Inventory & Catalog Audit

- [ ] **Physical Stock Spot-Check**:
  - Walk the showroom shelves and spot-check 5 to 10 randomly selected laptops against **Admin → Products**.
  - Ensure every physically displayed laptop has accurate pricing and specifications listed on the website.
  - Check for laptops that were sold in the showroom but accidentally left as "In Stock" online.
- [ ] **Accessories Audit**:
  - Check charger stock counts in **Admin → Products** (filtered by Chargers).
  - Verify common charger pin types (Type-C, HP Blue Pin, Lenovo Square Tip, Dell 7.4mm) are adequately stocked.

---

## 💰 2. Pricing & Market Competitiveness Review

- [ ] **Review Market Rates**:
  - Compare popular model prices against current Elephant Road / IDB market trends.
  - Update prices using either the **Bulk Price CSV** feature or the inline product editor.
- [ ] **Rotate Power Deals & Flash Offers**:
  - Open **Admin → Power Deals**.
  - Check for expired countdown deals.
  - Select 2 or 3 high-margin or aging stock models and launch new 48-hour or weekend Power Deals.

---

## 🖼️ 3. Homepage & Marketing Refresh

- [ ] **Banner Rotation**:
  - Open **Admin → Banners**.
  - Update any promotional hero banners with new seasonal themes or special discounts.
- [ ] **Customer Reviews & Testimonials**:
  - Check Google Maps / Facebook reviews from happy buyers.
  - Follow up with recent courier delivery customers to request a 5-star Google Review for the Mirpur showroom.

---

## 🔒 4. Data Safety & Backup Routine

- [ ] **Run Scheduled Database Snapshot**:
  - In your server management terminal or office machine, run the automated backup utility:
    ```bash
    node scripts/backup-db.mjs
    ```
  - Confirm the generated file in `backups/db-backup-YYYY-MM-DD.json` and its `.sha256` checksum are saved.
  - Copy the weekly backup file to an encrypted external storage drive or company Google Drive for disaster recovery peace of mind.
- [ ] **Neon Cloud Snapshot**:
  - Log in to your Neon database dashboard and verify that automated daily cloud snapshots are active and healthy.

---

## 🛡️ 5. Security & Staff Access Review

- [ ] **Audit Staff Accounts**:
  - Open **Admin → Staff** (`/admin/staff`).
  - Review all active accounts.
  - If any showroom sales representative has resigned or changed positions, immediately deactivate their account or update their role.
- [ ] **System Uptime & Health Check**:
  - Visit `https://laptoppointbd.com/api/health` in your browser.
  - Confirm that the status reports `"status": "healthy"`, with `"database": true` and `"env": true`.
