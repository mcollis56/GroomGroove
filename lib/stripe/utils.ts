import { createClient } from '@/utils/supabase/server';

/**
 * Check if a user has an active subscription
 */
export async function isUserPro(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single();

  return subscription?.status === 'active' || subscription?.status === 'trialing';
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string) {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return subscription;
}

/**
 * Get the Stripe customer portal URL for a user to manage their subscription
 */
export async function getCustomerPortalUrl(userId: string, returnUrl: string) {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (!subscription?.stripe_customer_id) {
    throw new Error('User does not have a Stripe customer ID');
  }

  const { stripe } = await import('./client');
  
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: returnUrl,
  });

  return session.url;
}
