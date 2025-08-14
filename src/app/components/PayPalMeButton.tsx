"use client";

import { useState } from "react";
import { PayPalIcon } from "./PayPalIcon";

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

  // Create a unique reference for the payment that includes all necessary data
  // This will be used in the PayPal.Me URL and for tracking
  const customId = `${itemId}|${itemName}|${quantity}|${buyerEmail || 'pending'}|${buyerName || 'pending'}`;
  
  // Create a return URL that users will be redirected to after payment
  const returnUrl = `${window.location.origin}/payment-success?ref=${encodeURIComponent(customId)}`;

  // PayPal.Me link with amount in EUR and custom note
  // Note: PayPal.Me doesn't support custom_id directly, so we'll use the note field
  const paypalMeUrl = `https://www.paypal.me/BiancaHeuser/${totalAmount}EUR`;

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Create a unique transaction ID for tracking
    const transactionId = `PPLME_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    if (typeof window !== "undefined") {
      const purchaseIntent = {
        itemId,
        itemName,
        quantity,
        totalAmount,
        buyerEmail,
        buyerName,
        timestamp: new Date().toISOString(),
        customId,
        transactionId,
        returnUrl,
      };

      try {
        // Store purchase intent in localStorage for tracking
        const existingIntents = JSON.parse(
          localStorage.getItem("paypalMePurchaseIntents") || "[]"
        );
        existingIntents.push(purchaseIntent);
        localStorage.setItem(
          "paypalMePurchaseIntents",
          JSON.stringify(existingIntents)
        );

        // Also store the current purchase intent for immediate access
        localStorage.setItem("currentPurchaseIntent", JSON.stringify(purchaseIntent));
      } catch (error) {
        console.error("Error storing purchase intent:", error);
      }

      try {
        // Create initial purchase record with pending status
        const purchaseData = {
          buyerEmail: buyerEmail || "pending@email.com",
          buyerName: buyerName || "Pending Name",
          raffleItemId: itemId,
          quantity,
          totalAmount: Math.round(parseFloat(totalAmount) * 100),
          paypalTransactionId: customId,
          paymentStatus: "pending",
          paymentMethod: "paypal_me",
          notes: `PayPal.Me payment initiated. Reference: ${customId}. PayPal.Me URL: ${paypalMeUrl}. Return URL: ${returnUrl}`,
        };

        const payload = JSON.stringify(purchaseData);
        
        // Use sendBeacon for reliable delivery, fallback to fetch
        let sent = false;
        if ("navigator" in window && "sendBeacon" in navigator) {
          sent = navigator.sendBeacon("/api/purchases", blob);
        }

        if (!sent) {
          fetch("/api/purchases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (error) {
        console.error("Error sending purchase data:", error);
      }

      console.log("Payment initiated:", purchaseIntent);
    }

    onPaymentInitiated?.();

    // Open PayPal.Me in a new tab with instructions
    const paypalWindow = window.open(
      paypalMeUrl,
      '_blank',
      'width=800,height=600'
    );

    // Show instructions to the user
    const instructions = `
      Please complete your payment on PayPal and include the following information in the payment note:
      
      Item: ${itemName}
      Quantity: ${quantity} ticket(s)
      Total: €${totalAmount}
      Reference: ${customId}
      
      After payment, you'll be redirected back to our site to confirm your purchase.
    `;
    
    alert(instructions);

    // Set a timeout to check if the user returns
    setTimeout(() => {
      setIsProcessing(false);
      // Check if user has returned and verify payment
      checkPaymentStatus(customId);
    }, 30000); // 30 seconds timeout
  };

  const checkPaymentStatus = async (customId: string) => {
    try {
      // This would typically involve checking with PayPal's API
      // For now, we'll just log that we're checking
      console.log("Checking payment status for:", customId);
      
      // In a real implementation, you would:
      // 1. Call PayPal's API to check payment status
      // 2. Update the purchase record accordingly
      // 3. Notify the user of the status
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-secondary-foreground space-y-2">
        <p className="font-normal">Payment Details:</p>
        <ul className="text-xs space-y-1 ml-4">
          <li>• Item: {itemName}</li>
          <li>• Quantity: {quantity} ticket(s)</li>
          <li>• Total: €{totalAmount}</li>
          {buyerName && <li>• Name: {buyerName}</li>}
          {buyerEmail && <li>• Email: {buyerEmail}</li>}
        </ul>
        <p className="text-xs italic mt-3">
          After clicking {`"Pay with PayPal"`}, you&apos;ll be redirected to
          PayPal to complete your payment. Please include the reference information
          in your payment note.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          💡 <strong>Important:</strong> Include the reference code in your PayPal payment note
          so we can match your payment to your purchase.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing}
        className="font-sans w-full bg-background border border-primary hover:bg-neutral-200 disabled:bg-neutral-200 disabled:cursor-not-allowed text-foreground font-normal h-12 leading-none whitespace-nowrap px-6 rounded-xs transition-colors duration-200 flex items-center justify-center gap-2"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        aria-label={`Pay €${totalAmount} with PayPal`}
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <PayPalIcon width={20} height={20} />
            Pay with PayPal
          </>
        )}
      </button>

      {/* Reference Information Display */}
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Reference Code (include in PayPal note):
        </p>
        <div className="bg-white p-2 rounded border-2 border-dashed border-gray-300">
          <code className="text-xs text-gray-800 break-all">{customId}</code>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Copy this code and paste it in the PayPal payment note field.
        </p>
      </div>
    </div>
  );
}
