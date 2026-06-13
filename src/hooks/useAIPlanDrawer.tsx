/**
 * AIPlanDrawerContext - Global context for opening the AI Plan Drawer from any page.
 *
 * This allows the bottom nav to trigger the drawer on any route without
 * needing to navigate to /plan first.
 */

"use client";

import type { AIPlanDrawerConfig, PlanType, WorkoutConfig, MealConfig } from "@/components/features/plan";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AIPlanDrawerContextValue {
  /** Whether the drawer is currently open. */
  isDrawerOpen: boolean;
  /** Open the AI Plan Drawer. */
  openDrawer: (initialType?: PlanType) => void;
  /** Close the AI Plan Drawer. */
  closeDrawer: () => void;
  /** Currently selected plan type. */
  planType: PlanType;
  /** Set the plan type. */
  setPlanType: (type: PlanType) => void;
  /** Current workout configuration. */
  workoutConfig: WorkoutConfig;
  /** Update workout configuration. */
  setWorkoutConfig: (config: WorkoutConfig) => void;
  /** Current meal configuration. */
  mealConfig: MealConfig;
  /** Update meal configuration. */
  setMealConfig: (config: MealConfig) => void;
  /** Current custom notes. */
  customNotes: string;
  /** Update custom notes. */
  setCustomNotes: (notes: string) => void;
}

const AIPlanDrawerContext = createContext<AIPlanDrawerContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AIPlanDrawerProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [planType, setPlanType] = useState<PlanType>("workout_plan");
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>({
    muscleGroup: "Full Body",
    exercises: 5,
    duration: "45 min",
    daysPerWeek: "4 days/week",
  });
  const [mealConfig, setMealConfig] = useState<MealConfig>({
    preferredFoods: "",
    allergies: "None",
    foodsToAvoid: "None",
    caloriesPerDay: "",
    mealsPerDay: "3",
  });
  const [customNotes, setCustomNotes] = useState("");

  const openDrawer = useCallback((initialType?: PlanType) => {
    if (initialType) setPlanType(initialType);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const contextValue: AIPlanDrawerContextValue = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    planType,
    setPlanType,
    workoutConfig,
    setWorkoutConfig,
    mealConfig,
    setMealConfig,
    customNotes,
    setCustomNotes,
  };

  return (
    <AIPlanDrawerContext.Provider value={contextValue}>
      {children}
    </AIPlanDrawerContext.Provider>
  );
}

export function useAIPlanDrawer() {
  const context = useContext(AIPlanDrawerContext);
  if (!context) {
    throw new Error("useAIPlanDrawer must be used within an AIPlanDrawerProvider");
  }
  return context;
}