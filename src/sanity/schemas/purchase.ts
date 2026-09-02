import { BasketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const purchase = defineType({
  name: 'purchase',
  title: 'Payment Intent',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'buyerEmail',
      title: 'Buyer Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'buyerName',
      title: 'Buyer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'raffleItem',
      title: 'Raffle Item',
      type: 'reference',
      to: [{ type: 'raffleItem' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'raffleItemTitle',
      title: 'Raffle Item Title at Time of Selection',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quantity',
      title: 'Tickets Requested',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'ticketPriceCents',
      title: 'Ticket Price (cents)',
      type: 'number',
      readOnly: true,
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount (cents)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
      description:
        'Calculated on the server from the raffle ticket price; 1000 means 10 EUR.',
    }),
    defineField({
      name: 'paypalTransactionId',
      title: 'PayPal Transaction ID',
      type: 'string',
      description:
        'Optional. Add this when manually reconciling a confirmed PayPal payment.',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          {
            title: 'Payment initiated — awaiting confirmation',
            value: 'pending',
          },
          { title: 'Completed', value: 'completed' },
          { title: 'Failed', value: 'failed' },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'purchaseDate',
      title: 'Payment Initiated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
      description: 'Optional payment reconciliation or customer-service notes.',
    }),
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
    prepare({ title, subtitle, media, quantity, totalAmount, purchaseDate, paymentStatus }) {
      const date = purchaseDate
        ? new Date(purchaseDate).toLocaleDateString()
        : 'Unknown date'
      const amount = typeof totalAmount === 'number' ? (totalAmount / 100).toFixed(2) : '—'

      return {
        title: `${title ?? 'Unnamed buyer'} (${quantity ?? 0}x)`,
        subtitle: `${subtitle ?? 'No email'} • ${amount} EUR • ${date} • ${paymentStatus ?? 'pending'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Payment Initiated (Newest)',
      name: 'purchaseDateDesc',
      by: [{ field: 'purchaseDate', direction: 'desc' }],
    },
    {
      title: 'Payment Initiated (Oldest)',
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
})

export default purchase
