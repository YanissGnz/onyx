/**
 * Zod validation schemas for Google Gemini API responses.
 *
 * These schemas enforce the structured JSON contract between the Gemini proxy
 * endpoint and the frontend. All Gemini responses must pass validation before
 * being returned to the client.
 *
 * @see Architecture: Data Architecture (_bmad-output/planning-artifacts/architecture.md#Data-Architecture)
 * @see Epics: Story 3.1 (_bmad-output/planning-artifacts/epics.md#Story-31-Gemini-Proxy-Endpoint)
 */

import { z } from "zod"

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

/** Types of AI generation requests supported by the proxy. */
export const GeminiGenerationType = z.enum([
  "workout_plan",
  "meal_plan",
  "regenerate_day",
])

export type GeminiGenerationType = z.infer<typeof GeminiGenerationType>

// ---------------------------------------------------------------------------
// Workout plan schemas
// ---------------------------------------------------------------------------

/** A single exercise entry within a workout day. */
export const GeminiExerciseSchema = z.object({
  /** Exercise name (PascalCase or standard naming). */
  name: z.string().min(1, "Exercise name must not be empty"),
  /** Number of sets. */
  sets: z.number().int().positive(),
  /** Number of reps per set. */
  reps: z.number().int().positive(),
  /** Weight in kilograms. */
  weight_kg: z.number().positive(),
  /** Rest interval in seconds between sets. */
  rest_seconds: z.number().int().positive(),
  /** Optional notes for the exercise (e.g. form cues). */
  notes: z.string().optional(),
})

/** A single day in a workout plan. */
export const GeminiWorkoutDaySchema = z.object({
  /** Day label (e.g. "Monday", "Day 1 — Chest"). */
  day: z.string(),
  /** Muscle group focus for this day. */
  muscle_group: z.string(),
  /** List of exercises for this day. */
  exercises: z.array(GeminiExerciseSchema).min(1),
})

/** Full 7-day workout plan returned by Gemini. */
export const GeminiWorkoutPlanSchema = z.object({
  type: z.literal("workout_plan"),
  plan: z.array(GeminiWorkoutDaySchema).length(7),
  /** Human-readable instructions for the frontend. */
  instructions: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Meal plan schemas
// ---------------------------------------------------------------------------

/** A single meal entry within a nutrition day. */
export const GeminiMealEntrySchema = z.object({
  /** Meal name. */
  name: z.string().min(1, "Meal name must not be empty"),
  /** Meal type: breakfast, lunch, dinner, or snack. */
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  /** Estimated calories. */
  calories: z.number().int().nonnegative(),
  /** Protein in grams. */
  protein_g: z.number().nonnegative(),
  /** Carbohydrates in grams. */
  carbs_g: z.number().nonnegative(),
  /** Fat in grams. */
  fat_g: z.number().nonnegative(),
  /** Whether this meal was sourced from the user's Personal Meal Database. */
  from_personal_db: z.boolean().default(false),
  /** List of ingredients (empty for simple meals). */
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        grams: z.number().positive(),
        calories: z.number().nonnegative().optional(),
        protein_g: z.number().nonnegative().optional(),
        carbs_g: z.number().nonnegative().optional(),
        fat_g: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
  /** Optional notes. */
  notes: z.string().optional(),
})

/** A single day in a meal plan. */
export const GeminiMealDaySchema = z.object({
  /** Day label. */
  day: z.string(),
  /** List of meals for this day. */
  meals: z.array(GeminiMealEntrySchema).min(3).max(7),
})

/** Full 7-day meal plan returned by Gemini. */
export const GeminiMealPlanSchema = z.object({
  type: z.literal("meal_plan"),
  plan: z.array(GeminiMealDaySchema).length(7),
  instructions: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Regenerate day schemas
// ---------------------------------------------------------------------------

/** Single regenerated day returned by Gemini. */
export const GeminiRegenerateDaySchema = z.object({
  type: z.literal("regenerate_day"),
  /** The day that was regenerated. */
  day: z.string(),
  /** Muscle group focus. */
  muscle_group: z.string(),
  /** Exercises for the regenerated day. */
  exercises: z.array(GeminiExerciseSchema).min(1),
  instructions: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Union of all possible Gemini response types
// ---------------------------------------------------------------------------

/** Discriminated union of all Gemini response schemas. */
export const GeminiResponseSchema = z.discriminatedUnion("type", [
  GeminiWorkoutPlanSchema,
  GeminiMealPlanSchema,
  GeminiRegenerateDaySchema,
])

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>

// ---------------------------------------------------------------------------
// Request schemas (frontend → API route)
// ---------------------------------------------------------------------------

/** User preferences shape used in prompt construction. */
export const GeminiPreferencesSchema = z.object({
  // L2 fix: Supabase user_id is a hex string (e.g. "a1b2c3d4..."), not a UUID
  user_id: z.string().min(1, "user_id must not be empty"),
  equipment: z.array(z.string()).optional(),
  preferred_split: z.string().optional(),
  session_duration: z.number().int().positive().optional(),
  training_days: z.number().int().positive().optional(),
  injury_notes: z.string().optional(),
  goal: z.string().optional(),
  caloric_target: z.number().int().nonnegative().optional(),
  protein_target: z.number().int().nonnegative().optional(),
  preferred_ingredients: z.array(z.string()).optional(),
  excluded_ingredients: z.array(z.string()).optional(),
  cuisine_style: z.string().optional(),
})

/** Request body for the POST /api/ai/generate endpoint. */
export const GeminiRequestSchema = z.object({
  type: GeminiGenerationType,
  // L2 fix: Supabase user_id is a hex string, not a UUID
  user_id: z.string().min(1, "user_id must not be empty"),
  preferences: GeminiPreferencesSchema,
  /** Optional history data passed to Gemini for context. */
  history: z.record(z.string(), z.unknown()).optional(),
  /** For regenerate_day: which day index (0-6) to regenerate. */
  day_index: z.number().int().min(0).max(6).optional(),
  /** Optional custom prompt override. */
  custom_prompt: z.string().optional(),
})

export type GeminiRequest = z.infer<typeof GeminiRequestSchema>
export type GeminiPreferences = z.infer<typeof GeminiPreferencesSchema>