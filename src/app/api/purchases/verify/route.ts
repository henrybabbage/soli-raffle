import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json(
        { error: 'Missing reference parameter' },
        { status: 400 }
      );
    }

    // Find purchase by the custom reference ID
    const purchase = await client.fetch(`
      *[_type == "purchase" && paypalTransactionId == $ref][0] {
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
        notes
      }
    `, { ref });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    );
  }
}