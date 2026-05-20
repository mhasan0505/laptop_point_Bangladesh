import { defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      description: "Full product name as it will appear on the website",
      type: "string",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      description:
        "Click 'Generate' to create from product name. This is used in the product URL.",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      description:
        "Stock Keeping Unit - unique product identifier (e.g., LP-001)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      description: "Manufacturer or brand name (e.g., Apple, Dell, HP)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "model",
      title: "Model",
      description: "Specific model line or variant (e.g., EliteBook 840 G8)",
      type: "string",
    }),
    defineField({
      name: "condition",
      title: "Condition",
      description: "Physical product condition used for listings and SEO",
      type: "string",
      options: {
        list: [
          { title: "New", value: "New" },
          { title: "Used", value: "Used" },
          { title: "Refurbished", value: "Refurbished" },
          { title: "Open Box", value: "Open Box" },
        ],
      },
      initialValue: "Used",
    }),
    defineField({
      name: "grade",
      title: "Grade",
      description: "Internal resale grading like A, A+, Premium, Like New",
      type: "string",
    }),
    defineField({
      name: "images",
      title: "Product Images (Sanity Assets)",
      description:
        "Upload high-quality images via Sanity Studio. First image is the main product image.",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: "Describe the image for accessibility and SEO",
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
              description: "Optional caption to display with image",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "imageUrls",
      title: "Product Image URLs",
      description:
        "External image URLs (e.g., from ImageKit CDN). Used by the admin panel when uploading via the web form.",
      type: "array",
      of: [{ type: "url" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      description: "Product category for organization and filtering",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      description: "Brief overview shown in product listings (1-2 sentences)",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      description: "Detailed product information with formatting",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h3" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "fullDescriptionText",
      title: "Full Description (Plain Text)",
      description:
        "Long-form text version used by the admin form to match products.json style content.",
      type: "text",
      rows: 10,
    }),
    defineField({
      name: "price",
      title: "Current Price (BDT)",
      description: "Current selling price shown to customers",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "salePrice",
      title: "Market Price (BDT)",
      description:
        "Original or comparison price used to show discount against the current selling price.",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "BDT",
    }),
    defineField({
      name: "taxIncluded",
      title: "Tax Included",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "stock",
      title: "Stock Quantity",
      description: "Current number of units available in inventory",
      type: "number",
      validation: (Rule) => Rule.required().min(0).integer(),
      initialValue: 0,
    }),
    defineField({
      name: "lowStockThreshold",
      title: "Low Stock Alert Threshold",
      description: "Get notified when stock falls below this number",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "stockStatus",
      title: "Stock Status Label",
      description:
        "Optional storefront stock label like In Stock or Limited Stock",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Product Status",
      description: "Control product visibility on the website",
      type: "string",
      options: {
        list: [
          { title: "✅ Active (Visible on website)", value: "active" },
          { title: "📝 Draft (Hidden - work in progress)", value: "draft" },
          { title: "📦 Archived (Discontinued)", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Product",
      description: "Show this product in featured/highlighted sections",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      title: "Tags / Keywords",
      description:
        "Add keywords for search and SEO (e.g., gaming, ultrabook, business)",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "features",
      title: "Key Features",
      description:
        "Short marketing highlights shown on product cards and details",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "specs",
      title: "Technical Specifications",
      description: "Detailed product specifications",
      type: "object",
      fields: [
        { name: "processor", title: "Processor", type: "string" },
        { name: "ram", title: "RAM", type: "string" },
        { name: "storage", title: "Storage", type: "string" },
        { name: "display", title: "Display", type: "string" },
        {
          name: "displayDetails",
          title: "Display Details",
          type: "object",
          fields: [
            { name: "size", title: "Size", type: "string" },
            { name: "resolution", title: "Resolution", type: "string" },
            { name: "type", title: "Panel / Display Type", type: "string" },
            { name: "touchscreen", title: "Touchscreen", type: "boolean" },
          ],
        },
        { name: "graphics", title: "Graphics Card", type: "string" },
        { name: "battery", title: "Battery Life", type: "string" },
        { name: "weight", title: "Weight", type: "string" },
        { name: "dimensions", title: "Dimensions", type: "string" },
        { name: "os", title: "Operating System", type: "string" },
        { name: "ports", title: "Ports & Connectivity", type: "text", rows: 3 },
        {
          name: "portsList",
          title: "Ports List",
          type: "array",
          of: [{ type: "string" }],
          options: {
            layout: "tags",
          },
        },
      ],
    }),
    defineField({
      name: "warranty",
      title: "Warranty Information",
      description: "Product warranty details",
      type: "object",
      fields: [
        {
          name: "period",
          title: "Warranty Period",
          type: "string",
          placeholder: "e.g., 1 Year, 2 Years",
        },
        {
          name: "type",
          title: "Warranty Type",
          type: "string",
          placeholder: "e.g., International, Local, Extended",
        },
        {
          name: "details",
          title: "Warranty Details",
          type: "text",
          rows: 2,
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images.0",
      subtitle: "category",
      stock: "stock",
    },
    prepare({ title, media, subtitle, stock }) {
      return {
        title,
        media,
        subtitle: `${subtitle} | Stock: ${stock}`,
      };
    },
  },
});
