# Stripe Integration Setup for GroomGroove

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Keys (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_...

# Existing Supabase variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Stripe Dashboard Setup

1. **Create Products and Prices:**
   - Go to Stripe Dashboard → Products
   - Create a product for your SaaS subscription (e.g., "GroomGroove Pro")
   - Add pricing (monthly/annual)

2. **Configure Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the "Signing secret"

3. **Test Mode:**
   - Use test keys (`sk_test_...`, `pk_test_...`) for development
   - Use Stripe's test cards (e.g., `4242 4242 4242 4242`)

## Database Migration

Run the SQL migration to create the `user_subscriptions` table:

```sql
-- The migration file is at: supabase/migrations/006_user_subscriptions.sql
-- Run this in your Supabase SQL Editor
```

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/stripe/checkout`

Request body:
```json
{
  "priceId": "price_...",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/pricing"
}
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

### 2. Webhook Endpoint
**POST** `/api/stripe/webhook`
- Handles Stripe events and updates user subscriptions
- Requires `STRIPE_WEBHOOK_SECRET` for signature verification

## Client-Side Integration

### Starting a Checkout Session
```typescript
async function startCheckout(priceId: string) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });
  
  const { url } = await response.json();
  window.location.href = url;
}
```

### Checking Subscription Status
```typescript
import { isUserPro } from '@/lib/stripe/utils';

const isPro = await isUserPro(userId);
```

### Customer Portal
```typescript
import { getCustomerPortalUrl } from '@/lib/stripe/utils';

const portalUrl = await getCustomerPortalUrl(userId, 'https://yourdomain.com/account');
window.location.href = portalUrl;
```

## Testing

1. **Local Testing:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - This provides a webhook signing secret for local development

2. **Test Cards:**
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Decline: `4000 0000 0000 0002`

## Security Notes

1. **Never expose secret keys in client-side code**
2. **Always verify webhook signatures**
3. **Use Row Level Security (RLS) in Supabase**
4. **Validate user authentication in API endpoints**
5. **Log webhook events for debugging**

## Troubleshooting

- **Webhook errors:** Check Stripe Dashboard → Developers → Webhooks for event logs
- **Database issues:** Verify RLS policies allow service role operations
- **Type errors:** Ensure Stripe SDK types are installed (`@types/stripe`)
- **Build errors:** Check environment variables are set correctly
