export default {
  name: 'purchase',
  title: 'Purchase',
  type: 'document',
  fields: [
    {
      name: 'buyerEmail',
      title: 'Buyer Email',
      type: 'email',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'buyerName',
      title: 'Buyer Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'raffleItem',
      title: 'Raffle Item',
      type: 'reference',
      to: [{ type: 'raffleItem' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1),
      initialValue: 1,
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'string',
      description: 'Total amount paid (e.g., "100€")',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'paypalTransactionId',
      title: 'PayPal Transaction ID',
      type: 'string',
      description: 'PayPal transaction identifier',
    },
    {
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Completed', value: 'completed' },
          { title: 'Failed', value: 'failed' },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
      initialValue: 'pending',
    },
    {
      name: 'purchaseDate',
      title: 'Purchase Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional notes about the purchase',
    },
  ],
  preview: {
    select: {
      title: 'buyerName',
      subtitle: 'buyerEmail',
      media: 'raffleItem.image',
    },
    prepare(selection: any) {
      const { title, subtitle, media } = selection
      return {
        title: title || 'Anonymous',
        subtitle,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Purchase Date, New',
      name: 'purchaseDateDesc',
      by: [{ field: 'purchaseDate', direction: 'desc' }],
    },
    {
      title: 'Purchase Date, Old',
      name: 'purchaseDateAsc',
      by: [{ field: 'purchaseDate', direction: 'asc' }],
    },
  ],
}