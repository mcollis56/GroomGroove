import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// 1. Force Stable API Version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, 
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: any[]) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               );
             } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId, skipTrial } = body;

    // 2. HARDCODED URLS (To rule out Env Var issues)
    const success_url = "https://groom-groove.vercel.app/dashboard?payment=success";
    const cancel_url = "https://groom-groove.vercel.app/pricing?payment=cancelled";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { userId: user.id },
      client_reference_id: user.id,
      success_url: success_url,
      cancel_url: cancel_url,
    };

    if (!skipTrial) {
      sessionParams.subscription_data = {
        trial_period_days: 14,
      };
    }

    console.log("Creating session...");
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return new NextResponse("Internal Error: " + error.message, { status: 500 });
  }
}
