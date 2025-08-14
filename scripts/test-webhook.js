#!/usr/bin/env node

/**
 * Test script for PayPal webhook endpoint
 * Run with: node scripts/test-webhook.js
 */

const https = require('https');
const http = require('http');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/paypal/webhook';
const IS_HTTPS = WEBHOOK_URL.startsWith('https://');

// Sample webhook data for PAYMENT.CAPTURE.COMPLETED
const sampleWebhookData = {
  id: "WH-1234567890",
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  create_time: "2024-01-01T12:00:00.000Z",
  resource_type: "capture",
  resource: {
    id: "CAPTURE-1234567890",
    status: "COMPLETED",
    amount: {
      currency_code: "EUR",
      value: "25.00"
    },
    final_capture: true,
    seller_protection: {
      status: "ELIGIBLE",
      dispute_categories: ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"]
    },
    seller_receivable_breakdown: {
      gross_amount: {
        currency_code: "EUR",
        value: "25.00"
      },
      paypal_fee: {
        currency_code: "EUR",
        value: "1.25"
      },
      net_amount: {
        currency_code: "EUR",
        value: "23.75"
      }
    },
    create_time: "2024-01-01T12:00:00.000Z",
    update_time: "2024-01-01T12:00:00.000Z",
    custom_id: "raffle-item-123|Qigong Session|2|user@example.com|John Doe"
  },
  links: [
    {
      href: "https://api.paypal.com/v1/notifications/webhooks-events/WH-1234567890",
      rel: "self",
      method: "GET"
    },
    {
      href: "https://api.paypal.com/v1/notifications/webhooks-events/WH-1234567890/resend",
      rel: "resend",
      method: "POST"
    }
  ]
};

// Sample webhook headers
const sampleHeaders = {
  'paypal-transmission-id': '1234567890',
  'paypal-transmission-time': '2024-01-01T12:00:00.000Z',
  'paypal-cert-url': 'https://api.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-5a11',
  'paypal-auth-algo': 'SHA256withRSA',
  'paypal-transmission-sig': 'test-signature-for-development',
  'content-type': 'application/json'
};

function makeRequest(data, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (IS_HTTPS ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: headers
    };

    const client = IS_HTTPS ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testWebhook() {
  console.log('🧪 Testing PayPal Webhook Endpoint');
  console.log('=====================================');
  console.log(`URL: ${WEBHOOK_URL}`);
  console.log(`Protocol: ${IS_HTTPS ? 'HTTPS' : 'HTTP'}`);
  console.log('');

  try {
    console.log('📤 Sending test webhook data...');
    
    const response = await makeRequest(sampleWebhookData, sampleHeaders);
    
    console.log('📥 Response received:');
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Headers:`, response.headers);
    console.log(`Response Data:`, response.data);
    console.log('');

    if (response.statusCode === 200) {
      console.log('✅ Webhook endpoint is working correctly!');
      console.log('The endpoint successfully processed the webhook data.');
    } else {
      console.log('⚠️  Webhook endpoint responded with non-200 status');
      console.log('Check the response data for error details.');
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    console.log('');
    console.log('Troubleshooting tips:');
    console.log('1. Make sure your Next.js app is running');
    console.log('2. Check that the webhook endpoint is accessible');
    console.log('3. Verify the URL in WEBHOOK_URL environment variable');
    console.log('4. Check server logs for any errors');
  }
}

// Run the test
if (require.main === module) {
  testWebhook();
}

module.exports = { testWebhook, sampleWebhookData, sampleHeaders };