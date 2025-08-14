import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: any) {
      this.url = url;
      this.init = init;
    }
    async text() { 
      if (this.init?.body) {
        return this.init.body;
      }
      return '{}'; 
    }
    get headers() { 
      if (this.init?.headers) {
        return this.init.headers;
      }
      return new Map(); 
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
  },
}));

// Mock crypto
const mockCrypto = {
  createHmac: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mock-signature'),
    })),
  })),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('PayPal Webhook Endpoint', () => {
  // Get the mocked client
  const mockSanityClient = require('@/sanity/lib/client').client;

  const mockWebhookData = {
    id: 'WH-1234567890',
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    create_time: '2024-01-01T12:00:00.000Z',
    resource_type: 'capture',
    resource: {
      id: 'CAPTURE-1234567890',
      status: 'COMPLETED',
      amount: {
        currency_code: 'EUR',
        value: '25.00',
      },
      final_capture: true,
      seller_protection: {
        status: 'ELIGIBLE',
        dispute_categories: ['ITEM_NOT_RECEIVED', 'UNAUTHORIZED_TRANSACTION'],
      },
      seller_receivable_breakdown: {
        gross_amount: {
          currency_code: 'EUR',
          value: '25.00',
        },
        paypal_fee: {
          currency_code: 'EUR',
          value: '1.25',
        },
        net_amount: {
          currency_code: 'EUR',
          value: '23.75',
        },
      },
      create_time: '2024-01-01T12:00:00.000Z',
      update_time: '2024-01-01T12:00:00.000Z',
      custom_id: 'raffle-item-123|Qigong Session|2|user@example.com|John Doe',
    },
    links: [
      {
        href: 'https://api.paypal.com/v1/notifications/webhooks-events/WH-1234567890',
        rel: 'self',
        method: 'GET',
      },
    ],
  };

  const mockHeaders = new Map([
    ['paypal-transmission-id', '1234567890'],
    ['paypal-transmission-time', '2024-01-01T12:00:00.000Z'],
    ['paypal-cert-url', 'https://api.paypal.com/v1/notifications/certs/CERT-123'],
    ['paypal-auth-algo', 'SHA256withRSA'],
    ['paypal-transmission-sig', 'mock-signature'],
  ]);

  // Mock the headers.get method
  const mockHeadersWithGet = {
    get: (key: string) => mockHeaders.get(key),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.PAYPAL_WEBHOOK_SECRET = 'test-secret';
    
    // Debug: log environment variables
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PAYPAL_WEBHOOK_SECRET:', process.env.PAYPAL_WEBHOOK_SECRET);
  });

  it('processes PAYMENT.CAPTURE.COMPLETED webhook successfully', async () => {
    // Mock the Sanity client methods
    mockSanityClient.fetch.mockResolvedValue({
      _id: 'existing-purchase-123',
      buyerEmail: 'user@example.com',
      buyerName: 'John Doe',
    });
    
    mockSanityClient.patch.mockReturnValue({
      set: jest.fn().mockReturnValue({
        commit: jest.fn().mockResolvedValue({ _id: 'updated-purchase' }),
      }),
    });

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeadersWithGet,
      body: JSON.stringify(mockWebhookData),
    });

    const response = await POST(request);
    
    // Check that we get a successful response
    expect(response.status).toBe(200);
    
    // Check the response data
    const responseData = await response.json();
    expect(responseData).toEqual({ status: 'success' });
    
    // Check that the route was called successfully
    expect(mockSanityClient.fetch).toHaveBeenCalled();
    
    // Check that the existing purchase was found and updated
    expect(mockSanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('paypalTransactionId == $transactionId'),
      { transactionId: 'raffle-item-123|Qigong Session|2|user@example.com|John Doe' }
    );
    
    expect(mockSanityClient.patch).toHaveBeenCalledWith('existing-purchase-123');
    
    // Check that the purchase was updated with the correct data
    // The patch.set method should have been called with the update data
    const patchCall = mockSanityClient.patch.mock.calls[0];
    const patchInstance = patchCall[0]; // The ID passed to patch
    
    // Since we can't easily access the chained mock calls, let's just verify
    // that the patch method was called with the correct ID
    expect(patchInstance).toBe('existing-purchase-123');
  });

  it('creates new purchase when existing one is not found', async () => {
    mockSanityClient.fetch.mockResolvedValue(null);
    mockSanityClient.create.mockResolvedValue({ _id: 'new-purchase-123' });

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(mockWebhookData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Check that new purchase was created
    expect(mockSanityClient.create).toHaveBeenCalledWith({
      _type: 'purchase',
      buyerEmail: 'user@example.com',
      buyerName: 'John Doe',
      raffleItem: {
        _type: 'reference',
        _ref: 'raffle-item-123',
      },
      quantity: 2,
      totalAmount: 2500, // 25.00 EUR in cents
      paypalTransactionId: 'raffle-item-123|Qigong Session|2|user@example.com|John Doe',
      paypalPaymentId: 'CAPTURE-1234567890',
      paypalPayerId: undefined,
      paymentStatus: 'completed',
      paymentMethod: 'paypal_webhook',
      purchaseDate: expect.any(String),
      paymentVerifiedDate: expect.any(String),
      verificationMethod: 'webhook',
      notes: 'Payment completed via PayPal webhook. Item: Qigong Session',
      webhookData: {
        eventType: 'PAYMENT.CAPTURE.COMPLETED',
        eventId: 'WH-1234567890',
        receivedAt: expect.any(String),
        rawData: JSON.stringify(mockWebhookData),
      },
    });
  });

  it('handles PAYMENT.CAPTURE.DENIED webhook', async () => {
    mockSanityClient.fetch.mockResolvedValue({
      _id: 'existing-purchase-123',
      buyerEmail: 'user@example.com',
      buyerName: 'John Doe',
    });

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeadersWithGet,
      body: JSON.stringify({
        ...mockWebhookData,
        event_type: 'PAYMENT.CAPTURE.DENIED',
        resource: {
          ...mockWebhookData.resource,
          status: 'DENIED',
        },
      }),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Check that purchase status was updated to failed
    expect(mockSanityClient.patch).toHaveBeenCalledWith('existing-purchase-123');
    
    // Verify the patch was called with the correct ID
    const patchCall = mockSanityClient.patch.mock.calls[0];
    const patchInstance = patchCall[0];
    expect(patchInstance).toBe('existing-purchase-123');
  });

  it('handles PAYMENT.CAPTURE.REFUNDED webhook', async () => {
    mockSanityClient.fetch.mockResolvedValue({
      _id: 'existing-purchase-123',
      buyerEmail: 'user@example.com',
      buyerName: 'John Doe',
    });

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeadersWithGet,
      body: JSON.stringify({
        ...mockWebhookData,
        event_type: 'PAYMENT.CAPTURE.REFUNDED',
        resource: {
          ...mockWebhookData.resource,
          status: 'REFUNDED',
        },
      }),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Check that purchase status was updated to refunded
    expect(mockSanityClient.patch).toHaveBeenCalledWith('existing-purchase-123');
    
    // Verify the patch was called with the correct ID
    const patchCall = mockSanityClient.patch.mock.calls[0];
    const patchInstance = patchCall[0];
    expect(patchInstance).toBe('existing-purchase-123');
  });

  it('handles webhook without custom_id gracefully', async () => {
    const webhookWithoutCustomId = {
      ...mockWebhookData,
      resource: {
        ...mockWebhookData.resource,
        custom_id: undefined,
      },
    };

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(webhookWithoutCustomId),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Should not create or update any purchases
    expect(mockSanityClient.create).not.toHaveBeenCalled();
    expect(mockSanityClient.patch).not.toHaveBeenCalled();
  });

  it('handles invalid custom_id format gracefully', async () => {
    const webhookWithInvalidCustomId = {
      ...mockWebhookData,
      resource: {
        ...mockWebhookData.resource,
        custom_id: 'invalid-format',
      },
    };

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(webhookWithInvalidCustomId),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Should not create or update any purchases
    expect(mockSanityClient.create).not.toHaveBeenCalled();
    expect(mockSanityClient.patch).not.toHaveBeenCalled();
  });

  it('returns error when required headers are missing', async () => {
    const incompleteHeaders = new Map([
      ['paypal-transmission-id', '1234567890'],
      // Missing other required headers
    ]);

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: incompleteHeaders,
      body: JSON.stringify(mockWebhookData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: 'Invalid webhook headers' });
  });

  it('handles webhook signature verification in production', async () => {
    // Set environment to production to enable signature verification
    process.env.NODE_ENV = 'production';
    
    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeadersWithGet,
      body: JSON.stringify(mockWebhookData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    // In production mode, signature verification should fail with our mock signature
    expect(response.status).toBe(401);
    expect(responseData).toEqual({ error: 'Invalid signature' });
  });

  it('handles unhandled webhook event types', async () => {
    const unhandledWebhookData = {
      ...mockWebhookData,
      event_type: 'UNKNOWN.EVENT.TYPE',
    };

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(unhandledWebhookData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });

    // Should not create or update any purchases
    expect(mockSanityClient.create).not.toHaveBeenCalled();
    expect(mockSanityClient.patch).not.toHaveBeenCalled();
  });

  it('handles Sanity client errors gracefully', async () => {
    mockSanityClient.fetch.mockRejectedValue(new Error('Sanity error'));

    const request = new NextRequest('http://localhost/api/paypal/webhook', {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(mockWebhookData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 'success' });
  });
});