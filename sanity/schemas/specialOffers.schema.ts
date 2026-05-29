import { defineArrayMember, defineField, defineType } from "sanity";

export const specialOffersSchema = defineType({
  name: "specialOffers",
  title: "Special Offers",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section Title (internal)",
      type: "string",
      initialValue: "Special Offers",
    }),
    defineField({
      name: "sectionHeading",
      title: "Section Heading",
      type: "string",
      description: "Displayed on the homepage above the offer cards",
      initialValue: "Special Offers",
    }),
    defineField({
      name: "sectionSubheading",
      title: "Section Subheading",
      type: "string",
      initialValue: "Handpicked deals you don't want to miss",
    }),
    defineField({
      name: "offers",
      title: "Offer Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle / Description",
              type: "string",
            }),
            defineField({
              name: "badgeText",
              title: "Badge Text",
              type: "string",
              description: 'e.g. "30% OFF" or "MEGA DEAL"',
            }),
            defineField({
              name: "badgeColor",
              title: "Badge Color",
              type: "string",
              options: {
                list: [
                  { title: "Red", value: "red" },
                  { title: "Amber / Gold", value: "amber" },
                  { title: "Green", value: "green" },
                  { title: "Blue", value: "blue" },
                  { title: "Purple", value: "purple" },
                  { title: "Rose", value: "rose" },
                ],
                layout: "radio",
              },
              initialValue: "red",
            }),
            defineField({
              name: "imageUrl",
              title: "Card Image URL",
              type: "url",
            }),
            defineField({
              name: "bgGradient",
              title: "Card Background",
              type: "string",
              description: "Tailwind gradient class or a hex colour",
              options: {
                list: [
                  { title: "Dark Slate", value: "slate" },
                  { title: "Deep Blue", value: "blue" },
                  { title: "Rich Violet", value: "violet" },
                  { title: "Forest Green", value: "green" },
                  { title: "Crimson Red", value: "red" },
                  { title: "Amber", value: "amber" },
                ],
                layout: "radio",
              },
              initialValue: "slate",
            }),
            defineField({
              name: "ctaLabel",
              title: "Button Label",
              type: "string",
              initialValue: "Shop Now",
            }),
            defineField({
              name: "ctaHref",
              title: "Button Link",
              type: "string",
              initialValue: "/shop",
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
              title: "title",
              badge: "badgeText",
              active: "active",
            },
            prepare({ title, badge, active }) {
              return {
                title: title ?? "Untitled offer",
                subtitle: `${badge ? badge + " · " : ""}${active ? "✅ Active" : "⏸ Hidden"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
});
