import {TICKET_PRICE_EUR} from '@/app/constants'
import {buildPayPalMeUrl} from '@/utils/paypal-me'
import {getWriteClient} from '@/sanity/lib/write-client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_QUANTITY = 1
const MAX_QUANTITY = 100

export interface CreatePurchaseInput {
	buyerName?: unknown
	buyerEmail?: unknown
	raffleItemId?: unknown
	quantity?: unknown
	totalAmount?: unknown
	prizeTitle?: unknown
}

export interface CreatePurchaseResult {
	id: string
	prizeTitle: string
	totalAmount: number
	paypalMeUrl: string | null
}

function asTrimmedString (value: unknown): string | null {
	if (typeof value !== 'string') {
		return null
	}

	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

export function parseCreatePurchaseInput (body: CreatePurchaseInput): {
	buyerName: string
	buyerEmail: string
	raffleItemId: string
	quantity: number
} {
	const buyerName = asTrimmedString(body.buyerName)
	const buyerEmail = asTrimmedString(body.buyerEmail)?.toLowerCase() ?? null
	const raffleItemId = asTrimmedString(body.raffleItemId)

	if (!buyerName) {
		throw new PurchaseValidationError('buyerName is required')
	}

	if (!buyerEmail || !EMAIL_PATTERN.test(buyerEmail)) {
		throw new PurchaseValidationError('A valid buyerEmail is required')
	}

	if (!raffleItemId) {
		throw new PurchaseValidationError('raffleItemId is required')
	}

	const quantity = Number(body.quantity)
	if (
		!Number.isInteger(quantity) ||
		quantity < MIN_QUANTITY ||
		quantity > MAX_QUANTITY
	) {
		throw new PurchaseValidationError(
			`quantity must be an integer between ${MIN_QUANTITY} and ${MAX_QUANTITY}`,
		)
	}

	return {buyerName, buyerEmail, raffleItemId, quantity}
}

export class PurchaseValidationError extends Error {
	constructor (message: string) {
		super(message)
		this.name = 'PurchaseValidationError'
	}
}

export class PurchaseNotFoundError extends Error {
	constructor (message: string) {
		super(message)
		this.name = 'PurchaseNotFoundError'
	}
}

export async function createPurchaseRecord (
	input: CreatePurchaseInput,
): Promise<CreatePurchaseResult> {
	const {buyerName, buyerEmail, raffleItemId, quantity} =
		parseCreatePurchaseInput(input)

	const writeClient = getWriteClient()

	const raffleItem = await writeClient.fetch<{
		_id: string
		title: string
		isActive: boolean
	} | null>(
		`*[_type == "raffleItem" && _id == $id][0]{
			_id,
			title,
			isActive
		}`,
		{id: raffleItemId},
	)

	if (!raffleItem || !raffleItem.isActive) {
		throw new PurchaseNotFoundError(
			'Raffle item not found or is not active',
		)
	}

	const totalAmount = quantity * TICKET_PRICE_EUR
	const paypalMeUrl = buildPayPalMeUrl(totalAmount.toFixed(2))
	const purchaseDate = new Date().toISOString()

	const created = await writeClient.create({
		_type: 'purchase',
		buyerName,
		buyerEmail,
		raffleItem: {
			_type: 'reference',
			_ref: raffleItem._id,
		},
		prizeTitle: raffleItem.title,
		quantity,
		totalAmount,
		currency: 'EUR',
		paymentStatus: 'pending',
		purchaseDate,
		paypalMeUrl: paypalMeUrl ?? undefined,
	})

	return {
		id: created._id,
		prizeTitle: raffleItem.title,
		totalAmount,
		paypalMeUrl,
	}
}
