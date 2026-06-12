import OnboardingWizard from "@/components/features/profile/OnboardingWizard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let user;
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    user = authData.user;
  } catch {
    // If Supabase is unavailable, render the page anyway — the client component will handle errors
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  // If profile already has a goal, onboarding is complete — redirect to dashboard
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("goal")
      .eq("user_id", user.id)
      .single();

    if (profile?.goal) {
      redirect("/workout");
    }
  } catch {
    // Profile fetch failed — render onboarding anyway, user can retry
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <OnboardingWizard />
      </div>
    </div>
  );
}
