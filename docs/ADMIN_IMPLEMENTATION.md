# Admin Panel Implementation Guide

## Overview

Your admin panel now includes:
1. **Real Order System** - Connected to Sanity CMS for order management
2. **Stock Management** - Real-time stock updates with Sanity
3. **Product Management** - Full CRUD operations on products
4. **Dashboard Analytics** - Real-time stats from Sanity

---

## 🚀 Setup Instructions

### 1. Install Required Dependencies

```bash
pnpm install @radix-ui/react-dialog
```

### 2. Configure Sanity

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token_here
```

**Important**: You need a **write token** for the admin panel to work. Get it from:
1. Go to https://sanity.io/manage
2. Select your project
3. Go to API settings
4. Create a new token with **Editor** permissions
5. Add it to your `.env.local` file as `SANITY_API_TOKEN`

### 3. Deploy Sanity Schemas

Run this command to deploy the new schemas to Sanity:

```bash
npx sanity@latest schema deploy
```

This will deploy:
- Enhanced **Product Schema** (with stock, SKU, brand, specs)
- **Order Schema** (with customer info, items, payment, status)

### 4. Start the Development Server

```bash
pnpm dev
```

---

## 📦 Features Implemented

### Product Management

**Location**: `/admin/products`

- ✅ View all products from Sanity
- ✅ Real-time stock tracking
- ✅ **Update stock quantities** with one click
- ✅ Search and filter products
- ✅ Delete products
- ✅  Low stock alerts

**How to update stock**:
1. Go to Products page
2. Click the Package icon (📦) in the Actions column
3. Enter new stock quantity
4. Click "Update Stock"

### Order Management

**Location**: `/admin/orders`

- ✅ View all orders from Sanity
- ✅ **Create new orders** manually  
- ✅ Track order status
- ✅ Search and filter orders
- ✅ Real-time order updates

**How to create an order**:
1. Go to Orders page
2. Click "Create Order" button
3. Fill in customer details
4. Add products (only showing in-stock items)
5. Select payment method
6. Click "Create Order"
7. **Stock is automatically reduced** when order is created

### Inventory Management

**Location**: `/admin/inventory`

- ✅ Real-time stock overview
- ✅ Low stock alerts (< 10 units)
- ✅ Out of stock tracking
- ✅ **Quick stock updates** from inventory page
- ✅ Total stock statistics

### Dashboard

**Location**: `/admin`

- ✅ Total products count (from Sanity)
- ✅ Total orders count
- ✅ Pending orders
- ✅ Total revenue (from delivered orders)
- ✅ Low stock items count
- ✅ Recent orders list
- ✅ Low stock products list

---

## 🗂️ File Structure

### New Files Created

```
lib/
  ├── sanity-admin.ts          # Sanity CRUD operations for admin
  
components/
  ├── admin/
  │   ├── StockUpdateDialog.tsx     # Modal for updating stock
  │   └── OrderCreateDialog.tsx     # Modal for creating orders
  ├── ui/
      ├── dialog.tsx              # Dialog component (new)
      ├── textarea.tsx            # Textarea component (new)
      └── label.tsx               # Label component (new)

sanity/
  └── schemas/
      ├── product.schema.ts       # Enhanced product schema
      ├── order.schema.ts         # Order schema (new)
      └── index.ts                # Updated exports
```

### Updated Files

```
app/
  └── admin/
      ├── page.tsx                 # Dashboard - uses Sanity data
      ├── products/page.tsx        # Products - CRUD with Sanity
      ├── orders/page.tsx          # Orders - full order management
      └── inventory/page.js        # Inventory - stock tracking
```

---

## 📊 Sanity Schemas

### Product Schema

```typescript
{
  name: string
  slug: { current: string }
  sku: string
  brand: string
  category: string
  price: number
  stock: number                    // NEW: Real stock tracking
  lowStockThreshold: number       // NEW: Alert threshold
  inStock: boolean
  status: "active" | "draft" | "archived"
  specs: {                         // NEW: Product specifications
    processor, ram, storage, display, graphics, battery, weight
  }
}
```

### Order Schema

```typescript
{
  orderNumber: string              // Auto-generated (#ORD123456)
  customer: {
    name, email, phone, address, city, postalCode
  }
  items: [{
    product: Reference<Product>
    quantity: number
    price: number                  // Price at purchase time
  }]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "cod" | "bkash" | "nagad" | "card" | "bank_transfer"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  orderDate: datetime
  trackingNumber?: string
  notes?: string
}
```

---

## 🔧 API Functions

### Product Operations

```typescript
// Fetch all products
const products = await fetchProducts();

// Update product stock
await updateProductStock(productId, newStock);

// Update product details
await updateProduct(productId, { 
  name, price, stock, status, etc.
});

// Delete product
await deleteProduct(productId);
```

### Order Operations

```typescript
// Fetch all orders
const orders = await fetchOrders();

// Create new order (auto-reduces stock)
const orderId = await createOrder({
  customer: { name, phone, email, address },
  items: [{ productId, quantity, price }],
  totalAmount,
  paymentMethod,
  notes
});

// Update order status
await updateOrderStatus(orderId, "shipped");
```

### Dashboard Statistics

```typescript
// Get comprehensive stats
const stats = await getAdminStatsFromSanity();
// Returns: {
//   totalProducts, totalOrders, pendingOrders,
//   totalRevenue, lowStockItems, deliveredToday
// }
```

---

## 🎯 How It Works

### Stock Management Flow

1. **Initial State**: Products loaded from Sanity with stock count
2. **User Updates**: Admin clicks "Update Stock" → Modal opens
3. **Update**: New stock sent to Sanity via `updateProductStock()`
4. **Real-time**: Products list refreshes with new stock
5. **Status Auto-update**: Stock < 10 → "Low Stock", Stock = 0 → "Out of Stock"

### Order Creation Flow

1. **Admin Creates Order**: Fills customer info and adds products
2. **Validation**: Checks if products have sufficient stock
3. **Order Saved**: Order created in Sanity with all details
4. **Stock Reduction**: Each ordered product's stock is automatically reduced
5. **Order Number**: Auto-generated with format `#ORD{timestamp}`

### Data Flow

```
Admin UI → sanity-admin.ts → Sanity Client → Sanity CMS
                ↓
           Real-time updates
                ↓
         Admin Dashboard reflects changes
```

---

## 🎨 UI Components

### StockUpdateDialog

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `product`: { id, name, currentStock }
- `onSuccess`: () => void

**Usage**:
```tsx
<StockUpdateDialog
  isOpen={dialogOpen}
  onClose={() => setDialogOpen(false)}
  product={{ id: "123", name: "HP Laptop", currentStock: 25 }}
  onSuccess={() => loadProducts()}
/>
```

### OrderCreateDialog  

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `products`: Array<{ id, name, price, stock }>
- `onSuccess`: () => void

**Usage**:
```tsx
<OrderCreateDialog
  isOpen={createDialogOpen}
  onClose={() => setCreateDialogOpen(false)}
  products={activeProducts}
  onSuccess={() => loadOrders()}
/>
```

---

## 🔐 Admin Access

**Login Credentials**:
- Email: `admin@laptoppointbd.com`
- Password: `admin@123`

**Change credentials** in `contexts/AdminAuthContext.tsx`:
```typescript
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@laptoppointbd.com";
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@123";
```

---

## 📝 Next Steps

### Recommended Enhancements

1. **Migrate JSON Products to Sanity**
   - Export products from `products.json`
   - Import them into Sanity Studio
   - Update frontend to use Sanity data

2. **Add Product Images Upload**
   - Enable image upload in product creation
   - Use Sanity's asset management

3. **Order Notifications**
   - Send email/SMS when order is created
   - Notify on status changes

4. **Customer Management**
   - Create customer accounts
   - Order history for customers
   - Loyalty program

5. **Analytics**
   - Sales charts
   - Product performance
   - Revenue trends

6. **Inventory Alerts**
   - Email alerts for low stock
   - Auto-reorder suggestions
   - Stock forecasting

---

## 🐛 Troubleshooting

### "Failed to  fetch products"
- Check `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
- Verify project exists in Sanity
- Run `npx sanity@latest schema deploy`

### "Failed to update stock"
- Ensure `SANITY_API_TOKEN` is set with **Editor** permissions
- Check token hasn't expired
- Verify product ID exists in Sanity

### "Order creation fails"
- Check all products in order exist in Sanity  
- Verify stock is sufficient
- Ensure write token has permissions

### Products not showing
- Deploy schemas: `npx sanity@latest schema deploy`
- Create some products in Sanity Studio (`/studio`)
- Check browser console for errors

---

## 🎉 Success!

You now have a fully functional admin panel with:
- ✅ Real order management system
- ✅ Live stock tracking and updates  
- ✅ Complete product CRUD operations
- ✅ Real-time dashboard analytics
- ✅ All connected to Sanity CMS

Access your admin panel at: **`http://localhost:3000/admin`**

---

## 📚 Additional Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI Components](https://www.radix-ui.com/)
