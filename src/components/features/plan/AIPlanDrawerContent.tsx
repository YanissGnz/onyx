/**
 * AIPlanDrawerContent — Global AI Plan Drawer component that can be opened from any page.
 *
 * This component wraps the AIPlanDrawer with the useAIGeneration hook and provides
 * the global context for opening/closing the drawer from any component.
 */

"use client";

import {
  type AIPlanDrawerConfig,
  PlanPreview
} from "@/components/features/plan";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { useAIPlanDrawer } from "@/hooks/useAIPlanDrawer";
import type { GeminiMealPlan, GeminiWorkoutPlan } from "@/types/ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import AIPlanDrawer from "./AIPlanDrawer";

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------

const PRIMARY = "#c3f400";
const ON_SURFACE = "#e5e2e1";
const ON_SURFACE_VARIANT = "#c4c9ac";
const OUTLINE = "#8e9379";
const SURFACE_CONTAINER = "#201f1f";

// ---------------------------------------------------------------------------
// AIPlanDrawerContent component
// ---------------------------------------------------------------------------

export function AIPlanDrawerContent() {
  const {
    isDrawerOpen,
    closeDrawer,
    planType,
    setPlanType,
    workoutConfig,
    setWorkoutConfig,
    mealConfig,
    setMealConfig,
    customNotes,
    setCustomNotes,
  } = useAIPlanDrawer();

  const { generate, cancel, isGenerating, plan, error } = useAIGeneration();
  const prefersReducedMotion = useReducedMotion();

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<{
    type: "workout_plan" | "meal_plan";
    data: GeminiWorkoutPlan | GeminiMealPlan;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (config: AIPlanDrawerConfig) => {
      // Close drawer temporarily
      closeDrawer();

      const planType = config.planType;

      // Build preferences object from config
      const preferences: Record<string, unknown> = {};

      if (planType === "workout_plan" && config.workout) {
        preferences.muscle_group = config.workout.muscleGroup;
        preferences.exercises = config.workout.exercises;
        preferences.duration = `${config.workout.duration} min`;
        preferences.days_per_week = config.workout.daysPerWeek;
        preferences.equipment = config.workout.equipment;
        preferences.workout_days = config.workout.workoutDays;
      } else if (planType === "meal_plan" && config.meal) {
        preferences.preferred_foods = config.meal.preferredFoods;
        preferences.allergies = config.meal.allergies;
        preferences.foods_to_avoid = config.meal.foodsToAvoid;
        preferences.calories_per_day = config.meal.caloriesPerDay;
        preferences.meals_per_day = config.meal.mealsPerDay;
      }

      const result = await generate(
        planType,
        config.customNotes || "Generate a plan with the configured options.",
        preferences,
      );

      if (result.plan && result.error === null) {
        const planType = result.plan.type === "workout_plan" || result.plan.type === "meal_plan"
          ? result.plan.type
          : "workout_plan";
        setCurrentPlan({
          type: planType,
          data: result.plan as GeminiWorkoutPlan | GeminiMealPlan,
        });
      }
    },
    [generate, closeDrawer],
  );

  const handleConfirm = useCallback(() => {
    console.info("[plan] Plan confirmed:", currentPlan);
  }, [currentPlan]);

  const handleRegenerate = useCallback(async () => {
    if (!currentPlan) return;
    setCurrentPlan(null);
    const result = await generate(
      planType,
      "Regenerate with different variations",
      {},
    );
    if (result.plan && result.error === null) {
      const planType = result.plan.type === "workout_plan" || result.plan.type === "meal_plan"
        ? result.plan.type
        : "workout_plan";
      setCurrentPlan({
        type: planType,
        data: result.plan as GeminiWorkoutPlan | GeminiMealPlan,
      });
    }
  }, [generate, planType, currentPlan]);

  // ---------------------------------------------------------------------------
  // Extract plan days
  // ---------------------------------------------------------------------------

  const planDays = currentPlan
    ? currentPlan.type === "workout_plan"
      ? (currentPlan.data as GeminiWorkoutPlan).plan.map(
          (day) => ({
            day: day.day,
            muscle_group: day.muscle_group,
            exercises: day.exercises,
          }),
        )
      : (currentPlan.data as GeminiMealPlan).plan.map(
          (day) => ({
            day: day.day,
            meals: day.meals.map((meal) => ({
              name: meal.name,
              meal_type: meal.meal_type,
              calories: meal.calories,
              protein_g: meal.protein_g,
              carbs_g: meal.carbs_g,
              fat_g: meal.fat_g,
            })),
          }),
        )
    : [];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* AIPlanDrawer */}
      <AIPlanDrawer
        isOpen={isDrawerOpen}
        onDismiss={closeDrawer}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
        planType={planType}
        onPlanTypeChange={setPlanType}
        workoutConfig={workoutConfig}
        onWorkoutConfigChange={setWorkoutConfig}
        mealConfig={mealConfig}
        onMealConfigChange={setMealConfig}
        customNotes={customNotes}
        onNotesChange={setCustomNotes}
      />

      {/* Result overlay — shown when drawer is closed but we have a result */}
      <AnimatePresence>
        {!isDrawerOpen && plan && !error && currentPlan && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Result card */}
            <motion.div
              className="w-full max-w-sm rounded-t-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.95)] p-6 backdrop-blur-md"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="mb-4 flex justify-center">
                <div
                  className="h-1.5 w-10 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                />
              </div>

              <h3
                className="mb-2 text-center text-lg font-semibold"
                style={{ color: ON_SURFACE }}
              >
                Your plan is ready!
              </h3>

              <p
                className="mb-6 text-center text-sm"
                style={{ color: ON_SURFACE_VARIANT }}
              >
                {planType === "workout_plan"
                  ? "Review your workout plan below."
                  : "Review your meal plan below."}
              </p>

              {/* Plan preview */}
              <div className="mb-4">
                <PlanPreview
                  days={planDays}
                  planType={planType}
                  onConfirm={handleConfirm}
                  onRegenerate={handleRegenerate}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeDrawer}
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3 text-sm font-medium text-[rgba(196,201,172,0.6)] transition-colors hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-transparent px-4 py-3 text-sm font-medium text-[rgba(196,201,172,0.6)] transition-colors hover:bg-white/10"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    console.info("[plan] Confirmed");
                    setCurrentPlan(null);
                  }}
                  className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}