"use client";

import { GOAL_LABELS, OnboardingData, SPLIT_LABELS } from "@/types/profile";

interface StepReviewProps {
  data: OnboardingData;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

export default function StepReview({
  data,
  onBack,
  onComplete,
  isSubmitting,
}: StepReviewProps) {
  const equipmentLabels = data.equipment.length > 0
    ? data.equipment.join(", ")
    : "None selected";

  return (
    <div className="flex flex-col gap-6" role="form" aria-label="Review your preferences">
      <div className="text-center">
        <h2 className="font-heading text-heading-md text-on-surface">
          Review Your Profile
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Confirm everything looks right before we save
        </p>
      </div>

      {/* Summary Cards */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <h3 className="mb-3 text-label-caps text-primary-container">Body & Goals</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Weight</dt>
            <dd className="text-body-sm text-on-surface">{data.weightKg} kg</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Goal</dt>
            <dd className="text-body-sm text-on-surface">
              {data.goal ? GOAL_LABELS[data.goal] : "Not set"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <h3 className="mb-3 text-label-caps text-primary-container">Nutrition</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Daily Calories</dt>
            <dd className="text-body-sm text-on-surface">{data.caloricTarget} kcal</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Daily Protein</dt>
            <dd className="text-body-sm text-on-surface">{data.proteinTarget} g</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <h3 className="mb-3 text-label-caps text-primary-container">Training</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Split</dt>
            <dd className="text-body-sm text-on-surface">
              {data.preferredSplit ? SPLIT_LABELS[data.preferredSplit] : "Not set"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Session Duration</dt>
            <dd className="text-body-sm text-on-surface">{data.sessionDuration} min</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Training Days</dt>
            <dd className="text-body-sm text-on-surface">{data.trainingDays}/week</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Equipment</dt>
            <dd className="text-body-sm text-on-surface text-right max-w-[60%]">
              {equipmentLabels}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <h3 className="mb-3 text-label-caps text-primary-container">Food Preferences</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Preferred</dt>
            <dd className="text-body-sm text-on-surface text-right max-w-[60%]">
              {data.preferredIngredients.length > 0
                ? data.preferredIngredients.join(", ")
                : "None"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Excluded</dt>
            <dd className="text-body-sm text-on-surface text-right max-w-[60%]">
              {data.excludedIngredients.length > 0
                ? data.excludedIngredients.join(", ")
                : "None"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body-sm text-muted-foreground">Cuisine</dt>
            <dd className="text-body-sm text-on-surface">
              {data.cuisineStyle || "None"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 rounded-md border border-glass-border bg-surface px-4 py-4 text-center text-body-md text-on-surface transition-colors hover:border-on-surface-variant disabled:opacity-50"
          aria-label="Go back to edit preferences"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className={`flex-1 rounded-md py-4 text-center text-body-md font-semibold transition-all ${
            isSubmitting
              ? "cursor-wait bg-primary-container/50 text-on-primary"
              : "bg-primary-container text-on-primary shadow-neon-glow-lime hover:brightness-110"
          }`}
          aria-label={isSubmitting ? "Saving your profile" : "Complete onboarding"}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
              Saving...
            </span>
          ) : (
            "Complete"
          )}
        </button>
      </div>
    </div>
  );
}