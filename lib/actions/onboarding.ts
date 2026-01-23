'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // Import cookies

export async function setupBusiness(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const businessName = formData.get("businessName") as string;
  const phone = formData.get("phone") as string;
  const currency = formData.get("currency") as string || "$";

  if (!businessName) return { error: "Business Name is required" };

  const { error } = await supabase
    .from("business_settings")
    .upsert({
      user_id: user.id,
      business_name: businessName,
      phone: phone || "",
      currency: currency,
      contact_email: user.email,
      address: "",
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) return { error: error.message };

  // --- THE NUCLEAR FIX ---
  // Set a cookie that expires in 24 hours.
  // This tells the dashboard "I am onboarded" without needing to query the DB.
  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "true", { 
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
