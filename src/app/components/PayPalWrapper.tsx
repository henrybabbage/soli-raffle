'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface PayPalWrapperProps {
  children: ReactNode;
}

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
  currency: 'EUR',
  intent: 'capture',
};

export default function PayPalWrapper({ children }: PayPalWrapperProps) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}