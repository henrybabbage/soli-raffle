import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { purchasesQuery } from '@/sanity/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = purchasesQuery;
    
    // If status filter is provided, modify the query
    if (status && status !== 'all') {
      query = `*[_type == "purchase" && paymentStatus == $status] {
        _id,
        buyerEmail,
        buyerName,
        raffleItem->{ title, _id },
        quantity,
        totalAmount,
        paymentStatus,
        paymentMethod,
        purchaseDate,
        paymentVerifiedDate,
        verificationMethod,
        paypalTransactionId,
        notes
      } | order(purchaseDate desc)`;
    }

    const purchases = await client.fetch(query, { status });
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
      paymentStatus = 'pending',
      paymentMethod = 'paypal_me',
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
    const purchase = await client.create({
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
      paymentMethod,
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