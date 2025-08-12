import "@testing-library/jest-dom";

// Mock PayPal SDK
global.window.paypal = {
  Buttons: jest.fn(),
  FUNDING: {
    PAYPAL: "paypal",
    PAYLATER: "paylater",
    VENMO: "venmo",
  },
};

// Mock environment variables
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = "test-client-id";
process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = "test@example.com";
process.env.NEXT_PUBLIC_SANITY_DATASET = "test";
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "test";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock fetch for PayPal API calls
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Do not override window.location.assign; jsdom doesn't navigate in tests anyway
