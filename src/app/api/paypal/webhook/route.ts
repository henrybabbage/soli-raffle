import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import crypto from 'crypto';

// PayPal webhook data interfaces
interface PayPalWebhookResource {
  id: string;
  amount?: {
    value: string;
    currency_code: string;
  };
  payer?: {
    payer_id: string;
  };
  custom_id?: string;
}

interface PayPalWebhookData {
  id: string;
  event_type: string;
  resource: PayPalWebhookResource;
}

// PayPal webhook verification
function verifyWebhookSignature(
  body: string,
  transmissionId: string,
  timestamp: string,
  certUrl: string,
  authAlgo: string,
  actualSignature: string
): boolean {
  // In production, you should implement proper webhook signature verification
  // This is a simplified version - PayPal provides detailed verification docs
  try {
    // For now, we'll do basic validation
    // In production, verify the certificate URL is from PayPal and check the signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYPAL_WEBHOOK_SECRET || 'default-secret')
      .update(body)
      .digest('hex');
    
    return actualSignature === expectedSignature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;
    
    // Extract PayPal webhook headers
    const transmissionId = headers.get('paypal-transmission-id');
    const timestamp = headers.get('paypal-transmission-time');
    const certUrl = headers.get('paypal-cert-url');
    const authAlgo = headers.get('paypal-auth-algo');
    const actualSignature = headers.get('paypal-transmission-sig');
    
    // Verify webhook signature (implement proper verification in production)
    if (!transmissionId || !timestamp || !certUrl || !authAlgo || !actualSignature) {
      console.error('Missing PayPal webhook headers');
      return NextResponse.json({ error: 'Invalid webhook headers' }, { status: 400 });
    }
    
    // For development, you can temporarily disable signature verification
    // In production, always verify the signature
    const isVerified = process.env.NODE_ENV === 'development' || 
      verifyWebhookSignature(body, transmissionId, timestamp, certUrl, authAlgo, actualSignature);
    
    if (!isVerified) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const webhookData: PayPalWebhookData = JSON.parse(body);
    console.log('PayPal webhook received:', webhookData);
    
    // Handle different webhook event types
    switch (webhookData.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookData);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookData);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(webhookData);
        break;
      default:
        console.log('Unhandled webhook event type:', webhookData.event_type);
    }
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(webhookData: PayPalWebhookData) {
  try {
    const { resource } = webhookData;
    const { id: paymentId, amount, payer, custom_id } = resource;
    
    // Extract custom_id which should contain our purchase reference
    // We'll need to modify the PayPal.Me button to include this
    if (!custom_id) {
      console.log('No custom_id found in webhook data');
      return;
    }
    
    // Parse the custom_id to get purchase details
    const [itemId, itemName, quantity, buyerEmail, buyerName] = custom_id.split('|');
    
    if (!itemId || !buyerEmail || !buyerName) {
      console.log('Invalid custom_id format:', custom_id);
      return;
    }
    
    // Check if purchase already exists
    const existingPurchase = await client.fetch(`
      *[_type == "purchase" && paypalTransactionId == $transactionId][0]
    `, { transactionId: custom_id });
    
    if (existingPurchase) {
      // Update existing purchase with webhook data
      await client.patch(existingPurchase._id)
        .set({
          paymentStatus: 'completed',
          paypalPaymentId: paymentId,
          paypalPayerId: payer?.payer_id,
          paymentVerifiedDate: new Date().toISOString(),
          verificationMethod: 'webhook',
          paymentMethod: 'paypal_webhook',
          webhookData: {
            eventType: webhookData.event_type,
            eventId: webhookData.id,
            receivedAt: new Date().toISOString(),
            rawData: JSON.stringify(webhookData),
          },
        })
        .commit();
      
      console.log('Updated existing purchase:', existingPurchase._id);
    } else {
      // Create new purchase from webhook data
      const purchase = await client.create({
        _type: 'purchase',
        buyerEmail,
        buyerName,
        raffleItem: {
          _type: 'reference',
          _ref: itemId,
        },
        quantity: parseInt(quantity) || 1,
        totalAmount: Math.round(parseFloat(amount?.value || '0') * 100),
        paypalTransactionId: custom_id,
        paypalPaymentId: paymentId,
        paypalPayerId: payer?.payer_id,
        paymentStatus: 'completed',
        paymentMethod: 'paypal_webhook',
        purchaseDate: new Date().toISOString(),
        paymentVerifiedDate: new Date().toISOString(),
        verificationMethod: 'webhook',
        notes: `Payment completed via PayPal webhook. Item: ${itemName}`,
        webhookData: {
          eventType: webhookData.event_type,
          eventId: webhookData.id,
          receivedAt: new Date().toISOString(),
          rawData: JSON.stringify(webhookData),
        },
      });
      
      console.log('Created new purchase from webhook:', purchase._id);
    }
  } catch (error) {
    console.error('Error handling payment completed:', error);
  }
}

async function handlePaymentDenied(webhookData: PayPalWebhookData) {
  try {
    const { resource } = webhookData;
    const { custom_id } = resource;
    
    if (custom_id) {
      // Update purchase status to failed
      const existingPurchase = await client.fetch(`
        *[_type == "purchase" && paypalTransactionId == $transactionId][0]
      `, { transactionId: custom_id });
      
      if (existingPurchase) {
        await client.patch(existingPurchase._id)
          .set({
            paymentStatus: 'failed',
            webhookData: {
              eventType: webhookData.event_type,
              eventId: webhookData.id,
              receivedAt: new Date().toISOString(),
              rawData: JSON.stringify(webhookData),
            },
          })
          .commit();
      }
    }
  } catch (error) {
    console.error('Error handling payment denied:', error);
  }
}

async function handlePaymentRefunded(webhookData: PayPalWebhookData) {
  try {
    const { resource } = webhookData;
    const { custom_id } = resource;
    
    if (custom_id) {
      // Update purchase status to refunded
      const existingPurchase = await client.fetch(`
        *[_type == "purchase" && paypalTransactionId == $transactionId][0]
      `, { transactionId: custom_id });
      
      if (existingPurchase) {
        await client.patch(existingPurchase._id)
          .set({
            paymentStatus: 'refunded',
            webhookData: {
              eventType: webhookData.event_type,
              eventId: webhookData.id,
              receivedAt: new Date().toISOString(),
              rawData: JSON.stringify(webhookData),
            },
          })
          .commit();
      }
    }
  } catch (error) {
    console.error('Error handling payment refunded:', error);
  }
}