# Client Data Remediation Guide
**Document Version:** 1.0.0  
**Target Audience:** Laptop Point BD Store Owner & Product Managers  

This guide provides exact, click-by-click administrative instructions to resolve data anomalies identified during the pre-delivery catalogue and inventory audit. In accordance with safety rules, no destructive direct database edits were made to client data files; all adjustments are performed safely via the Admin Panel.

---

## 1. Misfiled Accessory: Vention Laptop Stand

### Background
Product ID **47** (`ACER-VENTION-KDNW0-WHITE-LAPTOP-STAND`) is an ergonomic laptop stand entered into the **Laptops** catalog. Because it was filed as a laptop, it has blank laptop technical specifications (CPU, RAM, GPU) and includes body copy mentioning a third-party retailer ("Ryans Computers").

### Remediation Steps
1. Log in to the Admin Dashboard at `/admin`.
2. In the left navigation sidebar, click **Products** (`/admin/products`).
3. In the search box, type `Vention` or `47`.
4. Click on the product and select **Delete** (or toggle **Draft** to unpublish).
5. Next, in the left navigation sidebar, click **Accessories** (`/admin/accessories`).
6. Click the **"Add Accessory"** button at the top right.
7. Fill in the details:
   - **Name:** `Vention KDNW0 Ergonomic Folding Laptop Stand (White)`
   - **SKU:** `ACC-VEN-KDNW0-WHT`
   - **Category:** `Stands & Coolers`
   - **Price:** `1,250` (or current showroom selling price)
   - **Stock Quantity:** Enter current physical stock in Mirpur-10 showroom.
   - **Description:** `Adjustable ergonomic aluminum laptop stand suitable for 11" to 17" laptops. Improves airflow and posture.`
   - **Status:** Active
8. Click **Save Accessory**.

---

## 2. Blank Specifications on Core Laptop Models

### Background
Products **45** and **46** have blank fields for Processor, RAM, and Storage in their structured specification objects, which prevents filter tags from indexing them accurately on the storefront.

### Product ID 45: HP ProBook x360 435 G8
1. Navigate to **Admin → Products** (`/admin/products`).
2. Search for `435 G8` or open `/admin/products/edit/45`.
3. Scroll to the **Specifications** section and update:
   - **Processor:** `AMD Ryzen 5 5600U (6 Cores, 12 Threads, Up to 4.2 GHz)`
   - **RAM:** `8GB DDR4 3200MHz (Upgradeable)`
   - **Storage:** `256GB PCIe NVMe M.2 SSD`
   - **Display:** `13.3-inch FHD (1920x1080) IPS Touchscreen X360 360° Convertible`
   - **Graphics:** `AMD Radeon Graphics`
4. Click **Save Product**.

### Product ID 46: HP EliteBook 630 G10
1. Navigate to **Admin → Products** (`/admin/products`).
2. Search for `EliteBook 630` or open `/admin/products/edit/46`.
3. Scroll to the **Specifications** section and update:
   - **Processor:** `Intel Core i5-1335U 13th Gen (10 Cores, 12 Threads, Up to 4.6 GHz)`
   - **RAM:** `16GB DDR4 3200MHz`
   - **Storage:** `512GB PCIe Gen4 NVMe M.2 SSD`
   - **Display:** `13.3-inch FHD (1920x1080) Anti-Glare IPS 250 nits`
   - **Graphics:** `Intel Iris Xe Graphics`
4. Click **Save Product**.

---

## 3. Price Anomalies & Typo Corrections

### Product ID 19 (SKU: LEN-T14G2-018) — Typo in Market Price
- **Issue:** Regular price is entered as ৳410,000 (an accidental extra zero), showing an unrealistic 91% discount against the ৳37,500 selling price.
- **Remediation:**
  1. Open `/admin/products/edit/19`.
  2. Set **Regular / Market Price** to `41,000`.
  3. Keep **Sale Price** at `37,500`.
  4. Click **Save Product**. (Discount badge will now show a realistic ~9% discount).

### Product ID 26 (SKU: LEN-X1C-G6-I5-026) — Price Inversion
- **Issue:** Sale price (৳29,999) is higher than Regular price (৳29,500).
- **Remediation:**
  1. Open `/admin/products/edit/26`.
  2. Set **Regular / Market Price** to `33,000` (or original MSRP).
  3. Keep **Sale Price** at `29,999`.
  4. Click **Save Product**.

### Product ID 28 (SKU: HP-640G5-I5-028) — Zero Discount Display
- **Issue:** Regular price (৳25,900) equals Sale price (৳25,900).
- **Remediation:**
  1. Open `/admin/products/edit/28`.
  2. If on special promotion, set **Regular Price** to `28,500` and **Sale Price** to `25,900`.
  3. If regular non-discounted price, set both to `25,900` or clear regular price.
  4. Click **Save Product**.

---

## 4. Seeded Chargers & Test Accessories

### Chargers Stock & Imagery Update
1. Navigate to **Admin → Accessories** (`/admin/accessories`).
2. Review the 6 charger SKUs:
   - `ACC-CHG-HP-45W` (HP 45W Smart Blue-Pin Charger)
   - `ACC-CHG-HP-65W` (HP 65W Blue-Pin Charger)
   - `ACC-CHG-DELL-65W` (Dell 65W Barrel Charger)
   - `ACC-CHG-LEN-65W` (Lenovo 65W Slim Tip Charger)
   - `ACC-CHG-MAC-60W` (Apple 60W MagSafe 2 Charger)
   - `ACC-CHG-TYPEC-65W` (Universal 65W GaN Type-C Charger)
3. For each item:
   - Click **Edit**.
   - Update **Stock Quantity** to match your physical count.
   - Upload high-resolution photos of the actual charger and packaging.
   - If temporarily out of stock, toggle status to **Inactive**.
   - Click **Save**.

### Remove Test Accessories
1. In **Admin → Accessories**, search for `TEST-ACC`.
2. If any test records exist (e.g. `TEST-ACC-001`), click the trash/delete icon and confirm deletion.

---

## 5. Development Test Order Cleanup

### Order `ORD-13583666-609` (HP ProBook 440 G3)
- **Status:** Development test order placed during initial configuration.
- **Action:**
  1. Navigate to **Admin → Orders** (`/admin/orders`).
  2. Search for `ORD-13583666-609`.
  3. Click to open order details.
  4. Change status from `Pending` to **`Cancelled`**.
  5. Add note: *"Development smoke test cancellation"*.
  6. Click **Update Status**.
  7. Confirm in **Admin → Inventory** that `HP-440G3-001` available quantity is restored to **7**.

---

## 6. Pre-Launch Verification Checklist
- [ ] Vention Stand removed from Laptops and added under Accessories.
- [ ] HP ProBook x360 435 G8 specs entered and saved.
- [ ] HP EliteBook 630 G10 specs entered and saved.
- [ ] ThinkPad T14 Gen 2 market price corrected to ৳41,000.
- [ ] ThinkPad X1 Carbon Gen 6 pricing verified.
- [ ] All 6 charger accessories updated with real stock and photos.
- [ ] Test order cancelled and inventory restocked.
