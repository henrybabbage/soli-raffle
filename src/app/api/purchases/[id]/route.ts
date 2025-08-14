import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { notes, ...otherFields } = body;

    // Only allow updating specific fields for security
    const allowedFields = ['notes', 'paymentStatus', 'totalAmount'];
    const updateData: any = {};

    Object.keys(otherFields).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = otherFields[key];
      }
    });

    if (notes) {
      updateData.notes = notes;
    }

    const updatedPurchase = await client
      .patch(id)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}