import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paypalTransactionId, amount, verificationMethod } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Update the purchase with verified payment information
    const updatedPurchase = await client
      .patch(id)
      .set({
        paymentStatus: 'completed',
        totalAmount: amount,
        paymentVerifiedDate: new Date().toISOString(),
        verificationMethod: verificationMethod || 'manual',
        notes: `Payment manually verified. Amount: €${(amount / 100).toFixed(2)}. Transaction ID: ${paypalTransactionId}`,
      })
      .commit();

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    );
  }
}