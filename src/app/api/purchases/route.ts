import {NextResponse} from 'next/server'

import {
	createPurchaseRecord,
	PurchaseNotFoundError,
	PurchaseValidationError,
} from './create-purchase'

export async function POST (request: Request) {
	let body: unknown

	try {
		body = await request.json()
	} catch {
		return NextResponse.json(
			{error: 'Request body must be valid JSON'},
			{status: 400},
		)
	}

	try {
		const purchase = await createPurchaseRecord(
			(body ?? {}) as Record<string, unknown>,
		)

		return NextResponse.json(
			{
				id: purchase.id,
				prizeTitle: purchase.prizeTitle,
				totalAmount: purchase.totalAmount,
				paypalMeUrl: purchase.paypalMeUrl,
			},
			{status: 201},
		)
	} catch (error) {
		if (error instanceof PurchaseValidationError) {
			return NextResponse.json({error: error.message}, {status: 400})
		}

		if (error instanceof PurchaseNotFoundError) {
			return NextResponse.json({error: error.message}, {status: 404})
		}

		const message =
			error instanceof Error ? error.message : 'Failed to create purchase'

		if (message.includes('SANITY_API_WRITE_TOKEN')) {
			return NextResponse.json(
				{error: 'Purchase recording is temporarily unavailable'},
				{status: 503},
			)
		}

		console.error('Failed to create purchase:', error)
		return NextResponse.json(
			{error: 'Failed to create purchase'},
			{status: 500},
		)
	}
}
