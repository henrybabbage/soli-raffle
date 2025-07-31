# Soli Raffle

A Next.js 15 raffle website where users can purchase tickets for exclusive Qigong and personal training sessions with PayPal integration.

## Features

- **Responsive Design**: Clean, modern layout that works on all devices
- **Raffle Items**: Three different session offerings with detailed descriptions
- **Quantity Controls**: Users can select how many tickets to purchase
- **PayPal Integration**: Secure payments using PayPal's official React SDK
- **TypeScript**: Fully typed for better development experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PayPal Developer Account (for payment processing)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your PayPal Client ID from [PayPal Developer Dashboard](https://developer.paypal.com/)

```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the site

### PayPal Setup

1. Create a PayPal Developer account at https://developer.paypal.com/
2. Create a new app in your dashboard
3. Copy the Client ID to your `.env.local` file:
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PayPal React SDK** - Payment processing
- **React 19** - UI library

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── PayPalWrapper.tsx    # PayPal script provider
│   │   └── PayPalButton.tsx     # PayPal payment button
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main raffle page
│   └── globals.css              # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The site can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- Railway
- DigitalOcean App Platform

Remember to set your environment variables in your deployment platform.
