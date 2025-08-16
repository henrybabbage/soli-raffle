# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A Next.js 15 raffle website with PayPal.Me integration and Sanity CMS for content management. Users can purchase raffle tickets for exclusive Qigong and personal training sessions.

## Quick Start Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Start Sanity Studio (CMS interface)
npm run studio

# Run both development server and Sanity Studio
npm run dev & npm run studio
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- src/app/__tests__/page.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="PayPal"
```

### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Data Management
```bash
# Migrate existing data to Sanity (one-time setup)
npm run migrate
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, styled-components
- **CMS**: Sanity v4 (Project ID: `aibflqfk`, Dataset: `production`)
- **Payments**: PayPal.Me integration (simplified from SDK)
- **Testing**: Jest with React Testing Library
- **TypeScript**: Strict mode enabled

### Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── purchases/        # Purchase tracking
│   │   └── raffle-items/     # Raffle items from Sanity
│   ├── components/           # React components
│   │   ├── PayPalMeButton    # Current payment implementation
│   │   ├── PayPalButton      # Legacy SDK implementation (preserved)
│   │   └── RaffleGrid        # Main raffle display
│   └── __tests__/            # Component tests
├── sanity/                   # Sanity CMS configuration
│   ├── lib/                  # Sanity utilities
│   │   ├── client.ts         # Sanity client setup
│   │   └── queries.ts        # GROQ queries (centralized)
│   └── schemas/              # Content schemas
│       ├── raffleItem.ts     # Raffle item structure
│       └── purchase.ts       # Purchase tracking
└── utils/                    # Shared utilities
```

### Key Integration Points

#### Payment Flow (PayPal.Me)
1. User selects tickets and enters details in `RaffleGrid` component
2. `PayPalMeButton` generates payment link with amount
3. Purchase record created in Sanity with "pending" status
4. User redirected to PayPal.Me for payment
5. Transaction verification via PayPal account
6. Purchase records accessible in Sanity Studio for reference

#### Data Flow
1. **Frontend → Sanity**: API routes in `app/api/` handle CRUD operations
2. **Sanity → Frontend**: GROQ queries in `sanity/lib/queries.ts` fetch data
3. **Local Storage**: Purchase intents backed up in browser

## Environment Configuration

Required environment variables (create `.env.local` from `.env.local.example`):

```bash
# Sanity CMS (Required)
NEXT_PUBLIC_SANITY_PROJECT_ID=aibflqfk
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=<get-from-sanity-dashboard>

# API Security (Required)
# Generate with: openssl rand -hex 32
API_SECRET_KEY=<your-secure-random-string>

# PayPal (Optional - for SDK fallback)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<if-using-sdk>
NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL=<business-email>
```

## Sanity CMS Access

### Studio URLs
- **Development**: http://localhost:3333/studio
- **Production**: /studio route on deployed site

### Content Types
- **raffleItem**: Raffle offerings (title, description, instructor, value, image)
- **purchase**: Transaction records (buyer info, payment status, amount)

### Key Queries
All GROQ queries are in `src/sanity/lib/queries.ts`:
- `raffleItemsQuery`: Active items for display
- `purchasesQuery`: All purchases for admin
- `purchaseStatsQuery`: Revenue and statistics

## Payment System

### Current Implementation: PayPal.Me
- Simple link-based payments via `PayPalMeButton` component
- URL: https://www.paypal.me/BiancaHeuser
- Automatic purchase tracking in Sanity
- Manual payment verification required

### Legacy SDK Implementation
Preserved in codebase but not active:
- `PayPalButton.tsx` - SDK integration
- `PayPalWrapper.tsx` - Provider setup
- Can be reactivated by updating imports in `page.tsx`

## Admin Features

### Sanity Studio
- Full content management
- Purchase record updates
- Raffle item management
- Image asset handling

## Security Features

### API Endpoint Protection
- **GET /api/purchases**: Protected with API_SECRET_KEY authentication
- **POST /api/purchases**: Server-side validation for all purchase data
  - Email format validation
  - Quantity limits (1-100 tickets)
  - Amount validation (€5 per ticket)
  - Payment status validation

### Vercel BotID Integration
- Configured in `next.config.ts` using `withBotId`
- Provides bot protection and DDoS mitigation
- Active in production environment only

### Testing Security
```bash
# Test API security (requires dev server running)
npm run test:secure-api

# Test purchase flow
npm run test:purchase
```

### Accessing Protected Endpoints
To access the purchases API programmatically:
```javascript
fetch('/api/purchases', {
  headers: {
    'Authorization': `Bearer ${API_SECRET_KEY}`
  }
})
```

## Testing Strategy

### Test Coverage Requirements
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Test Files Location
- Component tests: `src/app/__tests__/`
- Component-specific tests: `src/app/components/__tests__/`

### Key Test Scenarios
- PayPal.Me button URL generation
- Purchase record creation
- Environment variable validation
- Component rendering and interactions

## Common Development Tasks

### Adding New Raffle Items
1. Access Sanity Studio at `/studio`
2. Navigate to "Raffle Item" section
3. Create new item with all fields
4. Upload image asset
5. Set `isActive: true` and appropriate `order`
6. Publish changes

### Updating Payment Status
1. Verify transaction in PayPal account
2. Go to Sanity Studio at `/studio`
3. Navigate to Purchase records
4. Find purchase by transaction ID or buyer email
5. Update status from "pending" to "completed" if needed
6. Add verification notes

### Modifying Queries
1. Edit queries in `src/sanity/lib/queries.ts`
2. Use GROQ syntax with `groq` template literal
3. Test in Sanity Vision tool at `/studio/vision`
4. Update TypeScript types if structure changes

### Switching Payment Methods
To revert to PayPal SDK:
1. Update `src/app/page.tsx` imports
2. Change `PayPalMeButton` to `PayPalButton`
3. Add `PayPalWrapper` to `layout.tsx`
4. Ensure SDK environment variables are set

## Performance Considerations

- **Images**: Served from Sanity CDN (cdn.sanity.io)
- **Queries**: Use projections to limit returned fields
- **Caching**: Next.js automatic caching for API routes
- **Bundle**: Turbopack for faster development builds

## Deployment Notes

### Required for Production
1. Set all environment variables in hosting platform
2. Configure Sanity CORS settings for production domain
3. Update PayPal.Me account if different from development
4. Set up monitoring for purchase tracking

### Platform Compatibility
- Vercel (recommended - zero config)
- Any Node.js 18+ hosting platform
- Static export not supported (requires API routes)

## Troubleshooting

### Common Issues
- **Sanity connection errors**: Check API token and project ID
- **Images not loading**: Verify Sanity CDN access
- **Payments not tracking**: Check browser console for localStorage errors
- **Studio not loading**: Ensure port 3333 is available

### Debug Commands
```bash
# Check Sanity configuration
npx sanity debug

# Test API routes
curl http://localhost:3000/api/raffle-items

# View purchase intents in browser console
JSON.parse(localStorage.getItem('paypalMePurchaseIntents'))
```

## Related Documentation

- Detailed setup: `.claude/SANITY_SETUP.md`
- Payment implementation: `.claude/PAYPAL_ME_IMPLEMENTATION.md`
- Query documentation: `.claude/QUERIES_DOCUMENTATION.md`
- Testing report: `.claude/PAYPAL_TESTING_REPORT.md`
