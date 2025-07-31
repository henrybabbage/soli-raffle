'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions } from '@paypal/paypal-js';

interface PayPalButtonProps {
  amount: string;
  itemName: string;
  quantity: number;
  onSuccess?: (details: unknown) => void;
  onError?: (error: unknown) => void;
}

export default function PayPalButton({ 
  amount, 
  itemName, 
  quantity,
  onSuccess,
  onError 
}: PayPalButtonProps) {
  const createOrder = async (data: CreateOrderData, actions: CreateOrderActions) => {
    const totalAmount = (parseFloat(amount) * quantity).toFixed(2);
    
    return actions.order.create({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: totalAmount,
          },
          description: `${quantity}x ${itemName}`,
        },
      ],
    });
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    
    try {
      const details = await actions.order.capture();
      console.log('Payment completed:', details);
      onSuccess?.(details);
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error);
    }
  };

  const onErrorHandler = (error: unknown) => {
    console.error('PayPal error:', error);
    onError?.(error);
  };

  return (
    <div className="paypal-button-container">
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        style={{
          layout: 'horizontal',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
          height: 40,
        }}
      />
    </div>
  );
}