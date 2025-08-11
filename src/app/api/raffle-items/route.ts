import { NextResponse } from 'next/server'
import { sanityClient } from '../../../../lib/sanity'
import { raffleItemsQuery } from '../../../../lib/sanity'

export async function GET() {
  try {
    const raffleItems = await sanityClient.fetch(raffleItemsQuery)
    return NextResponse.json(raffleItems)
  } catch (error) {
    console.error('Error fetching raffle items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch raffle items' },
      { status: 500 }
    )
  }
}