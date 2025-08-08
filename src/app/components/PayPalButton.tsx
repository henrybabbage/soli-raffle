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
  onSuccess?: (details: unknown) => void;
  onError?: (error: unknown) => void;
}

export default function PayPalButton({
  amount,
  itemName,
  itemId,
  quantity,
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
        style={{
          layout: "horizontal",
          color: "blue",
          shape: "rect",
          label: "pay",
          height: 40,
        }}
      />
    </div>
  );
}
