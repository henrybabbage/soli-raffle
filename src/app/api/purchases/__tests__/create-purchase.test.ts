/**
 * @jest-environment node
 */

import {TICKET_PRICE_EUR} from '@/app/constants'
import {
	createPurchaseRecord,
	parseCreatePurchaseInput,
	PurchaseNotFoundError,
	PurchaseValidationError,
} from '../create-purchase'

const mockFetch = jest.fn()
const mockCreate = jest.fn()
const mockGetWriteClient = jest.fn()

jest.mock('@/sanity/lib/write-client', () => ({
	getWriteClient: () => mockGetWriteClient(),
}))

jest.mock('@/utils/paypal-me', () => ({
	buildPayPalMeUrl: (totalAmount: string) =>
		`https://www.paypal.me/palirafflefundraiser/${totalAmount}EUR`,
}))

describe('createPurchaseRecord', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockGetWriteClient.mockReturnValue({
			fetch: mockFetch,
			create: mockCreate,
		})
	})

	it('rejects invalid buyer input before talking to Sanity', () => {
		expect(() =>
			parseCreatePurchaseInput({
				buyerName: ' ',
				buyerEmail: 'not-an-email',
				raffleItemId: 'item-1',
				quantity: 1,
			}),
		).toThrow(PurchaseValidationError)
	})

	it('stores prize title and amount from the server, ignoring client values', async () => {
		const CLIENT_PRIZE_TITLE = 'Spoofed Prize'
		const CLIENT_TOTAL_AMOUNT = 1
		const SERVER_PRIZE_TITLE = 'Private Qigong Session'
		const QUANTITY = 3
		const EXPECTED_TOTAL = QUANTITY * TICKET_PRICE_EUR

		mockFetch.mockResolvedValue({
			_id: 'item-1',
			title: SERVER_PRIZE_TITLE,
			isActive: true,
		})
		mockCreate.mockResolvedValue({_id: 'purchase-1'})

		const result = await createPurchaseRecord({
			buyerName: 'Ada Lovelace',
			buyerEmail: 'ada@example.com',
			raffleItemId: 'item-1',
			quantity: QUANTITY,
			prizeTitle: CLIENT_PRIZE_TITLE,
			totalAmount: CLIENT_TOTAL_AMOUNT,
		})

		expect(mockCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				_type: 'purchase',
				buyerName: 'Ada Lovelace',
				buyerEmail: 'ada@example.com',
				prizeTitle: SERVER_PRIZE_TITLE,
				quantity: QUANTITY,
				totalAmount: EXPECTED_TOTAL,
				currency: 'EUR',
				paymentStatus: 'pending',
				raffleItem: {
					_type: 'reference',
					_ref: 'item-1',
				},
				paypalMeUrl: `https://www.paypal.me/palirafflefundraiser/${EXPECTED_TOTAL.toFixed(2)}EUR`,
			}),
		)
		expect(result).toEqual({
			id: 'purchase-1',
			prizeTitle: SERVER_PRIZE_TITLE,
			totalAmount: EXPECTED_TOTAL,
			paypalMeUrl: `https://www.paypal.me/palirafflefundraiser/${EXPECTED_TOTAL.toFixed(2)}EUR`,
		})
		expect(result.prizeTitle).not.toBe(CLIENT_PRIZE_TITLE)
		expect(result.totalAmount).not.toBe(CLIENT_TOTAL_AMOUNT)
	})

	it('rejects inactive or missing raffle items', async () => {
		mockFetch.mockResolvedValue(null)

		await expect(
			createPurchaseRecord({
				buyerName: 'Ada Lovelace',
				buyerEmail: 'ada@example.com',
				raffleItemId: 'missing',
				quantity: 1,
			}),
		).rejects.toBeInstanceOf(PurchaseNotFoundError)

		expect(mockCreate).not.toHaveBeenCalled()
	})
})
