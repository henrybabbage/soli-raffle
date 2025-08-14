import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paymentStatus, notes } = body;

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Update the purchase status
    const updateData: any = { paymentStatus };
    
    if (notes) {
      updateData.notes = notes;
    }

    // If marking as completed, add verification date
    if (paymentStatus === 'completed') {
      updateData.paymentVerifiedDate = new Date().toISOString();
    }

    const updatedPurchase = await client
      .patch(id)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase status' },
      { status: 500 }
    );
  }
}