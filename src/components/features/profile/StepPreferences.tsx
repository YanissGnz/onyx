"use client";

import { OnboardingData } from "@/types/profile";
import { useState } from "react";

interface StepPreferencesProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPreferences({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepPreferencesProps) {
  const [preferredInput, setPreferredInput] = useState(
    data.preferredIngredients.join(", ")
  );
  const [excludedInput, setExcludedInput] = useState(
    data.excludedIngredients.join(", ")
  );

  const handlePreferredChange = (value: string) => {
    setPreferredInput(value);
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({ preferredIngredients: items });
  };

  const handleExcludedChange = (value: string) => {
    setExcludedInput(value);
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({ excludedIngredients: items });
  };

  return (
    <div className="flex flex-col gap-6" role="form" aria-label="Nutrition preferences">
      <div className="text-center">
        <h2 className="font-heading text-heading-md text-on-surface">
          Nutrition Preferences
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Help us tailor your meal plans to your taste
        </p>
      </div>

      {/* Preferred Ingredients */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="preferred-ingredients"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Preferred Ingredients
        </label>
        <textarea
          id="preferred-ingredients"
          placeholder="e.g. chicken, rice, broccoli, eggs, oats"
          value={preferredInput}
          onChange={(e) => handlePreferredChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-glass-border bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          aria-describedby="preferred-hint"
        />
        <p id="preferred-hint" className="mt-2 text-body-sm text-muted-foreground">
          Separate ingredients with commas
        </p>
      </div>

      {/* Excluded Ingredients */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="excluded-ingredients"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Excluded Ingredients
        </label>
        <textarea
          id="excluded-ingredients"
          placeholder="e.g. shellfish, mushrooms, blue cheese"
          value={excludedInput}
          onChange={(e) => handleExcludedChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-glass-border bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          aria-describedby="excluded-hint"
        />
        <p id="excluded-hint" className="mt-2 text-body-sm text-muted-foreground">
          Separate ingredients with commas
        </p>
      </div>

      {/* Cuisine Style */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="cuisine-style"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Preferred Cuisine Style
        </label>
        <input
          id="cuisine-style"
          type="text"
          placeholder="e.g. Mediterranean, Asian, Mexican"
          value={data.cuisineStyle}
          onChange={(e) => onUpdate({ cuisineStyle: e.target.value })}
          className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-lg text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        />
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
          className="flex-1 rounded-md bg-primary-container px-4 py-4 text-center text-body-md font-semibold text-on-primary shadow-neon-glow-lime transition-all hover:brightness-110"
          aria-label="Review your preferences"
        >
          Review
        </button>
      </div>
    </div>
  );
}