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

  // Create a reference for the payment
  const reference =
    `${itemName} - ${quantity}x tickets - ${buyerName || "Guest"} - ${buyerEmail || ""}`.slice(
      0,
      100
    );

  // PayPal.Me link with amount in EUR
  // The link format is: https://www.paypal.me/[username]/[amount][currency]
  const paypalMeUrl = `https://www.paypal.me/BiancaHeuser/${totalAmount}EUR`;

  const handlePayment = () => {
    setIsProcessing(true);
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
        reference,
        transactionId,
      };

      try {
        const existingIntents = JSON.parse(
          localStorage.getItem("paypalMePurchaseIntents") || "[]"
        );
        existingIntents.push(purchaseIntent);
        localStorage.setItem(
          "paypalMePurchaseIntents",
          JSON.stringify(existingIntents)
        );
      } catch (error) {
        console.error("Error storing purchase intent:", error);
      }

      try {
        const purchaseData = {
          buyerEmail: buyerEmail || "pending@email.com",
          buyerName: buyerName || "Pending Name",
          raffleItemId: itemId,
          quantity,
          totalAmount: Math.round(parseFloat(totalAmount) * 100),
          paypalTransactionId: transactionId,
          paymentStatus: "pending",
          notes: `PayPal.Me payment initiated. Reference: ${reference}. PayPal.Me URL: ${paypalMeUrl}`,
        };

        const payload = JSON.stringify(purchaseData);
        const blob = new Blob([payload], { type: "application/json" });

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

    window.location.assign(paypalMeUrl);

    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
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
          PayPal to complete your payment.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing}
        className="font-sans w-full bg-background border border-primary hover:bg-neutral-200 disabled:bg-neutral-200 disabled:cursor-not-allowed text-foreground font-normal py-3 px-6 rounded-xs transition-colors duration-200 flex items-center justify-center gap-2"
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
            <PayPalIcon />
            Pay with PayPal
          </>
        )}
      </button>
    </div>
  );
}
