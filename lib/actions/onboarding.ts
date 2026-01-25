"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function setupBusiness(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const businessName = formData.get("businessName") as string;
  if (!businessName?.trim()) {
    return { error: "Business name is required" };
  }

  // Insert/update business settings
  const { error: dbError } = await supabase
    .from("business_settings")
    .upsert({
      user_id: user.id,
      business_name: businessName.trim(),
      phone: (formData.get("phone") as string) || null,
      currency: (formData.get("currency") as string) || "$",
    }, { onConflict: "user_id" });

  if (dbError) {
    return { error: "Failed to save business settings. Please try again." };
  }

  // Set the cookie so the Dashboard lets us in immediately
  cookieStore.set("onboarding_complete", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/dashboard");
}
