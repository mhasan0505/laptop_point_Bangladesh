import { defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
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
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image" }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Price (BDT)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "stock",
      title: "Stock Quantity",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: "lowStockThreshold",
      title: "Low Stock Alert Threshold",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "specs",
      title: "Specifications",
      type: "object",
      fields: [
        { name: "processor", title: "Processor", type: "string" },
        { name: "ram", title: "RAM", type: "string" },
        { name: "storage", title: "Storage", type: "string" },
        { name: "display", title: "Display", type: "string" },
        { name: "graphics", title: "Graphics", type: "string" },
        { name: "battery", title: "Battery", type: "string" },
        { name: "weight", title: "Weight", type: "string" },
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
