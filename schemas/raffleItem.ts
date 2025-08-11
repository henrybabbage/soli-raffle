export default {
  name: 'raffleItem',
  title: 'Raffle Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'instructor',
      title: 'Instructor',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'details',
      title: 'Details',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'value',
      title: 'Value',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'href',
              title: 'URL',
              type: 'url',
            },
          ],
        },
      ],
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this raffle item is currently active',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this item appears on the website',
      initialValue: 0,
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      instructor: 'instructor',
      media: 'image',
    },
    prepare(selection: any) {
      const { title, instructor, media } = selection
      return {
        title,
        subtitle: instructor,
        media,
      }
    },
  },
}