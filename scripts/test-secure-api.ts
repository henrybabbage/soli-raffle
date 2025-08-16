#!/usr/bin/env tsx

/**
 * Test script to verify the secured /api/purchases endpoint
 * Usage: npm run test:secure-api
 */

import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_URL = 'http://localhost:3000/api'
const API_SECRET_KEY = process.env.API_SECRET_KEY

async function testSecureApi() {
  console.log('🔒 Testing secured API endpoints...\n')

  // Test 1: Try to access purchases WITHOUT API key (should fail)
  console.log('❌ Test 1: Accessing /api/purchases WITHOUT API key...')
  try {
    const response = await fetch(`${API_URL}/purchases`)
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Correctly blocked: Unauthorized (401)')
    } else {
      console.log(`⚠️ Unexpected response: ${response.status} - ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }

  // Test 2: Try to access purchases WITH invalid API key (should fail)
  console.log('\n❌ Test 2: Accessing /api/purchases with INVALID API key...')
  try {
    const response = await fetch(`${API_URL}/purchases`, {
      headers: {
        'Authorization': 'Bearer invalid_key_12345'
      }
    })
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Correctly blocked: Unauthorized (401)')
    } else {
      console.log(`⚠️ Unexpected response: ${response.status} - ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }

  // Test 3: Try to access purchases WITH valid API key (should succeed)
  console.log('\n✅ Test 3: Accessing /api/purchases with VALID API key...')
  
  if (!API_SECRET_KEY) {
    console.error('❌ API_SECRET_KEY not found in environment variables')
    console.log('💡 Make sure API_SECRET_KEY is set in your .env.local file')
    return
  }

  try {
    const response = await fetch(`${API_URL}/purchases`, {
      headers: {
        'Authorization': `Bearer ${API_SECRET_KEY}`
      }
    })
    
    if (response.status === 200) {
      const data = await response.json()
      console.log(`✅ Success! Retrieved ${data.length} purchase records`)
      
      if (data.length > 0) {
        console.log('\n📦 Sample purchase:')
        const sample = data[0]
        console.log(`   - Buyer: ${sample.buyerName} (${sample.buyerEmail})`)
        console.log(`   - Amount: €${sample.totalAmount / 100}`)
        console.log(`   - Status: ${sample.paymentStatus}`)
      }
    } else {
      const data = await response.json()
      console.log(`❌ Failed: ${response.status} - ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }

  // Test 4: Test POST validation
  console.log('\n🧪 Test 4: Testing POST validation...')
  
  // Invalid data (wrong amount)
  const invalidPurchase = {
    buyerEmail: 'test@example.com',
    buyerName: 'Test User',
    raffleItemId: 'test123',
    quantity: 2,
    totalAmount: 999, // Wrong amount (should be 1000 for 2 tickets)
    paypalTransactionId: `TEST_${Date.now()}`,
    paymentStatus: 'pending'
  }

  try {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidPurchase)
    })
    const data = await response.json()
    
    if (response.status === 400) {
      console.log(`✅ Validation working: ${data.error}`)
    } else {
      console.log(`⚠️ Unexpected response: ${response.status} - ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('\n✨ Security testing complete!')
}

// Run the test
testSecureApi().catch(console.error)
