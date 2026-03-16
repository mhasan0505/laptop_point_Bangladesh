import { defineField, defineType } from "sanity";

export const orderSchema = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "customer",
      title: "Customer",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() },
        { name: "email", title: "Email", type: "string", validation: (Rule) => Rule.email() },
        { name: "phone", title: "Phone", type: "string", validation: (Rule) => Rule.required() },
        { name: "address", title: "Address", type: "text" },
        { name: "city", title: "City", type: "string" },
        { name: "postalCode", title: "Postal Code", type: "string" },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: "price",
              title: "Price at Purchase",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            },
          ],
          preview: {
            select: {
              productName: "product.name",
              quantity: "quantity",
              price: "price",
            },
            prepare({ productName, quantity, price }) {
              return {
                title: productName || "Unknown Product",
                subtitle: `Qty: ${quantity} × ৳${price}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount (BDT)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "cod" },
          { title: "bKash", value: "bkash" },
          { title: "Nagad", value: "nagad" },
          { title: "Card", value: "card" },
          { title: "Bank Transfer", value: "bank_transfer" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "notes",
      title: "Order Notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "trackingNumber",
      title: "Tracking Number",
      type: "string",
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "deliveryDate",
      title: "Delivery Date",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      orderNumber: "orderNumber",
      customerName: "customer.name",
      totalAmount: "totalAmount",
      status: "status",
      orderDate: "orderDate",
    },
    prepare({ orderNumber, customerName, totalAmount, status, orderDate }) {
      return {
        title: `${orderNumber} - ${customerName}`,
        subtitle: `৳${totalAmount} | ${status} | ${new Date(orderDate).toLocaleDateString()}`,
      };
    },
  },
  orderings: [
    {
      title: "Order Date, New",
      name: "orderDateDesc",
      by: [{ field: "orderDate", direction: "desc" }],
    },
    {
      title: "Order Date, Old",
      name: "orderDateAsc",
      by: [{ field: "orderDate", direction: "asc" }],
    },
  ],
});
