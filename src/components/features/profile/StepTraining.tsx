"use client";

import {
  Equipment,
  EQUIPMENT_LABELS,
  OnboardingData,
  PreferredSplit,
  SPLIT_LABELS,
} from "@/types/profile";
import { useState } from "react";

interface StepTrainingProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const equipmentList = Object.keys(EQUIPMENT_LABELS) as Equipment[];

export default function StepTraining({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepTrainingProps) {
  const [durationError, setDurationError] = useState<string | null>(null);

  const toggleEquipment = (item: Equipment) => {
    const current = data.equipment;
    const updated = current.includes(item)
      ? current.filter((e) => e !== item)
      : [...current, item];
    onUpdate({ equipment: updated });
  };

  const handleDurationChange = (value: string) => {
    const val = parseInt(value, 10);
    if (value === "") {
      onUpdate({ sessionDuration: null });
      setDurationError(null);
    } else if (isNaN(val)) {
      setDurationError("Please enter a valid number");
    } else if (val < 15 || val > 180) {
      onUpdate({ sessionDuration: val });
      setDurationError("Duration should be between 15 and 180 minutes");
    } else {
      onUpdate({ sessionDuration: val });
      setDurationError(null);
    }
  };

  const canProceed =
    data.preferredSplit !== null && data.sessionDuration !== null && data.trainingDays !== null;

  return (
    <div className="flex flex-col gap-6" role="form" aria-label="Training preferences">
      <div className="text-center">
        <h2 className="font-heading text-heading-md text-on-surface">
          Training Preferences
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Tell us about your equipment and training style
        </p>
      </div>

      {/* Equipment */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <fieldset>
          <legend className="mb-3 text-label-caps text-on-surface-variant">
            Available Equipment
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Equipment options">
            {equipmentList.map((item) => (
              <button
                key={item}
                type="button"
                role="checkbox"
                aria-checked={data.equipment.includes(item)}
                onClick={() => toggleEquipment(item)}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-body-sm transition-all ${
                  data.equipment.includes(item)
                    ? "border-primary-container bg-primary-container/10 text-primary-container"
                    : "border-glass-border bg-surface text-on-surface hover:border-on-surface-variant"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                    data.equipment.includes(item)
                      ? "border-primary-container bg-primary-container"
                      : "border-outline"
                  }`}
                  aria-hidden="true"
                >
                  {data.equipment.includes(item) && (
                    <svg
                      className="h-3 w-3 text-on-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {EQUIPMENT_LABELS[item]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Preferred Split */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="preferred-split"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Preferred Split
        </label>
        <select
          id="preferred-split"
          value={data.preferredSplit ?? ""}
          onChange={(e) =>
            onUpdate({
              preferredSplit: (e.target.value || null) as PreferredSplit | null,
            })
          }
          className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          aria-required="true"
        >
          <option value="" disabled>
            Select a split
          </option>
          {(Object.entries(SPLIT_LABELS) as [PreferredSplit, string][]).map(
            ([split, label]) => (
              <option key={split} value={split}>
                {label}
              </option>
            )
          )}
        </select>
      </div>

      {/* Session Duration */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="session-duration"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Session Duration
        </label>
        <div className="relative">
          <input
            id="session-duration"
            type="number"
            inputMode="numeric"
            min={15}
            max={180}
            placeholder="e.g. 60"
            value={data.sessionDuration ?? ""}
            onChange={(e) => handleDurationChange(e.target.value)}
            className="w-full rounded-md border border-glass-border bg-surface px-4 py-3 text-body-lg text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            aria-describedby={durationError ? "duration-error" : undefined}
            aria-required="true"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground">
            min
          </span>
        </div>
        {durationError && (
          <p id="duration-error" className="mt-2 text-body-sm text-error" role="alert">
            {durationError}
          </p>
        )}
      </div>

      {/* Training Days */}
      <div className="rounded-card bg-surface-container-low border border-glass-border p-5">
        <label
          htmlFor="training-days"
          className="mb-3 block text-label-caps text-on-surface-variant"
        >
          Training Days Per Week
        </label>
        <div className="flex gap-2" role="radiogroup" aria-label="Training days per week">
          {[2, 3, 4, 5, 6].map((day) => (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={data.trainingDays === day}
              onClick={() => onUpdate({ trainingDays: day })}
              className={`flex h-12 flex-1 items-center justify-center rounded-md border text-body-md transition-all ${
                data.trainingDays === day
                  ? "border-primary-container bg-primary-container/10 text-primary-container"
                  : "border-glass-border bg-surface text-on-surface hover:border-on-surface-variant"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
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
            canProceed ? "Continue to next step" : "Fill in required fields to continue"
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}