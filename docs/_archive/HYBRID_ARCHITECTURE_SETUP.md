# PostgreSQL + Prisma Hybrid Architecture — Setup Guide

**Date:** March 20, 2026
**Status:** ✅ Ready for development
**Scope:** Orders, inventory, transactional data only (excludes Stripe payments)

---

## 📋 Overview

This project now uses a **hybrid data model**:

- **Sanity CMS** → Product catalog, descriptions, images, marketing content
- **PostgreSQL + Prisma** → Orders, line items, inventory, stock movements
- **Next.js API Routes** → REST endpoints for checkout & admin order management

**Why this design:**

- Prevents overselling during concurrent orders (atomic transactions)
- Cleaner accounting/refund workflows
- Sanity stays focused on content
- Easy to add payment gateway later (Stripe, bKash, etc.)

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 22+
- PostgreSQL 14+ (local or cloud like Supabase, Neon, Render)
- pnpm 10+

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and fill in DATABASE_URL
# Example for local PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/laptop_point"
# Example for Neon/Supabase:
# DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?schema=public"
```

### 3. Initialize Database

```bash
# Generate Prisma TypeScript client
pnpm prisma:generate

# Create tables in your database
pnpm prisma:migrate

# Populate Inventory table from products.json
pnpm prisma:seed
```

### 4. Start Development

```bash
pnpm dev
```

Your app is now ready:

- **Frontend:** http://localhost:3000
- **Checkout** → Calls `POST /api/orders`
- **Admin → Orders** → Calls `GET /api/orders`, `PATCH /api/orders/[id]`

---

## 📊 Data Model

### Orders & Inventory

**`Order`** (one per customer transaction)

```
- id (cuid) | orderNumber (ORD-timestamp-random)
- customerName, phone, email, address, city, district
- totalAmount, subtotal, shippingCost
- status (Pending | Processing | Shipped | Delivered | Cancelled)
- paymentMethod (cod | bkash | nagad | card)
- paymentStatus (pending | paid | failed | refunded)
- items (OrderItem[])
- statusHistory (OrderStatusEvent[])
```

**`OrderItem`** (line item snapshot)

```
- productId (references Sanity or products.json id)
- sku, name, unitPrice (locked at purchase), quantity
- inventoryDeducted (bool)
```

**`Inventory`** (per-product stock)

```
- productId | sku | name
- quantity (available units)
- reserved (for pending orders)
```

**`InventoryLog`** (append-only audit trail)

```
- productId, sku, delta (-/+), reason (sale|restock|adjustment|return)
- orderId (for traceability)
```

---

## 🔌 API Endpoints

### Orders

**`GET /api/orders`**
List all orders with optional filters.

```bash
curl "http://localhost:3000/api/orders?status=Pending&search=john"
```

Returns: `Order[]` with items and statusHistory

**`POST /api/orders`**
Create a new order (checkout).

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+8801234567890",
    "customerEmail": "john@example.com",
    "address": "Apt 5, Building A",
    "city": "Dhaka",
    "district": "Dhaka",
    "postalCode": "1207",
    "paymentMethod": "cod",
    "notes": "Coffee delivery to apartment entrance",
    "items": [
      {
        "productId": "1",
        "sku": "HP-440G3-001",
        "name": "HP ProBook 440 G3",
        "unitPrice": 19990,
        "quantity": 1
      }
    ],
    "subtotal": 19990,
    "shippingCost": 100,
    "totalAmount": 20090
  }'
```

Returns: `{ success: true, orderNumber: "ORD-...", id: "..." }`
Errors: `409 Conflict` (stock unavailable), `400 Bad Request`, `500 Server Error`

**`GET /api/orders/[id]`**
Retrieve single order (by cuid or orderNumber).

```bash
curl http://localhost:3000/api/orders/ORD-12345678-001
```

Returns: Order with full history

**`PATCH /api/orders/[id]`**
Update order status & add status event.

```bash
curl -X PATCH http://localhost:3000/api/orders/ORD-12345678-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped",
    "note": "Handed to courier at 2:30 PM",
    "trackingNumber": "TRK123456789"
  }'
```

Returns: Updated Order

### Inventory

**`GET /api/inventory`**
List all inventory sorted by quantity (low stock first).

**`GET /api/inventory/[productId]`**
Get single product's inventory.

**`PATCH /api/inventory/[productId]`**
Update stock (absolute or relative).

```bash
# Set absolute quantity
curl -X PATCH http://localhost:3000/api/inventory/1 \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 50, "reason": "restock", "note": "New shipment arrived" }'

# Relative delta
curl -X PATCH http://localhost:3000/api/inventory/1 \
  -H "Content-Type: application/json" \
  -d '{ "delta": 10, "reason": "correction", "note": "Physical count adjustment" }'
```

---

## 🔒 Transaction Safety

The `POST /api/orders` endpoint is **atomic**:

1. **Check phase:** Verify all items have sufficient stock
2. **Create phase:** Insert Order + Items + first status event
3. **Deduct phase:** Atomically update Inventory rows + append InventoryLog

If any phase fails, **all changes are rolled back**. You'll get a `409 Conflict` error with the item name and available vs. requested quantities.

```bash
# This would fail if HP ProBook only has 2 units
curl -X POST http://localhost:3000/api/orders ... -d '{
  ...
  "items": [
    { "productId": "1", "quantity": 5 }  ← More than available!
  ]
}'
# Response: 409 Conflict
# { "error": "Insufficient stock for \"HP ProBook 440 G3\": requested 5, available 2" }
```

---

## 🛠️ Database Management

### Useful Commands

```bash
# View/edit database in UI (won't work without running server)
pnpm prisma:studio

# Check migration status
# (Shows which migrations are pending, already applied, etc.)

# Reset database (⚠️ destroys all data, re-runs migrations, re-seeds)
# Only for development!
pnpm prisma:reset

# Create migration after schema changes
pnpm prisma:migrate

# Deploy migrations to production database
pnpm prisma:migrate:prod
```

---

## 📝 Migration Guide: Sanity Product → Inventory

**Current state:**
Products live in `app/data/products.json` and in Sanity schemas but are NOT yet connected to the API at runtime.

**Next steps (for future Sanity reconnection):**

1. **Fetch products from Sanity** via `@sanity/client` in a background job or cron
2. **Upsert into Inventory** table:
   ```typescript
   // Example: sync from Sanity
   const products = await client.fetch('*[_type == "product"]');
   for (const p of products) {
     await prisma.inventory.upsert({
       where: { productId: p._id },
       update: {}, // Don't touch qty if already tracked
       create: {
         productId: p._id,
         sku: p.sku,
         name: p.name,
         quantity: p.stock ?? 0,
       },
     });
   }
   ```
3. **Update product pages** to fetch from Sanity, inventory from API
4. **Orders system stays unchanged** — still posts to `/api/orders`

For now, `products.json` is seeded into Inventory on first `pnpm prisma:seed`.

---

## 🔄 Payment Gateway Integration (Future)

**Stripe, bKash, Nagad, etc.** not yet implemented.

The foundation is ready:

- Orders have `paymentMethod` (cod | bkash | nagad | card)
- Orders have `paymentStatus` (pending | paid | failed | refunded)
- `POST /api/orders` currently assumes all orders are `paymentStatus: "pending"`

**To add Stripe:**

1. Install `stripe` npm package
2. Create `POST /api/checkout/session` → calls Stripe API
3. Create webhook handler `POST /api/webhooks/stripe` → updates order + inventory
4. Update checkout UI to redirect to Stripe Checkout

---

## ⚠️ Important Notes

### About In-Memory Fallback

The old **in-memory store** from `lib/sanity-admin.ts` is still there for backwards compatibility:

- Admin products page can still call `fetchProducts()` if API fails
- Admin orders page now always uses the API

If you need a fallback while developing without a database, the in-memory functions are there—just note that data resets on hot-reload.

### No Payments Yet

Orders default to `paymentMethod: "cod"` and `paymentStatus: "pending"`. The checkout success screen now shows the `orderNumber`, but no money changes hands. This is intentional—add a payment processor when ready.

### Stock Snapshot

Line items in orders are **immutable snapshots**:

- Storage in Sanity can change
- Product prices can drop
- Orders always show the exact name + price customer saw at checkout
- Refunds are separate logic (future: `POST /api/refund/[orderId]`)

---

## 📚 Documentation

- **Prisma docs:** https://www.prisma.io
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Transaction safety:** https://www.prisma.io/docs/orm/prisma-client/queries/transactions

---

## 🐛 Troubleshooting

**"DATABASE_URL is not set"**
→ Copy `.env.example` to `.env.local` and fill in your PostgreSQL connection string.

**"Prisma Client failed to generate"**
→ Run `pnpm prisma:generate` manually before building.

**"Relations... does not exist"**
→ Run migrations: `pnpm prisma:migrate` (or `prisma:migrate:prod` for production).

**"Connection refused"**
→ PostgreSQL server isn't running. Check your `DATABASE_URL` host + port.

**API returns 500 but no logs**
→ Check server console for prisma errors. Try `pnpm dev` in verbose mode.

---

## ✨ Next Steps

- [ ] Set up PostgreSQL (local or cloud)
- [ ] Run `pnpm prisma:migrate` & `pnpm prisma:seed`
- [ ] Test checkout flow: add item → place order → check `/api/orders`
- [ ] Test admin: view orders, update status
- [ ] Add payment gateway (Stripe, etc.) when ready
- [ ] Reconnect Sanity for live product syncing

Good luck! 🚀
