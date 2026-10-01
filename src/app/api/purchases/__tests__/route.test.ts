/**
 * @jest-environment node
 */

import {POST} from '../route'

const mockCreatePurchaseRecord = jest.fn()

jest.mock('../create-purchase', () => ({
	createPurchaseRecord: (...args: unknown[]) =>
		mockCreatePurchaseRecord(...args),
	PurchaseValidationError: class PurchaseValidationError extends Error {
		constructor (message: string) {
			super(message)
			this.name = 'PurchaseValidationError'
		}
	},
	PurchaseNotFoundError: class PurchaseNotFoundError extends Error {
		constructor (message: string) {
			super(message)
			this.name = 'PurchaseNotFoundError'
		}
	},
}))

describe('POST /api/purchases', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns the created purchase on success', async () => {
		mockCreatePurchaseRecord.mockResolvedValue({
			id: 'purchase-1',
			prizeTitle: 'Private Qigong Session',
			totalAmount: 20,
			paypalMeUrl: 'https://www.paypal.me/palirafflefundraiser/20.00EUR',
		})

		const request = new Request('http://localhost/api/purchases', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				buyerName: 'Ada Lovelace',
				buyerEmail: 'ada@example.com',
				raffleItemId: 'item-1',
				quantity: 2,
				prizeTitle: 'Ignored',
				totalAmount: 1,
			}),
		})

		const response = await POST(request)
		const body = await response.json()

		expect(response.status).toBe(201)
		expect(body).toEqual({
			id: 'purchase-1',
			prizeTitle: 'Private Qigong Session',
			totalAmount: 20,
			paypalMeUrl: 'https://www.paypal.me/palirafflefundraiser/20.00EUR',
		})
		expect(mockCreatePurchaseRecord).toHaveBeenCalledWith(
			expect.objectContaining({
				buyerName: 'Ada Lovelace',
				buyerEmail: 'ada@example.com',
				raffleItemId: 'item-1',
				quantity: 2,
			}),
		)
	})

	it('returns 400 for validation errors', async () => {
		const {PurchaseValidationError} = jest.requireMock('../create-purchase')
		mockCreatePurchaseRecord.mockRejectedValue(
			new PurchaseValidationError('buyerName is required'),
		)

		const request = new Request('http://localhost/api/purchases', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({}),
		})

		const response = await POST(request)
		const body = await response.json()

		expect(response.status).toBe(400)
		expect(body).toEqual({error: 'buyerName is required'})
	})
})
