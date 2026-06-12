"use client";

import { Goal, GOAL_LABELS, OnboardingData } from "@/types/profile";
import { useState } from "react";

interface StepGoalProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

type WeightUnit = "kg" | "lbs";

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

export default function StepGoal({ data, onUpdate, onNext }: StepGoalProps) {
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [displayWeight, setDisplayWeight] = useState(
    data.weightKg ? String(Math.round(data.weightKg)) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 350) {
      const kg = unit === "lbs" ? num * LBS_TO_KG : num;
      onUpdate({ weightKg: Math.round(kg * 10) / 10 });
      setError(null);
    } else if (!isNaN(num) && (num <= 0 || num > 350)) {
      onUpdate({ weightKg: null });
      setError(`Weight must be between 1 and 350 ${unit}`);
    } else if (value !== "") {
      onUpdate({ weightKg: null });
      setError("Please enter a valid number");
    } else {
      onUpdate({ weightKg: null });
      setError(null);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === "kg" ? "lbs" : "kg";
    const currentKg = data.weightKg;
    if (currentKg) {
      const converted =
        newUnit === "lbs" ? currentKg * KG_TO_LBS : currentKg * LBS_TO_KG;
      setDisplayWeight(String(Math.round(converted)));
    }
    setUnit(newUnit);
  };

  const handleSelectGoal = (goal: Goal) => {
    onUpdate({ goal });
  };

  const canProceed = data.weightKg !== null && data.weightKg > 0 && data.goal !== null;

  return (
    <div className="flex flex-col gap-6" role="form" aria-label="Goal and body metrics">
      <div className="text-center">
        <h2 className="font-heading text-heading-md text-on-surface">
          Let's get started
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Tell us about yourself so we can personalize your plans
        </p>
      </div>

      {/* Weight Input */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="weight-input"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Current Weight
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              id="weight-input"
              type="number"
              inputMode="decimal"
              min={20}
              max={350}
              placeholder="e.g. 75"
              value={displayWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-lg text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              aria-describedby={error ? "weight-error" : undefined}
              aria-required="true"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground">
              {unit}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleUnit}
            className="min-w-[48px] rounded-md border border-glass-border bg-surface px-3 py-3 text-label-caps text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary-container"
            aria-label={`Switch to ${unit === "kg" ? "pounds" : "kilograms"}`}
          >
            {unit === "kg" ? "lbs" : "kg"}
          </button>
        </div>
        {error && (
          <p id="weight-error" className="mt-2 text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Goal Selection */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <fieldset>
          <legend className="mb-3 text-label-caps text-on-surface-variant">
            What's your goal?
          </legend>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Fitness goal">
            {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(
              ([goal, label]) => (
                <button
                  key={goal}
                  type="button"
                  role="radio"
                  aria-checked={data.goal === goal}
                  onClick={() => handleSelectGoal(goal)}
                  className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-body-md transition-all ${
                    data.goal === goal
                      ? "border-primary-container bg-primary-container/10 text-primary-container"
                      : "border-glass-border bg-surface text-on-surface hover:border-on-surface-variant"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      data.goal === goal
                        ? "border-primary-container bg-primary-container"
                        : "border-outline"
                    }`}
                    aria-hidden="true"
                  >
                    {data.goal === goal && (
                      <span className="h-2 w-2 rounded-full bg-on-primary" />
                    )}
                  </span>
                  {label}
                </button>
              )
            )}
          </div>
        </fieldset>
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full rounded-md py-4 text-center text-body-md font-semibold transition-all ${
          canProceed
            ? "bg-primary-container text-on-primary shadow-neon-glow-lime hover:brightness-110"
            : "cursor-not-allowed bg-surface-container-high text-muted-foreground"
        }`}
        aria-label={canProceed ? "Continue to next step" : "Fill in all fields to continue"}
      >
        Continue
      </button>
    </div>
  );
}