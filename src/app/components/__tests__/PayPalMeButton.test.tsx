import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PayPalMeButton from '../PayPalMeButton'

describe('PayPalMeButton', () => {
  const defaultProps = {
    amount: 10,
    itemName: 'Test Item',
    itemId: 'item-123',
    quantity: 2,
    buyerEmail: 'buyer@example.com',
    buyerName: 'Buyer Name',
    onPaymentInitiated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_PAYPAL_ME_USERNAME = 'palirafflefundraiser'
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
    expect(screen.getByText('• Name: Buyer Name')).toBeInTheDocument()
    expect(screen.getByText('• Email: buyer@example.com')).toBeInTheDocument()
  })

  it('records an intent before redirecting to PayPal', async () => {
    ;(fetch as unknown as jest.Mock).mockResolvedValue({ ok: true })

    render(<PayPalMeButton {...defaultProps} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Pay €20.00 with PayPal' })
    )

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(fetch).toHaveBeenCalledWith('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer Name',
        raffleItemId: 'item-123',
        quantity: 2,
      }),
    })
    expect(defaultProps.onPaymentInitiated).toHaveBeenCalledTimes(1)
  })

  it('continues to PayPal when the intent cannot be recorded', async () => {
    ;(fetch as unknown as jest.Mock).mockResolvedValue({ ok: false })

    render(<PayPalMeButton {...defaultProps} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Pay €20.00 with PayPal' })
    )

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(defaultProps.onPaymentInitiated).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByText(
        'We could not record your ticket selection. Please try again before continuing to PayPal.'
      )
    ).not.toBeInTheDocument()
  })
})
