import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("goal")
    .eq("user_id", user.id)
    .single();

  if (!profile?.goal) {
    // No goal set → onboarding not completed
    redirect("/profile/onboarding");
  }

  // Authenticated + onboarded → dashboard
  redirect("/workout");
}