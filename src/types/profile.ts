// Profile types for ONYX onboarding and user preferences
// Matches the Supabase profiles table schema in supabase/migrations/002_profiles.sql

export type Goal = "cut" | "maintain" | "bulk";

export const GOAL_LABELS: Record<Goal, string> = {
  cut: "Cut (Lose Fat)",
  maintain: "Maintain (Recomp)",
  bulk: "Bulk (Gain Muscle)",
};

export type Equipment =
  | "barbell"
  | "dumbbells"
  | "cable-machine"
  | "kettlebell"
  | "resistance-bands"
  | "pull-up-bar"
  | "squat-rack"
  | "bench"
  | "leg-press"
  | "lat-pulldown"
  | "treadmill"
  | "exercise-bike"
  | "rowing-machine"
  | "smith-machine"
  | "ez-bar"
  | "foam-roller"
  | "medicine-ball"
  | "jump-rope";

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbells: "Dumbbells",
  "cable-machine": "Cable Machine",
  kettlebell: "Kettlebell",
  "resistance-bands": "Resistance Bands",
  "pull-up-bar": "Pull-Up Bar",
  "squat-rack": "Squat Rack",
  bench: "Bench",
  "leg-press": "Leg Press",
  "lat-pulldown": "Lat Pulldown",
  treadmill: "Treadmill",
  "exercise-bike": "Exercise Bike",
  "rowing-machine": "Rowing Machine",
  "smith-machine": "Smith Machine",
  "ez-bar": "EZ Bar",
  "foam-roller": "Foam Roller",
  "medicine-ball": "Medicine Ball",
  "jump-rope": "Jump Rope",
};

export type PreferredSplit =
  | "PPL"
  | "upper-lower"
  | "full-body"
  | "bro-split"
  | "push-pull"
  | "custom";

export const SPLIT_LABELS: Record<PreferredSplit, string> = {
  PPL: "Push / Pull / Legs",
  "upper-lower": "Upper / Lower",
  "full-body": "Full Body",
  "bro-split": "Bro Split (Chest/Back/Shoulders/Arms/Legs)",
  "push-pull": "Push / Pull",
  custom: "Custom",
};

export interface OnboardingData {
  currentStep: number;
  weightKg: number | null;
  goal: Goal | null;
  caloricTarget: number | null;
  proteinTarget: number | null;
  equipment: Equipment[];
  preferredSplit: PreferredSplit | null;
  sessionDuration: number | null;
  trainingDays: number | null;
  preferredIngredients: string[];
  excludedIngredients: string[];
  cuisineStyle: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number | null;
  goal: Goal | null;
  caloricTarget: number | null;
  proteinTarget: number | null;
  equipment: Equipment[];
  preferredSplit: PreferredSplit | null;
  sessionDuration: number | null;
  trainingDays: number | null;
  preferredIngredients: string[];
  excludedIngredients: string[];
  cuisineStyle: string;
  createdAt: string;
  updatedAt: string;
}

export const ONBOARDING_DEFAULTS: Partial<OnboardingData> = {
  goal: "maintain",
  trainingDays: 4,
  sessionDuration: 60,
  preferredSplit: "PPL",
  equipment: [],
  preferredIngredients: [],
  excludedIngredients: [],
  cuisineStyle: "",
};

export const ONBOARDING_DRAFT_KEY = "ONYX_ONBOARDING_DRAFT";

export function createEmptyOnboardingData(): OnboardingData {
  return {
    currentStep: 0,
    weightKg: null,
    goal: null,
    caloricTarget: null,
    proteinTarget: null,
    equipment: [],
    preferredSplit: null,
    sessionDuration: null,
    trainingDays: null,
    preferredIngredients: [],
    excludedIngredients: [],
    cuisineStyle: "",
  };
}