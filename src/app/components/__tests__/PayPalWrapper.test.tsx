import React from 'react'
import { render, screen } from '@testing-library/react'
import PayPalWrapper from '../PayPalWrapper'

// Mock the PayPal Script Provider
jest.mock('@paypal/react-paypal-js', () => {
  const mockPayPalScriptProvider = ({ children, options }: any) => {
    // Store options for testing
    (mockPayPalScriptProvider as any).lastOptions = options
    return <div data-testid="paypal-script-provider">{children}</div>
  }
  
  return {
    PayPalScriptProvider: mockPayPalScriptProvider,
  }
})

describe('PayPalWrapper', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'test@example.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <PayPalWrapper>
        <div data-testid="test-child">Test Content</div>
      </PayPalWrapper>
    )

    expect(screen.getByTestId('paypal-script-provider')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('configures PayPal with correct client ID from environment', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options.clientId).toBe('test-client-id')
  })

  it('uses fallback client ID when environment variable is not set', () => {
    // For this test, we'll check that the fallback is used when the env var is not set
    // Since the module is already loaded, we'll test the actual fallback logic
    const originalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = undefined

    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    // The fallback should be 'test' when NEXT_PUBLIC_PAYPAL_CLIENT_ID is undefined
    expect(options.clientId).toBe('test')
    
    // Restore the environment variable
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = originalClientId
  })

  it('configures PayPal with correct currency (EUR)', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options.currency).toBe('EUR')
  })

  it('configures PayPal with correct intent (capture)', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options.intent).toBe('capture')
  })

  it('enables additional funding options (paylater, venmo)', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options['enable-funding']).toBe('paylater,venmo')
  })

  it('disables card funding for business account optimization', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options['disable-funding']).toBe('card')
  })

  it('includes SDK integration source for button factory', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options['data-sdk-integration-source']).toBe('button-factory')
  })

  it('passes all required configuration options', () => {
    render(
      <PayPalWrapper>
        <div>Test</div>
      </PayPalWrapper>
    )

    const { PayPalScriptProvider } = require('@paypal/react-paypal-js')
    const options = (PayPalScriptProvider as any).lastOptions

    expect(options).toEqual({
      clientId: 'test-client-id',
      currency: 'EUR',
      intent: 'capture',
      'enable-funding': 'paylater,venmo',
      'disable-funding': 'card',
      'data-sdk-integration-source': 'button-factory',
    })
  })
})