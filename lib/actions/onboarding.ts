'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function setupBusiness(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const businessName = formData.get("businessName") as string;
  const phone = formData.get("phone") as string;
  const currency = formData.get("currency") as string || "$";

  if (!businessName) {
    return { error: "Business Name is required" };
  }

  // Insert settings
  const { error } = await supabase
    .from("business_settings")
    .insert({
      user_id: user.id,
      business_name: businessName,
      phone: phone,
      currency: currency,
    });

  if (error) {
    console.error("Onboarding Error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
