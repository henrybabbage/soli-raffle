import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { raffleItemsQuery } from '@/sanity/lib/queries'

export async function GET() {
  try {
    const raffleItems = await client.fetch(raffleItemsQuery)
    return NextResponse.json(raffleItems)
  } catch (error) {
    console.error('Error fetching raffle items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch raffle items' },
      { status: 500 }
    )
  }
}
