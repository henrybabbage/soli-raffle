const PAYPAL_ME_USERNAME =
	process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME || 'palirafflefundraiser'

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
