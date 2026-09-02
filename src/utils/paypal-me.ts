import { DEFAULT_PAYPAL_ME_USERNAME } from '@/app/config/paypal'

export function getPayPalMeUsername(): string | undefined {
	const username =
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME?.trim() ||
		DEFAULT_PAYPAL_ME_USERNAME

	return username.replace(/^@/, '')
}

export function buildPayPalMeUrl(totalAmount: string): string | null {
	const username = getPayPalMeUsername()
	if (!username) {
		return null
	}

	return `https://www.paypal.me/${username}/${totalAmount}EUR`
}
