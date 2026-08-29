#!/usr/bin/env tsx

/**
 * Test script to simulate PayPal.Me button flow
 * This mimics what happens when a user clicks the PayPal.Me button
 */

import dotenv from 'dotenv'
import path from 'path'
import { buildPayPalMeUrl } from '../src/app/config/paypal'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_URL = 'http://localhost:3000/api'

async function testPayPalMeFlow() {
  console.log('🧪 Testing PayPal.Me button flow...\n')

  // 1. First fetch raffle items
  console.log('📋 Fetching raffle items...')
  const itemsResponse = await fetch(`${API_URL}/raffle-items`)
  const items = await itemsResponse.json()
  
  if (items.length === 0) {
    console.error('❌ No raffle items found')
    return
  }

  const selectedItem = items[0]
  console.log(`✅ Selected item: ${selectedItem.title}`)

  // 2. Simulate user input
  const userInput = {
    buyerEmail: 'jane.doe@example.com',
    buyerName: 'Jane Doe',
    quantity: 3,
    totalAmount: 1500, // €15.00 (3 tickets × €5)
  }

  console.log('\n👤 User details:')
  console.log(`   Name: ${userInput.buyerName}`)
  console.log(`   Email: ${userInput.buyerEmail}`)
  console.log(`   Tickets: ${userInput.quantity}`)
  console.log(`   Total: €${userInput.totalAmount / 100}`)

  // 3. Create purchase record (this happens when PayPal.Me button is clicked)
  const transactionId = `PPLME_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const paypalMeUrl = buildPayPalMeUrl(
    (userInput.totalAmount / 100).toFixed(2)
  )

  console.log('\n💾 Creating purchase record in Sanity...')
  const purchaseData = {
    buyerEmail: userInput.buyerEmail,
    buyerName: userInput.buyerName,
    raffleItemId: selectedItem._id,
    quantity: userInput.quantity,
    totalAmount: userInput.totalAmount,
    paypalTransactionId: transactionId,
    paymentStatus: 'pending',
    notes: `PayPal.Me URL: ${paypalMeUrl} | Reference: ${transactionId}`,
  }

  try {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    })

    if (!response.ok) {
      throw new Error(`Failed: ${await response.text()}`)
    }

    const purchase = await response.json()
    
    console.log('✅ Purchase record created successfully!')
    console.log(`📄 Purchase ID: ${purchase._id}`)
    console.log(`🔗 Transaction ID: ${transactionId}`)
    console.log(`💳 PayPal.Me URL: ${paypalMeUrl}`)

    // 4. Simulate localStorage storage (happens client-side)
    const purchaseIntent = {
      itemId: selectedItem._id,
      itemName: selectedItem.title,
      quantity: userInput.quantity,
      totalAmount: `€${userInput.totalAmount / 100}`,
      buyerEmail: userInput.buyerEmail,
      buyerName: userInput.buyerName,
      timestamp: new Date().toISOString(),
      reference: transactionId,
    }

    console.log('\n💾 Purchase intent (would be in localStorage):')
    console.log(JSON.stringify(purchaseIntent, null, 2))

    console.log('\n🎉 Success! The purchase flow is working correctly.')
    console.log('\n📍 Next steps:')
    console.log('   1. User would be redirected to:', paypalMeUrl)
    console.log('   2. After payment, verify transaction in PayPal account')
    console.log('   3. View purchase records in Sanity Studio at: http://localhost:3333/studio')

  } catch (error) {
    console.error('\n❌ Failed to create purchase:', error)
    console.error('Make sure the dev server is running and the token is configured.')
  }
}

// Run the test
testPayPalMeFlow().catch(console.error)
