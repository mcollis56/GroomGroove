import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authClient = await createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(now.getDate() + 14);

    const { error } = await supabaseAdmin.from("subscriptions").insert({
      id: `trial_${user.id.slice(0, 8)}_${Date.now()}`,
      user_id: user.id,
      status: "trialing",
      price_id: "price_1SpjQlGzqO94XgciE9C3FJsE",
      quantity: 1,
      cancel_at_period_end: false,
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ url: "/dashboard" });
  } catch (error: any) {
    return new NextResponse("Internal Error: " + error.message, { status: 500 });
  }
}
