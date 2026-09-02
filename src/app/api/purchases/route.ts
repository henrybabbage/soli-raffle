import { NextRequest, NextResponse } from 'next/server'
import { TICKET_PRICE_CENTS } from '@/app/constants'
import { client, writeClient } from '@/sanity/lib/client'
import { purchasesQuery } from '@/sanity/lib/queries'

const MAX_TICKETS_PER_INTENT = 100

type PurchaseIntentPayload = {
  buyerEmail?: unknown
  buyerName?: unknown
  raffleItemId?: unknown
  quantity?: unknown
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null
}

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const validKey = process.env.API_SECRET_KEY

  return Boolean(
    authHeader?.startsWith('Bearer ') &&
      validKey &&
      authHeader.substring(7) === validKey
  )
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const purchases = await client.fetch(purchasesQuery)
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('SANITY_API_WRITE_TOKEN is not configured')
    return NextResponse.json(
      { error: 'Purchase logging is temporarily unavailable' },
      { status: 503 }
    )
  }

  try {
    const body = (await request.json()) as PurchaseIntentPayload
    const buyerEmail = stringValue(body.buyerEmail)
    const buyerName = stringValue(body.buyerName)
    const raffleItemId = stringValue(body.raffleItemId)
    const quantity = body.quantity

    if (!buyerEmail || !buyerName || !raffleItemId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_TICKETS_PER_INTENT
    ) {
      return NextResponse.json(
        { error: `Invalid quantity. Must be between 1 and ${MAX_TICKETS_PER_INTENT}.` },
        { status: 400 }
      )
    }

    const raffleItem = await writeClient.fetch<{ _id: string; title: string } | null>(
      '*[_type == "raffleItem" && _id == $id && isActive == true][0]{_id, title}',
      { id: raffleItemId }
    )

    if (!raffleItem) {
      return NextResponse.json(
        { error: 'This raffle item is no longer available' },
        { status: 404 }
      )
    }

    const purchase = await writeClient.create({
      _type: 'purchase',
      buyerEmail,
      buyerName,
      raffleItem: {
        _type: 'reference',
        _ref: raffleItem._id,
      },
      raffleItemTitle: raffleItem.title,
      quantity,
      ticketPriceCents: TICKET_PRICE_CENTS,
      totalAmount: quantity * TICKET_PRICE_CENTS,
      // Redirecting to PayPal.Me does not confirm payment. These records are
      // therefore purchase intents until an organiser verifies the payment.
      paymentStatus: 'pending',
      purchaseDate: new Date().toISOString(),
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase intent:', error)
    return NextResponse.json(
      { error: 'Failed to record purchase intent' },
      { status: 500 }
    )
  }
}
