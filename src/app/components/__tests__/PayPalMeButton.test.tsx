import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import PayPalMeButton from '../PayPalMeButton'

describe('PayPalMeButton', () => {
  const defaultProps = {
    amount: 10,
    itemName: 'Test Item',
    quantity: 2,
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
  })

  it('links directly to PayPal without depending on intent recording', () => {
    render(<PayPalMeButton {...defaultProps} />)

    const link = screen.getByRole('link', { name: 'Pay €20.00 with PayPal' })
    expect(link).toHaveAttribute(
      'href',
      'https://www.paypal.me/palirafflefundraiser/20.00EUR'
    )
    fireEvent.click(link)
    expect(defaultProps.onPaymentInitiated).toHaveBeenCalledTimes(1)
    expect(fetch).not.toHaveBeenCalled()
  })
})
