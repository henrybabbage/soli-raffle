import '@testing-library/jest-dom'

// Mock PayPal SDK
global.window.paypal = {
  Buttons: jest.fn(),
  FUNDING: {
    PAYPAL: 'paypal',
    PAYLATER: 'paylater',
    VENMO: 'venmo',
  },
}

// Mock environment variables
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'test@example.com'

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

// Mock fetch for PayPal API calls
global.fetch = jest.fn()

// Mock window.alert
global.alert = jest.fn()

// Mock window.location is not needed for PayPal tests