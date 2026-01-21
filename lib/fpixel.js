export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Track page views
export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

// Track custom events
export const event = (name, options = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};

// Track product view
export const trackViewContent = (productData) => {
  event("ViewContent", {
    content_name: productData.name,
    content_type: "product",
    content_ids: [productData.id],
    currency: productData.currency || "BDT",
    value: productData.price,
  });
};

// Track add to cart
export const trackAddToCart = (productData) => {
  event("AddToCart", {
    content_name: productData.name,
    content_type: "product",
    content_ids: [productData.id],
    currency: productData.currency || "BDT",
    value: productData.price,
  });
};

// Track add to wishlist
export const trackAddToWishlist = (productData) => {
  event("AddToWishlist", {
    content_name: productData.name,
    content_type: "product",
    content_ids: [productData.id],
    currency: productData.currency || "BDT",
    value: productData.price,
  });
};

// Track purchase
export const trackPurchase = (orderData) => {
  event("Purchase", {
    content_type: "product",
    currency: orderData.currency || "BDT",
    value: orderData.total,
    content_ids: orderData.productIds || [],
    content_name: orderData.productNames?.join(", ") || "Order",
  });
};

// Track search
export const trackSearch = (searchTerm) => {
  event("Search", {
    search_string: searchTerm,
  });
};

// Track initiate checkout
export const trackInitiateCheckout = (cartData) => {
  event("InitiateCheckout", {
    content_type: "product_group",
    currency: cartData.currency || "BDT",
    value: cartData.total,
    content_ids: cartData.productIds || [],
    num_items: cartData.numItems || 0,
  });
};

// Track lead (contact form, newsletter signup, etc.)
export const trackLead = (leadData) => {
  event("Lead", {
    content_name: leadData.name || "Lead",
    currency: "BDT",
    value: 0,
  });
};
