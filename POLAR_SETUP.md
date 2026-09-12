# Polar Checkout Integration Setup

## Overview
Polar checkout is now integrated into your TanStack Start app. The integration includes:

- **Server functions** (`src/lib/polar.server.ts`) - Handles Polar API requests
- **Checkout API endpoint** (`src/routes/api/public/checkout.ts`) - Server-side checkout creation
- **Checkout hook** (`src/hooks/useCheckout.tsx`) - Client-side checkout triggering
- **Pricing page** (`src/routes/pricing.tsx`) - Updated with checkout buttons

## Configuration

### 1. Add Product IDs to `.env`
You need to configure your Polar product IDs in the `.env` file:

```env
VITE_POLAR_PRODUCT_MONTHLY="prod_xxxxx"      # Your monthly plan product ID
VITE_POLAR_PRODUCT_YEARLY="prod_xxxxx"       # Your yearly plan product ID
VITE_POLAR_PRODUCT_LIFETIME="prod_xxxxx"     # Your lifetime plan product ID
```

### 2. Update Success URL (Optional)
If you want to customize the success URL:

```env
POLAR_SUCCESS_URL=https://yourdomain.com/success?checkout_id={CHECKOUT_ID}
```

The `{CHECKOUT_ID}` placeholder will be replaced with the actual checkout ID.

## Getting Product IDs from Polar

1. Log in to your Polar dashboard
2. Navigate to Products
3. For each plan (monthly, yearly, lifetime), copy the Product ID
4. Paste them into the corresponding environment variables

## How It Works

### User Flow
1. User clicks "Checkout" button on pricing page for their desired plan
2. `useCheckout()` hook calls the server function
3. Server function creates a checkout session with Polar API
4. User is redirected to Polar's hosted checkout
5. After payment, user is redirected to your success URL

### Code Flow
```
Pricing Page
    ↓
useCheckout() hook
    ↓
createCheckout() server function
    ↓
Polar API (createCheckoutSession)
    ↓
Polar hosted checkout
    ↓
Success URL
```

## Testing

### Local Development
1. Ensure all environment variables are set in `.env`
2. Run your app: `npm run dev`
3. Navigate to `/pricing`
4. Click a "Checkout" button
5. You'll be redirected to Polar's test checkout flow

### Test Mode
Polar provides test cards for development:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## API Reference

### `createCheckout` (Server Function)
```typescript
createCheckout(productId: string, successUrl?: string)
```
- **productId**: Polar product ID
- **successUrl**: Optional override for success URL
- **Returns**: Object with `checkoutUrl` and `checkoutId`

### `useCheckout` (React Hook)
```typescript
const { handleCheckout, isLoading } = useCheckout();
handleCheckout(productId, successUrl);
```
- **handleCheckout**: Function to initiate checkout
- **isLoading**: Loading state while creating checkout

## Webhook Integration (Optional)

To sync Polar events with your database, implement webhooks:

1. Create a webhook endpoint in your API routes
2. Configure webhook URL in Polar dashboard
3. Verify webhook signatures using Polar's SDK

Example webhook handler:
```typescript
// src/routes/api/public/polar-webhook.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-polar-signature');
  // Verify and process webhook...
}
```

## Troubleshooting

### "No checkout URL received"
- Verify `VITE_POLAR_PRODUCT_*` environment variables are set
- Check Polar API access token is valid
- Ensure product IDs exist in your Polar account

### "POLAR_ACCESS_TOKEN is not set"
- Add `POLAR_ACCESS_TOKEN` to `.env`
- Restart your dev server

### Checkout redirects to error page
- Check browser console for error messages
- Verify success URL is configured correctly
- Ensure Polar account is in good standing

## Additional Resources

- [Polar Docs](https://docs.polar.sh)
- [Polar API Reference](https://api.polar.sh/swagger)
- [TanStack Start Documentation](https://tanstack.com/router/latest)
