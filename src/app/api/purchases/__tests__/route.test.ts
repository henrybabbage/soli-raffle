import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the entire next/server module
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: any) {
      this.url = url;
      this.init = init;
    }
    async text() { return '{}'; }
    async json() { 
      if (this.init?.body) {
        return JSON.parse(this.init.body);
      }
      return {};
    }
    get headers() { return new Map(); }
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
  },
}));

// Mock queries
jest.mock('@/sanity/lib/queries', () => ({
  purchasesQuery: '*[_type == "purchase"]',
}));

describe('Purchases API Route', () => {
  // Get the mocked client and NextResponse
  const mockSanityClient = require('@/sanity/lib/client').client;
  const { NextResponse } = require('next/server');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/purchases', () => {
    it('fetches all purchases successfully', async () => {
      const mockPurchases = [
        {
          _id: 'purchase-1',
          buyerEmail: 'user1@example.com',
          buyerName: 'John Doe',
          raffleItem: { title: 'Qigong Session', _id: 'raffle-1' },
          quantity: 2,
          totalAmount: 5000,
          paymentStatus: 'completed',
          paymentMethod: 'paypal_webhook',
          purchaseDate: '2024-01-01T12:00:00.000Z',
          paypalTransactionId: 'ref-1',
          notes: 'Payment completed',
        },
      ];

      mockSanityClient.fetch.mockResolvedValue(mockPurchases);

      const request = new NextRequest('http://localhost/api/purchases');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPurchases);
      expect(mockSanityClient.fetch).toHaveBeenCalledWith('*[_type == "purchase"]', { status: null });
    });

    it('filters purchases by status when status parameter is provided', async () => {
      const mockPendingPurchases = [
        {
          _id: 'purchase-2',
          buyerEmail: 'user2@example.com',
          buyerName: 'Jane Smith',
          raffleItem: { title: 'Qigong Session', _id: 'raffle-1' },
          quantity: 1,
          totalAmount: 2500,
          paymentStatus: 'pending',
          paymentMethod: 'paypal_me',
          purchaseDate: '2024-01-01T12:00:00.000Z',
          paypalTransactionId: 'ref-2',
          notes: 'Payment pending',
        },
      ];

      mockSanityClient.fetch.mockResolvedValue(mockPendingPurchases);

      const request = new NextRequest('http://localhost/api/purchases?status=pending');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPendingPurchases);
      expect(mockSanityClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('paymentStatus == $status'),
        { status: 'pending' }
      );
    });

    it('returns all purchases when status is "all"', async () => {
      const mockAllPurchases = [
        {
          _id: 'purchase-3',
          buyerEmail: 'user3@example.com',
          buyerName: 'Bob Johnson',
          raffleItem: { title: 'Qigong Session', _id: 'raffle-1' },
          quantity: 3,
          totalAmount: 7500,
          paymentStatus: 'completed',
          paymentMethod: 'paypal_webhook',
          purchaseDate: '2024-01-01T12:00:00.000Z',
          paypalTransactionId: 'ref-3',
          notes: 'Payment completed',
        },
      ];

      mockSanityClient.fetch.mockResolvedValue(mockAllPurchases);

      const request = new NextRequest('http://localhost/api/purchases?status=all');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockAllPurchases);
      expect(mockSanityClient.fetch).toHaveBeenCalledWith('*[_type == "purchase"]', { status: 'all' });
    });

    it('handles fetch errors gracefully', async () => {
      mockSanityClient.fetch.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/purchases');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch purchases' });
    });
  });

  describe('POST /api/purchases', () => {
    it('creates a new purchase successfully', async () => {
      const purchaseData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        quantity: 2,
        totalAmount: 5000,
        paypalTransactionId: 'ref-123',
        paymentStatus: 'pending',
        paymentMethod: 'paypal_me',
        notes: 'Payment initiated',
      };

      const mockCreatedPurchase = {
        _id: 'new-purchase-123',
        ...purchaseData,
        purchaseDate: '2024-01-01T12:00:00.000Z',
      };

      mockSanityClient.create.mockResolvedValue(mockCreatedPurchase);

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      // Debug: log the actual response
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockCreatedPurchase);
      expect(mockSanityClient.create).toHaveBeenCalledWith({
        _type: 'purchase',
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItem: {
          _type: 'reference',
          _ref: 'raffle-item-123',
        },
        quantity: 2,
        totalAmount: 5000,
        paypalTransactionId: 'ref-123',
        paymentStatus: 'pending',
        paymentMethod: 'paypal_me',
        purchaseDate: expect.any(String),
        notes: 'Payment initiated',
      });
    });

    it('creates purchase with default values when not provided', async () => {
      const purchaseData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      const mockCreatedPurchase = {
        _id: 'new-purchase-123',
        ...purchaseData,
        paymentStatus: 'pending',
        paymentMethod: 'paypal_me',
        purchaseDate: '2024-01-01T12:00:00.000Z',
      };

      mockSanityClient.create.mockResolvedValue(mockCreatedPurchase);

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockCreatedPurchase);
      expect(mockSanityClient.create).toHaveBeenCalledWith({
        _type: 'purchase',
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItem: {
          _type: 'reference',
          _ref: 'raffle-item-123',
        },
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
        paymentStatus: 'pending',
        paymentMethod: 'paypal_me',
        purchaseDate: expect.any(String),
        notes: undefined,
      });
    });

    it('returns error when required fields are missing', async () => {
      const incompleteData = {
        buyerEmail: 'user@example.com',
        // Missing buyerName, raffleItemId, quantity, totalAmount
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('returns error when buyerEmail is missing', async () => {
      const incompleteData = {
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('returns error when buyerName is missing', async () => {
      const incompleteData = {
        buyerEmail: 'user@example.com',
        raffleItemId: 'raffle-item-123',
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('returns error when raffleItemId is missing', async () => {
      const incompleteData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('returns error when quantity is missing', async () => {
      const incompleteData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('returns error when totalAmount is missing', async () => {
      const incompleteData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        quantity: 1,
        paypalTransactionId: 'ref-123',
      };

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('handles creation errors gracefully', async () => {
      const purchaseData = {
        buyerEmail: 'user@example.com',
        buyerName: 'John Doe',
        raffleItemId: 'raffle-item-123',
        quantity: 1,
        totalAmount: 2500,
        paypalTransactionId: 'ref-123',
      };

      mockSanityClient.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create purchase' });
    });
  });
});