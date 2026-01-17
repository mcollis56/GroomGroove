import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Create a mock Stripe client for development when key is missing
const createStripeClient = () => {
  if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is not set. Using mock Stripe client.');
    // Return a mock client that throws informative errors
    return {
      customers: {
        create: () => Promise.reject(new Error('STRIPE_SECRET_KEY is not set')),
      },
      checkout: {
        sessions: {
          create: () => Promise.reject(new Error('STRIPE_SECRET_KEY is not set')),
        },
      },
      subscriptions: {
        retrieve: () => Promise.reject(new Error('STRIPE_SECRET_KEY is not set')),
      },
      webhooks: {
        constructEvent: () => { throw new Error('STRIPE_WEBHOOK_SECRET is not set'); },
      },
      billingPortal: {
        sessions: {
          create: () => Promise.reject(new Error('STRIPE_SECRET_KEY is not set')),
        },
      },
    } as any;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia' as const as any,
    typescript: true,
  });
};

export const stripe = createStripeClient();

// Helper to get or create Stripe customer for a user
export async function getOrCreateStripeCustomer(userId: string, email?: string) {
  const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();
  
  // Check if user already has a Stripe customer ID in the database
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (existingSubscription?.stripe_customer_id) {
    return existingSubscription.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Store the Stripe customer ID in the database
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  return customer.id;
}
