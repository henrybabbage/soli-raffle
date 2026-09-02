export const DEFAULT_PAYPAL_ME_USERNAME = 'palirafflefundraiser'

const PAYPAL_ME_USERNAME =
	process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME || DEFAULT_PAYPAL_ME_USERNAME

export const paypalConfig = {
	clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
	businessEmail:
		process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL ||
		'seedsofliberationraffle@proton.me',
	meUsername: PAYPAL_ME_USERNAME.replace(/^@/, ''),
	currency: 'EUR',
	intent: 'capture',
} as const

export function buildPayPalMeUrl(amount: string): string {
	return `https://www.paypal.me/${paypalConfig.meUsername}/${amount}${paypalConfig.currency}`
}
