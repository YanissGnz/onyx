/**
 * TypeScript types for the AI layer (Gemini proxy).
 *
 * Defines the core data structures for AI generation requests and responses,
 * complementing the Zod schemas in `lib/validation/gemini.ts`.
 *
 * @see Architecture: Data Architecture
 *     (_bmad-output/planning-artifacts/architecture.md#Data-Architecture)
 */

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

/** Types of AI generation requests. */
export type GeminiRequestType = "workout_plan" | "meal_plan" | "regenerate_day"

/** User preferences passed to Gemini for prompt construction. */
export interface GeminiUserPreferences {
  user_id: string
  equipment?: string[]
  preferred_split?: string
  session_duration?: number
  training_days?: number
  injury_notes?: string
  goal?: string
  caloric_target?: number
  protein_target?: number
  preferred_ingredients?: string[]
  excluded_ingredients?: string[]
  cuisine_style?: string
}

/** Request body for POST /api/ai/generate. */
export interface GeminiRequest {
  type: GeminiRequestType
  user_id: string
  preferences: GeminiUserPreferences
  history?: Record<string, unknown>
  day_index?: number
  custom_prompt?: string
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** A single exercise in a workout plan. */
export interface GeminiExercise {
  name: string
  sets: number
  reps: number
  weight_kg: number
  rest_seconds: number
  notes?: string
}

/** A single day in a workout plan. */
export interface GeminiWorkoutDay {
  day: string
  muscle_group: string
  exercises: GeminiExercise[]
}

/** Full 7-day workout plan response. */
export interface GeminiWorkoutPlan {
  type: "workout_plan"
  plan: GeminiWorkoutDay[]
  instructions?: string
}

/** A single ingredient in a meal. */
export interface GeminiMealIngredient {
  name: string
  grams: number
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

/** A single meal entry in a meal plan. */
export interface GeminiMealEntry {
  name: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  from_personal_db?: boolean
  ingredients?: GeminiMealIngredient[]
  notes?: string
}

/** A single day in a meal plan. */
export interface GeminiMealDay {
  day: string
  meals: GeminiMealEntry[]
}

/** Full 7-day meal plan response. */
export interface GeminiMealPlan {
  type: "meal_plan"
  plan: GeminiMealDay[]
  instructions?: string
}

/** Regenerated single day response. */
export interface GeminiRegenerateDay {
  type: "regenerate_day"
  day: string
  muscle_group: string
  exercises: GeminiExercise[]
  instructions?: string
}

/** Union of all Gemini response types. */
export type GeminiResponse = GeminiWorkoutPlan | GeminiMealPlan | GeminiRegenerateDay

/** API response wrapper for the Gemini proxy. */
export interface GeminiApiResponse {
  data: GeminiResponse | null
  error: { code: string; message: string } | null
}