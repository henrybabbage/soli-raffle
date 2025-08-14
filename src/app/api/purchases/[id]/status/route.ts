import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

interface StatusUpdateData {
  paymentStatus: string;
  notes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, notes }: StatusUpdateData = body;

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Update the purchase status
    const updateData: StatusUpdateData = { paymentStatus };
    
    if (notes) {
      updateData.notes = notes;
    }

    // If marking as completed, add verification date
    if (paymentStatus === 'completed') {
      (updateData as StatusUpdateData & { paymentVerifiedDate: string }).paymentVerifiedDate = new Date().toISOString();
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