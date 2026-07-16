# Checkout → Order → Inventory Flow

A visual walkthrough of how an order moves from customer checkout to database.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CUSTOMER CHECKOUT PAGE (app/(main)/checkout/page.tsx)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Form fields:                                                                │
│  - firstName, lastName, email, phone                                         │
│  - address, city, district, postalCode                                       │
│  - paymentMethod (cod | bkash | nagad | card)                               │
│  - orderNotes (optional)                                                     │
│                                                                              │
│  Cart from React context:                                                    │
│  - items: [{ id, name, price, quantity, ... }, ...]                         │
│  - getSubtotal(), getShipping(), getCartTotal()                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
                        form.onSubmit() handler
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/orders (app/api/orders/route.ts)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Body (from checkout page):                                                  │
│  {                                                                            │
│    customerName: "John Doe",                    (firstName + lastName)       │
│    customerPhone: "+8801234567890",                                          │
│    customerEmail: "john@example.com",                                        │
│    address: "123 Elm St",                                                    │
│    city: "Dhaka",                                                            │
│    district: "Dhaka",                                                        │
│    postalCode: "1207",                                                       │
│    paymentMethod: "cod",            (user's selected method)                 │
│    notes: "Leave at gate",          (orderNotes)                             │
│    items: [                                                                   │
│      {                                                                        │
│        productId: "1",              (cart item id)                           │
│        sku: "HP-440G3-001",         (same as id for JSON products)           │
│        name: "HP ProBook 440 G3",                                             │
│        unitPrice: 19990,            (locked price at time of order)          │
│        quantity: 1                                                            │
│      }                                                                        │
│    ],                                                                        │
│    subtotal: 19990,                 (sum of item prices × qty)               │
│    shippingCost: 100,               (100 BDT, or 0 if subtotal > 50k)       │
│    totalAmount: 20090               (subtotal + shipping + tax)              │
│  }                                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
                    prisma.$transaction(async tx => {
                                   ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Stock Check (MUST succeed for all items or ROLLBACK)              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  For each item in POST body:                                                 │
│    existing = await tx.inventory.findUnique({ where: productId })           │
│    available = existing?.quantity - existing?.reserved                      │
│    if (available < item.quantity) → throw Error → 409 Conflict               │
│                                                                               │
│  Example:                                                                     │
│  - productId "1" has inventory qty=5, reserved=0, so available=5             │
│  - Requesting qty=1 ✓ PASS                                                   │
│  - OR requesting qty=10 ✗ FAIL → 409 "Insufficient stock... available 5"  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓ (if all pass)
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Create Order & Items in Database                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Generate orderNumber = "ORD-{timestamp}-{random}"                          │
│                       e.g., "ORD-12345678-001"                               │
│                                                                               │
│  INSERT INTO orders (                                                         │
│    id (auto-cuid),                                                            │
│    orderNumber: "ORD-12345678-001",                                           │
│    customerName,                                                              │
│    customerPhone,                                                             │
│    customerEmail,                                                             │
│    address, city, district, postalCode,                                       │
│    paymentMethod: "cod",                                                      │
│    paymentStatus: "pending",  ← Default, will change after payment           │
│    status: "Pending",         ← First status in lifecycle                    │
│    notes,                                                                      │
│    subtotal, shippingCost, totalAmount,                                       │
│    createdAt: now(),                                                          │
│    ...                                                                         │
│  );                                                                            │
│                                                                               │
│  INSERT INTO order_items for each item:  (line item snapshot)               │
│  (                                                                             │
│    orderId,                                                                    │
│    productId, sku, name,                                                       │
│    unitPrice: 19990,  ← LOCKED in time (even if Sanity price changes)        │
│    quantity,                                                                   │
│    inventoryDeducted: true                                                    │
│  );                                                                            │
│                                                                               │
│  INSERT INTO order_status_events  (first event):                             │
│  (                                                                             │
│    orderId,                                                                    │
│    status: "Pending",                                                         │
│    note: "Order placed by customer",                                          │
│    createdAt: now()                                                           │
│  );                                                                            │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓ (if create succeeds)
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Decrement Inventory & Log                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  For each item:                                                              │
│                                                                               │
│  UPDATE inventory                                                             │
│    SET quantity = quantity - {item.quantity}                                 │
│    WHERE productId = "1";                                                     │
│  -- e.g., qty: 5 → 4 (sold 1)                                                │
│                                                                               │
│  INSERT INTO inventory_log:                                                   │
│  (                                                                             │
│    productId: "1",                                                            │
│    sku: "HP-440G3-001",                                                       │
│    delta: -1,                 ← Negative for sale                            │
│    reason: "sale",                                                            │
│    orderId: "ORD-12345678-001",  ← Traceability link                         │
│    note: "Sold 1× HP ProBook 440 G3 — order ORD-12345678-001",              │
│    createdAt: now()                                                           │
│  );                                                                            │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓
                    }) }  ← End of transaction
                                   ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ ROLLBACK if ANY phase fails                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  If at any point an error occurs:                                           │
│  - Phase 1 fails: return 409 Conflict (stock unavailable)                   │
│  - Phase 2 fails: Order/Items rollback, return 500 (rare)                   │
│  - Phase 3 fails: Inventory/Log rollback, return 500 (rare)                 │
│                                                                               │
│  Either ALL changes persist, or NONE do.                                     │
│  No partial orders.                                                          │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓ (success)
┌──────────────────────────────────────────────────────────────────────────────┐
│ API Response to Checkout Page                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Response JSON:                                                              │
│  {                                                                             │
│    success: true,                                                             │
│    orderNumber: "ORD-12345678-001",                                           │
│    id: "clx1a2b3c4d5e6f7g"  (cuid, for admin/detail views)                   │
│  }                                                                            │
│  Status: 201 Created                                                         │
│                                                                               │
│  OR on error:                                                                 │
│  {                                                                             │
│    error: "Insufficient stock for 'HP ProBook 440 G3': requested 5,          │
│             available 2"                                                      │
│  }                                                                            │
│  Status: 409 Conflict (or 400, 500)                                          │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓ (frontend updates)
┌──────────────────────────────────────────────────────────────────────────────┐
│ Checkout Page: Success/Error UI                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  On success:                                                                  │
│  - setOrderNumber("ORD-12345678-001")                                            │
│  - setOrderPlaced(true)                                                      │
│  - clearCart()                                                                │
│  - Show success screen with order number                                     │
│  - Redirect to / after 5 seconds                                             │
│                                                                               │
│  On error:                                                                    │
│  - setSubmitError("Insufficient stock... available 2")                        │
│  - Show error banner above submit button                                      │
│  - Keep form & cart intact (can retry after stock updates)                   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin Orders Page (Now Aware of New Order)                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  GET /api/orders fetches:                                                    │
│  {                                                                             │
│    id: "clx1a2b3c4d5e6f7g",                                                  │
│    orderNumber: "ORD-12345678-001",                                           │
│    customerName: "John Doe",  ✓ Displayed in table                           │
│    totalAmount: 20090,        ✓ Displayed as "৳20,090"                       │
│    status: "Pending",         ✓ Can be updated via dropdown                  │
│    createdAt: "2026-03-20...", ✓ Displayed as date                          │
│    items: [...],              ✓ Available for detail view                    │
│    statusHistory: [...]       ✓ Audit trail of status changes                │
│  }                                                                            │
│                                                                               │
│  Status dropdown: Select new status → PATCH /api/orders/{id}                 │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Guarantees

1. **No Overselling** — Stock check happens before order creation. Even if 10 customers try to buy the last laptop simultaneously, only 1 succeeds.

2. **Price Snapshot** — `unitPrice` on OrderItem is locked at purchase time. Future Sanity changes don't affect past orders.

3. **Audit Trail** — Every status change recorded in `orderStatusEvents` with timestamp. Every stock movement in `inventoryLog` with reason + order link.

4. **Atomic All-or-Nothing** — If anything fails during order creation, the entire transaction is rolled back. No partial orders, no invisible stock deductions.

---

## Database Views After Successful Order

```
orders table:
┌─────┬────────────────────┬────────────┬──────────┬─────────┬────────────┐
│ id  │ orderNumber        │ status     │ total    │ created │ ...        │
├─────┼────────────────────┼────────────┼──────────┼─────────┼────────────┤
│ x1  │ ORD-12345678-001   │ Pending    │ 20090    │ 2026... │ ...        │
└─────┴────────────────────┴────────────┴──────────┴─────────┴────────────┘

order_items table (snapshot data):
┌─────┬────────┬────────────────┬──────────────┬────────┬──────────┐
│ id  │orderId │ productId      │ name         │ qty    │unitPrice │
├─────┼────────┼────────────────┼──────────────┼────────┼──────────┤
│ y1  │ x1     │ 1              │HP ProBook... │ 1      │ 19990    │
└─────┴────────┴────────────────┴──────────────┴────────┴──────────┘

inventory table (decremented):
┌─────┬────────────┬──────┬──────────┐
│ id  │ productId  │ qty  │ reserved │
├─────┼────────────┼──────┼──────────┤
│ z1  │ 1          │ 4    │ 0        │  (was 5, sold 1)
└─────┴────────────┴──────┴──────────┘

inventory_log table (audit):
┌─────┬────────────┬────────┬───────┬──────────────────────────┐
│ id  │ productId  │ delta  │ reason │ orderId                  │
├─────┼────────────┼────────┼───────┼──────────────────────────┤
│ w1  │ 1          │ -1     │ sale  │ ORD-12345678-001         │
└─────┴────────────┴────────┴───────┴──────────────────────────┘

order_status_events table (lifecycle):
┌─────┬────────┬─────────┬──────────────────────────────┬─────────┐
│ id  │orderId │ status  │ note                         │ created │
├─────┼────────┼─────────┼──────────────────────────────┼─────────┤
│ v1  │ x1     │ Pending │ Order placed by customer     │ 2026... │
└─────┴────────┴─────────┴──────────────────────────────┴─────────┘
```

(Admin can then update status → Pending → Processing → Shipped → Delivered, each creating a new row in order_status_events)
