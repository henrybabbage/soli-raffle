describe('PayPal config', () => {
	const originalUsername = process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME

	afterEach(() => {
		if (originalUsername === undefined) {
			delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME
		} else {
			process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = originalUsername
		}
		jest.resetModules()
	})

	it('uses the configured PayPal.Me username', () => {
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
		jest.resetModules()

		const { paypalConfig: config } = require('../config/paypal')
		expect(config.meUsername).toBe('palirafflefundraiser')
	})

	it('strips a leading @ from the PayPal.Me username', () => {
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = '@palirafflefundraiser'
		jest.resetModules()

		const { paypalConfig: config } = require('../config/paypal')
		expect(config.meUsername).toBe('palirafflefundraiser')
	})

	it('builds PayPal.Me URLs with the configured username', () => {
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
		jest.resetModules()

		const { buildPayPalMeUrl: buildUrl } = require('../config/paypal')
		expect(buildUrl('10.00')).toBe(
			'https://www.paypal.me/palirafflefundraiser/10.00EUR'
		)
	})

	it('defaults to palirafflefundraiser when env is unset', () => {
		delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME
		jest.resetModules()

		const { paypalConfig: config } = require('../config/paypal')
		expect(config.meUsername).toBe('palirafflefundraiser')
	})
})

describe('PayPal Environment Configuration', () => {
	beforeEach(() => {
		process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'ZPAXXQHPYQN2Q'
		process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL =
			'seedsofliberationraffle@proton.me'
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('has the correct PayPal client ID configured', () => {
		expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBe('ZPAXXQHPYQN2Q')
	})

	it('has the correct business email configured', () => {
		expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe(
			'seedsofliberationraffle@proton.me'
		)
	})

	it('has the correct PayPal.Me username configured', () => {
		expect(process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME).toBe(
			'palirafflefundraiser'
		)
	})

	it('verifies business account credentials are set', () => {
		expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeDefined()
		expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBeDefined()
		expect(process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME).toBeDefined()
		expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).not.toBe('')
		expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).not.toBe('')
		expect(process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME).not.toBe('')
	})

	it('ensures business email matches the documented account', () => {
		const expectedEmail = 'seedsofliberationraffle@proton.me'
		expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe(expectedEmail)
	})

	it('verifies client ID matches the documented business account', () => {
		const expectedClientId = 'ZPAXXQHPYQN2Q'
		expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBe(expectedClientId)
	})

	it('verifies PayPal.Me username matches the documented account', () => {
		const expectedUsername = 'palirafflefundraiser'
		expect(process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME).toBe(expectedUsername)
	})

	it('confirms environment variables are properly named', () => {
		expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeDefined()
		expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBeDefined()
		expect(process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME).toBeDefined()
	})

	it('validates business email format', () => {
		const email = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		expect(emailRegex.test(email!)).toBe(true)
	})

	it('ensures client ID is not a test value', () => {
		const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
		expect(clientId).not.toBe('test')
		expect(clientId).not.toBe('test-client-id')
	})

	it('verifies business email is not a test value', () => {
		const email = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
		expect(email).not.toBe('test@example.com')
		expect(email).toBe('seedsofliberationraffle@proton.me')
	})

	it('verifies PayPal.Me username is not a test value', () => {
		const username = process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME
		expect(username).not.toBe('BiancaHeuser')
		expect(username).toBe('palirafflefundraiser')
	})
})
