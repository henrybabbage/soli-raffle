export function getPayPalMeUsername(): string | undefined {
	const username = process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME?.trim()
	return username || undefined
}

export function buildPayPalMeUrl(totalAmount: string): string | null {
	const username = getPayPalMeUsername()
	if (!username) {
		return null
	}

	return `https://www.paypal.me/${username}/${totalAmount}EUR`
}
