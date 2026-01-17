import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateStripeCustomer, stripe } from '@/lib/stripe/client';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId, successUrl, cancelUrl } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer for the user
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      // CRITICAL: This allows us to match the payment to the user in the webhook
      metadata: {
        userId: user.id,
      },
      client_reference_id: user.id,
      success_url: successUrl || `${request.nextUrl.origin}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
