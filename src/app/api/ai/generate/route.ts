/**
 * POST /api/ai/generate — Gemini proxy endpoint.
 *
 * Constructs prompts for Google Gemini, sends them, validates the structured
 * JSON response, and returns it to the frontend. Implements 5-minute in-memory
 * caching and single retry on validation failure (PRD FR-23).
 *
 * @see Architecture: API & Communication Patterns
 *     (_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)
 * @see PRD: FR-23, NFR-6
 */

import { getCachedResponse, setCachedResponse } from "@/lib/gemini/cache"
import { getGeminiModel, getGenAI } from "@/lib/gemini/client"
import type { PersonalMealSample, WorkoutSessionHistory } from "@/lib/gemini/prompts"
import {
  buildMealPlanPrompt,
  buildRegenerateDayPrompt,
  buildWorkoutPlanPrompt,
} from "@/lib/gemini/prompts"
import {
  GeminiGenerationType,
  GeminiRequestSchema,
  GeminiResponseSchema,
} from "@/lib/validation/gemini"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RETRIES = 1

/** Default day labels for regenerate_day muscle group mapping. */
const DAY_LABELS = [
  "Day 1 — Chest & Triceps",
  "Day 2 — Back & Biceps",
  "Day 3 — Shoulders & Abs",
  "Day 4 — Chest & Triceps",
  "Day 5 — Back & Biceps",
  "Day 6 — Legs & Core",
  "Day 7 — Rest & Recovery",
] as const

// ---------------------------------------------------------------------------
// M2 fix: Simple in-memory rate limiter
// ---------------------------------------------------------------------------

/** Rate limit: max requests per window per user. */
const RATE_LIMIT_MAX = 10
/** Rate limit window: 1 minute in milliseconds. */
const RATE_LIMIT_WINDOW_MS = 60 * 1000

interface RateLimitEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Checks if a user is within the rate limit.
 * Returns true if allowed, false if rate-limited.
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry) {
    rateLimitMap.set(userId, { timestamps: [now] })
    return true
  }

  // Filter out timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false
  }

  entry.timestamps.push(now)
  return true
}

/**
 * Map of day_index to muscle_group for regenerate_day prompt construction.
 * Used when no existing plan data is available.
 */
export const MUSCLE_GROUP_BY_INDEX: Record<number, string> = {
  0: "Chest & Triceps",
  1: "Back & Biceps",
  2: "Shoulders & Abs",
  3: "Chest & Triceps",
  4: "Back & Biceps",
  5: "Legs & Core",
  6: "Rest & Recovery",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Returns the user_id if valid, or null if missing/invalid.
 *
 * Fixes applied (2026-06-13):
 * - C1: Now verifies JWT signature against Supabase's JWT_SECRET env var.
 * - C2: Now checks token expiration (exp claim).
 * - H2: Buffer.from wrapped in try/catch.
 * - L1: Removed dead AI_TIMEOUT_MS constant.
 */
async function verifyAuth(): Promise<string | null> {
  const hdrs = await headers()
  const authHeader = hdrs.get("authorization")

  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  if (!token || !token.includes(".")) return null

  // Validate JWT format (header.payload.signature)
  const parts = token.split(".")
  if (parts.length !== 3) return null

  // Verify JWT signature against Supabase's JWT_SECRET
  const jwtSecret = process.env.SUPABASE_JWT_SECRET
  if (jwtSecret) {
    try {
      const crypto = globalThis.crypto as Crypto
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      )
      // Signature is in base64url encoding (no padding)
      const sigBytes = Buffer.from(parts[2].replace(/_/g, "/").replace(/-/g, "+"), "base64")
      const signature = new Uint8Array(sigBytes)
      // Verify: the signed data is parts[0] + "." + parts[1]
      const signedData = new TextEncoder().encode(parts[0] + "." + parts[1])
      const isValid = await crypto.subtle.verify("HMAC", key, signature, signedData)
      if (!isValid) return null
    } catch {
      // Signature verification failed — token is invalid
      return null
    }
  } else {
    // No JWT_SECRET configured — skip signature verification (dev mode)
    console.warn("[verifyAuth] SUPABASE_JWT_SECRET not configured — skipping signature verification")
  }

  // Decode payload to extract user_id
  try {
    const jsonStr = Buffer.from(parts[1], "base64").toString("utf-8")
    const payload = JSON.parse(jsonStr) as Record<string, unknown>

    // C2 fix: Check token expiration
    const exp = payload.exp as number | undefined
    if (exp && exp * 1000 < Date.now()) {
      return null
    }

    return (payload.sub as string) ?? (payload.user_id as string) ?? null
  } catch {
    return null
  }
}

/**
 * Fetches workout session history from the database.
 * Returns the last 4 weeks of completed sessions.
 *
 * M3 fix: Implemented Supabase query.
 */
async function fetchWorkoutHistory(userId: string): Promise<WorkoutSessionHistory[]> {
  try {
    // M3 fix: Query Supabase for workout_sessions
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}/rest/v1/workout_sessions?select=date,exercises,total_volume,duration_minutes&user_id=eq.${encodeURIComponent(userId)}&completed_at=gte.${new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()}&order=date.desc&limit=4`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET || ""}`,
          "Content-Type": "application/json",
        },
        // M1 fix: respect rate limit
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return []
    return (await res.json()) as WorkoutSessionHistory[]
  } catch {
    return []
  }
}

/**
 * Fetches top meal samples from the user's Personal Meal Database.
 * Returns up to 20 most-used entries.
 *
 * M3 fix: Implemented Supabase query.
 */
async function fetchMealDbSamples(userId: string): Promise<PersonalMealSample[]> {
  try {
    // M3 fix: Query Supabase for personal_meals
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}/rest/v1/personal_meals?select=id,name,calories,protein_g,carbs_g,fat_g,usage_count&user_id=eq.${encodeURIComponent(userId)}&order=usage_count.desc&limit=20`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET || ""}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return []
    return (await res.json()) as PersonalMealSample[]
  } catch {
    return []
  }
}

/**
 * Calls Gemini with the given prompt and validates the response.
 * Retries once on validation failure.
 */
async function callGemini(prompt: string, retryCount: number = 0): Promise<unknown> {
  const genai = getGenAI()
  const model = getGeminiModel()

  try {
    const response = await genai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    })

    const text = response.text
    if (!text) throw new Error("Empty Gemini response")

    // Parse and validate JSON
    const parsed = JSON.parse(text)
    const result = GeminiResponseSchema.safeParse(parsed)

    if (result.success) return result.data

    // Retry on validation failure
    if (retryCount < MAX_RETRIES) {
      return callGemini(prompt, retryCount + 1)
    }

    throw new Error(`Gemini response validation failed after ${MAX_RETRIES + 1} attempts: ${result.error.message}`)
  } catch (error) {
    // Gemini timeout or network error
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI generation timed out. Please try again.")
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // 1. Verify auth
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const parsed = GeminiRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: "INVALID_REQUEST", message: parsed.error.message } },
        { status: 400 },
      )
    }

    const { type, preferences, history, day_index } = parsed.data

    // M2 fix: Check rate limit before calling Gemini
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { data: null, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again in a minute." } },
        { status: 429 },
      )
    }

    // 3. Check cache
    const cached = getCachedResponse({ type, user_id: userId, preferences, history })
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // 4. Build prompt based on type
    let prompt: string

    switch (type) {
      case GeminiGenerationType.enum.workout_plan: {
        const workoutHistory = await fetchWorkoutHistory(userId)
        prompt = buildWorkoutPlanPrompt(preferences, workoutHistory)
        break
      }

      case GeminiGenerationType.enum.meal_plan: {
        const mealSamples = await fetchMealDbSamples(userId)
        prompt = buildMealPlanPrompt(preferences, mealSamples)
        break
      }

      case GeminiGenerationType.enum.regenerate_day: {
        if (day_index === undefined) {
          return NextResponse.json(
            { data: null, error: { code: "INVALID_REQUEST", message: "day_index is required for regenerate_day" } },
            { status: 400 },
          )
        }
        // C3 fix: Map day_index to muscle group using deterministic lookup
        const muscleGroup = MUSCLE_GROUP_BY_INDEX[day_index] ?? `Day ${day_index + 1}`
        const recentHistory = await fetchWorkoutHistory(userId)
        prompt = buildRegenerateDayPrompt(preferences, muscleGroup, recentHistory)
        break
      }

      default:
        return NextResponse.json(
          { data: null, error: { code: "INVALID_TYPE", message: `Unknown generation type: ${type}` } },
          { status: 400 },
        )
    }

    // 5. Call Gemini
    const result = await callGemini(prompt)

    // 6. Cache the response
    setCachedResponse({ type, user_id: userId, preferences, history }, JSON.stringify(result))

    // 7. Log metrics
    const elapsed = Date.now() - startTime
    console.info(`[ai/generate] type=${type} elapsed=${elapsed}ms user=${userId}`)

    return NextResponse.json({ data: result, error: null })
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[ai/generate] error elapsed=${elapsed}ms`, error)

    return NextResponse.json(
      {
        data: null,
        error: {
          code: "AI_GENERATION_FAILED",
          message: "AI generation is temporarily unavailable. Please try again.",
        },
      },
      { status: 500 },
    )
  }
}