"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function setupBusiness(formData: FormData) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // ... (Your existing DB insertion logic here) ...
  // e.g. await supabase.from('business_settings').upsert(...)

  // --- THE IMPORTANT PART ---
  // Set the cookie so the Dashboard lets us in immediately
  cookieStore.set("onboarding_complete", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/dashboard");
}
