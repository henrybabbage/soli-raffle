#!/usr/bin/env tsx

/**
 * Test script to simulate a purchase completion
 * Usage: npm run test:purchase
 * 
 * This creates a test purchase record in Sanity without going through PayPal
 */

import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_URL = 'http://localhost:3000/api'

interface TestPurchase {
  buyerEmail: string
  buyerName: string
  raffleItemId: string
  quantity: number
  totalAmount: number
  paypalTransactionId: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  notes?: string
}

async function fetchRaffleItems() {
  try {
    const response = await fetch(`${API_URL}/raffle-items`)
    if (!response.ok) {
      throw new Error(`Failed to fetch raffle items: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching raffle items:', error)
    return []
  }
}

async function createTestPurchase(purchase: TestPurchase) {
  try {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create purchase: ${error}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error creating test purchase:', error)
    throw error
  }
}

async function runTest() {
  console.log('🧪 Starting purchase test...\n')

  // First, fetch available raffle items
  console.log('📋 Fetching available raffle items...')
  const raffleItems = await fetchRaffleItems()
  
  if (raffleItems.length === 0) {
    console.error('❌ No raffle items found. Please ensure Sanity has raffle items and the dev server is running.')
    process.exit(1)
  }

  console.log(`✅ Found ${raffleItems.length} raffle items`)
  console.log('📦 Using first item for test:', raffleItems[0].title)

  // Create test purchase data
  const testPurchase: TestPurchase = {
    buyerEmail: 'test@example.com',
    buyerName: 'Test User',
    raffleItemId: raffleItems[0]._id,
    quantity: 2,
    totalAmount: 1000, // €10.00 (in cents)
    paypalTransactionId: `TEST_${Date.now()}`,
    paymentStatus: 'pending', // Start as pending to simulate real flow
    notes: 'Test purchase created via script',
  }

  console.log('\n📝 Creating test purchase with data:')
  console.log(JSON.stringify(testPurchase, null, 2))

  try {
    const result = await createTestPurchase(testPurchase)
    console.log('\n✅ Purchase created successfully!')
    console.log('📄 Purchase ID:', result._id)
    console.log('🔗 Transaction ID:', result.paypalTransactionId)
    console.log('\n💡 You can now:')
    console.log('   1. Check the purchase in Sanity Studio at http://localhost:3333/studio')
    console.log('   2. Verify transactions in your PayPal account')
    console.log('   3. Update the status from "pending" to "completed" in Sanity Studio if needed')
  } catch (error) {
    console.error('\n❌ Failed to create test purchase')
    console.error('💡 Make sure:')
    console.error('   1. The development server is running (npm run dev)')
    console.error('   2. Your Sanity API token has write permissions')
    console.error('   3. Update the token in .env.local if needed')
    process.exit(1)
  }
}

// Run the test
runTest().catch(console.error)
