/**
 * Prompt templates for Google Gemini.
 *
 * Each function constructs a structured prompt from user preferences and
 * historical data, tailored to the requested generation type.
 *
 * @see Architecture: AI Integration (_bmad-output/planning-artifacts/architecture.md#AI-Integration)
 * @see Epics: Story 3.1 (FR-4, FR-7, FR-6)
 */

import type { GeminiPreferences } from "@/lib/validation/gemini"

// ---------------------------------------------------------------------------
// Types for prompt inputs
// ---------------------------------------------------------------------------

/** Completed workout sessions for history context. */
export interface WorkoutSessionHistory {
  date: string
  exercises: Array<{
    name: string
    sets: Array<{ reps: number; weight_kg: number }>
  }>
  total_volume: number
  duration_minutes: number
}

/** Top meal entries from the user's Personal Meal Database. */
export interface PersonalMealSample {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  usage_count: number
}

// ---------------------------------------------------------------------------
// Helper: build a common user context block
// ---------------------------------------------------------------------------

/**
 * Sanitizes user input to prevent prompt injection (H1 fix).
 * Escapes backticks, code fences, and instruction-like patterns that
 * Gemini might interpret as system instructions.
 */
function sanitize(input: string): string {
  return input
    .replace(/`/g, "\\`") // Escape backticks
    .replace(/\n/g, " ") // Collapse newlines to spaces
    .replace(/\r/g, " ") // Remove carriage returns
    .replace(/\*/g, "\\*") // Escape asterisks
    .replace(/^[-#>]/g, (match) => `\\${match}`) // Escape list/markdown prefixes at line start
    .slice(0, 500) // Truncate to prevent prompt length abuse
}

function buildUserContext(prefs: GeminiPreferences): string {
  const parts: string[] = []

  parts.push(`Goal: ${sanitize(prefs.goal ?? "maintain")}`)
  if (prefs.caloric_target) parts.push(`Caloric target: ${prefs.caloric_target} kcal/day`)
  if (prefs.protein_target) parts.push(`Protein target: ${prefs.protein_target}g/day`)
  if (prefs.equipment && prefs.equipment.length > 0)
    parts.push(`Equipment: ${prefs.equipment.map(sanitize).join(", ")}`)
  if (prefs.preferred_split) parts.push(`Split preference: ${sanitize(prefs.preferred_split)}`)
  if (prefs.session_duration) parts.push(`Session duration: ${prefs.session_duration} minutes`)
  if (prefs.training_days) parts.push(`Training days per week: ${prefs.training_days}`)
  if (prefs.injury_notes) parts.push(`Injury notes: ${sanitize(prefs.injury_notes)}`)
  if (prefs.preferred_ingredients && prefs.preferred_ingredients.length > 0)
    parts.push(`Preferred ingredients: ${prefs.preferred_ingredients.map(sanitize).join(", ")}`)
  if (prefs.excluded_ingredients && prefs.excluded_ingredients.length > 0)
    parts.push(`Excluded ingredients: ${prefs.excluded_ingredients.map(sanitize).join(", ")}`)
  if (prefs.cuisine_style) parts.push(`Cuisine style: ${sanitize(prefs.cuisine_style)}`)

  return parts.join("\n")
}

// ---------------------------------------------------------------------------
// Workout plan prompt
// ---------------------------------------------------------------------------

/**
 * Constructs the Gemini prompt for workout_plan generation.
 *
 * Includes: equipment, split, duration, training days, injury notes,
 * and the last 4 weeks of completed workout history.
 */
export function buildWorkoutPlanPrompt(
  prefs: GeminiPreferences,
  history: WorkoutSessionHistory[],
): string {
  const context = buildUserContext(prefs)

  const historyBlock =
    history.length > 0
      ? `\n\n## Recent Workout History (last ${Math.min(history.length, 4)} weeks)\n\n` +
        history
          .slice(0, 4)
          .map((s) => {
            const exercises = s.exercises
              .map((e) => `  - ${e.name}: ${e.sets.map((st) => `${st.reps}x${st.weight_kg}kg`).join(", ")}`)
              .join("\n")
            return `${s.date}: Volume=${s.total_volume}kg, Duration=${s.duration_minutes}min\n${exercises}`
          })
          .join("\n\n")
      : "\n\n**Note:** No workout history available. Generate a reasonable starter plan."

  return [
    `You are an expert personal trainer AI. Generate a structured 7-day workout plan in JSON format.`,
    ``,
    `## User Context`,
    context,
    historyBlock,
    ``,
    `## Instructions`,
    `- Return a JSON object with type="workout_plan" and a "plan" array of exactly 7 days.`,
    `- Each day must have: "day" (label), "muscle_group" (focus), "exercises" (array of exercise objects).`,
    `- Each exercise must have: "name", "sets" (positive int), "reps" (positive int), "weight_kg" (positive number), "rest_seconds" (positive int).`,
    `- Consider progressive overload and proper muscle group recovery.`,
    `- Match the user's equipment, split preference, session duration, and training days.`,
    `- Include injury-aware modifications if injury_notes are provided.`,
    `- Ensure the plan is balanced across the week.`,
    `- Include an "instructions" field with brief guidance for the user.`,
    `- Output ONLY valid JSON. No markdown code blocks. No explanations.`,
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Meal plan prompt
// ---------------------------------------------------------------------------

/**
 * Constructs the Gemini prompt for meal_plan generation.
 *
 * Includes: goal macros, preferred/excluded ingredients, cuisine style,
 * and up to 20 most-used entries from Personal Meal Database.
 * Instructs Gemini to prefer DB meals for at least 60% of daily meals.
 */
export function buildMealPlanPrompt(
  prefs: GeminiPreferences,
  mealDbSamples: PersonalMealSample[],
): string {
  const context = buildUserContext(prefs)

  const mealDbBlock =
    mealDbSamples.length > 0
      ? `\n\n## User's Personal Meal Database (top ${mealDbSamples.length} most-used)\n\n` +
        mealDbSamples
          .map(
            (m) =>
              `- "${m.name}": ${m.calories}kcal | P:${m.protein_g}g C:${m.carbs_g}g F:${m.fat_g}g (used ${m.usage_count}x)`,
          )
          .join("\n")
      : "\n\n**Note:** No personal meal database entries. Generate all meals from scratch."

  return [
    `You are an expert nutritionist AI. Generate a structured 7-day meal plan in JSON format.`,
    ``,
    `## User Context`,
    context,
    mealDbBlock,
    ``,
    `## Instructions`,
    `- Return a JSON object with type="meal_plan" and a "plan" array of exactly 7 days.`,
    `- Each day must have: "day" (label), "meals" (array of 3-7 meal objects).`,
    `- Each meal must have: "name", "meal_type" (breakfast/lunch/dinner/snack), "calories", "protein_g", "carbs_g", "fat_g".`,
    `- For meals matching a personal database entry, set "from_personal_db": true and include "ingredients" array.`,
    `- For new meals, set "from_personal_db": false and include estimated "ingredients" with name and grams.`,
    `- PREFER meals from the user's Personal Meal Database for at least 60% of daily meals.`,
    `- For new meals, provide reasonable macro estimates.`,
    `- Align total daily macros with the user's caloric and protein targets.`,
    `- Respect excluded ingredients.`,
    `- Include an "instructions" field with brief guidance.`,
    `- Output ONLY valid JSON. No markdown code blocks. No explanations.`,
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Regenerate day prompt
// ---------------------------------------------------------------------------

/**
 * Constructs the Gemini prompt for regenerate_day generation.
 *
 * Includes: day's muscle group, user preferences, and recent history
 * for that movement pattern.
 */
export function buildRegenerateDayPrompt(
  prefs: GeminiPreferences,
  dayMuscleGroup: string,
  recentHistory: WorkoutSessionHistory[],
): string {
  const context = buildUserContext(prefs)

  const historyBlock =
    recentHistory.length > 0
      ? `\n\n## Recent History for ${dayMuscleGroup}\n\n` +
        recentHistory
          .slice(0, 3)
          .map((s) => {
            const relevantExercises = s.exercises
              .filter((e) =>
                e.name.toLowerCase().includes(dayMuscleGroup.toLowerCase()) ||
                dayMuscleGroup.toLowerCase().includes(e.name.toLowerCase()),
              )
            if (relevantExercises.length === 0) return null
            const exercises = relevantExercises
              .map((e) => `  - ${e.name}: ${e.sets.map((st) => `${st.reps}x${st.weight_kg}kg`).join(", ")}`)
              .join("\n")
            return `${s.date}:\n${exercises}`
          })
          .filter(Boolean)
          .join("\n\n")
      : `\n\n**Note:** No recent history for ${dayMuscleGroup}. Generate based on standard training principles.`

  return [
    `You are an expert personal trainer AI. Regenerate a single day's workout in JSON format.`,
    ``,
    `## User Context`,
    context,
    ``,
    `## Regeneration Target`,
    `- Day muscle group: ${dayMuscleGroup}`,
    historyBlock,
    ``,
    `## Instructions`,
    `- Return a JSON object with type="regenerate_day", "day" (label), "muscle_group", and "exercises" array.`,
    `- Each exercise must have: "name", "sets" (positive int), "reps" (positive int), "weight_kg" (positive number), "rest_seconds" (positive int).`,
    `- Build on recent history for this muscle group with progressive overload.`,
    `- Match the user's equipment, session duration, and training preferences.`,
    `- Include an "instructions" field with brief guidance.`,
    `- Output ONLY valid JSON. No markdown code blocks. No explanations.`,
  ].join("\n")
}