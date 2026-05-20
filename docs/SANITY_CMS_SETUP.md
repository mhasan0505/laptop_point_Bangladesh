# Sanity CMS Setup Guide for Product Management

This guide will help you set up Sanity CMS so clients can upload product descriptions and images through an intuitive interface.

## Overview

Your e-commerce site is already configured with Sanity CMS. Clients can access the Sanity Studio (admin panel) to manage products without touching code.

## Quick Start

### 1. Create Sanity Project (If Not Already Done)

If you haven't created a Sanity project yet:

```bash
# Login to Sanity
pnpm sanity login

# Initialize (if needed) or link existing project
pnpm sanity init
```

Follow the prompts to:

- Create a new project or select an existing one
- Note your **Project ID** (you'll need this)
- Create a dataset (usually "production")

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Sanity Configuration (Public - can be exposed to browser)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01

# Sanity API Token (Private - server-side only)
SANITY_API_TOKEN=your_write_token_here
```

**To get your API token:**

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to "API" tab → "Tokens"
4. Click "Add API Token"
5. Give it a name (e.g., "Production Write Token")
6. Set permissions to **Editor** (for read/write access)
7. Copy the token and paste it in your `.env.local`

### 3. Deploy Your Schema

Deploy your product schema to Sanity:

```bash
pnpm sanity:deploy-schema
```

This will push your product schema (with image support) to your Sanity project.

### 4. Access Sanity Studio

Once configured, you or your client can access the admin panel at:

```
http://localhost:3000/studio (development)
https://yourdomain.com/studio (production)
```

### 5. Configure CORS (Production)

For production, add your domain to Sanity's CORS origins:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to "API" tab → "CORS Origins"
4. Click "Add CORS Origin"
5. Add your production URL: `https://yourdomain.com`
6. Enable "Allow credentials"

## Product Schema Features

Your product schema supports:

### ✅ Basic Information

- **Product Name** (required)
- **SKU** (required)
- **Brand** (required)
- **Category** (required)
- **Description** (text field)

### ✅ Images

- **Multiple Product Images** (required, minimum 1)
- Drag and drop to reorder
- Automatic image optimization
- First image used as thumbnail

### ✅ Pricing & Stock

- **Price in BDT** (required)
- **Stock Quantity** (required)
- **Low Stock Threshold** (alerts when stock is low)
- **In Stock** (boolean toggle)

### ✅ Product Status

- Active (visible on website)
- Draft (hidden from website)
- Archived (hidden, for discontinued products)

### ✅ Specifications

- Processor
- RAM
- Storage
- Display
- Graphics
- Battery
- Weight

## Client Usage Guide

### How to Add a New Product

1. **Navigate to Studio**
   - Go to `/studio` in your browser
   - Login with Sanity credentials

2. **Create New Product**
   - Click "Product" in the left sidebar
   - Click "+ Create" button
   - Fill in the required fields (marked with \*)

3. **Upload Images**
   - Click "Upload" in the "Product Images" section
   - Select one or more images
   - Drag to reorder (first image = main product image)
   - Click image to edit alt text (for SEO)

4. **Add Description**
   - Write product description in the "Description" field
   - Keep it concise and customer-focused

5. **Set Price & Stock**
   - Enter price in BDT
   - Set initial stock quantity
   - Optionally set low stock alert threshold

6. **Add Specifications**
   - Expand "Specifications" section
   - Fill in relevant technical details

7. **Publish**
   - Click "Publish" button (top right)
   - Product is now live on the website!

### How to Edit a Product

1. Click "Product" in sidebar
2. Find the product in the list
3. Click to open
4. Make changes
5. Click "Publish" to save

### How to Remove Images

1. Open the product
2. Click the image to select it
3. Click the trash icon or press Delete
4. Click "Publish" to save

### Product Status Guide

- **Active**: Product is live and visible on website
- **Draft**: Product is saved but not visible to customers (use for preparation)
- **Archived**: Product is discontinued but data is preserved

## Integration with Your Website

Your website automatically fetches products from Sanity. When clients publish changes in Sanity Studio:

1. Products appear immediately (with caching)
2. Images are automatically optimized for web
3. Changes sync across all pages (shop, product details, etc.)

## Image Guidelines for Clients

For best results, advise clients to:

- **Format**: JPG or PNG
- **Size**: At least 800x800px (1200x1200px recommended)
- **Aspect Ratio**: Square (1:1) preferred for consistency
- **Background**: White or transparent
- **File Size**: Under 5MB per image
- **Naming**: Use descriptive names (e.g., "macbook-pro-m3-front.jpg")

## Troubleshooting

### Images Not Uploading

- Check file size (max 5MB)
- Try different browser
- Clear browser cache

### Changes Not Appearing on Website

- Wait 30-60 seconds for cache
- Hard refresh browser (Ctrl+Shift+R)
- Check if product status is "Active"

### Can't Access Studio

- Verify environment variables are set correctly
- Check if you're logged in to Sanity
- Verify CORS settings include your domain

## Support

For technical issues:

- Sanity Documentation: <https://www.sanity.io/docs>s>
- Sanity Community: <https://www.sanity.io/exchange/community>y>

## Next Steps

1. ✅ Complete environment setup
2. ✅ Deploy schema
3. ✅ Create test product
4. ✅ Configure CORS for production
5. ✅ Train client on studio usage
6. ✅ Provide client with login credentials

## Security Notes

- Keep `SANITY_API_TOKEN` secret (never commit to Git)
- Create separate tokens for development/production
- Only share Studio access with trusted users
- Regularly review API token usage in Sanity dashboard
