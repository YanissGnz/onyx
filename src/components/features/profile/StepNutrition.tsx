"use client";

import { OnboardingData } from "@/types/profile";
import { useState } from "react";

interface StepNutritionProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepNutrition({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepNutritionProps) {
  const [caloricError, setCaloricError] = useState<string | null>(null);
  const [proteinError, setProteinError] = useState<string | null>(null);

  const handleCaloricChange = (value: string) => {
    const val = parseInt(value, 10);
    if (value === "") {
      onUpdate({ caloricTarget: null });
      setCaloricError(null);
    } else if (isNaN(val)) {
      setCaloricError("Please enter a valid number");
    } else if (val < 1200 || val > 6000) {
      onUpdate({ caloricTarget: val });
      setCaloricError("Caloric target should be between 1,200 and 6,000 kcal");
    } else {
      onUpdate({ caloricTarget: val });
      setCaloricError(null);
    }
  };

  const handleProteinChange = (value: string) => {
    const val = parseInt(value, 10);
    if (value === "") {
      onUpdate({ proteinTarget: null });
      setProteinError(null);
    } else if (isNaN(val)) {
      setProteinError("Please enter a valid number");
    } else if (val < 30 || val > 400) {
      onUpdate({ proteinTarget: val });
      setProteinError("Protein target should be between 30 and 400 g");
    } else {
      onUpdate({ proteinTarget: val });
      setProteinError(null);
    }
  };

  const canProceed =
    data.caloricTarget !== null &&
    data.caloricTarget > 0 &&
    data.proteinTarget !== null &&
    data.proteinTarget > 0;

  return (
    <div className="flex flex-col gap-6" role="form" aria-label="Nutrition targets">
      <div className="text-center">
        <h2 className="font-heading text-heading-md text-on-surface">
          Nutrition Targets
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Set your daily nutrition goals to guide your meal planning
        </p>
      </div>

      {/* Caloric Target */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="caloric-target"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Daily Caloric Target
        </label>
        <div className="relative">
          <input
            id="caloric-target"
            type="number"
            inputMode="numeric"
            min={1200}
            max={6000}
            placeholder="e.g. 2200"
            value={data.caloricTarget ?? ""}
            onChange={(e) => handleCaloricChange(e.target.value)}
            className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-lg text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            aria-describedby={caloricError ? "caloric-error" : undefined}
            aria-required="true"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground">
            kcal
          </span>
        </div>
        {caloricError && (
          <p id="caloric-error" className="mt-2 text-body-sm text-error" role="alert">
            {caloricError}
          </p>
        )}
        {data.caloricTarget !== null && data.caloricTarget > 0 && !caloricError && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            ~{Math.round(data.caloricTarget / 4)}g carbs /{" "}
            {Math.round((data.caloricTarget * 0.25) / 4)}g protein /{" "}
            {Math.round((data.caloricTarget * 0.25) / 9)}g fat at ~25/25 split
          </p>
        )}
      </div>

      {/* Protein Target */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="protein-target"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Daily Protein Target
        </label>
        <div className="relative">
          <input
            id="protein-target"
            type="number"
            inputMode="numeric"
            min={30}
            max={400}
            placeholder="e.g. 150"
            value={data.proteinTarget ?? ""}
            onChange={(e) => handleProteinChange(e.target.value)}
            className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-lg text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            aria-describedby={proteinError ? "protein-error" : undefined}
            aria-required="true"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground">
            g
          </span>
        </div>
        {proteinError && (
          <p id="protein-error" className="mt-2 text-body-sm text-error" role="alert">
            {proteinError}
          </p>
        )}
        {data.weightKg && data.proteinTarget && data.proteinTarget > 0 && !proteinError && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            {(data.proteinTarget / data.weightKg).toFixed(1)}g per kg of body weight
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md border border-glass-border bg-surface px-4 py-4 text-center text-body-md text-on-surface transition-colors hover:border-on-surface-variant"
          aria-label="Go back to previous step"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 rounded-md py-4 text-center text-body-md font-semibold transition-all ${
            canProceed
              ? "bg-primary-container text-on-primary shadow-neon-glow-lime hover:brightness-110"
              : "cursor-not-allowed bg-surface-container-high text-muted-foreground"
          }`}
          aria-label={
            canProceed ? "Continue to next step" : "Fill in all fields to continue"
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}