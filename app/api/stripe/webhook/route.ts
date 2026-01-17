cat <<EOF > app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client (Service Role)
// We need this to bypass RLS and update subscription status
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(\`Webhook Signature Error: \${error.message}\`);
    return new NextResponse(\`Webhook Error: \${error.message}\`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    if (event.type === "checkout.session.completed") {
      const userId = session.metadata?.userId || session.client_reference_id;
      const subId = session.subscription as string;

      if (!userId) {
        return new NextResponse("Error: No userId in metadata", { status: 400 });
      }

      console.log(\`Payment success for user \${userId}\`);

      // Update Supabase
      // 1. Try updating 'subscriptions' table if it exists
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: userId,
          stripe_subscription_id: subId,
          stripe_customer_id: session.customer,
          status: "active",
          plan_id: "pro_monthly",
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Subscription table update failed:", error);
      }
      
      // 2. ALWAYS update user metadata as a reliable fallback
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { is_pro: true, stripe_sub_id: subId }
      });
    }
  } catch (err: any) {
    console.error("Webhook Logic Error:", err);
    return new NextResponse("Server Error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
EOF
