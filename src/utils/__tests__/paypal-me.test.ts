import { buildPayPalMeUrl, getPayPalMeUsername } from '@/utils/paypal-me'

describe('paypal-me utils', () => {
	beforeEach(() => {
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
	})

	afterEach(() => {
		delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME
	})

	it('reads the configured PayPal.Me username', () => {
		expect(getPayPalMeUsername()).toBe('palirafflefundraiser')
	})

	it('builds a PayPal.Me URL with amount and currency', () => {
		expect(buildPayPalMeUrl('10.00')).toBe(
			'https://www.paypal.me/palirafflefundraiser/10.00EUR'
		)
	})

	it('returns null when username is missing', () => {
		delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME

		expect(getPayPalMeUsername()).toBeUndefined()
		expect(buildPayPalMeUrl('10.00')).toBeNull()
	})
})
