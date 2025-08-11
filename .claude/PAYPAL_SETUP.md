# PayPal Business Account Integration

## Configuration Summary

The PayPal business account has been successfully integrated with the following credentials:

### Business Account Details
- **Business Email**: seedsofliberationraffle@proton.me
- **Client ID**: ZPAXXQHPYQN2Q

### Environment Variables
The following environment variables have been configured in `.env.local`:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ZPAXXQHPYQN2Q
NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL=seedsofliberationraffle@proton.me
```

### Implementation Details

#### PayPal Wrapper Configuration (`src/app/components/PayPalWrapper.tsx`)
- Client ID loaded from environment variable
- Currency set to EUR
- Intent set to 'capture' for immediate payment processing
- Additional funding options enabled (PayLater, Venmo)
- Card payments disabled for business account optimization

#### PayPal Button Configuration (`src/app/components/PayPalButton.tsx`)
- Business email configured as payee for all transactions
- Automatic order creation with proper currency and amount formatting
- Error handling and success callbacks implemented
- Responsive button styling

### Features
- ✅ Secure payment processing
- ✅ Business account integration
- ✅ EUR currency support
- ✅ Multiple payment methods (PayPal, PayLater, Venmo)
- ✅ Automatic order capture
- ✅ Error handling
- ✅ Success/failure callbacks

### Testing
The development server is running at http://localhost:3000
You can test the PayPal integration by:
1. Selecting a raffle item
2. Choosing quantity
3. Clicking "Buy Ticket"
4. Completing the PayPal payment flow

### Production Deployment
When deploying to production, ensure the environment variables are set in your hosting platform:
- Vercel: Add environment variables in project settings
- Netlify: Add environment variables in site settings
- Other platforms: Follow their respective environment variable configuration

### Security Notes
- Client ID is public and safe to expose in frontend code
- Business email is used for transaction routing
- All sensitive operations are handled by PayPal's secure servers