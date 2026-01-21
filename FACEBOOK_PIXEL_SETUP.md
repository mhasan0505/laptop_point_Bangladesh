# Facebook Pixel Setup Guide

## 📋 Overview

This guide will help you set up Facebook Pixel tracking for Laptop Point Bangladesh to track user behavior, conversions, and optimize your Facebook ad campaigns.

## 🚀 Quick Start

### 1. Get Your Facebook Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to **Events Manager**
3. Create a new Data Source (if you don't have one)
4. Select **Web** as your platform
5. Copy your **Pixel ID** (8-15 digit number)

### 2. Add Your Pixel ID to Environment Variables

Update `.env` file:

```env
NEXT_PUBLIC_FB_PIXEL_ID=your_actual_pixel_id_here
```

Replace `your_actual_pixel_id_here` with your actual Pixel ID from Facebook.

### 3. Deploy Your Changes

```bash
# Commit and push your changes
git add .env
git commit -m "Add Facebook Pixel ID"
git push
```

## 📊 Implemented Events

The following events are automatically tracked:

### Standard Events

- **PageView** - Tracked automatically on every page load
- **ViewContent** - Triggered when user views a product
- **AddToCart** - Triggered when product is added to cart
- **AddToWishlist** - Triggered when product is added to wishlist
- **InitiateCheckout** - Triggered when user starts checkout
- **Purchase** - Triggered when order is completed
- **Search** - Triggered when user searches for products
- **Lead** - Triggered when user submits a contact form

## 💻 Usage Examples

### Track Product View

```typescript
import { trackViewContent } from "@/lib/fpixel";

trackViewContent({
  id: "product-123",
  name: "HP Elitebook 840 G6",
  price: 21700,
  currency: "BDT",
});
```

### Track Add to Cart

```typescript
import { trackAddToCart } from "@/lib/fpixel";

trackAddToCart({
  id: "product-123",
  name: "HP Elitebook 840 G6",
  price: 21700,
  currency: "BDT",
});
```

### Track Purchase

```typescript
import { trackPurchase } from "@/lib/fpixel";

trackPurchase({
  total: 65000,
  productIds: ["product-123", "product-456"],
  productNames: ["HP Elitebook 840 G6", "Dell Latitude 3410"],
  currency: "BDT",
});
```

## 📝 Implementation Checklist

- [x] Facebook Pixel script added to layout.tsx
- [x] Event tracking functions created in lib/fpixel.js
- [x] Environment variable configuration
- [ ] Add tracking to product details page
- [ ] Add tracking to cart operations
- [ ] Add tracking to checkout process
- [ ] Add tracking to contact form
- [ ] Add tracking to search functionality
- [ ] Test pixel in Facebook Events Manager
- [ ] Create conversion events in Facebook
- [ ] Set up custom audiences
- [ ] Create lookalike audiences

## 🧪 Testing Your Pixel

### 1. Using Facebook Pixel Helper (Chrome Extension)

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)
2. Visit your website
3. Check Events Manager shows your events being fired

### 2. Using Events Manager

1. Go to Facebook Events Manager
2. Select your Pixel
3. Go to **Test Events**
4. Check that events appear as you browse the site

### 3. Using Browser Console

```javascript
// Check if fbq is loaded
window.fbq;

// Manually fire an event
fbq("track", "TestEvent");
```

## 🎯 Next Steps

### 1. Set Up Conversion Events

1. In Events Manager, create conversion events:
   - Purchase (tracked automatically)
   - Add to Cart (tracked automatically)
   - Contact Form Submission

### 2. Create Audiences

- Website visitors (all traffic)
- Product viewers
- Cart abandoners
- Purchasers

### 3. Create Ad Campaigns

- Retargeting campaigns for cart abandoners
- Lookalike audiences based on purchasers
- Dynamic product ads

### 4. Monitor Performance

- Check Events Manager regularly
- Monitor conversion rates
- Optimize campaigns based on data

## ⚙️ Configuration Files

### layout.tsx

- Loads Facebook Pixel script
- Tracks PageView automatically
- Conditionally loads only if pixel ID is set

### fpixel.js

- Contains all event tracking functions
- Safe client-side implementation
- Checks for window.fbq existence

### .env

- Stores NEXT_PUBLIC_FB_PIXEL_ID
- Must be public (NEXT*PUBLIC* prefix)

## 🚨 Important Notes

1. **Privacy Compliance**: Ensure you have proper GDPR/privacy policy compliance
2. **Test Mode**: Test thoroughly before going live
3. **Event Naming**: Use consistent event naming conventions
4. **Data Quality**: Ensure accurate data is being sent
5. **Updates**: Keep Facebook SDK updated

## 📚 Useful Resources

- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Events Manager Guide](https://www.facebook.com/business/help/898185560232180)
- [Conversion Tracking Setup](https://www.facebook.com/business/help/952192354843755)
- [Custom Audiences](https://www.facebook.com/business/help/744354708981227)

## 🐛 Troubleshooting

### Pixel not showing events

1. Verify Pixel ID is correct in .env
2. Check browser console for errors
3. Use Facebook Pixel Helper to verify
4. Ensure script isn't blocked by ad blockers

### Events showing but not converting

1. Verify event names match Facebook settings
2. Check event parameters are correct
3. Wait 24-48 hours for data to sync
4. Review Events Manager test events

### Rate limiting issues

1. Facebook may limit test events
2. Use actual traffic for testing
3. Wait a few minutes between tests

## 📞 Support

For issues with Facebook Pixel setup, contact:

- Facebook Support: business.facebook.com/support
- Documentation: developers.facebook.com/docs/facebook-pixel
