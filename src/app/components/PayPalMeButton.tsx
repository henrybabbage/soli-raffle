"use client";

import { useState } from "react";

interface PayPalMeButtonProps {
  amount: number; // Amount in EUR
  itemName: string;
  itemId: string;
  quantity: number;
  buyerEmail?: string;
  buyerName?: string;
  onPaymentInitiated?: () => void;
}

export default function PayPalMeButton({
  amount,
  itemName,
  itemId,
  quantity,
  buyerEmail,
  buyerName,
  onPaymentInitiated,
}: PayPalMeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const totalAmount = (amount * quantity).toFixed(2);
  
  // Create a reference for the payment
  const reference = `${itemName} - ${quantity}x tickets - ${buyerName || "Guest"} - ${buyerEmail || ""}`.slice(0, 100);
  
  // PayPal.Me link with amount in EUR
  // The link format is: https://www.paypal.me/[username]/[amount][currency]
  const paypalMeUrl = `https://www.paypal.me/BiancaHeuser/${totalAmount}EUR`;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    // Create a unique transaction ID for tracking
    const transactionId = `PPLME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store purchase intent in localStorage for tracking
    if (typeof window !== 'undefined') {
      const purchaseIntent = {
        itemId,
        itemName,
        quantity,
        totalAmount,
        buyerEmail,
        buyerName,
        timestamp: new Date().toISOString(),
        reference,
        transactionId,
      };
      
      // Store the purchase intent locally
      const existingIntents = JSON.parse(localStorage.getItem('paypalMePurchaseIntents') || '[]');
      existingIntents.push(purchaseIntent);
      localStorage.setItem('paypalMePurchaseIntents', JSON.stringify(existingIntents));
      
      // Send purchase data to Sanity with pending status
      try {
        const purchaseData = {
          buyerEmail: buyerEmail || 'pending@email.com',
          buyerName: buyerName || 'Pending Name',
          raffleItemId: itemId,
          quantity,
          totalAmount: Math.round(parseFloat(totalAmount) * 100), // Convert to cents
          paypalTransactionId: transactionId,
          paymentStatus: 'pending',
          notes: `PayPal.Me payment initiated. Reference: ${reference}. PayPal.Me URL: ${paypalMeUrl}`,
        };
        
        const response = await fetch('/api/purchases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchaseData),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Purchase record created in Sanity:', result);
        } else {
          console.error('Failed to create purchase record:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating purchase record:', error);
      }
      
      // Log for tracking
      console.log('Payment initiated:', purchaseIntent);
    }
    
    // Call the callback if provided
    onPaymentInitiated?.();
    
    // Open PayPal.Me link in a new tab
    window.open(paypalMeUrl, '_blank', 'noopener,noreferrer');
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium">Payment Details:</p>
        <ul className="text-xs space-y-1 ml-4">
          <li>• Item: {itemName}</li>
          <li>• Quantity: {quantity} ticket(s)</li>
          <li>• Total: €{totalAmount}</li>
          {buyerName && <li>• Name: {buyerName}</li>}
          {buyerEmail && <li>• Email: {buyerEmail}</li>}
        </ul>
        <p className="text-xs italic mt-3">
          After clicking {`"Pay with PayPal"`}, you&apos;ll be redirected to PayPal to complete your payment.
          Please include your name and email in the PayPal notes for raffle entry confirmation.
        </p>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-[#0070ba] hover:bg-[#003087] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
        aria-label={`Pay €${totalAmount} with PayPal`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .633-.542h7.535c2.541 0 4.434.577 5.474 1.67 1.08 1.134 1.463 2.825 1.047 4.636-.591 2.57-2.984 5.293-7.015 5.293H9.524l-.881 5.85a.641.641 0 0 1-.633.545l-.002.002-.932 2.163zm6.832-18.159h-7.01l-2.583 14.66h3.235l.994-6.59a.641.641 0 0 1 .633-.545h3.72c3.338 0 5.475-2.12 5.977-4.315.241-1.054.048-1.87-.53-2.415-.609-.574-1.629-.795-3.436-.795z"/>
            </svg>
            Pay with PayPal
          </>
        )}
      </button>
    </div>
  );
}
