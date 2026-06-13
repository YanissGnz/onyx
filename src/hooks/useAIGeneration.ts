/**
 * useAIGeneration — Custom hook for AI plan generation.
 *
 * Provides:
 * - `generate(planType, vibeText)` — calls POST /api/ai/generate with validated input
 * - State: `isGenerating`, `plan`, `error`
 * - Cancel support via AbortController
 * - Error mapping (rate limit → toast, auth → redirect, etc.)
 *
 * @see Story 3.2 (_bmad-output/implementation-artifacts/3-2-vibe-drawer.md)
 * @see API route (src/app/api/ai/generate/route.ts)
 */

"use client";

import type { GeminiApiResponse, GeminiResponse } from "@/types/ai";
import { useCallback, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Generation request payload. */
export interface GenerateRequest {
  type: "workout_plan" | "meal_plan" | "regenerate_day";
  user_id: string;
  preferences: Record<string, unknown>;
  custom_prompt?: string;
  day_index?: number;
}

/** Generation result state. */
export interface GenerationResult {
  plan: GeminiResponse | null;
  error: GenerationError | null;
}

/** Typed generation error. */
export interface GenerationError {
  code: "UNAUTHORIZED" | "RATE_LIMITED" | "API_ERROR" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of retries for failed generation attempts. */
const MAX_RETRIES = 1;

/** Timeout for API requests (milliseconds). */
const API_TIMEOUT = 60_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps an API error response to a typed GenerationError.
 */
function mapError(data: GeminiApiResponse): GenerationError {
  if (data.error) {
    return {
      code: data.error.code as GenerationError["code"],
      message: data.error.message,
    };
  }
  return { code: "UNKNOWN", message: "An unknown error occurred." };
}

/**
 * Fetches the current user from the Supabase auth state.
 * Returns the user_id string or null if not authenticated.
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    // Dynamically import to avoid SSR issues
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// useAIGeneration hook
// ---------------------------------------------------------------------------

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<GenerationError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Generate a plan by calling the AI API.
   *
   * @param planType - Type of plan to generate
   * @param vibeText - User's natural language input
   * @param preferences - Optional user preferences
   * @param dayIndex - Optional day index for regenerate_day
   */
  const generate = useCallback(
    async (
      planType: GenerateRequest["type"],
      vibeText: string,
      preferences: Record<string, unknown> = {},
      dayIndex?: number,
    ): Promise<GenerationResult> => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsGenerating(true);
      setError(null);

      try {
        // Get current user
        const userId = await getCurrentUserId();
        if (!userId) {
          const err: GenerationError = {
            code: "UNAUTHORIZED",
            message: "Please sign in to generate plans.",
          };
          setError(err);
          setIsGenerating(false);
          return { plan: null, error: err };
        }

        // Build request body
        const requestBody: GenerateRequest = {
          type: planType,
          user_id: userId,
          preferences: {
            ...preferences,
            custom_prompt: vibeText,
          },
          ...(dayIndex !== undefined && { day_index: dayIndex }),
        };

        // Call API with timeout
        const controller = abortRef.current;
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: GeminiApiResponse = await response.json();

        // Handle response
        if (!response.ok) {
          const err = mapError(data);

          // Rate limit → specific message
          if (err.code === "RATE_LIMITED") {
            err.message =
              "Too many requests. Please wait a moment and try again.";
          }

          setError(err);
          setIsGenerating(false);
          return { plan: null, error: err };
        }

        // Success
        if (data.data) {
          setPlan(data.data);
          setError(null);
          return { plan: data.data, error: null };
        }

        const unknownErr: GenerationError = {
          code: "API_ERROR",
          message: "Unexpected response from AI service.",
        };
        setError(unknownErr);
        return { plan: null, error: unknownErr };
      } catch (err) {
        // Network error
        if (err instanceof Error && err.name === "AbortError") {
          return { plan: null, error: null };
        }

        const networkErr: GenerationError = {
          code: "NETWORK_ERROR",
          message: "Network error. Please check your connection.",
        };
        setError(networkErr);
        setIsGenerating(false);
        return { plan: null, error: networkErr };
      } finally {
        abortRef.current = null;
      }
    },
    [],
  );

  /** Cancel the current generation. */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setError(null);
  }, []);

  /** Reset the result state. */
  const reset = useCallback(() => {
    setPlan(null);
    setError(null);
  }, []);

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    plan,
    error,
  };
}