# Facebook Pixel Setup - Quick Summary

## ✅ What's Been Implemented

### 1. **Core Facebook Pixel Script** (layout.tsx)

- Facebook Pixel script added to the document head
- Automatically initializes with your Pixel ID
- Tracks PageView events on every page load
- Includes noscript fallback for users without JavaScript
- Only loads if `NEXT_PUBLIC_FB_PIXEL_ID` is set

### 2. **Event Tracking Library** (lib/fpixel.js)

Created a comprehensive event tracking library with the following functions:

| Function                  | Purpose                | Parameters    |
| ------------------------- | ---------------------- | ------------- |
| `pageview()`              | Track page views       | None          |
| `event(name, options)`    | Track custom events    | name, options |
| `trackViewContent()`      | Track product views    | productData   |
| `trackAddToCart()`        | Track add to cart      | productData   |
| `trackAddToWishlist()`    | Track wishlist adds    | productData   |
| `trackPurchase()`         | Track purchases        | orderData     |
| `trackSearch()`           | Track searches         | searchTerm    |
| `trackInitiateCheckout()` | Track checkout starts  | cartData      |
| `trackLead()`             | Track lead submissions | leadData      |

### 3. **Environment Configuration** (.env)

- Added placeholder for `NEXT_PUBLIC_FB_PIXEL_ID`
- Instructions included in comments

### 4. **Documentation**

- `FACEBOOK_PIXEL_SETUP.md` - Complete setup guide
- `FACEBOOK_PIXEL_EXAMPLES.md` - Implementation examples

## 🚀 Getting Started

### Step 1: Get Your Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to **Events Manager**
3. Find or create your Pixel
4. Copy your **Pixel ID**

### Step 2: Add to Environment

Update `.env`:

```env
NEXT_PUBLIC_FB_PIXEL_ID=your_actual_pixel_id_here
```

### Step 3: Deploy

```bash
git add .env
git commit -m "Add Facebook Pixel ID"
git push
```

## 📊 Event Tracking Examples

### In Product Details Page

```typescript
import { trackViewContent } from "@/lib/fpixel";

// When product loads
trackViewContent({
  id: product.id.toString(),
  name: product.name,
  price: product.price,
  currency: "BDT",
});
```

### In Cart Operations

```typescript
import { trackAddToCart } from "@/lib/fpixel";

const handleAddToCart = () => {
  addToCart(product);
  trackAddToCart({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    currency: "BDT",
  });
};
```

### In Checkout

```typescript
import { trackInitiateCheckout } from "@/lib/fpixel";

trackInitiateCheckout({
  total: cartTotal,
  productIds: cart.map((item) => item.id.toString()),
  numItems: cart.length,
  currency: "BDT",
});
```

### On Purchase

```typescript
import { trackPurchase } from "@/lib/fpixel";

trackPurchase({
  total: orderTotal,
  productIds: orderItems.map((item) => item.id.toString()),
  productNames: orderItems.map((item) => item.name),
  currency: "BDT",
});
```

## 🧪 Testing

### Option 1: Facebook Pixel Helper (Recommended)

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)
2. Visit your website
3. Extension shows events in real-time
4. Check that events have correct data

### Option 2: Browser Console

```javascript
// Test if fbq is loaded
window.fbq;

// Manual event test
fbq("track", "ViewContent", {
  content_name: "Test Product",
  value: 10000,
  currency: "BDT",
});
```

### Option 3: Facebook Events Manager

1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Go to **Test Events**
4. Browse your site - events should appear

## 📋 Implementation Checklist

**Immediate:**

- [x] Core pixel script implemented
- [x] Event library created
- [x] Environment variable setup
- [ ] Update `.env` with real Pixel ID
- [ ] Deploy changes

**Short-term:**

- [ ] Add tracking to ProductDetailsClient.tsx
- [ ] Add tracking to cart operations
- [ ] Add tracking to checkout flow
- [ ] Add tracking to contact form
- [ ] Test all events

**Medium-term:**

- [ ] Set up conversion events in Facebook
- [ ] Create custom audiences
- [ ] Set up retargeting campaigns
- [ ] Monitor performance

## 🔍 Key Files

| File                         | Purpose                   |
| ---------------------------- | ------------------------- |
| `app/layout.tsx`             | Main pixel script loading |
| `lib/fpixel.js`              | Event tracking functions  |
| `.env`                       | Configuration (Pixel ID)  |
| `FACEBOOK_PIXEL_SETUP.md`    | Detailed setup guide      |
| `FACEBOOK_PIXEL_EXAMPLES.md` | Code examples             |

## 🎯 Next Steps

1. **Get your Pixel ID** from Facebook Business Manager
2. **Update `.env`** with your actual Pixel ID
3. **Deploy** the changes
4. **Test** using Facebook Pixel Helper or Events Manager
5. **Integrate tracking** into your key pages:
   - Product details
   - Add to cart
   - Add to wishlist
   - Checkout flow
   - Contact form
   - Search results
6. **Create conversion events** in Facebook
7. **Set up audiences** for retargeting
8. **Launch campaigns** using your pixel data

## 💡 Tips

- Start with basic events (PageView, ViewContent, Purchase)
- Test thoroughly before going to production
- Use Facebook Pixel Helper to verify events are firing
- Check Events Manager daily for data quality
- Keep event names consistent
- Include all required parameters for each event

## ⚠️ Important Notes

1. **Privacy**: Ensure GDPR and local privacy law compliance
2. **Test Before Production**: Test all events in test mode first
3. **Event Parameters**: Use consistent parameter naming
4. **Currency**: Always use "BDT" for Bangladesh Taka
5. **Event Timing**: Some events should fire after successful actions
6. **User Privacy**: Only track necessary data

## 📚 Resources

- [Facebook Pixel Docs](https://developers.facebook.com/docs/facebook-pixel)
- [Events Manager Guide](https://www.facebook.com/business/help/898185560232180)
- [Conversion Tracking](https://www.facebook.com/business/help/952192354843755)
- [Pixel Helper Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)

## 🆘 Troubleshooting

**Pixel not showing events?**

- Check Pixel ID in `.env`
- Verify script is loaded (check browser console)
- Use Pixel Helper to debug
- Wait for data to sync (24-48 hours)

**Events showing but no conversions?**

- Verify event names match Facebook settings
- Check parameter values
- Ensure event fires after successful action
- Review Facebook Events Manager test events

**Need help?**

- Check FACEBOOK_PIXEL_SETUP.md for detailed guide
- Review FACEBOOK_PIXEL_EXAMPLES.md for code samples
- Visit Facebook's official documentation

---

**Status**: ✅ Ready to implement
**Last Updated**: January 21, 2026
**Pixel ID Status**: ⏳ Pending user configuration
