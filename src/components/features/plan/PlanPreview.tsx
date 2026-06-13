/**
 * PlanPreview — Card stack showing generated plan with swipe navigation.
 *
 * Displays a card stack with one card per day (7 days), swipe left/right
 * between days navigation, "Looks good? Confirm or regenerate." text,
 * Confirm button (Electric Lime fill), and Regenerate button (glass style).
 *
 * Implements AC #6 from story 3.2.
 *
 * @see Story 3.2 (_bmad-output/implementation-artifacts/3-2-vibe-drawer.md)
 */

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Color tokens from DESIGN.md (ONYX design system)
// ---------------------------------------------------------------------------

/** Primary accent: Electric Lime — used for confirm/primary actions. */
const PRIMARY = "#c3f400";

/** Surface container-low — card background. */
const SURFACE_LOW = "#1c1b1b";

/** Glass border — subtle edge highlight. */
const GLASS_BORDER = "rgba(255, 255, 255, 0.08)";

/** On surface — text color. */
const ON_SURFACE = "#e5e2e1";

/** On surface variant — secondary text color. */
const ON_SURFACE_VARIANT = "#c4c9ac";

/** Outline — tertiary text color. */
const OUTLINE = "#8e9379";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single day in a workout plan. */
export interface WorkoutDay {
  day: string;
  muscle_group: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight_kg: number;
    rest_seconds: number;
    notes?: string;
  }>;
}

/** A single day in a meal plan. */
export interface MealDay {
  day: string;
  meals: Array<{
    name: string;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
}

export interface PlanPreviewProps {
  /** The generated plan days (either workout or meal days). */
  days: Array<{ day: string; muscle_group?: string; exercises?: Array<{ name: string; sets: number; reps: number; weight_kg: number; rest_seconds: number; notes?: string }>; meals?: Array<{ name: string; meal_type: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }> }>;
  /** Plan type indicator. */
  planType: "workout_plan" | "meal_plan";
  /** Callback when user confirms the plan. */
  onConfirm: () => void;
  /** Callback when user requests regeneration. */
  onRegenerate: () => void;
}

// ---------------------------------------------------------------------------
// DayCard component
// ---------------------------------------------------------------------------

/**
 * A single day card in the plan preview.
 *
 * @param day - Day data
 * @param isActive - Whether this card is currently visible
 * @param planType - Type of plan
 */
function DayCard({
  day,
  isActive,
  planType,
}: {
  day: { day: string; muscle_group?: string; exercises?: Array<{ name: string; sets: number; reps: number; weight_kg: number; rest_seconds: number; notes?: string }>; meals?: Array<{ name: string; meal_type: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }> };
  isActive: boolean;
  planType: "workout_plan" | "meal_plan";
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex w-full flex-col gap-3"
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      role="listitem"
      aria-label={day.day}
    >
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="font-geist font-semibold text-lg"
            style={{ color: ON_SURFACE }}
          >
            {day.day}
          </h3>
          {day.muscle_group && planType === "workout_plan" && (
            <p
              className="font-jetbrains-mono text-xs tracking-wide"
              style={{ color: OUTLINE }}
            >
              {day.muscle_group}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {planType === "workout_plan" && day.exercises ? (
        <div className="flex flex-col gap-2">
          {day.exercises.map((exercise, i) => (
            <motion.div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: GLASS_BORDER,
                backgroundColor: SURFACE_LOW,
              }}
              initial={prefersReducedMotion ? {} : { x: 20, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <p
                className="font-inter font-medium text-sm"
                style={{ color: ON_SURFACE }}
              >
                {exercise.name}
              </p>
              <div className="mt-1 flex gap-3">
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  {exercise.sets} × {exercise.reps}
                </span>
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  {exercise.weight_kg}kg
                </span>
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: OUTLINE }}
                >
                  {exercise.rest_seconds}s rest
                </span>
              </div>
              {exercise.notes && (
                <p
                  className="mt-1 text-xs italic"
                  style={{ color: OUTLINE }}
                >
                  {exercise.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : planType === "meal_plan" && day.meals ? (
        <div className="flex flex-col gap-2">
          {day.meals.map((meal, i) => (
            <motion.div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: GLASS_BORDER,
                backgroundColor: SURFACE_LOW,
              }}
              initial={prefersReducedMotion ? {} : { x: 20, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <p
                className="font-inter font-medium text-sm capitalize"
                style={{ color: ON_SURFACE }}
              >
                {meal.name}
              </p>
              <div className="mt-1 flex gap-3">
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  {meal.calories} cal
                </span>
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  P: {meal.protein_g}g
                </span>
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  C: {meal.carbs_g}g
                </span>
                <span
                  className="font-jetbrains-mono text-xs"
                  style={{ color: OUTLINE }}
                >
                  F: {meal.fat_g}g
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PlanPreview component
// ---------------------------------------------------------------------------

/**
 * PlanPreview component implementation.
 *
 * Key implementation details:
 * - Card stack showing generated plan: one card per day (7 days)
 * - Swipe left/right between days via navigation arrows
 * - "Looks good? Confirm or regenerate." text above buttons
 * - Confirm button: Electric Lime (#c3f400) fill, rounded-xl, 48px height
 * - Regenerate button: Glass style (transparent fill, glass-border)
 * - Transition from skeleton: smooth opacity + scale animation via AnimatePresence
 * - useReducedMotion for prefers-reduced-motion support
 *
 * @param days - Array of plan days
 * @param planType - Type of plan
 * @param onConfirm - Called when user confirms
 * @param onRegenerate - Called when user requests regeneration
 * @returns The PlanPreview component
 */
export default function PlanPreview({
  days,
  planType,
  onConfirm,
  onRegenerate,
}: PlanPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(days.length - 1, prev + 1));
  };

  return (
    <div className="flex w-full flex-col gap-4 py-4">
      {/* Days navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[${GLASS_BORDER}] bg-transparent transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: GLASS_BORDER }}
          aria-label="Previous day"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: ON_SURFACE_VARIANT }} />
        </button>

        {/* Day indicators */}
        <div className="flex gap-1.5">
          {days.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === currentIndex ? "24px" : "8px",
                backgroundColor: i === currentIndex ? PRIMARY : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === days.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[${GLASS_BORDER}] bg-transparent transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: GLASS_BORDER }}
          aria-label="Next day"
        >
          <ArrowRight className="h-4 w-4" style={{ color: ON_SURFACE_VARIANT }} />
        </button>
      </div>

      {/* Day content */}
      <div className="max-h-[320px] overflow-y-auto px-1" role="list" aria-label="Plan days">
        <AnimatePresence mode="wait">
          <DayCard
            key={currentIndex}
            day={days[currentIndex]}
            isActive={true}
            planType={planType}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <p
          className="text-center text-sm font-medium"
          style={{ color: ON_SURFACE_VARIANT }}
        >
          Looks good? Confirm or regenerate.
        </p>
        <div className="flex gap-3">
          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: PRIMARY, color: "black" }}
            aria-label="Confirm plan"
          >
            <Check className="h-5 w-5" />
            <span>Confirm</span>
          </button>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold text-sm transition-all hover:bg-white/10"
            style={{ borderColor: GLASS_BORDER, color: ON_SURFACE_VARIANT }}
            aria-label="Regenerate plan"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  );
}