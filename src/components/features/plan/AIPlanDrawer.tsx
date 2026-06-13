/**
 * AIPlanDrawer — Glassmorphism bottom-anchored drawer for AI plan generation.
 *
 * Implements UX-DR10 from the ONYX design system:
 * - Bottom-anchored drawer with heavy backdrop blur
 * - Workout/Meal plan type toggle with configuration inputs
 * - Natural language textarea for additional preferences
 * - Electric Lime (Green) accent on Generate button
 * - Swipe down to dismiss (cancels generation if in progress)
 * - Tap outside to dismiss
 * - Focus trap within drawer
 *
 * @see UX-DR10 (_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/DESIGN.md#UX-DR10)
 * @see DESIGN.md color tokens (_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/DESIGN.md#colors)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpCircle,
  Dumbbell,
  Soup,
  X
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Color tokens from DESIGN.md (ONYX design system)
// ---------------------------------------------------------------------------

/** Primary accent: Electric Lime — used for confirm/primary actions. */
const PRIMARY = "#c3f400";

/** Surface dim background: obsidian dark. */
const SURFACE_DIM = "#131313";

/** Surface container-low: card backgrounds. */
const SURFACE_CONTAINER_LOW = "#1c1b1b";

/** Surface container: slightly elevated background. */
const SURFACE_CONTAINER = "#201f1f";

/** Glass border: subtle edge highlight for glassmorphism. */
const GLASS_BORDER = "rgba(255, 255, 255, 0.08)";

/** Glass background fill: semi-transparent dark. */
const GLASS_BG = "rgba(18, 18, 18, 0.85)";

/** Placeholder text color. */
const PLACEHOLDER_TEXT = "rgba(196, 201, 172, 0.5)";

/** Disabled text color. */
const DISABLED_TEXT = "rgba(196, 201, 172, 0.4)";

/** On surface text color. */
const ON_SURFACE = "#e5e2e1";

/** On surface variant text color. */
const ON_SURFACE_VARIANT = "#c4c9ac";

/** Outline/tertiary text color. */
const OUTLINE = "#8e9379";

/** Input background color. */
const INPUT_BG = "rgba(255, 255, 255, 0.05)";

/** Input border color. */
const INPUT_BORDER = "rgba(255, 255, 255, 0.1)";

/** Input focus border color. */
const INPUT_FOCUS_BORDER = PRIMARY;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Plan type selector. */
export type PlanType = "workout_plan" | "meal_plan";

/** Muscle group options for workout plans. */
export const MUSCLE_GROUPS = [
  "Full Body",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Arms",
  "Glutes",
] as const;

/** Workout duration options. */
export const WORKOUT_DURATIONS = [
  "15 min",
  "20 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
] as const;

/** Workout day options. */
export const WORKOUT_DAYS = [
  "3 days/week",
  "4 days/week",
  "5 days/week",
  "6 days/week",
] as const;

/** Meal type options. */
export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const;

/** Common food allergies. */
export const FOOD_ALLERGIES = [
  "Nuts",
  "Dairy",
  "Gluten",
  "Soy",
  "Eggs",
  "Shellfish",
  "Fish",
  "Wheat",
  "Peanuts",
  "None",
] as const;

/** Common foods to avoid. */
export const FOODS_TO_AVOID = [
  "Processed Food",
  "Sugar",
  "Fried Food",
  "Red Meat",
  "Pork",
  "Seafood",
  "Dairy",
  "Gluten",
  "Soy",
  "Spicy Food",
  "None",
] as const;

/** Workout plan configuration. */
export interface WorkoutConfig {
  muscleGroup: string;
  exercises: number;
  duration: string;
  daysPerWeek: string;
}

/** Meal plan configuration. */
export interface MealConfig {
  preferredFoods: string;
  allergies: string;
  foodsToAvoid: string;
  caloriesPerDay: string;
  mealsPerDay: string;
}

/** Combined configuration for the AI Plan Drawer. */
export interface AIPlanDrawerConfig {
  planType: PlanType;
  workout?: WorkoutConfig;
  meal?: MealConfig;
  customNotes: string;
}

/** Props for the AIPlanDrawer component. */
export interface AIPlanDrawerProps {
  /** Whether the drawer is currently open. */
  isOpen: boolean;
  /** Callback when the drawer is dismissed. */
  onDismiss: () => void;
  /** Callback when the user submits their configuration. */
  onSubmit: (config: AIPlanDrawerConfig) => void;
  /** Whether generation is currently in progress. */
  isGenerating: boolean;
  /** Current plan type selection. */
  planType: PlanType;
  /** Callback to update plan type. */
  onPlanTypeChange: (type: PlanType) => void;
  /** Current workout configuration. */
  workoutConfig?: WorkoutConfig;
  /** Callback to update workout configuration. */
  onWorkoutConfigChange?: (config: WorkoutConfig) => void;
  /** Current meal configuration. */
  mealConfig?: MealConfig;
  /** Callback to update meal configuration. */
  onMealConfigChange?: (config: MealConfig) => void;
  /** Current custom notes text. */
  customNotes: string;
  /** Callback to update custom notes. */
  onNotesChange: (text: string) => void;
}

// ---------------------------------------------------------------------------
// Focus trap hook
// ---------------------------------------------------------------------------

/**
 * Traps keyboard focus within a container element.
 * @param containerRef - Ref to the container element
 * @param isActive - Whether focus trapping is enabled
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
) {
  const focusableSelector = useCallback(
    () =>
      [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(", "),
    [],
  );

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(focusableSelector());
    const firstElement = focusableElements[0] as HTMLElement | undefined;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef, focusableSelector]);
}

// ---------------------------------------------------------------------------
// AIPlanDrawer component
// ---------------------------------------------------------------------------

/**
 * AIPlanDrawer component implementation.
 *
 * Key implementation details:
 * - Uses framer-motion drag gestures for swipe-down detection
 * - Glassmorphism: backdrop-blur-md + semi-transparent fill + glass-border
 * - Bottom-anchored with safe-area-inset-bottom padding
 * - Height: 75% of viewport on mobile, max 640px on desktop
 * - Focus trap via Tab/Shift+Tab cycling
 * - role="dialog" + aria-label + aria-modal for accessibility
 * - aria-live region for loading state announcements
 * - Workout/Meal toggle with configuration inputs
 * - Electric Lime Generate button
 *
 * @returns The AIPlanDrawer component
 */
export default function AIPlanDrawer({
  isOpen,
  onDismiss,
  onSubmit,
  isGenerating,
  planType,
  onPlanTypeChange,
  workoutConfig,
  onWorkoutConfigChange,
  mealConfig,
  onMealConfigChange,
  customNotes,
  onNotesChange,
}: AIPlanDrawerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Focus trap
  // ---------------------------------------------------------------------------

  useFocusTrap(drawerRef, isOpen && !isDragging);

  // ---------------------------------------------------------------------------
  // Announce loading state changes via aria-live
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isGenerating && liveRef.current) {
      liveRef.current.textContent = "Generating your plan...";
    } else if (!isOpen && liveRef.current) {
      liveRef.current.textContent = "Drawer closed.";
    }
  }, [isGenerating, isOpen]);

  // ---------------------------------------------------------------------------
  // Swipe-down detection threshold
  // ---------------------------------------------------------------------------

  const DISMISS_THRESHOLD = 120;

  // ---------------------------------------------------------------------------
  // Drag handlers
  // ---------------------------------------------------------------------------

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    setIsDragging(false);

    const shouldDismiss = info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 10;
    if (shouldDismiss) {
      onDismiss();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  const handleSubmit = () => {
    if (planType === "workout_plan") {
      const workout: WorkoutConfig = workoutConfig ?? {
        muscleGroup: "Full Body",
        exercises: 5,
        duration: "45 min",
        daysPerWeek: "4 days/week",
      };
      onSubmit({
        planType: "workout_plan",
        workout,
        meal: undefined as unknown as MealConfig,
        customNotes: customNotes.trim(),
      });
    } else {
      const meal: MealConfig = mealConfig ?? {
        preferredFoods: "",
        allergies: "None",
        foodsToAvoid: "None",
        caloriesPerDay: "",
        mealsPerDay: "3",
      };
      onSubmit({
        planType: "meal_plan",
        meal,
        workout: undefined as unknown as WorkoutConfig,
        customNotes: customNotes.trim(),
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Keyboard handler for textarea
  // ---------------------------------------------------------------------------

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && !isGenerating) {
      onDismiss();
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Create a memoized workout config updater. */
  const workoutUpdater = useMemo(() => {
    if (!onWorkoutConfigChange) return undefined;
    const base = workoutConfig ?? {
      muscleGroup: "Full Body",
      exercises: 5,
      duration: "45 min",
      daysPerWeek: "4 days/week",
    };
    return (field: keyof WorkoutConfig, value: string | number) => {
      onWorkoutConfigChange({ ...base, [field]: value } as WorkoutConfig);
    };
  }, [onWorkoutConfigChange, workoutConfig]);

  /** Create a memoized meal config updater. */
  const mealUpdater = useMemo(() => {
    if (!onMealConfigChange) return undefined;
    const base = mealConfig ?? {
      preferredFoods: "",
      allergies: "None",
      foodsToAvoid: "None",
      caloriesPerDay: "",
      mealsPerDay: "3",
    };
    return (field: keyof MealConfig, value: string) => {
      onMealConfigChange({ ...base, [field]: value } as MealConfig);
    };
  }, [onMealConfigChange, mealConfig]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop overlay (tap outside to dismiss) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onDismiss}
            aria-hidden="true"
          />

          {/* ── Drawer (fixed bottom overlay) ── */}
          <motion.div
            ref={drawerRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[720px] flex-col overflow-hidden rounded-t-2xl border-t border-t-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.85)] backdrop-blur-md shadow-2xl"
            style={{
              backgroundColor: GLASS_BG,
              paddingBottom: "env(safe-area-inset-bottom)",
              maxHeight: "85dvh",
            }}
            role="dialog"
            aria-label="AI Plan Drawer"
            aria-modal="true"
          >
            {/* ── Drag handle indicator ── */}
            <div className="flex w-full justify-center pt-3 pb-1">
              <div
                className="h-1.5 w-10 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                aria-hidden="true"
              />
            </div>

            {/* ── Header (title + close) ── */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2
                className="font-geist font-semibold text-base"
                style={{ color: ON_SURFACE }}
              >
                AI Plan Drawer
              </h2>
              <button
                onClick={onDismiss}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-transparent backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#c3f400]"
                style={{ borderColor: GLASS_BORDER }}
                aria-label="Close drawer"
                disabled={isGenerating}
              >
                <X className="h-5 w-5" style={{ color: ON_SURFACE_VARIANT }} />
              </button>
            </div>

            {/* ── Plan type toggle ── */}
            <div className="px-5 pb-4">
              <div
                className="inline-flex w-full rounded-xl border p-1"
                style={{ borderColor: GLASS_BORDER, backgroundColor: SURFACE_CONTAINER }}
              >
                <button
                  onClick={() => onPlanTypeChange("workout_plan")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    planType === "workout_plan"
                      ? "bg-white/10 text-white"
                      : `text-[${ON_SURFACE_VARIANT}] hover:text-[${ON_SURFACE}]`
                  }`}
                  aria-pressed={planType === "workout_plan"}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Workout</span>
                </button>
                <button
                  onClick={() => onPlanTypeChange("meal_plan")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    planType === "meal_plan"
                      ? "bg-white/10 text-white"
                      : `text-[${ON_SURFACE_VARIANT}] hover:text-[${ON_SURFACE}]`
                  }`}
                  aria-pressed={planType === "meal_plan"}
                >
                  <Soup className="h-4 w-4" />
                  <span>Meal Plan</span>
                </button>
              </div>
            </div>

            {/* ── Workout configuration ── */}
            {planType === "workout_plan" && (
              <div className="px-5 pb-4">
                <div className="flex flex-col gap-3">
                  {/* Muscle Group */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Muscle Group
                    </label>
                    <select
                      value={workoutConfig?.muscleGroup || "Full Body"}
                      onChange={(e) => workoutUpdater?.("muscleGroup", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {MUSCLE_GROUPS.map((mg) => (
                        <option key={mg} value={mg}>{mg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Exercises */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Number of Exercises
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={workoutConfig?.exercises || 5}
                      onChange={(e) => workoutUpdater?.("exercises", parseInt(e.target.value) || 5)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    />
                  </div>

                  {/* Workout Duration */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Workout Duration
                    </label>
                    <select
                      value={workoutConfig?.duration || "45 min"}
                      onChange={(e) => workoutUpdater?.("duration", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {WORKOUT_DURATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Workout Days Per Week */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Workout Days Per Week
                    </label>
                    <select
                      value={workoutConfig?.daysPerWeek || "4 days/week"}
                      onChange={(e) => workoutUpdater?.("daysPerWeek", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {WORKOUT_DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Meal configuration ── */}
            {planType === "meal_plan" && (
              <div className="px-5 pb-4">
                <div className="flex flex-col gap-3">
                  {/* Preferred Foods */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Preferred Foods
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Chicken, Rice, Vegetables"
                      value={mealConfig?.preferredFoods || ""}
                      onChange={(e) => mealUpdater?.("preferredFoods", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors placeholder:text-[rgba(196,201,172,0.4)] focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    />
                  </div>

                  {/* Allergies */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Allergies
                    </label>
                    <select
                      value={mealConfig?.allergies || "None"}
                      onChange={(e) => mealUpdater?.("allergies", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {FOOD_ALLERGIES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  {/* Foods to Avoid */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Foods to Avoid
                    </label>
                    <select
                      value={mealConfig?.foodsToAvoid || "None"}
                      onChange={(e) => mealUpdater?.("foodsToAvoid", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {FOODS_TO_AVOID.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calories Per Day */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Calories Per Day
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={10000}
                      placeholder="e.g., 2000"
                      value={mealConfig?.caloriesPerDay || ""}
                      onChange={(e) => mealUpdater?.("caloriesPerDay", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors placeholder:text-[rgba(196,201,172,0.4)] focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    />
                  </div>

                  {/* Meals Per Day */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Meals Per Day
                    </label>
                    <select
                      value={mealConfig?.mealsPerDay || "3"}
                      onChange={(e) => mealUpdater?.("mealsPerDay", e.target.value)}
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((m) => (
                        <option key={m} value={String(m)}>{m} meals</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Custom notes textarea ── */}
            <div className="px-5 pb-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  Additional Notes (optional)
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Anything else you'd like to add... (e.g., 'I prefer morning workouts', 'I'm vegetarian')"
                  disabled={isGenerating}
                  className="w-full resize-none rounded-lg border bg-transparent px-3 py-2.5 text-sm leading-relaxed placeholder:text-[rgba(196,201,172,0.4)] focus:border-b-[#c3f400] focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                  style={{
                    borderColor: INPUT_BORDER,
                    color: ON_SURFACE,
                    minHeight: "80px",
                  }}
                />
              </div>
            </div>

            {/* ── Help text ── */}
            <div className="px-5 pb-3">
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: OUTLINE }}
              >
                Fill in your preferences above and tap Generate. You can also add custom notes for more personalized results.
              </p>
            </div>

            {/* ── Footer (Generate button) ── */}
            <div className="flex items-center justify-between px-5 pb-5 pt-2">
              <span
                className="text-xs"
                style={{ color: OUTLINE }}
              >
                {customNotes.length > 0 ? `${customNotes.length} characters` : "Configure options and tap Generate"}
              </span>
              <button
                onClick={handleSubmit}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-semibold text-sm text-black transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[#c3f400]"
                style={{ backgroundColor: PRIMARY }}
                aria-label="Generate plan"
              >
                <ArrowUpCircle className="h-5 w-5" />
                <span>Generate</span>
              </button>
            </div>

            {/* ── aria-live region for screen reader announcements ── */}
            <div
              ref={liveRef}
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              role="status"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}