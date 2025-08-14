"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentSuccessProps {
  // Component props
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<"verifying" | "success" | "pending" | "error">("verifying");
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      verifyPayment(ref);
    } else {
      setPaymentStatus("error");
      setVerificationMessage("No payment reference found. Please contact support.");
    }
  }, [searchParams]);

  const verifyPayment = async (customId: string) => {
    try {
      setPaymentStatus("verifying");
      setVerificationMessage("Verifying your payment...");

      // Decode the custom ID to get purchase details
      const [itemId, itemName, quantity, buyerEmail, buyerName] = decodeURIComponent(customId).split("|");
      
      if (!itemId || !itemName || !buyerEmail || !buyerName) {
        throw new Error("Invalid payment reference");
      }

      setPurchaseDetails({
        itemId,
        itemName,
        quantity: parseInt(quantity),
        buyerEmail,
        buyerName,
        customId,
      });

      // Check if we have a purchase record for this payment
      const response = await fetch(`/api/purchases/verify?ref=${encodeURIComponent(customId)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.paymentStatus === "completed") {
          setPaymentStatus("success");
          setVerificationMessage("Payment verified successfully! Your tickets have been confirmed.");
        } else if (data.paymentStatus === "pending") {
          setPaymentStatus("pending");
          setVerificationMessage("Payment is being processed. This may take a few minutes. You'll receive a confirmation email once verified.");
        } else {
          setPaymentStatus("error");
          setVerificationMessage("Payment verification failed. Please contact support with your reference code.");
        }
      } else {
        // If no purchase record found, create one with pending status
        await createPendingPurchase(customId, itemId, itemName, quantity, buyerEmail, buyerName);
        setPaymentStatus("pending");
        setVerificationMessage("Payment received! We're verifying your payment. You'll receive a confirmation email once verified.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus("error");
      setVerificationMessage("Error verifying payment. Please contact support with your reference code.");
    }
  };

  const createPendingPurchase = async (
    customId: string,
    itemId: string,
    itemName: string,
    quantity: number,
    buyerEmail: string,
    buyerName: string
  ) => {
    try {
      const purchaseData = {
        buyerEmail,
        buyerName,
        raffleItemId: itemId,
        quantity,
        totalAmount: 0, // Will be updated when payment is verified
        paypalTransactionId: customId,
        paymentStatus: "pending",
        paymentMethod: "paypal_me",
        notes: `Payment received via PayPal.Me. Awaiting verification. Reference: ${customId}`,
      };

      await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });
    } catch (error) {
      console.error("Error creating pending purchase:", error);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return "✅";
      case "pending":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "🔄";
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "success":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">{getStatusIcon()}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment {paymentStatus === "success" ? "Successful" : paymentStatus === "pending" ? "Processing" : "Verification"}
          </h1>
          <p className={`text-lg font-medium ${getStatusColor()} mb-6`}>
            {verificationMessage}
          </p>
        </div>

        {purchaseDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Purchase Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">{purchaseDetails.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{purchaseDetails.quantity} ticket(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{purchaseDetails.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{purchaseDetails.buyerEmail}</span>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We'll verify your payment with PayPal</li>
              <li>• You'll receive a confirmation email</li>
              <li>• Your tickets will be confirmed</li>
              <li>• This process usually takes 5-15 minutes</li>
            </ul>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">🎉 Congratulations!</h3>
            <p className="text-sm text-green-800">
              Your payment has been verified and your tickets are confirmed. 
              You'll receive a confirmation email shortly.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block text-center"
          >
            Return to Raffle
          </Link>
          
          {paymentStatus === "pending" && (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Check Status Again
            </button>
          )}
        </div>

        {purchaseDetails?.customId && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Reference Code: <code className="bg-gray-100 px-2 py-1 rounded">{purchaseDetails.customId}</code>
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Keep this code for your records and customer support inquiries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}