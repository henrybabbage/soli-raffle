# PayPal.Me Payment Integration

## Overview

This raffle application has been refactored to use PayPal.Me payment links instead of the PayPal SDK integration. This provides a simpler, more straightforward payment process using a personal PayPal account.

## Implementation Details

### PayPal.Me Account
- **Account URL**: https://www.paypal.me/BiancaHeuser
- **Payment Method**: Direct PayPal.Me links with pre-filled amounts

### Key Changes

1. **New Component**: `PayPalMeButton.tsx`
   - Replaces the complex PayPal SDK button with a simple link-based approach
   - Generates PayPal.Me URLs with the correct amount in EUR
   - Tracks purchase intent in localStorage for record-keeping
   - Opens PayPal payment in a new tab

2. **Removed Dependencies**:
   - Removed `@paypal/react-paypal-js` from active use (kept in package.json for potential future use)
   - Removed `PayPalWrapper` from the layout

3. **Updated Components**:
   - `page.tsx`: Now uses `PayPalMeButton` instead of `PayPalButton`
   - `layout.tsx`: Removed PayPalWrapper integration

### How It Works

1. **User Flow**:
   - User selects quantity of raffle tickets
   - Enters their name and email
   - Clicks "Pay with PayPal" button
   - Purchase record is automatically created in Sanity with "pending" status
   - Gets redirected to PayPal.Me link with the correct amount
   - Completes payment on PayPal's website
   - User should include their name and email in the PayPal notes

2. **Payment Tracking**:
   - Purchase record is automatically created in Sanity CMS with:
     - Buyer information (name and email)
     - Raffle item reference
     - Quantity and total amount
     - Unique transaction ID (format: `PPLME_timestamp_random`)
     - "Pending" payment status
     - Notes with PayPal.Me URL and reference
   - Purchase intent is also stored in browser's localStorage for backup
   - Can be reconciled with actual PayPal transactions

3. **Amount Calculation**:
   - €5 per raffle ticket
   - Total amount = 5 * quantity
   - Amount is included in the PayPal.Me URL

### Benefits of This Approach

1. **Simplicity**: No complex SDK integration or API keys needed
2. **Personal Account**: Works with personal PayPal accounts
3. **No Merchant Account Required**: Bypasses business account requirements
4. **Direct Payment**: Users pay directly through PayPal's interface
5. **Mobile Friendly**: Works seamlessly on all devices

### Important Notes

- **Automatic Recording**: Purchase intents are automatically recorded in Sanity
- **Manual Reconciliation**: Actual payments need to be manually verified in PayPal
- **Status Updates**: Payment status can be updated in Sanity Studio from "pending" to "completed"
- **User Instructions**: Users should include their details in PayPal notes for verification
- **Dual Storage**: Purchase data is stored both in Sanity and browser localStorage

### Testing the Implementation

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Select a raffle item and quantity

4. Enter name and email

5. Click "Pay with PayPal"

6. Verify that you're redirected to the correct PayPal.Me URL with the right amount

### Future Considerations

The original PayPal SDK integration code is preserved and can be reactivated if needed:
- `PayPalButton.tsx` - Original SDK-based button
- `PayPalWrapper.tsx` - SDK provider wrapper
- Environment variables for SDK are still in `.env.local`

To switch back to SDK integration:
1. Update imports in `page.tsx` to use `PayPalButton`
2. Re-add `PayPalWrapper` to `layout.tsx`
3. Ensure PayPal SDK credentials are configured

### Purchase Intent Storage

Purchase intents are stored in localStorage under the key `paypalMePurchaseIntents` as a JSON array:

```javascript
{
  itemId: string,
  itemName: string,
  quantity: number,
  totalAmount: string,
  buyerEmail: string,
  buyerName: string,
  timestamp: string,
  reference: string
}
```

This data can be accessed via browser console:
```javascript
JSON.parse(localStorage.getItem('paypalMePurchaseIntents'))
```

### Admin Dashboard

Access the purchase records dashboard at `/admin/purchases` to:
- View all purchase records
- Filter by payment status (pending, completed, failed, refunded)
- See total and pending revenue
- Track transaction IDs for reconciliation
- View detailed purchase information

### Sanity Studio Integration

Purchases can also be managed directly in Sanity Studio:
1. Access Sanity Studio at `/studio` or http://localhost:3333/studio
2. Navigate to the "Purchase" section
3. Update payment status after verifying PayPal transactions
4. Add notes for customer service

## Support

For any issues or questions about the payment implementation, please refer to:
- PayPal.Me documentation: https://www.paypal.com/paypalme/
- Sanity Studio: Access at `/studio` for content management
- Admin Dashboard: Access at `/admin/purchases` for purchase tracking
- Contact: lilith.spink@proton.me
