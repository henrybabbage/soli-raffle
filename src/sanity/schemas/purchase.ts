import {UsersIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const purchase = defineType({
	name: 'purchase',
	title: 'Purchase',
	type: 'document',
	icon: UsersIcon,
	fields: [
		defineField({
			name: 'buyerName',
			title: 'Buyer Name',
			type: 'string',
			readOnly: true,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'buyerEmail',
			title: 'Buyer Email',
			type: 'string',
			readOnly: true,
			validation: (Rule) => Rule.required().email(),
		}),
		defineField({
			name: 'raffleItem',
			title: 'Raffle Item',
			type: 'reference',
			to: [{type: 'raffleItem'}],
			readOnly: true,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'prizeTitle',
			title: 'Prize Title',
			type: 'string',
			readOnly: true,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'quantity',
			title: 'Quantity',
			type: 'number',
			readOnly: true,
			validation: (Rule) => Rule.required().integer().min(1).max(100),
		}),
		defineField({
			name: 'totalAmount',
			title: 'Total Amount',
			type: 'number',
			readOnly: true,
			validation: (Rule) => Rule.required().positive(),
		}),
		defineField({
			name: 'currency',
			title: 'Currency',
			type: 'string',
			readOnly: true,
			initialValue: 'EUR',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'paymentStatus',
			title: 'Payment Status',
			type: 'string',
			options: {
				list: [
					{title: 'Pending', value: 'pending'},
					{title: 'Completed', value: 'completed'},
					{title: 'Failed', value: 'failed'},
					{title: 'Refunded', value: 'refunded'},
				],
				layout: 'radio',
			},
			initialValue: 'pending',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'purchaseDate',
			title: 'Purchase Date',
			type: 'datetime',
			readOnly: true,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'paypalMeUrl',
			title: 'PayPal.Me URL',
			type: 'url',
			readOnly: true,
		}),
	],
	preview: {
		select: {
			title: 'buyerName',
			prizeTitle: 'prizeTitle',
			quantity: 'quantity',
			paymentStatus: 'paymentStatus',
		},
		prepare ({title, prizeTitle, quantity, paymentStatus}) {
			return {
				title: title || 'Unknown buyer',
				subtitle: [
					prizeTitle,
					quantity ? `×${quantity}` : null,
					paymentStatus,
				]
					.filter(Boolean)
					.join(' · '),
			}
		},
	},
	orderings: [
		{
			title: 'Purchase Date, Newest',
			name: 'purchaseDateDesc',
			by: [{field: 'purchaseDate', direction: 'desc'}],
		},
	],
})

export default purchase
