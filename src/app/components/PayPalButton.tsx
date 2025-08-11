"use client";

import {
  CreateOrderActions,
  CreateOrderData,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  itemName: string;
  itemId?: string;
  quantity: number;
  buyerEmail?: string;
  buyerName?: string;
  onSuccess?: (details: unknown) => void;
  onError?: (error: unknown) => void;
}

export default function PayPalButton({
  amount,
  itemName,
  itemId,
  quantity,
  buyerEmail,
  buyerName,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const createOrder = async (
    data: CreateOrderData,
    actions: CreateOrderActions
  ) => {
    const totalAmount = (parseFloat(amount) * quantity).toFixed(2);

    return actions.order.create({
      intent: "CAPTURE",
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
      purchase_units: [
        {
          custom_id: itemId ? `raffle:${itemId}` : `raffle:${itemName}`,
          invoice_id: itemId
            ? `raffle-${itemId}-${Date.now()}`
            : `raffle-generic-${Date.now()}`,
          amount: {
            currency_code: "EUR",
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: totalAmount,
              },
            },
          },
          description: `${quantity}x ${itemName}`,
          items: [
            {
              name: itemName,
              sku: itemId ?? itemName,
              unit_amount: {
                currency_code: "EUR",
                value: parseFloat(amount).toFixed(2),
              },
              quantity: quantity.toString(),
              category: "DIGITAL_GOODS",
            },
          ],
          payee: {
            email_address:
              process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL ||
              "seedsofliberationraffle@proton.me",
          },
        },
      ],
    });
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;

    try {
      const details = await actions.order.capture();
      console.log("Payment completed:", details);
      
      // Create purchase record in Sanity if we have the required information
      if (itemId && buyerEmail && buyerName) {
        try {
          const totalAmount = parseFloat(amount) * quantity * 100; // Convert to cents
          const purchaseData = {
            buyerEmail,
            buyerName,
            raffleItemId: itemId,
            quantity,
            totalAmount: Math.round(totalAmount),
            paypalTransactionId: details.id,
            paymentStatus: 'completed',
            notes: `PayPal Order ID: ${data.orderID}`,
          };

          const response = await fetch('/api/purchases', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData),
          });

          if (!response.ok) {
            console.error('Failed to create purchase record:', response.statusText);
          } else {
            console.log('Purchase record created successfully');
          }
        } catch (error) {
          console.error('Error creating purchase record:', error);
        }
      }
      
      onSuccess?.(details);
    } catch (error) {
      console.error("Payment error:", error);
      onError?.(error);
    }
  };

  const onErrorHandler = (error: unknown) => {
    console.error("PayPal error:", error);
    onError?.(error);
  };

  return (
    <div className="paypal-button-container">
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        forceReRender={[amount, itemName, itemId, quantity]}
        style={{
          layout: "horizontal",
          color: "white",
          shape: "rect",
          label: "pay",
          height: 40,
        }}
      />
    </div>
  );
}
