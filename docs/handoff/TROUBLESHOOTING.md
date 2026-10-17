# Troubleshooting Guide for Store Owner & Administrators

This guide explains how to quickly diagnose and resolve common issues that may arise during day-to-day operations.

---

## 1. Image Won't Upload

### Symptoms
- An upload error toast appears (*"Unsupported file"* or *"Failed to upload"*).
- The thumbnail remains blank after selecting a file.

### Common Causes & Solutions
1. **File is Too Large**:
   - *Cause*: High-resolution camera photos directly from DSLR or mobile phones can sometimes exceed the maximum upload limit (default: 8 MB).
   - *Fix*: Resize the image to under 2 MB or under 2000 × 2000 pixels before uploading. Standard photo editing tools or WhatsApp can quickly reduce image dimensions.
2. **Unsupported File Format**:
   - *Cause*: Uploading formats like `.heic` (iPhone default raw), `.svg`, `.bmp`, `.tiff`, or PDF.
   - *Fix*: Convert the photo to standard **JPG**, **PNG**, or **WebP** format. (SVG files are deliberately blocked to prevent web security vulnerabilities).
3. **ImageKit Cloud Storage Keys**:
   - *Cause*: In a new production deployment, the `IMAGEKIT_PRIVATE_KEY` or `IMAGEKIT_PUBLIC_KEY` environment variables might be missing.
   - *Fix*: Check with your technical administrator to confirm that ImageKit credentials in Vercel project settings match your active ImageKit account.

---

## 2. Product Not Showing on the Website

### Symptoms
- You saved a laptop, but it does not appear on `/shop`, `/deals`, or search.

### Checklist
1. **Check Visibility Status**:
   - Open **Admin → Products** and locate the item.
   - Is the status set to **Draft** or **Archived**?
   - *Solution*: Set status to **Active** and save.
2. **Check Stock Quantity**:
   - Is the stock quantity **0**?
   - *Solution*: The store automatically marks zero-stock products as "Out of Stock" or places them at the bottom of listings. Increase the stock quantity to **1** or higher.
3. **Serverless Cache Delay (15 Seconds)**:
   - When you edit a product, changes take effect immediately on your computer, but other visitors on different internet servers may take up to **15 seconds** to refresh their cache. Wait 15 seconds and refresh the browser with `Ctrl + F5` (or `Cmd + Shift + R`).
4. **Category Filter**:
   - If an accessory was created under a laptop category (or vice versa), it will appear in the wrong section of the website. Edit the product and verify the **Category** dropdown.

---

## 3. Order Stuck or Customer Cannot Track Order

### Symptoms
- Customer enters their phone and order number at `/track-order`, but receives *"No order found matching these details"*.

### Common Causes & Solutions
1. **Exact Number Matching**:
   - *Cause*: The customer typed an incorrect phone number or omitted a leading zero (e.g. `1711223344` instead of `01711223344`).
   - *Fix*: Ensure the phone number entered matches exactly what was recorded when the order was submitted.
2. **Order Number Format**:
   - The tracking portal requires the full order number (e.g. `ORD-20261017-001`).
3. **Uniform 404 Privacy Protection**:
   - To protect customer privacy and prevent strangers from guessing other people's phone numbers or orders, our tracking system deliberately returns the same polite message whether the order doesn't exist or the phone number doesn't match.
4. **Rate Limiting (15 Lookups per 10 Minutes)**:
   - If someone repeatedly tests random order numbers, their IP address is temporarily blocked for 10 minutes to protect customer data.

---

## 4. Can't Log In / Locked Out of Admin

### Symptoms
- Login button fails with *"Too many login attempts. Please try again in 15 minutes."*

### Why This Happens & How to Fix It
- **Brute-Force Protection**: If someone enters an incorrect password 5 times consecutively, the system locks that specific computer connection for **15 minutes**.
- **Immediate Solutions**:
  1. **Wait 15 Minutes**: The lockout timer clears automatically after 15 minutes.
  2. **Switch Networks**: If you need urgent access immediately, connect your laptop to your mobile phone's 4G hotspot. This gives you a fresh connection with a clean attempt counter.
  3. **Password Reset**: If you have forgotten the master owner password, contact your technical administrator to generate a new password or set the temporary break-glass environment variable `ADMIN_PASSWORD` in your Vercel hosting settings.

---

## 5. Where to Look for System Health & Logs

If something unexpected happens on the website:

1. **System Health Check**:
   - Open `https://laptoppointbd.com/api/health`.
   - If `status` is `healthy`, the database and server are functioning normally.
   - If `checks.database` is `false`, the PostgreSQL database connection has been paused or lost network connectivity.
2. **Vercel Operational Logs**:
   - Log in to your Vercel Dashboard at `https://vercel.com`.
   - Go to **Project → Logs**.
   - Filter by `error` or search for terms like:
     - `order_failed` (shows any failed customer order attempts with exact error descriptions).
     - `login_failed` (shows unauthorized administrative login attempts).
     - `upload_failed` (shows reasons for image upload rejections).
