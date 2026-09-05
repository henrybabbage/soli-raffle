"use client";

import { useState } from "react";
import { buildPayPalMeUrl } from "@/utils/paypal-me";
import { PayPalIcon } from "./PayPalIcon";

interface PayPalMeButtonProps {
  amount: number;
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
  const paypalMeUrl = buildPayPalMeUrl(totalAmount);
  const isPaymentConfigured = paypalMeUrl !== null;

  const handlePayment = () => {
    if (!paypalMeUrl) {
      return;
    }

    setIsProcessing(true);

    // Payment must not depend on analytics-style intent tracking. `keepalive`
    // lets the small request continue while the browser starts the PayPal
    // navigation; failures are logged for operators without blocking buyers.
    void fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          buyerEmail,
          buyerName,
          raffleItemId: itemId,
          quantity,
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Purchase intent could not be recorded");
        }
      })
      .catch((error) => {
        console.error("Error recording purchase intent:", error);
      });

    onPaymentInitiated?.();
    window.location.assign(paypalMeUrl);
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
          After clicking {`"Pay with PayPal"`}, your ticket selection will be
          recorded and you&apos;ll be redirected to PayPal to complete payment.
        </p>
        {!isPaymentConfigured && (
          <p className="text-xs text-red-600 mt-2">
            PayPal payments are temporarily unavailable. Please try again
            later.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing || !isPaymentConfigured}
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Recording selection...
          </>
        ) : (
          <>
            <PayPalIcon width={20} height={20} />
            Pay with PayPal
          </>
        )}
      </button>
    </div>
  );
}
