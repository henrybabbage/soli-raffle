import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '../../../../lib/sanity'
import { purchasesQuery } from '../../../../lib/sanity'

export async function GET() {
  try {
    const purchases = await sanityClient.fetch(purchasesQuery)
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
      paymentStatus = 'completed',
      notes,
    } = body

    // Validate required fields
    if (!buyerEmail || !buyerName || !raffleItemId || !quantity || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create purchase document
    const purchase = await sanityClient.create({
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