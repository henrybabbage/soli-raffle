export default {
  name: 'purchase',
  title: 'Purchase',
  type: 'document',
  fields: [
    {
      name: 'buyerEmail',
      title: 'Buyer Email',
      type: 'string',
      validation: (Rule: any) => Rule.required().email(),
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
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
      description: 'Total amount paid in the smallest currency unit (e.g., cents for USD)',
    },
    {
      name: 'paypalTransactionId',
      title: 'PayPal Transaction ID',
      type: 'string',
      description: 'Unique identifier from PayPal for this transaction',
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
      initialValue: 'completed',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'purchaseDate',
      title: 'Purchase Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
      description: 'Additional notes about this purchase (e.g., customer service notes)',
    },
  ],
  preview: {
    select: {
      title: 'buyerName',
      subtitle: 'buyerEmail',
      media: 'raffleItem.image',
      quantity: 'quantity',
      totalAmount: 'totalAmount',
      purchaseDate: 'purchaseDate',
      paymentStatus: 'paymentStatus',
    },
    prepare(selection: any) {
      const { title, subtitle, media, quantity, totalAmount, purchaseDate, paymentStatus } = selection
      const date = new Date(purchaseDate).toLocaleDateString()
      const amount = (totalAmount / 100).toFixed(2) // Assuming amount is in cents
      return {
        title: `${title} (${quantity}x)`,
        subtitle: `${subtitle} • ${amount}€ • ${date} • ${paymentStatus}`,
        media: media,
      }
    },
  },
  orderings: [
    {
      title: 'Purchase Date (Newest)',
      name: 'purchaseDateDesc',
      by: [{ field: 'purchaseDate', direction: 'desc' }],
    },
    {
      title: 'Purchase Date (Oldest)',
      name: 'purchaseDateAsc',
      by: [{ field: 'purchaseDate', direction: 'asc' }],
    },
    {
      title: 'Buyer Name A-Z',
      name: 'buyerNameAsc',
      by: [{ field: 'buyerName', direction: 'asc' }],
    },
    {
      title: 'Payment Status',
      name: 'paymentStatusAsc',
      by: [{ field: 'paymentStatus', direction: 'asc' }],
    },
  ],
}