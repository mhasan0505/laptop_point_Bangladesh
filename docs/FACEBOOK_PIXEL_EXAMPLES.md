# Facebook Pixel Event Integration Examples

This document shows how to integrate Facebook Pixel tracking events into your components and pages.

## 🔧 Basic Implementation

### 1. Track Product View

When a user views a product details page, track the view:

```typescript
// In ProductDetailsClient.tsx or your product page

import { useEffect } from "react"
import { trackViewContent } from "@/lib/fpixel"
import { Product } from "@/types/product"

export default function ProductDetailsClient({ product }: { product: Product }) {
  useEffect(() => {
    // Track product view
    trackViewContent({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      currency: "BDT"
    })
  }, [product.id])

  return (
    // Your component content
  )
}
```

### 2. Track Add to Cart

When user adds a product to cart:

```typescript
// In your cart context or component where addToCart is called

import { trackAddToCart } from "@/lib/fpixel";

const handleAddToCart = (product) => {
  addToCart(product);

  // Track the event
  trackAddToCart({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    currency: "BDT",
  });
};
```

### 3. Track Add to Wishlist

When user adds a product to wishlist:

```typescript
// In your wishlist context or component

import { trackAddToWishlist } from "@/lib/fpixel";

const handleAddToWishlist = (product) => {
  addToWishlist(product);

  // Track the event
  trackAddToWishlist({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    currency: "BDT",
  });
};
```

### 4. Track Search

When user performs a search:

```typescript
// In your search component

import { trackSearch } from "@/lib/fpixel";

const handleSearch = (searchTerm) => {
  // Perform search logic...

  // Track the search
  trackSearch(searchTerm);
};
```

### 5. Track Purchase

When order is completed:

```typescript
// In your checkout/order success page

import { trackPurchase } from "@/lib/fpixel";

useEffect(() => {
  if (orderData) {
    trackPurchase({
      total: orderData.totalAmount,
      productIds: orderData.items.map((item) => item.id.toString()),
      productNames: orderData.items.map((item) => item.name),
      currency: "BDT",
    });
  }
}, [orderData]);
```

### 6. Track Contact Form Submission

When user submits a contact form:

```typescript
// In your contact form component

import { trackLead } from "@/lib/fpixel";

const handleSubmit = async (formData) => {
  // Submit form...

  // Track as lead
  trackLead({
    name: formData.name,
  });
};
```

### 7. Track Initiate Checkout

When user starts the checkout process:

```typescript
// In your checkout page

import { trackInitiateCheckout } from "@/lib/fpixel";

useEffect(() => {
  if (cartItems.length > 0) {
    trackInitiateCheckout({
      total: cartTotal,
      productIds: cartItems.map((item) => item.id.toString()),
      numItems: cartItems.length,
      currency: "BDT",
    });
  }
}, [cartItems]);
```

## 📊 Complete ProductDetailsClient.tsx Example

Here's how to update ProductDetailsClient.tsx:

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { Product } from "@/types/product"
import { Heart, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import { trackAddToCart, trackAddToWishlist, trackViewContent } from "@/lib/fpixel"

interface ProductDetailsClientProps {
  product: Product
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)

  // Track product view on component mount
  useEffect(() => {
    trackViewContent({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      currency: "BDT",
    })
  }, [product.id, product.name, product.price])

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id.toString(),
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image: typeof product.image === "string" ? product.image : product.image.src,
      specs: product.specs,
      quantity: quantity,
    }

    addToCart(cartItem)

    // Track add to cart event
    trackAddToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      currency: "BDT",
    })
  }

  const handleAddToWishlist = () => {
    addToWishlist(product)

    // Track add to wishlist event (only if not already wishlisted)
    if (!isInWishlist(product.id)) {
      trackAddToWishlist({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        currency: "BDT",
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Your existing component JSX */}

      <div className="flex gap-4">
        <Button
          onClick={handleAddToCart}
          className="flex-1"
          size="lg"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          onClick={handleAddToWishlist}
          variant="outline"
          size="lg"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
```

## 🛒 CartContext Integration Example

Update your CartContext to track events:

```typescript
// In contexts/CartContext.tsx

import { createContext, useContext, useState } from "react"
import { trackAddToCart } from "@/lib/fpixel"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  // ... other fields
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  // ... other methods
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        )
      }
      return [...prev, item]
    })

    // Track the add to cart event
    trackAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      currency: "BDT",
    })
  }

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
```

## 🔄 Checkout Page Example

```typescript
// In app/(main)/checkout/page.tsx

"use client"

import { useCart } from "@/contexts/CartContext"
import { useState } from "react"
import { trackInitiateCheckout, trackPurchase } from "@/lib/fpixel"

export default function CheckoutPage() {
  const { cart } = useCart()
  const [orderData, setOrderData] = useState(null)

  // Track initiate checkout when page loads
  const handleCheckoutStart = () => {
    trackInitiateCheckout({
      total: calculateTotal(),
      productIds: cart.map(item => item.id),
      numItems: cart.length,
      currency: "BDT",
    })
  }

  const handlePurchaseComplete = async (paymentData) => {
    // Process payment...

    const total = calculateTotal()

    // Track purchase
    trackPurchase({
      total: total,
      productIds: cart.map(item => item.id),
      productNames: cart.map(item => item.name),
      currency: "BDT",
    })

    setOrderData(paymentData)
  }

  return (
    <div>
      {/* Checkout form */}
      <button onClick={handleCheckoutStart}>
        Start Checkout
      </button>
      <button onClick={handlePurchaseComplete}>
        Complete Purchase
      </button>
    </div>
  )
}
```

## 🎯 Testing Your Implementation

### 1. In Browser Console

```javascript
// Check if events are being tracked
fbq("track", "TestEvent");

// Check cart
fbq("track", "AddToCart", {
  content_name: "Test Product",
  content_type: "product",
  value: 10000,
  currency: "BDT",
});
```

### 2. Using Facebook Pixel Helper

1. Install the Chrome extension
2. Browse your website
3. Events should appear in real-time
4. Click "Events" tab to see details

### 3. In Facebook Events Manager

1. Go to Events Manager
2. Select your Pixel
3. Go to "Test Events"
4. You should see events appear as you interact with your site

## 📋 Event Data Format Reference

All events use this general format:

```typescript
{
  content_name: string,      // Product name or event name
  content_type: string,      // 'product' or 'product_group'
  content_ids: string[],     // Product IDs
  currency: string,          // 'BDT'
  value: number,            // Price in smallest currency unit
  // Additional optional fields based on event type
}
```

## ✅ Checklist for Full Implementation

- [ ] Add tracking to ProductDetailsClient.tsx
- [ ] Add tracking to CartContext
- [ ] Add tracking to checkout process
- [ ] Add tracking to contact form
- [ ] Add tracking to search
- [ ] Add tracking to wishlist
- [ ] Test all events in browser
- [ ] Test in Facebook Events Manager
- [ ] Create conversion events in Facebook
- [ ] Set up custom audiences
- [ ] Create retargeting campaigns

## 🚀 Next Steps

1. Implement tracking in your key pages
2. Test thoroughly using Facebook Pixel Helper
3. Monitor Events Manager for data
4. Set up conversion tracking in Facebook Ads
5. Create audiences and campaigns
