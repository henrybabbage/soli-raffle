const {
  TextDecoder: NodeTextDecoder,
  TextEncoder: NodeTextEncoder,
} = require('node:util')
const { ReadableStream: NodeReadableStream } = require('node:stream/web')

Object.assign(global, {
  TextDecoder: NodeTextDecoder,
  TextEncoder: NodeTextEncoder,
  ReadableStream: NodeReadableStream,
})

const edgeFetch = require('next/dist/compiled/@edge-runtime/primitives/fetch')

Object.assign(global, {
  Request: edgeFetch.Request,
  Response: edgeFetch.Response,
  Headers: edgeFetch.Headers,
})

jest.mock('@/sanity/lib/client', () => ({
  client: { fetch: jest.fn() },
  writeClient: { fetch: jest.fn(), create: jest.fn() },
}))
jest.mock('@/sanity/lib/queries', () => ({ purchasesQuery: '*[_type == "purchase"]' }))

const { NextRequest } = require('next/server')
const { POST } = require('../route')
const { writeClient } = require('@/sanity/lib/client')

const fetchRaffleItem = writeClient.fetch as jest.Mock
const createPurchase = writeClient.create as jest.Mock

function request(body: unknown) {
  return new NextRequest('http://localhost/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/purchases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SANITY_API_WRITE_TOKEN = 'test-write-token'
    fetchRaffleItem.mockResolvedValue({ _id: 'item-123', title: 'Test Item' })
    createPurchase.mockResolvedValue({ _id: 'intent-123' })
  })

  afterEach(() => {
    delete process.env.SANITY_API_WRITE_TOKEN
  })

  it('records a pending, server-priced intent for an active raffle item', async () => {
    const response = await POST(
      request({
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer Name',
        raffleItemId: 'item-123',
        quantity: 2,
        totalAmount: 1,
        paymentStatus: 'completed',
      })
    )

    expect(response.status).toBe(201)
    expect(fetchRaffleItem).toHaveBeenCalledWith(
      '*[_type == "raffleItem" && _id == $id && isActive == true][0]{_id, title}',
      { id: 'item-123' }
    )
    expect(createPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'purchase',
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer Name',
        raffleItem: { _type: 'reference', _ref: 'item-123' },
        raffleItemTitle: 'Test Item',
        quantity: 2,
        ticketPriceCents: 1000,
        totalAmount: 2000,
        paymentStatus: 'pending',
      })
    )
  })

  it('rejects inactive or missing raffle items', async () => {
    fetchRaffleItem.mockResolvedValue(null)

    const response = await POST(
      request({
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer Name',
        raffleItemId: 'retired-item',
        quantity: 1,
      })
    )

    expect(response.status).toBe(404)
    expect(createPurchase).not.toHaveBeenCalled()
  })

  it('requires a server-side Sanity write token', async () => {
    delete process.env.SANITY_API_WRITE_TOKEN

    const response = await POST(
      request({
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer Name',
        raffleItemId: 'item-123',
        quantity: 1,
      })
    )

    expect(response.status).toBe(503)
    expect(createPurchase).not.toHaveBeenCalled()
  })
})
