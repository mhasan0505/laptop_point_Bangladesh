# Facebook Pixel Implementation Checklist by Page/Component

Use this checklist to track which pages/components have Facebook Pixel event tracking implemented.

## 🛒 Product Pages

### Product Details Page

- **File**: `app/(main)/product/[slug]/page.tsx` or `components/product/ProductDetailsClient.tsx`
- **Events to Track**:
  - [ ] ViewContent - When page loads
  - [ ] AddToCart - When user clicks add to cart
  - [ ] AddToWishlist - When user adds to wishlist
  - [ ] AddToComparison - When user adds to comparison
- **Implementation Code**:

  ```typescript
  import { trackViewContent, trackAddToCart } from "@/lib/fpixel";

  useEffect(() => {
    trackViewContent({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      currency: "BDT",
    });
  }, [product.id]);
  ```

### Product Listing Pages

- **Files**:
  - [ ] `app/(main)/shop/page.tsx`
  - [ ] `app/(main)/blog/page.tsx`
  - [ ] `components/application/NewProductsSection.tsx`
  - [ ] `components/application/HpLaptopSection.tsx`
  - [ ] `components/application/BrandProductSection.tsx`
- **Events to Track**:
  - [ ] ViewContent - When user clicks on product
  - [ ] Search - When filtering/sorting applied
- **Notes**: Track ViewContent when user interacts with product card

## 🛍️ Cart & Checkout

### Cart Page

- **File**: `app/(main)/cart/page.tsx`
- **Events to Track**:
  - [ ] ViewContent - When cart items are viewed
  - [ ] RemoveFromCart - When item removed
- **Implementation Code**:
  ```typescript
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    trackEvent("RemoveFromCart", { content_ids: [productId] });
  };
  ```

### Checkout Page

- **File**: `app/(main)/checkout/page.tsx`
- **Events to Track**:
  - [ ] InitiateCheckout - When checkout page loads
  - [ ] Purchase - When order is confirmed
- **Implementation Code**:

  ```typescript
  import { trackInitiateCheckout, trackPurchase } from "@/lib/fpixel";

  // On checkout page load
  useEffect(() => {
    trackInitiateCheckout({
      total: cartTotal,
      productIds: cart.map((item) => item.id.toString()),
      numItems: cart.length,
      currency: "BDT",
    });
  }, [cart, cartTotal]);

  // On order success
  const handleOrderSuccess = (orderData) => {
    trackPurchase({
      total: orderData.total,
      productIds: orderData.items.map((item) => item.id.toString()),
      productNames: orderData.items.map((item) => item.name),
      currency: "BDT",
    });
  };
  ```

### Wishlist Page

- **File**: `app/(main)/wishlist/page.tsx`
- **Events to Track**:
  - [ ] ViewContent - When wishlist items viewed
  - [ ] AddToCart - When item added to cart from wishlist
  - [ ] RemoveFromWishlist - When item removed

### Comparison Page

- **File**: `app/(main)/compare/page.tsx`
- **Events to Track**:
  - [ ] ViewContent - When comparison viewed
  - [ ] AddToCart - When item added to cart from comparison

## 📋 Contact & Lead Generation

### Contact Page

- **File**: `app/(main)/contact/page.tsx`
- **Events to Track**:
  - [ ] Lead - When contact form submitted
- **Implementation Code**:

  ```typescript
  import { trackLead } from "@/lib/fpixel";

  const handleContactSubmit = async (formData) => {
    const response = await submitForm(formData);
    if (response.success) {
      trackLead({ name: formData.name });
    }
  };
  ```

### Newsletter Signup

- **Component**: `components/application/NewsletterPopup.tsx`
- **Events to Track**:
  - [ ] Lead - When user subscribes
- **Implementation Code**:
  ```typescript
  const handleNewsletterSignup = (email) => {
    subscribeNewsletter(email);
    trackLead({ name: "Newsletter Signup" });
  };
  ```

## 🔍 Search & Browse

### Search Results

- **File**: `app/(main)/shop/page.tsx` (with search parameter)
- **Events to Track**:
  - [ ] Search - When search query submitted
- **Implementation Code**:

  ```typescript
  import { trackSearch } from "@/lib/fpixel";

  const handleSearch = (searchTerm) => {
    trackSearch(searchTerm);
    // Perform search...
  };
  ```

### Category/Filter Pages

- **Files**:
  - [ ] `components/shop/FilterSidebar.tsx`
- **Events to Track**:
  - [ ] Search - When filter applied (treat as refined search)

## 💬 Communication

### WhatsApp Button

- **Component**: `components/application/WhatsAppButton.tsx`
- **Events to Track**:
  - [ ] Contact - Custom event for WhatsApp click
- **Implementation Code**:

  ```typescript
  import { event } from "@/lib/fpixel";

  const handleWhatsAppClick = () => {
    event("Contact", { contact_type: "whatsapp" });
    window.open("https://wa.me/...");
  };
  ```

### Live Chat (if implemented)

- **Events to Track**:
  - [ ] Contact - When chat initiated

## 📊 Admin/Analytics

### Admin Dashboard

- **File**: `app/admin/page.tsx`
- **Events to Track**:
  - [ ] ⚠️ NO tracking (internal only)

### Order Management

- **File**: `app/admin/orders/page.js`
- **Events to Track**:
  - [ ] ⚠️ NO tracking (internal only)

## 🎁 Special Features

### Flash Sale Banner

- **Component**: `components/application/FlashSaleBanner.tsx`
- **Events to Track**:
  - [ ] ViewContent - When sale banner interacted with
  - [ ] AddToCart - Items added during sale

### Deals Page

- **File**: `app/(main)/deals/page.tsx`
- **Events to Track**:
  - [ ] ViewContent - When deal items viewed
  - [ ] AddToCart - When deal items added to cart

### Product Bundle

- **Component**: `components/product/ProductBundle.tsx`
- **Events to Track**:
  - [ ] ViewContent - When bundle viewed
  - [ ] AddToCart - When bundle added to cart

## 🔄 Context Providers

### CartContext

- **File**: `contexts/CartContext.tsx`
- **Integration Points**:
  - [ ] Track AddToCart in addToCart method
  - [ ] Track RemoveFromCart in removeFromCart method
  - [ ] Track UpdateCart in updateQuantity method

### WishlistContext

- **File**: `contexts/WishlistContext.tsx`
- **Integration Points**:
  - [ ] Track AddToWishlist in addToWishlist method
  - [ ] Track RemoveFromWishlist in removeFromWishlist method

### ComparisonContext

- **File**: `contexts/ComparisonContext.tsx`
- **Integration Points**:
  - [ ] Track comparison actions

## 📱 Mobile Components

### MobileMenu

- **Component**: `components/application/MobileMenu.tsx`
- **Events to Track**:
  - [ ] ViewContent - When product links in menu clicked
  - [ ] Search - When search in menu used

### StickyMobileBar

- **Component**: `components/application/StickyMobileBar.tsx`
- **Events to Track**:
  - [ ] AddToCart - When cart button clicked
  - [ ] Contact - When contact button clicked

## 📝 General Tracking Rules

### ViewContent Events

- Track whenever a product is viewed in detail
- Include: product ID, name, price
- Trigger: Product page load, product card click

### AddToCart Events

- Track whenever user adds item to cart
- Include: product ID, name, price
- Trigger: Add to cart button click

### Purchase Events

- Track only after successful payment
- Include: all order items, total amount
- Trigger: Order confirmation page load

### Lead Events

- Track form submissions
- Include: form type (contact, newsletter, etc.)
- Trigger: Successful form submission

### Search Events

- Track search queries and filters
- Include: search term or filter applied
- Trigger: Search submission or filter change

## ✅ Implementation Status Summary

| Category            | Status | Progress |
| ------------------- | ------ | -------- |
| Product Pages       | [ ]    | \_\_/3   |
| Cart & Checkout     | [ ]    | \_\_/4   |
| Contact & Leads     | [ ]    | \_\_/2   |
| Search & Browse     | [ ]    | \_\_/2   |
| Communication       | [ ]    | \_\_/2   |
| Special Features    | [ ]    | \_\_/3   |
| Context Integration | [ ]    | \_\_/3   |
| Mobile Components   | [ ]    | \_\_/2   |

## 🚀 Priority Implementation Order

1. **High Priority** (Conversion Events):
   - [ ] ViewContent - Product pages
   - [ ] AddToCart - Cart functionality
   - [ ] Purchase - Checkout completion
   - [ ] InitiateCheckout - Checkout page load
   - [ ] Lead - Contact form

2. **Medium Priority** (User Engagement):
   - [ ] Search - Search functionality
   - [ ] AddToWishlist - Wishlist feature
   - [ ] Product comparison
   - [ ] Contact interactions

3. **Low Priority** (Additional Tracking):
   - [ ] Navigation tracking
   - [ ] Feature interactions
   - [ ] Newsletter signup

## 📖 Reference

- Event tracking functions: `lib/fpixel.js`
- Setup guide: `FACEBOOK_PIXEL_SETUP.md`
- Code examples: `FACEBOOK_PIXEL_EXAMPLES.md`
- Quick start: `FACEBOOK_PIXEL_QUICK_START.md`

---

**Last Updated**: January 21, 2026
**Total Checkpoints**: 25+
**Completion Goal**: 100%
