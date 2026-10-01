import '@testing-library/jest-dom'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PayPalMeButton from '../PayPalMeButton'
import {redirectTo} from '@/utils/redirect'

jest.mock('@/utils/redirect', () => ({
	redirectTo: jest.fn(),
}))

const mockedRedirectTo = redirectTo as jest.MockedFunction<typeof redirectTo>

describe('PayPalMeButton', () => {
	const defaultProps = {
		amount: 10,
		itemId: 'item-1',
		itemName: 'Test Item',
		quantity: 2,
		onPaymentInitiated: jest.fn(),
	}

	beforeEach(() => {
		jest.clearAllMocks()
		process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
		;(global.fetch as jest.Mock).mockReset()
	})

	afterEach(() => {
		delete process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME
	})

	it('renders the requested ticket details', () => {
		render(<PayPalMeButton {...defaultProps} />)

		expect(screen.getByText('Payment Details:')).toBeInTheDocument()
		expect(screen.getByText('• Item: Test Item')).toBeInTheDocument()
		expect(screen.getByText('• Quantity: 2 ticket(s)')).toBeInTheDocument()
		expect(screen.getByText('• Total: €20.00')).toBeInTheDocument()
	})

	it('requires name and email before payment can be submitted', () => {
		render(<PayPalMeButton {...defaultProps} />)

		const payButton = screen.getByRole('button', {
			name: 'Pay €20.00 with PayPal',
		})
		expect(payButton).toBeDisabled()
		expect(global.fetch).not.toHaveBeenCalled()
	})

	it('does not redirect when purchase recording fails', async () => {
		const user = userEvent.setup()
		;(global.fetch as jest.Mock).mockResolvedValue({
			ok: false,
			json: async () => ({error: 'Could not record your purchase'}),
		})

		render(<PayPalMeButton {...defaultProps} />)

		await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
		await user.type(screen.getByLabelText('Email'), 'ada@example.com')
		await user.click(
			screen.getByRole('button', {name: 'Pay €20.00 with PayPal'}),
		)

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Could not record your purchase',
		)
		expect(mockedRedirectTo).not.toHaveBeenCalled()
		expect(defaultProps.onPaymentInitiated).not.toHaveBeenCalled()
	})

	it('records the purchase then redirects to PayPal.Me', async () => {
		const user = userEvent.setup()
		;(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 'purchase-1',
				prizeTitle: 'Test Item',
				totalAmount: 20,
			}),
		})

		render(<PayPalMeButton {...defaultProps} />)

		await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
		await user.type(screen.getByLabelText('Email'), 'ada@example.com')
		await user.click(
			screen.getByRole('button', {name: 'Pay €20.00 with PayPal'}),
		)

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('/api/purchases', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					buyerName: 'Ada Lovelace',
					buyerEmail: 'ada@example.com',
					raffleItemId: 'item-1',
					quantity: 2,
				}),
			})
		})

		await waitFor(() => {
			expect(mockedRedirectTo).toHaveBeenCalledWith(
				'https://www.paypal.me/palirafflefundraiser/20.00EUR',
			)
		})
		expect(defaultProps.onPaymentInitiated).toHaveBeenCalledTimes(1)
	})

	it('keeps the pay button disabled while submitting', async () => {
		let resolveFetch: (value: unknown) => void = () => undefined
		;(global.fetch as jest.Mock).mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveFetch = resolve
				}),
		)

		render(<PayPalMeButton {...defaultProps} />)

		fireEvent.change(screen.getByLabelText('Full name'), {
			target: {value: 'Ada Lovelace'},
		})
		fireEvent.change(screen.getByLabelText('Email'), {
			target: {value: 'ada@example.com'},
		})
		fireEvent.click(
			screen.getByRole('button', {name: 'Pay €20.00 with PayPal'}),
		)

		expect(
			await screen.findByRole('button', {name: 'Recording purchase'}),
		).toBeDisabled()

		resolveFetch({
			ok: true,
			json: async () => ({id: 'purchase-1'}),
		})
	})
})
