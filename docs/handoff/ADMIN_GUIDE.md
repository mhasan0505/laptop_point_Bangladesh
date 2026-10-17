# Laptop Point BD — Store Administrator & Owner Manual

Welcome to your new e-commerce administration portal! This guide is written in plain, straightforward language to help you and your staff manage daily operations, add products, process customer orders, update prices, print invoices, and configure your store without needing technical assistance.

---

## Table of Contents
1. [Logging In & Account Security](#1-logging-in--account-security)
2. [Adding & Editing Laptops](#2-adding--editing-laptops)
3. [Adding & Editing Accessories](#3-adding--editing-accessories)
4. [Updating Stock & Prices Quickly](#4-updating-stock--prices-quickly)
5. [Hiding Products (Draft & Archive Mode)](#5-hiding-products-draft--archive-mode)
6. [Image Uploads & Recommended Sizes](#6-image-uploads--recommended-sizes)
7. [Adding YouTube Review Videos](#7-adding-youtube-review-videos)
8. [Homepage Banners & Layout](#8-homepage-banners--layout)
9. [Managing Power Deals & Flash Sales](#9-managing-power-deals--flash-sales)
10. [Answering Customer Product Questions (Q&A)](#10-answering-customer-product-questions-qa)
11. [Processing Orders, Invoices & Delivery Challans](#11-processing-orders-invoices--delivery-challans)
12. [Customer Messages & Contact Inquiries](#12-customer-messages--contact-inquiries)
13. [Staff Accounts & Role Permissions](#13-staff-accounts--role-permissions)
14. [Store Profile, Showroom Details & Policies](#14-store-profile-showroom-details--policies)
15. [Bulk Price CSV (Export & Import)](#15-bulk-price-csv-export--import)

---

## 1. Logging In & Account Security

### Accessing the Admin Console
- **Login URL**: Visit `https://laptoppointbd.com/admin/login` (or `/admin`).
- Enter your registered staff email and password.

### Security & Rate-Limit Lockout
- **15-Minute Lockout**: If an incorrect password is typed 5 times in a row, the portal will temporarily lock out login attempts from that internet connection for **15 minutes** to protect against unauthorized access.
- **Trusted Devices**: When you sign in from your office laptop or phone, your session stays active for up to 30 days unless you manually log out.
- **Logging Out**: Click your name in the bottom-left sidebar and select **Log Out** when using a shared computer.

---

## 2. Adding & Editing Laptops

### Adding a New Laptop
1. Go to **Admin → Products** from the left navigation menu.
2. Click the black **+ Add Product** button in the top right.
3. Keep the **Category** set to a laptop category (e.g., `Laptop`, `Ultrabook`, `Gaming Laptop`, `MacBook`).
4. Fill in the primary details:
   - **Product Name**: Full descriptive title (e.g., *Lenovo ThinkPad T14 Gen 2 Core i5 11th Gen 16GB RAM 512GB SSD*).
   - **Brand**: Select the brand (HP, Lenovo, Dell, Apple, Asus, Acer, etc.).
   - **Model**: Specific model name (e.g., *ThinkPad T14 Gen 2*).
   - **SKU**: Unique inventory code (e.g., *LEN-T14G2-019*). Each product must have its own unique SKU.
   - **Sale Price (৳)**: The actual price the customer will pay at checkout.
   - **Regular / Market Price (৳)**: The crossed-out comparison price (e.g., ৳65,000 crossed out, selling for ৳55,000).
   - **Condition**: Select *Used*, *Refurbished*, or *Brand New*.
   - **Grade**: Select cosmetic quality (*A+*, *A*, *B*).
   - **Stock Quantity**: Initial physical units available in your shop.
5. Enter detailed specifications using the categorized tabs:
   - **Processor**: e.g., Intel Core i5-1135G7, 2.40 GHz up to 4.20 GHz, 4 Cores, 8 Threads.
   - **Memory (RAM)**: e.g., 16 GB DDR4 3200MHz.
   - **Storage**: e.g., 512 GB NVMe M.2 SSD.
   - **Display**: e.g., 14.0-inch Full HD (1920x1080) IPS Anti-glare, Touchscreen (Yes/No).
   - **Graphics**: e.g., Intel Iris Xe Graphics.
   - **Ports & Connectivity**: HDMI, USB Type-C / Thunderbolt, USB 3.2, Audio Combo Jack, Wi-Fi 6, Bluetooth 5.2.
   - **Battery & Charger**: e.g., 3-cell 50Wh with 65W Type-C original adapter.
6. Upload photos (see [Image Uploads](#6-image-uploads--recommended-sizes) below).
7. Set **Status** to **Active** to publish immediately, or **Draft** to keep it private while preparing.
8. Click **Save Product**.

---

## 3. Adding & Editing Accessories

The catalog intelligently adapts its form when you are entering an accessory instead of a laptop.

### How to Add an Accessory
1. Go to **Admin → Products → Add Product**.
2. Change the **Category** dropdown to an accessory category:
   - `Laptop Charger / Adapter`
   - `Laptop Bag & Backpack`
   - `Mouse & Keyboard`
   - `Laptop Stand & Cooling Pad`
   - `Cable, Hub & Converter`
   - `RAM & Storage Upgrade`
3. **Form Change**: Notice how laptop-specific fields (CPU, RAM, Display) automatically disappear!
4. Fill in accessory-specific specifications:
   - **Compatible Brands**: e.g., HP, Lenovo, Dell, Universal.
   - **Output Power / Wattage**: e.g., *65W*, *45W*, *90W*, *135W*.
   - **Connector Pin Type**: e.g., *Type-C USB-PD*, *4.5mm Blue Pin*, *Round Pin 7.4mm*, *Square Yellow Slim Tip*.
   - **Warranty Period**: e.g., *6 Months Replacement Warranty*.
5. Save the product. It will automatically appear in the public `/accessories` storefront and category filters.

---

## 4. Updating Stock & Prices Quickly

You do not need to open the full edit page just to change quantity or price.

### Quick Stock Update (From Product List)
1. In **Admin → Products**, locate the product row.
2. In the **Stock** column, click the stock badge or click the **Box** icon.
3. Enter the new stock number (e.g., change `0` to `5` after receiving new showroom stock).
4. Click **Update Stock**. The shop stock updates instantly.

### Bulk Stock & Out-of-Stock Badges
- **Out of Stock**: When stock reaches `0`, the shop automatically displays an "Out of Stock" badge and prevents customers from adding it to their cart.
- **Low Stock**: When stock is between `1` and `4`, a subtle "Low Stock" indicator reminds customers to order before it sells out.

---

## 5. Hiding Products (Draft & Archive Mode)

If an item is being repaired, temporarily reserved, or discontinued:
1. Edit the product in **Admin → Products**.
2. Locate the **Visibility / Status** dropdown:
   - **Active**: Visible everywhere (shop, search, sitemap, Google indexing).
   - **Draft**: Completely hidden from the storefront, search, and category pages. Only staff can see it in Admin.
   - **Archived**: Discontinued item. Hidden from the storefront.
3. **Checkout Protection**: Even if a customer had an item in their browser cart before you marked it Draft, our checkout system will reject the purchase and explain that the item is no longer available.

---

## 6. Image Uploads & Recommended Sizes

High quality, clean photos dramatically increase customer trust and conversion.

### Recommended Image Guidelines
- **Product Showcase Photos**: Square format (`1:1` aspect ratio), recommended **1000 × 1000 pixels** (or minimum 800 × 800).
- **Format**: JPG, PNG, or WebP.
- **Background**: Solid clean white or light showroom surface.
- **Hero Homepage Banners**: Panoramic wide format (`16:5` or `16:6` aspect ratio), recommended **1920 × 600 pixels**.
- **Promotional Grid Banners**: Rectangular format (`4:3` or `16:9`), recommended **800 × 600 pixels**.

### How Uploading Works
- Images are automatically uploaded to your high-speed ImageKit CDN storage.
- Images are automatically resized and converted to modern WebP format for fast loading on customer mobile phones without consuming excessive mobile data.

---

## 7. Adding YouTube Review Videos

Adding hands-on showroom review videos builds immediate customer confidence.

1. Open any product in **Admin → Products**.
2. Scroll to the **Video Review URL** field.
3. Paste any valid YouTube link. All standard YouTube formats work:
   - `https://www.youtube.com/watch?v=ABC123xyz`
   - `https://youtu.be/ABC123xyz`
   - `https://www.youtube.com/shorts/ABC123xyz`
4. Save the product.
5. On the customer product page, an interactive video player and high-definition video badge will appear right alongside the photo gallery.

---

## 8. Homepage Banners & Layout

You can customize the promotions displayed on the front page without writing any code.

1. Navigate to **Admin → Banners**.
2. Here you can manage two types of banners:
   - **Main Hero Slider**: The large top carousel on the homepage. You can re-order slides, change titles, update promotional taglines, and set the destination button link (e.g. `/deals`, `/shop?brand=Lenovo`).
   - **Promotional Grid Banners**: The two middle banners highlighting seasonal offers (e.g. "Ramadan Discount", "Corporate Bulk Sale").
3. Set **Start Date** and **End Date** if you want the banner to appear and disappear automatically.

---

## 9. Managing Power Deals & Flash Sales

To run a limited-time flash sale on specific laptops:
1. Navigate to **Admin → Power Deals**.
2. Click **Create Deal**.
3. Select the laptop from your catalog.
4. Set the **Discount Percentage** or special promotional price.
5. Set the **Countdown Timer**: Enter the exact date and hour when the deal ends.
6. The product will feature a live countdown timer on the homepage and at `/power-deal`. When the timer expires, the product automatically reverts to its normal price without any manual intervention.

---

## 10. Answering Customer Product Questions (Q&A)

Customers can ask questions directly on any product page (e.g., *"Can I upgrade RAM to 32GB?"* or *"Does it come with original 65W charger?"*).

1. Go to **Admin → Questions**.
2. You will see all customer questions marked **Pending**.
3. Click **Reply** on a question.
4. Type your clear, polite answer.
5. Check **Publish Answer**.
6. The question and your verified staff answer will immediately appear on the product page under the **Q&A** tab for all future customers to read.

---

## 11. Processing Orders, Invoices & Delivery Challans

### Order Lifecycle & Status Progression
When a customer places an order on the website, it enters the **Orders Console** (`/admin/orders`):

```
Pending Review ➔ Confirmed ➔ Processing ➔ Shipped (Courier) ➔ Delivered
      │
      └──➔ Cancelled (Stock Restored Automatically)
```

1. **Pending**: New web order placed. Call customer to verify delivery address and phone number.
2. **Confirmed**: Customer confirmed order by phone. Package the laptop with charger and warranty memo.
3. **Processing**: Package boxed and ready for courier pickup.
4. **Shipped**: Handed over to courier (Steadfast, RedX, Pathao, Sundarban). Enter the Courier Tracking Code into the order.
5. **Delivered**: Courier collected cash (COD) and handed parcel to customer.

### Automatic Inventory Safety
- When an order is placed, stock is automatically reserved/decremented so you never double-sell a unique used laptop.
- If an order is marked **Cancelled** or **Returned**, our system **automatically restores the stock** to your inventory and creates an audit record in the inventory log.

### Printing A4 Tax Invoices & Delivery Challans
For every order, you can print official showroom paperwork with one click:
1. In **Admin → Orders**, click on the order or click the **Print** icon.
2. Choose **Invoice** or **Delivery Challan**:
   - **A4 Invoice**: Contains full financial breakdown, product specs, subtotal, courier charge, tax status, total in words (Bangladeshi Taka & Poisha), warranty policy, and showroom contact info.
   - **A4 Challan**: Official shipping document for the courier or customer receiver. Contains shipping details, product description, and receiver signature slip without financial prices.
3. Click the blue **Print Document** button. Use standard A4 paper in your showroom printer.

---

## 12. Customer Messages & Contact Inquiries

Customers submitting inquiries on the `/contact` page appear directly in **Admin → Messages**:
- Unread messages display a notification badge on the sidebar.
- Click any message to read the customer's full inquiry, email, and phone number.
- Click **Mark Handled** once you have phoned or emailed the customer.
- Spam and bot submissions are automatically filtered out.

---

## 13. Staff Accounts & Role Permissions

You can create individual logins for your showroom sales team without giving everyone full administrative power.

Go to **Admin → Staff** to manage accounts:

| Role | What They Can Do | What Is Hidden From Them |
| :--- | :--- | :--- |
| **Owner** | Everything. Full access to catalog, orders, staff accounts, store profile, policies, backups, and financial numbers. | Nothing. |
| **Manager** | Can add/edit products, change prices & stock, manage orders, print invoices, and respond to customer messages. | Cannot delete the Owner account or alter master store credentials. |
| **Marketing** | Can manage banners, create Power Deals, edit product descriptions/photos, and write blog articles. | Cannot change order statuses or alter banking/hotline details. |
| **Support** | Can view orders, update delivery tracking codes, answer customer Q&A, and reply to contact messages. | Cannot edit catalog prices or delete inventory. |

---

## 14. Store Profile, Showroom Details & Policies

All store contact details across the website (Header, Footer, Contact page, WhatsApp button, Map, and printed invoices) read from **Admin → Settings → Store Profile**:

- **Hotline Phone**: Updates phone link in header and footer.
- **WhatsApp Number**: Formatted automatically to open WhatsApp chat with pre-filled message.
- **Showroom Address**: Updates footer address, Google Maps pin, and invoice header.
- **Business Hours**: e.g. *Saturday – Thursday: 10:00 AM – 8:30 PM (Friday Closed)*.
- **Policies**: Click **Policies** to update Terms & Conditions, Privacy Policy, Return & Warranty Policy, and Shipping Rules. Changes take effect on the public legal pages immediately.

---

## 15. Bulk Price CSV (Export & Import)

To update prices for 20 or 50 laptops simultaneously:
1. Go to **Admin → Products**.
2. Click **Export CSV** in the top toolbar.
3. Save the file and open it in **Microsoft Excel** or **Google Sheets**.
4. Edit the numbers in the `sale_price` and `regular_price` columns.
   - *Do not change the `id` or `sku` columns!*
5. In Excel, choose **File → Save As → CSV (Comma delimited) (*.csv)**.
6. In **Admin → Products**, click **Import CSV**, select your updated file, and click **Apply Updates**.
7. All product prices will update immediately across the entire shop.
