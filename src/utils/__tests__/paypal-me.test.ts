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

	it('uses the production username when the environment variable is missing', () => {
		delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME

		expect(getPayPalMeUsername()).toBe('palirafflefundraiser')
		expect(buildPayPalMeUrl('10.00')).toBe(
			'https://www.paypal.me/palirafflefundraiser/10.00EUR'
		)
	})

	it('strips a leading @ from a configured username', () => {
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = '@palirafflefundraiser'

		expect(getPayPalMeUsername()).toBe('palirafflefundraiser')
	})
})
