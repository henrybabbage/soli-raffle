'use client'

import {FormEvent, useState} from 'react'
import {buildPayPalMeUrl} from '@/utils/paypal-me'
import {redirectTo} from '@/utils/redirect'
import {PayPalIcon} from './PayPalIcon'

interface PayPalMeButtonProps {
	amount: number
	itemId: string
	itemName: string
	quantity: number
	onPaymentInitiated?: () => void
}

export default function PayPalMeButton ({
	amount,
	itemId,
	itemName,
	quantity,
	onPaymentInitiated,
}: PayPalMeButtonProps) {
	const [buyerName, setBuyerName] = useState('')
	const [buyerEmail, setBuyerEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const totalAmount = (amount * quantity).toFixed(2)
	const paypalMeUrl = buildPayPalMeUrl(totalAmount)
	const isPaymentConfigured = paypalMeUrl !== null
	const canSubmit =
		isPaymentConfigured &&
		!isSubmitting &&
		buyerName.trim().length > 0 &&
		buyerEmail.trim().length > 0

	async function handleSubmit (event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!canSubmit || !paypalMeUrl) {
			return
		}

		setIsSubmitting(true)
		setErrorMessage(null)

		try {
			const response = await fetch('/api/purchases', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					buyerName: buyerName.trim(),
					buyerEmail: buyerEmail.trim(),
					raffleItemId: itemId,
					quantity,
				}),
			})

			const payload = (await response.json().catch(() => null)) as {
				error?: string
			} | null

			if (!response.ok) {
				setErrorMessage(
					payload?.error ||
						'Could not record your purchase. Please try again.',
				)
				setIsSubmitting(false)
				return
			}

			onPaymentInitiated?.()
			redirectTo(paypalMeUrl)
		} catch {
			setErrorMessage(
				'Could not record your purchase. Please try again.',
			)
			setIsSubmitting(false)
		}
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit} noValidate>
			<div className="text-sm text-secondary-foreground space-y-2">
				<p className="font-normal">Payment Details:</p>
				<ul className="text-xs space-y-1 ml-4">
					<li>• Item: {itemName}</li>
					<li>• Quantity: {quantity} ticket(s)</li>
					<li>• Total: €{totalAmount}</li>
				</ul>
				<p className="text-xs italic mt-3">
					Enter your details below. We record your name and selected
					prize before sending you to PayPal. Please also include your
					name and “{itemName}” in the PayPal note.
				</p>
				{!isPaymentConfigured && (
					<p className="text-xs text-red-600 mt-2">
						PayPal payments are temporarily unavailable. Please try
						again later.
					</p>
				)}
			</div>

			<div className="space-y-3">
				<label className="block space-y-1">
					<span className="text-xs text-secondary-foreground">
						Full name
					</span>
					<input
						type="text"
						name="buyerName"
						autoComplete="name"
						value={buyerName}
						onChange={(event) => setBuyerName(event.target.value)}
						required
						disabled={isSubmitting || !isPaymentConfigured}
						className="w-full border border-primary bg-background px-3 py-2 text-sm text-foreground rounded-xs disabled:opacity-50"
					/>
				</label>
				<label className="block space-y-1">
					<span className="text-xs text-secondary-foreground">
						Email
					</span>
					<input
						type="email"
						name="buyerEmail"
						autoComplete="email"
						value={buyerEmail}
						onChange={(event) => setBuyerEmail(event.target.value)}
						required
						disabled={isSubmitting || !isPaymentConfigured}
						className="w-full border border-primary bg-background px-3 py-2 text-sm text-foreground rounded-xs disabled:opacity-50"
					/>
				</label>
			</div>

			{errorMessage && (
				<p className="text-xs text-red-600" role="alert">
					{errorMessage}
				</p>
			)}

			<button
				type="submit"
				disabled={!canSubmit}
				aria-busy={isSubmitting}
				aria-label={
					isSubmitting
						? 'Recording purchase'
						: `Pay €${totalAmount} with PayPal`
				}
				className="font-sans w-full bg-background border border-primary hover:bg-neutral-200 disabled:bg-neutral-200 disabled:cursor-not-allowed text-foreground font-normal h-12 leading-none whitespace-nowrap px-6 rounded-xs transition-colors duration-200 flex items-center justify-center gap-2"
				style={{
					fontFamily:
						'"Helvetica Neue", Helvetica, Arial, sans-serif',
				}}
			>
				<PayPalIcon width={20} height={20} />
				{isSubmitting ? 'Recording…' : 'Pay with PayPal'}
			</button>
		</form>
	)
}
