import SettingsForm from "@/components/features/profile/SettingsForm";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let user;
  let profile;
  let fetchError = false;
  let supabase;

  try {
    supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    user = authData.user;
  } catch {
    console.error("Auth check failed in profile page");
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  try {
    const { data } = await supabase!
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      profile = {
        id: data.id,
        userId: data.user_id,
        weightKg: data.weight_kg,
        goal: data.goal,
        caloricTarget: data.caloric_target,
        proteinTarget: data.protein_target,
        equipment: data.equipment ?? [],
        preferredSplit: data.preferred_split,
        sessionDuration: data.session_duration,
        trainingDays: data.training_days,
        preferredIngredients: data.preferred_ingredients ?? [],
        excludedIngredients: data.excluded_ingredients ?? [],
        cuisineStyle: data.cuisine_style ?? "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch {
    fetchError = true;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col px-5 py-6">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-6 font-heading text-heading-md text-on-surface">
          Settings
        </h1>

        {fetchError && (
          <div className="mb-6 rounded-card border border-error/30 bg-error/10 p-4 text-center">
            <p className="text-body-sm text-error" role="alert">
              Couldn't load your profile. Please try again.
            </p>
          </div>
        )}

        {!fetchError && !profile && (
          <div className="rounded-card bg-surface-container-low border border-glass-border p-8 text-center">
            <p className="text-body-md text-muted-foreground">
              No profile data found.
            </p>
          </div>
        )}

        {profile && <SettingsForm profile={profile} />}

        <div className="mt-8">
          <form
            action={async () => {
              "use server";
              const sb = await createClient();
              await sb.auth.signOut();
              redirect("/login");
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-glass-border bg-surface-container px-4 py-3 text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
