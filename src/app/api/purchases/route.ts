import { NextRequest, NextResponse } from 'next/server'
import { client, writeClient } from '@/sanity/lib/client'
import { purchasesQuery } from '@/sanity/lib/queries'

// Validate API secret key
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  const validKey = process.env.API_SECRET_KEY
  
  if (!validKey) {
    console.error('API_SECRET_KEY is not configured')
    return false
  }
  
  return token === validKey
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
  try {
    const body = await request.json()
    const {
      buyerEmail,
      buyerName,
      raffleItemId,
      quantity,
      totalAmount,
      paypalTransactionId,
      paymentStatus = 'pending', // Default to pending for new purchases
      notes,
    } = body

    // Validate required fields
    if (!buyerEmail || !buyerName || !raffleItemId || !quantity || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be between 1 and 100.' },
        { status: 400 }
      )
    }

    // Validate total amount (must be positive and reasonable)
    if (!Number.isInteger(totalAmount) || totalAmount < 100 || totalAmount > 1000000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between €1 and €10,000.' },
        { status: 400 }
      )
    }

    // Calculate expected amount (€5 per ticket, in cents)
    const expectedAmount = quantity * 500
    if (totalAmount !== expectedAmount) {
      return NextResponse.json(
        { error: `Invalid amount. Expected €${expectedAmount / 100} for ${quantity} tickets.` },
        { status: 400 }
      )
    }

    // Validate payment status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      )
    }

    // Create purchase document
    const purchase = await writeClient.create({
      _type: 'purchase',
      buyerEmail,
      buyerName,
      raffleItem: {
        _type: 'reference',
        _ref: raffleItemId,
      },
      quantity,
      totalAmount,
      paypalTransactionId,
      paymentStatus,
      purchaseDate: new Date().toISOString(),
      notes,
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
}