"use client";

import { createClient } from "@/lib/supabase/client";
import { type Provider } from "@supabase/supabase-js";
import { useState } from "react";

interface OAuthButtonsProps {
  redirectTo?: string;
}

const providers: { id: Provider; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
];

export default function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("OAuth sign-in error:", error.message);
      setLoadingProvider(null);
    }
    // No need to reset on success — page navigates away
  };

  return (
    <div className="flex flex-col gap-3">
      {providers.map(({ id, label }) => {
        const isLoading = loadingProvider === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleOAuthSignIn(id)}
            disabled={loadingProvider !== null}
            className="flex h-12 w-full items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label={`Sign in with ${id.charAt(0).toUpperCase() + id.slice(1)}`}
          >
            {isLoading ? "Redirecting..." : label}
          </button>
        );
      })}
    </div>
  );
}
