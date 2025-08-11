# Sanity CMS Setup for Soli Raffle

This document outlines the setup and configuration of Sanity CMS for the Soli Raffle website.

## Overview

The raffle website has been integrated with Sanity CMS to allow editors to:
- Manage raffle items (add, edit, remove)
- Track purchases and transactions
- Make the website reusable for future raffles

## Sanity Configuration

- **Project ID**: `aibflqfk`
- **Dataset**: `production`
- **Organization ID**: `oBR3015Sk`

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=aibflqfk
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token_here
```

### 2. Get Sanity API Token

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project (`aibflqfk`)
3. Go to API section
4. Create a new token with read/write permissions
5. Copy the token to your `.env.local` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migration Script

To migrate existing raffle items data to Sanity:

```bash
npm run migrate
```

**Note**: Before running the migration, you'll need to:
1. Upload the raffle item images to Sanity
2. Update the migration script with the correct image asset references

### 5. Start Sanity Studio

```bash
npm run studio
```

This will start the Sanity Studio at `http://localhost:3333/studio`

### 6. Start Development Server

```bash
npm run dev
```

## Schema Structure

### Raffle Item Schema

- **title**: Item title
- **description**: Short description
- **instructor**: Instructor name and details
- **details**: Full description
- **value**: Item value (e.g., "100€")
- **contact**: Array of contact links
- **image**: Item image
- **isActive**: Whether the item is currently active
- **order**: Display order on the website
- **slug**: URL-friendly identifier

### Purchase Schema

- **buyerEmail**: Customer email address
- **buyerName**: Customer name
- **raffleItem**: Reference to the raffle item
- **quantity**: Number of tickets purchased
- **totalAmount**: Total amount paid
- **paypalTransactionId**: PayPal transaction identifier
- **paymentStatus**: Payment status (pending/completed/failed/refunded)
- **purchaseDate**: Date of purchase
- **notes**: Additional notes

## API Endpoints

### GET /api/raffle-items
Fetches all active raffle items from Sanity.

### GET /api/purchases
Fetches all purchase records (admin only).

### POST /api/purchases
Creates a new purchase record when payment is completed.

## Frontend Integration

The frontend now uses the `useRaffleItems` hook to fetch data from Sanity instead of hardcoded data. The component automatically:

- Shows loading states while fetching data
- Displays error messages if data fetching fails
- Renders raffle items dynamically from the CMS

## Making Changes

### Adding New Raffle Items

1. Go to Sanity Studio (`/studio`)
2. Navigate to "Raffle Item" section
3. Click "Create new"
4. Fill in all required fields
5. Upload an image
6. Set the order for display
7. Publish the item

### Editing Existing Items

1. Find the item in Sanity Studio
2. Make your changes
3. Publish the updated version

### Managing Purchases

1. Go to "Purchase" section in Sanity Studio
2. View all purchase records
3. Update payment statuses as needed
4. Add notes for customer service

## Future Raffles

To make this website reusable for future raffles:

1. **Deactivate old items**: Set `isActive` to false for completed raffles
2. **Add new items**: Create new raffle items with new images and details
3. **Reset purchase tracking**: Archive old purchases or create new datasets
4. **Update branding**: Modify the website title and description as needed

## Troubleshooting

### Common Issues

1. **Images not loading**: Ensure images are uploaded to Sanity and the asset references are correct
2. **API errors**: Check your Sanity API token and project configuration
3. **Studio not loading**: Verify the studio route is correctly configured

### Getting Help

- Check Sanity documentation: [sanity.io/docs](https://sanity.io/docs)
- Review the Sanity Studio logs for errors
- Verify your project configuration in `sanity.config.ts`

## Security Notes

- Keep your Sanity API token secure
- Use environment variables for sensitive configuration
- Consider implementing authentication for admin routes if needed
- Regularly review and rotate API tokens