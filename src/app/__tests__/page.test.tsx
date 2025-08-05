import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

// Mock PayPal components
jest.mock('../components/PayPalButton', () => {
  return function MockPayPalButton({ amount, itemName, quantity, onSuccess, onError }: any) {
    return (
      <div data-testid="paypal-button">
        <button
          data-testid="mock-paypal-button"
          onClick={() => {
            // Simulate successful payment
            onSuccess({
              id: 'test-payment-id',
              status: 'COMPLETED',
              payer: { email_address: 'test@example.com' },
              purchase_units: [{
                amount: { currency_code: 'EUR', value: (parseFloat(amount) * quantity).toFixed(2) }
              }]
            })
          }}
        >
          Pay with PayPal
        </button>
        <button
          data-testid="mock-paypal-error-button"
          onClick={() => {
            onError(new Error('Payment failed'))
          }}
        >
          Simulate Error
        </button>
      </div>
    )
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

describe('Home Page - PayPal Integration', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'seedsofliberationraffle@proton.me'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main page with raffle items', () => {
    render(<Home />)
    
    expect(screen.getByText('Soli-Raffle')).toBeInTheDocument()
    expect(screen.getByText('Winners drawn live 31.08.2025')).toBeInTheDocument()
    expect(screen.getByText('5€ per ticket')).toBeInTheDocument()
  })

  it('displays "Buy Ticket" buttons for each raffle item', () => {
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    expect(buyButtons.length).toBeGreaterThan(0)
  })

  it('shows quantity controls for each item', () => {
    render(<Home />)
    
    const minusButtons = screen.getAllByText('-')
    const plusButtons = screen.getAllByText('+')
    
    expect(minusButtons.length).toBeGreaterThan(0)
    expect(plusButtons.length).toBeGreaterThan(0)
  })

  it('allows users to increase quantity', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const plusButtons = screen.getAllByText('+')
    const firstPlusButton = plusButtons[0]
    
    // Get the initial quantity
    const quantityDisplay = firstPlusButton.parentElement?.querySelector('span')
    const initialQuantity = parseInt(quantityDisplay?.textContent || '1')
    
    await user.click(firstPlusButton)
    
    expect(quantityDisplay?.textContent).toBe((initialQuantity + 1).toString())
  })

  it('allows users to decrease quantity (minimum 1)', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const plusButtons = screen.getAllByText('+')
    const minusButtons = screen.getAllByText('-')
    const firstPlusButton = plusButtons[0]
    const firstMinusButton = minusButtons[0]
    
    // Increase quantity first
    await user.click(firstPlusButton)
    
    // Get the quantity display
    const quantityDisplay = firstPlusButton.parentElement?.querySelector('span')
    const quantityAfterIncrease = parseInt(quantityDisplay?.textContent || '1')
    
    // Decrease quantity
    await user.click(firstMinusButton)
    
    expect(quantityDisplay?.textContent).toBe((quantityAfterIncrease - 1).toString())
  })

  it('prevents quantity from going below 1', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const minusButtons = screen.getAllByText('-')
    const firstMinusButton = minusButtons[0]
    
    // Get the initial quantity
    const quantityDisplay = firstMinusButton.parentElement?.querySelector('span')
    const initialQuantity = parseInt(quantityDisplay?.textContent || '1')
    
    // Try to decrease when already at 1
    if (initialQuantity === 1) {
      await user.click(firstMinusButton)
      expect(quantityDisplay?.textContent).toBe('1')
    }
  })

  it('shows PayPal button when "Buy Ticket" is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    await user.click(firstBuyButton)
    
    expect(screen.getByTestId('paypal-button')).toBeInTheDocument()
    expect(screen.getByText('Pay with PayPal')).toBeInTheDocument()
  })

  it('shows total amount when PayPal button is displayed', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    await user.click(firstBuyButton)
    
    // Should show total amount (5€ * quantity)
    expect(screen.getByText(/Total: €/)).toBeInTheDocument()
  })

  it('calculates total amount correctly based on quantity', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    const plusButtons = screen.getAllByText('+')
    const firstPlusButton = plusButtons[0]
    
    // Increase quantity to 3
    await user.click(firstPlusButton)
    await user.click(firstPlusButton)
    
    // Click buy ticket
    await user.click(firstBuyButton)
    
    // Should show total of 15€ (5€ * 3)
    expect(screen.getByText('Total: €15.00')).toBeInTheDocument()
  })

  it('shows cancel button when PayPal is displayed', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    await user.click(firstBuyButton)
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('hides PayPal button when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    expect(screen.getByTestId('paypal-button')).toBeInTheDocument()
    
    // Cancel
    await user.click(screen.getByText('Cancel'))
    
    // PayPal should be hidden
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument()
  })

  it('handles successful payment correctly', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    
    // Complete payment
    await user.click(screen.getByTestId('mock-paypal-button'))
    
    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        expect.stringContaining('Payment successful! You have purchased')
      )
    })
    
    // PayPal should be hidden after successful payment
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument()
  })

  it('handles payment error correctly', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    
    // Simulate payment error
    await user.click(screen.getByTestId('mock-paypal-error-button'))
    
    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Payment failed. Please try again.')
    })
    
    // PayPal should be hidden after error
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument()
  })

  it('disables quantity controls when PayPal is displayed', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    const plusButtons = screen.getAllByText('+')
    const firstPlusButton = plusButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    
    // Quantity controls should be disabled
    expect(firstPlusButton).toBeDisabled()
  })

  it('logs payment success details to console', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    
    // Complete payment
    await user.click(screen.getByTestId('mock-paypal-button'))
    
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Payment successful for item:',
        expect.any(String),
        expect.objectContaining({
          id: 'test-payment-id',
          status: 'COMPLETED'
        })
      )
    })
  })

  it('logs payment error details to console', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const buyButtons = screen.getAllByText('Buy Ticket')
    const firstBuyButton = buyButtons[0]
    
    // Show PayPal
    await user.click(firstBuyButton)
    
    // Simulate payment error
    await user.click(screen.getByTestId('mock-paypal-error-button'))
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Payment error for item:',
        expect.any(String),
        expect.any(Error)
      )
    })
  })

  it('displays correct business contact information', () => {
    render(<Home />)
    
    expect(screen.getByText('Contact: lilith.spink@proton.me')).toBeInTheDocument()
  })

  it('displays raffle items with correct information', () => {
    render(<Home />)
    
    // Check for specific raffle item details
    expect(screen.getByText('Private Qigong Session')).toBeInTheDocument()
    expect(screen.getByText(/Lingji Hon/)).toBeInTheDocument()
    expect(screen.getByText('Value: 100€')).toBeInTheDocument()
  })
})