import { buildPayPalMeUrl } from "@/utils/paypal-me";
import { PayPalIcon } from "./PayPalIcon";

interface PayPalMeButtonProps {
  amount: number;
  itemName: string;
  quantity: number;
  onPaymentInitiated?: () => void;
}

export default function PayPalMeButton({
  amount,
  itemName,
  quantity,
  onPaymentInitiated,
}: PayPalMeButtonProps) {
  const totalAmount = (amount * quantity).toFixed(2);
  const paypalMeUrl = buildPayPalMeUrl(totalAmount);
  const isPaymentConfigured = paypalMeUrl !== null;

  return (
    <div className="space-y-4">
      <div className="text-sm text-secondary-foreground space-y-2">
        <p className="font-normal">Payment Details:</p>
        <ul className="text-xs space-y-1 ml-4">
          <li>• Item: {itemName}</li>
          <li>• Quantity: {quantity} ticket(s)</li>
          <li>• Total: €{totalAmount}</li>
        </ul>
        <p className="text-xs italic mt-3">
          Select {`"Pay with PayPal"`} to continue securely to PayPal and
          complete payment.
        </p>
        {!isPaymentConfigured && (
          <p className="text-xs text-red-600 mt-2">
            PayPal payments are temporarily unavailable. Please try again
            later.
          </p>
        )}
      </div>

      <a
        href={paypalMeUrl ?? undefined}
        onClick={isPaymentConfigured ? onPaymentInitiated : undefined}
        aria-disabled={!isPaymentConfigured}
        className="font-sans w-full bg-background border border-primary hover:bg-neutral-200 aria-disabled:bg-neutral-200 aria-disabled:cursor-not-allowed text-foreground font-normal h-12 leading-none whitespace-nowrap px-6 rounded-xs transition-colors duration-200 flex items-center justify-center gap-2"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        aria-label={`Pay €${totalAmount} with PayPal`}
      >
        <PayPalIcon width={20} height={20} />
        Pay with PayPal
      </a>
    </div>
  );
}
