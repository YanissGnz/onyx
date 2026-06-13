/**
 * AIPlanDrawer - Glassmorphism bottom-anchored drawer for AI plan generation.
 *
 * Implements UX-DR10 from the ONYX design system:
 * - Bottom-anchored drawer with heavy backdrop blur
 * - Workout/Meal plan type toggle with configuration inputs
 * - Muscle group toggle buttons
 * - Equipment toggle buttons
 * - Workout duration slider
 * - Workout days toggle buttons
 * - Meal plan fields with suggestion pills
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

import { SelectItem, SelectRoot, SelectTrigger } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpCircle,
  Dumbbell,
  Soup,
  X,
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

/** Primary accent: Electric Lime - used for confirm/primary actions. */
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

/** Equipment options for workout plans. */
export const EQUIPMENT_OPTIONS = [
  "None",
  "Dumbbells",
  "Barbell",
  "Resistance Bands",
  "Pull-up Bar",
  "Kettlebell",
  "Bench",
  "Jump Rope",
  "Foam Roller",
  "Gym Machine",
] as const;

/** Workout days of the week. */
export const DAYS_OF_WEEK = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
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

/** Common preferred foods for suggestions. */
export const FOOD_SUGGESTIONS = [
  "Chicken",
  "Rice",
  "Vegetables",
  "Fruits",
  "Fish",
  "Eggs",
  "Oats",
  "Yogurt",
  "Banana",
  "Apple",
  "Broccoli",
  "Salmon",
  "Sweet Potato",
  "Avocado",
  "Nuts",
  "Chicken Breast",
  "Brown Rice",
  "Greek Yogurt",
  "Almonds",
  "Blueberries",
] as const;

/** Workout plan configuration. */
export interface WorkoutConfig {
  muscleGroup: string;
  exercises: number;
  duration: number;
  daysPerWeek: string;
  equipment: string[];
  workoutDays: string[];
}

/** Meal plan configuration. */
export interface MealConfig {
  preferredFoods: string[];
  allergies: string[];
  foodsToAvoid: string[];
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
// PillInput component
// ---------------------------------------------------------------------------

interface PillInputProps {
  placeholder: string;
  suggestions: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  label: string;
}

function PillInput({ placeholder, suggestions, value, onChange, disabled, label }: PillInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !value.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      inputValue.length > 0,
  );

  const addPill = (item: string) => {
    if (!value.includes(item)) {
      onChange([...value, item]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removePill = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
        {label}
      </label>
      <div
        className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#c3f400]"
        style={{
          backgroundColor: INPUT_BG,
          borderColor: showSuggestions ? INPUT_FOCUS_BORDER : INPUT_BORDER,
        }}
        onClick={() => containerRef.current?.querySelector("input")?.focus()}
      >
        {value.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: "rgba(195, 244, 0, 0.15)",
              color: "#c3f400",
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => removePill(item)}
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-[rgba(195,244,0,0.3)]"
              disabled={disabled}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={value.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(196,201,172,0.4)]"
          style={{ color: ON_SURFACE, minWidth: "80px" }}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="z-[110] max-h-48 overflow-y-auto rounded-lg border shadow-lg"
          style={{
            backgroundColor: SURFACE_CONTAINER,
            borderColor: GLASS_BORDER,
          }}
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addPill(suggestion)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#c4c9ac] transition-colors hover:bg-white/5 hover:text-white first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
              {suggestion}
            </button>
          ))}
          <div
            className="border-t px-3 py-1.5 text-xs italic"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: OUTLINE }}
          >
            Press Enter to add custom: "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleGroup component
// ---------------------------------------------------------------------------

interface ToggleGroupProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: readonly string[];
  label: string;
  disabled?: boolean;
  className?: string;
}

function ToggleGroup({ value, onChange, options, label, disabled, className }: ToggleGroupProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className || ""}`}>
      <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              disabled={disabled}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "border-[#c3f400] bg-[#c3f400]/15 text-[#c3f400]"
                  : "border-[rgba(255,255,255,0.1)] bg-transparent text-[#c4c9ac] hover:border-[rgba(255,255,255,0.2)] hover:text-white"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-pressed={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DurationSlider component
// ---------------------------------------------------------------------------

interface DurationSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

function DurationSlider({ value, onChange, disabled }: DurationSliderProps) {
  const durationLabels: Record<number, string> = {
    15: "15 min",
    20: "20 min",
    30: "30 min",
    45: "45 min",
    60: "60 min",
    90: "90 min",
  };

  const durationSteps = [15, 20, 30, 45, 60, 90];
  const currentIndex = durationSteps.indexOf(value) >= 0 ? durationSteps.indexOf(value) : 3;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
          Workout Duration
        </label>
        <span
          className="text-xs font-semibold"
          style={{ color: PRIMARY }}
        >
          {durationLabels[value] || `${value} min`}
        </span>
      </div>
      <input
        type="range"
        min={15}
        max={90}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          accentColor: PRIMARY,
        }}
      />
      <div className="flex justify-between px-1">
        {[15, 30, 60, 90].map((mark) => (
          <span key={mark} className="text-[10px]" style={{ color: OUTLINE }}>
            {mark}m
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AIPlanDrawer component
// ---------------------------------------------------------------------------

/**
 * AIPlanDrawer component implementation.
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

  // Workout defaults
  const defaultWorkout: WorkoutConfig = useMemo(
    () => ({
      muscleGroup: "Full Body",
      exercises: 5,
      duration: 45,
      daysPerWeek: "4 days/week",
      equipment: ["None"],
      workoutDays: [],
    }),
    [],
  );

  // Meal defaults
  const defaultMeal: MealConfig = useMemo(
    () => ({
      preferredFoods: [],
      allergies: [],
      foodsToAvoid: [],
      caloriesPerDay: "",
      mealsPerDay: "3",
    }),
    [],
  );

  const currentWorkout = { ...defaultWorkout, ...workoutConfig };
  const currentMeal = { ...defaultMeal, ...mealConfig };

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

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } },
  ) => {
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
      onSubmit({
        planType: "workout_plan",
        workout: currentWorkout,
        meal: undefined as unknown as MealConfig,
        customNotes: customNotes.trim(),
      });
    } else {
      onSubmit({
        planType: "meal_plan",
        meal: currentMeal,
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
              <div className="px-5 pb-4" style={{ overflowY: "auto" }}>
                <div className="flex flex-col gap-4">
                  {/* Muscle Group - Toggle buttons */}
                  <ToggleGroup
                    label="Muscle Group"
                    value={[currentWorkout.muscleGroup]}
                    onChange={([val]) =>
                      onWorkoutConfigChange?.({ ...currentWorkout, muscleGroup: val })
                    }
                    options={MUSCLE_GROUPS}
                    disabled={isGenerating}
                  />

                  {/* Equipment - Toggle buttons */}
                  <ToggleGroup
                    label="Equipment"
                    value={currentWorkout.equipment}
                    onChange={(val) =>
                      onWorkoutConfigChange?.({ ...currentWorkout, equipment: val })
                    }
                    options={EQUIPMENT_OPTIONS}
                    disabled={isGenerating}
                  />

                  {/* Number of Exercises */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
                      Number of Exercises
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={currentWorkout.exercises}
                      onChange={(e) =>
                        onWorkoutConfigChange?.({
                          ...currentWorkout,
                          exercises: parseInt(e.target.value) || 5,
                        })
                      }
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    />
                  </div>

                  {/* Duration - Slider */}
                  <DurationSlider
                    value={currentWorkout.duration}
                    onChange={(dur) =>
                      onWorkoutConfigChange?.({ ...currentWorkout, duration: dur })
                    }
                    disabled={isGenerating}
                  />

                  {/* Workout Days - Toggle buttons */}
                  <ToggleGroup
                    label="Workout Days"
                    value={currentWorkout.workoutDays}
                    onChange={(val) =>
                      onWorkoutConfigChange?.({ ...currentWorkout, workoutDays: val })
                    }
                    options={DAYS_OF_WEEK}
                    disabled={isGenerating}
                  />

                  {/* Days Per Week Summary */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
                      Frequency
                    </label>
                    <SelectRoot
                      value={currentWorkout.daysPerWeek}
                      onValueChange={(val) =>
                        onWorkoutConfigChange?.({ ...currentWorkout, daysPerWeek: val })
                      }
                    >
                      <SelectTrigger placeholder="Select frequency">
                        <span>{currentWorkout.daysPerWeek}</span>
                      </SelectTrigger>
                      <div
                        className="z-[110] max-h-48 overflow-y-auto rounded-lg border shadow-lg"
                        style={{
                          backgroundColor: SURFACE_CONTAINER,
                          borderColor: GLASS_BORDER,
                        }}
                      >
                        {["3 days/week", "4 days/week", "5 days/week", "6 days/week"].map(
                          (d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ),
                        )}
                      </div>
                    </SelectRoot>
                  </div>
                </div>
              </div>
            )}

            {/* ── Meal configuration ── */}
            {planType === "meal_plan" && (
              <div className="px-5 pb-4" style={{ overflowY: "auto" }}>
                <div className="flex flex-col gap-4">
                  {/* Preferred Foods - Pill input with suggestions */}
                  <PillInput
                    placeholder="Type to search foods..."
                    suggestions={FOOD_SUGGESTIONS}
                    value={currentMeal.preferredFoods}
                    onChange={(val) => onMealConfigChange?.({ ...currentMeal, preferredFoods: val })}
                    disabled={isGenerating}
                    label="Preferred Foods"
                  />

                  {/* Allergies - Pill input */}
                  <PillInput
                    placeholder="Type to search allergies..."
                    suggestions={FOOD_ALLERGIES.filter((a) => a !== "None")}
                    value={currentMeal.allergies}
                    onChange={(val) => onMealConfigChange?.({ ...currentMeal, allergies: val })}
                    disabled={isGenerating}
                    label="Allergies"
                  />

                  {/* Foods to Avoid - Pill input */}
                  <PillInput
                    placeholder="Type to search foods..."
                    suggestions={FOODS_TO_AVOID.filter((f) => f !== "None")}
                    value={currentMeal.foodsToAvoid}
                    onChange={(val) => onMealConfigChange?.({ ...currentMeal, foodsToAvoid: val })}
                    disabled={isGenerating}
                    label="Foods to Avoid"
                  />

                  {/* Calories Per Day */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
                      Calories Per Day
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={10000}
                      placeholder="e.g., 2000"
                      value={currentMeal.caloriesPerDay}
                      onChange={(e) =>
                        onMealConfigChange?.({
                          ...currentMeal,
                          caloriesPerDay: e.target.value,
                        })
                      }
                      disabled={isGenerating}
                      className="w-full rounded-lg border px-3 py-2.5 text-sm transition-colors placeholder:text-[rgba(196,201,172,0.4)] focus:outline-none focus:ring-2 focus:ring-[#c3f400]"
                      style={{
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: ON_SURFACE,
                      }}
                    />
                  </div>

                  {/* Meals Per Day - Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
                      Meals Per Day
                    </label>
                    <SelectRoot
                      value={currentMeal.mealsPerDay}
                      onValueChange={(val) =>
                        onMealConfigChange?.({ ...currentMeal, mealsPerDay: val })
                      }
                    >
                      <SelectTrigger placeholder="Select meals per day">
                        <span>{currentMeal.mealsPerDay} meals</span>
                      </SelectTrigger>
                      <div
                        className="z-[110] max-h-48 overflow-y-auto rounded-lg border shadow-lg"
                        style={{
                          backgroundColor: SURFACE_CONTAINER,
                          borderColor: GLASS_BORDER,
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m} meals
                          </SelectItem>
                        ))}
                      </div>
                    </SelectRoot>
                  </div>
                </div>
              </div>
            )}

            {/* ── Custom notes textarea ── */}
            <div className="px-5 pb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: ON_SURFACE_VARIANT }}>
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
              <p className="text-[11px] leading-relaxed" style={{ color: OUTLINE }}>
                Fill in your preferences above and tap Generate. You can also add custom notes for
                more personalized results.
              </p>
            </div>

            {/* ── Footer (Generate button) ── */}
            <div className="flex items-center justify-between px-5 pb-5 pt-2">
              <span className="text-xs" style={{ color: OUTLINE }}>
                {customNotes.length > 0
                  ? `${customNotes.length} characters`
                  : "Configure options and tap Generate"}
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