/* eslint-disable @typescript-eslint/no-explicit-any */
const raffleItem = {
  name: "raffleItem",
  title: "Raffle Item",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "instructor",
      title: "Instructor",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "details",
      title: "Details",
      type: "text",
      rows: 5,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "value",
      title: "Value",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "contact",
      title: "Contact Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "href",
              title: "Link",
              type: "url",
              validation: (Rule: any) => Rule.required(),
            },
          ],
        },
      ],
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description:
        "Whether this item is currently active and visible on the website",
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      description:
        "Order in which this item appears on the website (lower numbers appear first)",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "title",
      instructor: "instructor",
      value: "value",
      media: "image",
      isActive: "isActive",
    },
    prepare(selection: any) {
      const { title, instructor, value, media, isActive } = selection;
      return {
        title: title,
        subtitle: `${instructor} • ${value}${!isActive ? " (Inactive)" : ""}`,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
};

export default raffleItem;
