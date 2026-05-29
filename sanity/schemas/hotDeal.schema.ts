import { defineField, defineType } from "sanity";

export const hotDealSchema = defineType({
  name: "hotDeal",
  title: "Hot Deal Banner",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section Title (internal)",
      type: "string",
      initialValue: "Hot Deal Banner",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'e.g. "Flash Sale Ends In"',
      initialValue: "Flash Sale Ends In",
    }),
    defineField({
      name: "subtext",
      title: "Subtext",
      type: "text",
      rows: 2,
      description: "Short description shown below the headline",
      initialValue:
        "Grab your favourite laptops at unbeatable prices. Discounts up to 40% on selected premium models.",
    }),
    defineField({
      name: "badgeText",
      title: "Badge Text",
      type: "string",
      description: 'Small label above the headline, e.g. "Limited Time Offer"',
      initialValue: "Limited Time Offer",
    }),
    defineField({
      name: "bannerImageUrl",
      title: "Banner Image URL",
      type: "url",
      description:
        "Upload a promotional image (appears on the right side of the banner)",
    }),
    defineField({
      name: "targetDate",
      title: "Countdown Target Date & Time",
      type: "datetime",
      description: "When the countdown reaches zero the timer shows all zeros",
    }),
    defineField({
      name: "ctaLabel",
      title: "Button Label",
      type: "string",
      initialValue: "Shop Deals Now",
    }),
    defineField({
      name: "ctaHref",
      title: "Button Link",
      type: "string",
      initialValue: "/shop",
    }),
    defineField({
      name: "active",
      title: "Show Banner",
      type: "boolean",
      description: "Hide the banner without deleting it",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "headline",
      active: "active",
    },
    prepare({ title, active }) {
      return {
        title: title ?? "Hot Deal Banner",
        subtitle: active ? "✅ Active" : "⏸ Hidden",
      };
    },
  },
});
