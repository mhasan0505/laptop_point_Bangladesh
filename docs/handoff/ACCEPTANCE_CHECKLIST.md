# Client Acceptance Sign-Off Checklist

This checklist guides the store owner through the final acceptance walkthrough of Laptop Point BD before opening the digital storefront to the public. Each item should be physically tested and checked off.

---

## 1. Storefront Browsing & Search Experience

- [ ] **Homepage Presentation**:
  - Store logo (`/Logo.webp`) and favicon load crisply without distortion.
  - Hero slider functions smoothly and links to promotional deals.
  - Featured laptops and power deals display accurate BDT pricing (৳) and stock badges.
  - Trust Row badges link to legitimate store policies (`/returns`, `/shipping`, `/EMI`).
- [ ] **Product Catalog & Filters**:
  - Brand filters (HP, Lenovo, Dell, Apple, etc.) filter products accurately.
  - Price slider filters laptops within selected budget ranges.
  - Search bar in header finds laptops by brand, model, or processor keyword.
- [ ] **Product Details Page**:
  - High-resolution photo gallery supports click-to-zoom.
  - Full technical specifications (CPU, RAM, SSD, Display, Battery) display cleanly.
  - Hands-on YouTube review video embeds and plays smoothly when present.
  - "Ask a Question" form allows customer questions.
- [ ] **Accessories Storefront (`/accessories`)**:
  - Chargers, bags, mouse, keyboards, and stands display in dedicated categories.
  - Charger listings display connector pin type, wattage, and compatible laptop brands without confusing CPU/RAM specs.
- [ ] **Mobile & Tablet Responsiveness**:
  - Tested on customer mobile phone (iOS / Android). Navigation drawer opens smoothly.
  - Sticky bottom mobile bar provides one-tap access to Shop, Cart, WhatsApp chat, and Order Tracking (`/track-order`).

---

## 2. Cart, Pricing & Checkout Rules

- [ ] **Authoritative Server Pricing**:
  - Subtotal, shipping charge, and final total calculate accurately.
  - Automatic **Free Shipping** applies for orders $\ge ৳50,000$ (except express VIP courier).
  - Inside Dhaka (৳100) and Outside Dhaka (৳150) delivery zone charges calculate according to Commerce settings.
- [ ] **Checkout Submission**:
  - Placing an order with Cash on Delivery (COD) succeeds and provides a clean confirmation screen with the generated Order Number (e.g. `ORD-20261017-001`).
  - Bot protection silently blocks automated spam without bothering real customers.
- [ ] **Public Order Tracking (`/track-order`)**:
  - Customer can enter their Order Number and Phone Number to check real-time order status and courier tracking.
  - Zero private customer data (address, price, phone, email) is ever exposed on the public lookup screen.

---

## 3. Administrative Console & Inventory Management

- [ ] **Admin Authentication**:
  - Staff login works smoothly at `/admin/login`.
  - 15-minute rate-limit lockout activates if 5 consecutive wrong passwords are typed.
- [ ] **Adding & Editing Products**:
  - Added a test laptop with specs, photos, and price; verified it shows up on `/shop`.
  - Added a test accessory; verified form automatically adapts to accessory fields (pin type, wattage).
  - Quick Stock Dialog updates stock quantity immediately from the products list.
  - Changed a product's visibility to **Draft**; confirmed it is immediately hidden from `/shop` and search.
- [ ] **Power Deals & Flash Offers**:
  - Created a 24-hour countdown flash sale in **Admin → Power Deals**; verified countdown timer displays on product card.
- [ ] **Product Q&A Management**:
  - Answered a pending customer question in **Admin → Questions**; verified the answer published immediately to the product page.

---

## 4. Order Fulfillment, Documents & Restocking Safety

- [ ] **Order Management Workflow**:
  - Verified new order appears in **Admin → Orders** as **Pending**.
  - Updated status to **Confirmed**, then **Processing**, then **Shipped**.
  - Entered courier tracking code and verified it appears on the customer's `/track-order` screen.
- [ ] **Document Printing**:
  - Printed official **A4 Tax Invoice**: Verified BDT currency symbol (৳), amount in words (Taka & Poisha), showroom contact details, and item details.
  - Printed official **A4 Delivery Challan**: Verified clean packing slip with receiver signature line.
- [ ] **Restocking Safety Guard**:
  - Cancelled a test order; verified that the inventory quantity **automatically restored** to stock and logged an audit entry in the inventory history.

---

## 5. Contact Inquiries, Legal & Brand Compliance

- [ ] **Contact Form**:
  - Submitted a test inquiry at `/contact`.
  - Verified inquiry appears in **Admin → Messages** with unread badge notification.
  - Marked inquiry as handled.
- [ ] **Single Source of Store Details**:
  - Verified hotline (`+880 1612-182408`), WhatsApp, showroom address (Madbar Mansion, Shop-08, Mirpur-10), and business hours match Store Profile across Header, Footer, Contact page, and printed documents.
  - WhatsApp chat button opens chat with pre-formatted inquiry text.
  - Showroom map opens centered on Mirpur-10 showroom location.
- [ ] **Legal Policies**:
  - Verified `/privacy`, `/terms`, `/returns`, and `/shipping` pages display owner policies saved in Admin Setup with stable update dates.

---

## 6. Operations, Backups & Maintenance

- [ ] **Automated Database Backup**:
  - Executed `node scripts/backup-db.mjs` and verified JSON snapshot and SHA-256 checksum created in `backups/`.
  - Verified disaster recovery runbook is accessible in `docs/RUNBOOKS/DATABASE_BACKUP_RESTORE.md`.
- [ ] **Vercel Cron Automation**:
  - Confirmed hourly cron trigger (`0 * * * *`) in `vercel.json` is configured to run deal expiry and maintenance tasks.
- [ ] **System Health Check**:
  - Visited `/api/health` and confirmed `"status": "healthy"`, `"database": true`, `"env": true`.

---

## 7. Mandatory Notes & Disclosures

> [!IMPORTANT]
> **Phase 1 Live Database Write Verification Status**:
> Phase 1 database write persistence on serverless instances has been thoroughly tested and verified via in-memory and simulated environments. To complete formal sign-off, run `scripts/test-readonly-persistence.mjs --acceptance` once your isolated staging database is provisioned.

---

## Formal Acceptance Sign-Off

We hereby certify that Laptop Point BD has been thoroughly inspected, tested, and accepted as fully deliverable for public launch.

**For the Development Team:**
- Name: ___________________________
- Signature: ___________________________
- Date: ___________________________

**For the Client (Store Owner / Laptop Point BD):**
- Name: ___________________________
- Title: Store Owner
- Signature: ___________________________
- Date: ___________________________
