"use client";

import {
  ONBOARDING_DEFAULTS,
  ONBOARDING_DRAFT_KEY,
  OnboardingData,
  createEmptyOnboardingData,
} from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { toast } from "sonner";
import StepGoal from "./StepGoal";
import StepNutrition from "./StepNutrition";
import StepPreferences from "./StepPreferences";
import StepReview from "./StepReview";
import StepTraining from "./StepTraining";

type Action =
  | { type: "UPDATE"; payload: Partial<OnboardingData> }
  | { type: "SET_STEP"; payload: number }
  | { type: "RESTORE"; payload: OnboardingData };

function onboardingReducer(
  state: OnboardingData,
  action: Action
): OnboardingData {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "RESTORE":
      return action.payload;
    default:
      return state;
  }
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [data, dispatch] = useReducer(
    onboardingReducer,
    createEmptyOnboardingData()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydrate draft from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingData;
        if (parsed && typeof parsed.currentStep === "number") {
          dispatch({ type: "RESTORE", payload: parsed });
        }
      }
    } catch {
      // Ignore parse errors — start fresh
    }
  }, []);

  // Save draft to localStorage on every data change (after mount)
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(data));
      } catch {
        // localStorage full — silently ignore
      }
    }
  }, [data, isMounted]);

  const goToStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  };

  const handleNext = () => {
    if (data.currentStep < 4) {
      goToStep(data.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (data.currentStep > 0) {
      goToStep(data.currentStep - 1);
    }
  };

  const handleUpdate = (updates: Partial<OnboardingData>) => {
    dispatch({ type: "UPDATE", payload: updates });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: data.weightKg,
          goal: data.goal,
          caloricTarget: data.caloricTarget,
          proteinTarget: data.proteinTarget,
          equipment: data.equipment,
          preferredSplit: data.preferredSplit,
          sessionDuration: data.sessionDuration,
          trainingDays: data.trainingDays,
          preferredIngredients: data.preferredIngredients,
          excludedIngredients: data.excludedIngredients,
          cuisineStyle: data.cuisineStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message =
          errorData?.errors?.map((e: any) => `${e.field}: ${e.message}`).join("; ") ||
          "Unknown error";
        console.error("Onboarding save failed:", message);
        throw new Error("Failed to save profile");
      }

      // Clear draft
      try {
        localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        // ignore
      }

      setIsComplete(true);

      // Brief delay for transition, then redirect to dashboard
      setTimeout(() => {
        router.push("/workout");
      }, 1500);
    } catch (err) {
      console.error("Onboarding save failed:", err);
      toast.error("Couldn't save your profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: ONBOARDING_DEFAULTS.goal,
          trainingDays: ONBOARDING_DEFAULTS.trainingDays,
          sessionDuration: ONBOARDING_DEFAULTS.sessionDuration,
          preferredSplit: ONBOARDING_DEFAULTS.preferredSplit,
          equipment: [],
          preferredIngredients: [],
          excludedIngredients: [],
          cuisineStyle: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to skip onboarding");
      }

      // Clear draft
      try {
        localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        // ignore
      }

      router.push("/workout");
    } catch (err) {
      console.error("Onboarding skip failed:", err);
      toast.error("Couldn't apply defaults. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Completion transition state
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
          <h2 className="font-heading text-heading-md text-on-surface">
            Generating your first plan...
          </h2>
        </div>
        <p className="text-body-md text-muted-foreground">
          We're building a personalized plan based on your preferences
        </p>
      </div>
    );
  }

  // Don't render until mounted (to avoid hydration mismatch with localStorage)
  if (!isMounted) {
    return null;
  }

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const steps = [
    <StepGoal
      key="step-0"
      data={data}
      onUpdate={handleUpdate}
      onNext={handleNext}
    />,
    <StepNutrition
      key="step-1"
      data={data}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <StepTraining
      key="step-2"
      data={data}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <StepPreferences
      key="step-3"
      data={data}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <StepReview
      key="step-4"
      data={data}
      onBack={handleBack}
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
    />,
  ];

  return (
    <div className="relative">
      {/* Skip button — only shown before review step */}
      {data.currentStep < 4 && !isSubmitting && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-0 top-0 text-body-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-on-surface"
          aria-label="Skip onboarding and use default settings"
        >
          Skip for now
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={data.currentStep}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {steps[data.currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}