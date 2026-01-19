import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// FORCE STABLE VERSION to prevent crashes
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
  typescript: true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId; // We attached this in checkout
      const subscriptionId = session.subscription as string;

      if (!userId || !subscriptionId) {
        throw new Error("Missing userId or subscriptionId in metadata");
      }

      console.log(`Processing subscription for User ${userId}`);

      // 1. Fetch Subscription Details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // 2. Upsert into Supabase
      const { error } = await supabase.from("subscriptions").upsert({
        id: subscription.id,
        user_id: userId,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        // Convert seconds to ISO strings
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

      if (error) throw error;
      console.log("Subscription saved to Supabase!");
    }

    return new NextResponse("Received", { status: 200 });
  } catch (error: any) {
    console.error("Webhook handler failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
