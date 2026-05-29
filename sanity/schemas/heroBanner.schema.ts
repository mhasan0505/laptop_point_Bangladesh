import { defineArrayMember, defineField, defineType } from "sanity";

export const heroBannerSchema = defineType({
  name: "heroBanner",
  title: "Hero Banner",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section Title (internal)",
      type: "string",
      initialValue: "Hero Banners",
    }),
    defineField({
      name: "slides",
      title: "Slides",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "imageUrl",
              title: "Image URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "linkHref",
              title: "Click Link (optional)",
              type: "url",
            }),
            defineField({
              name: "active",
              title: "Active",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              imageUrl: "imageUrl",
              alt: "alt",
              active: "active",
            },
            prepare({ imageUrl, alt, active }) {
              return {
                title: alt || imageUrl || "Untitled slide",
                subtitle: active ? "✅ Active" : "⏸ Inactive",
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
