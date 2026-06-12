"use client";

import {
  Equipment,
  EQUIPMENT_LABELS,
  Goal,
  GOAL_LABELS,
  PreferredSplit,
  SPLIT_LABELS,
  UserProfile,
} from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ——— Weight editor sub-component (avoids useState inside render function) ———

type WeightUnit = "kg" | "lbs";
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

function WeightEditor({
  value,
  onChange,
  error,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  error?: string;
}) {
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [display, setDisplay] = useState(
    value ? String(Math.round(value)) : ""
  );

  const handleChange = (val: string) => {
    setDisplay(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 350) {
      const kg = unit === "lbs" ? num * LBS_TO_KG : num;
      onChange(Math.round(kg * 10) / 10);
    } else {
      onChange(null);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === "kg" ? "lbs" : "kg";
    if (value) {
      const converted =
        newUnit === "lbs" ? value * KG_TO_LBS : value * LBS_TO_KG;
      setDisplay(String(Math.round(converted)));
    }
    setUnit(newUnit);
  };

  return (
    <div>
      <label className="mb-1 block text-label-caps text-on-surface-variant">
        Weight
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            min={1}
            max={350}
            placeholder="e.g. 75"
            value={display}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
            aria-label="Current weight"
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground">
            {unit}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleUnit}
          className="min-w-[44px] rounded border border-glass-border bg-surface px-2 py-2 text-label-caps text-on-surface-variant hover:border-primary-container hover:text-primary-container"
          aria-label={`Switch to ${unit === "kg" ? "pounds" : "kilograms"}`}
        >
          {unit === "kg" ? "lbs" : "kg"}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ——— Field definitions ———

/** Fields whose change triggers the plan-regeneration prompt */
const TRIGGER_FIELDS: (keyof UserProfile)[] = [
  "goal",
  "caloricTarget",
  "equipment",
  "preferredSplit",
  "sessionDuration",
  "trainingDays",
];

interface EditableSection {
  id: string;
  label: string;
  fields: (keyof UserProfile)[];
}

const SECTIONS: EditableSection[] = [
  {
    id: "body-metrics",
    label: "Body Metrics",
    fields: ["weightKg", "goal"],
  },
  {
    id: "nutrition-targets",
    label: "Nutrition Targets",
    fields: ["caloricTarget", "proteinTarget"],
  },
  {
    id: "training-preferences",
    label: "Training Preferences",
    fields: ["equipment", "preferredSplit", "sessionDuration", "trainingDays"],
  },
  {
    id: "nutrition-preferences",
    label: "Nutrition Preferences",
    fields: ["preferredIngredients", "excludedIngredients", "cuisineStyle"],
  },
];

interface SettingsFormProps {
  profile: UserProfile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  // Track current form values (initially from server profile)
  const [values, setValues] = useState<UserProfile>(profile);
  // Which sections are in edit mode
  const [editingSection, setEditingSection] = useState<string | null>(null);
  // Per-section saving state
  const [savingSection, setSavingSection] = useState<string | null>(null);
  // Per-field errors after save attempt
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Section retry — tracks failed saves
  const [failedSection, setFailedSection] = useState<string | null>(null);
  // Goal-change prompt
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);
  const regenSection = useRef<string | null>(null);

  // Keep a ref of the original values to detect changes
  const originalRef = useRef(profile);

  // Local-state helpers
  const updateField = useCallback(
    (field: keyof UserProfile, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev };
        (next as Record<string, unknown>)[field] = value;
        return next;
      });
      // Clear field error on edit
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const startEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setFailedSection(null);
    setFieldErrors({});
  };

  const cancelEdit = (section: EditableSection) => {
    // Restore original values for this section
    setValues((prev) => {
      const restored = { ...prev };
      for (const field of section.fields) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (restored as any)[field] = (originalRef.current as any)[field];
      }
      return restored;
    });
    setEditingSection(null);
    setFailedSection(null);
    setFieldErrors({});
  };

  // ——— Save section ———
  const saveSection = useCallback(
    async (section: EditableSection) => {
      setSavingSection(section.id);
      setFailedSection(null);
      setFieldErrors({});

      // Build payload with only the fields of this section
      const payload: Record<string, unknown> = {};
      for (const field of section.fields) {
        payload[field] = values[field];
      }

      try {
        const response = await fetch("/api/profile/onboarding", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const details = err?.error?.details ?? [];
          if (Array.isArray(details) && details.length > 0) {
            const newErrors: Record<string, string> = {};
            for (const d of details) {
              newErrors[d.field] = d.message;
            }
            setFieldErrors(newErrors);
          }
          throw new Error(err?.error?.message ?? "Save failed");
        }

        // Save succeeded — close edit
        setEditingSection(null);
        toast.success("Saved.");

        // Check if any trigger fields changed (before overwriting originalRef)
        const changedTriggers = TRIGGER_FIELDS.filter((f) => {
          const old = JSON.stringify(originalRef.current[f]);
          const cur = JSON.stringify(values[f]);
          return old !== cur;
        });

        // Update original values after diff check
        originalRef.current = { ...values };

        if (changedTriggers.length > 0) {
          regenSection.current = section.id;
          setShowRegenPrompt(true);
        }
      } catch (err) {
        console.error("Profile save failed:", err);
        toast.error("Couldn't save — we'll retry when you're back online.");
        setFailedSection(section.id);
      } finally {
        setSavingSection(null);
      }
    },
    [values]
  );

  const handleRegenerate = () => {
    setShowRegenPrompt(false);
    router.push("/plan");
  };

  const handleKeepPlan = () => {
    setShowRegenPrompt(false);
  };

  // ——— Render helpers ———
  const renderReadValue = (field: keyof UserProfile) => {
    const v = values[field];
    if (v === null || v === undefined || v === "") return "Not set";

    switch (field) {
      case "weightKg":
        return `${v} kg`;
      case "goal":
        return GOAL_LABELS[v as Goal] ?? v;
      case "caloricTarget":
        return `${v} kcal`;
      case "proteinTarget":
        return `${v} g`;
      case "equipment":
        return Array.isArray(v) && v.length > 0
          ? (v as unknown as Equipment[]).map((e) => EQUIPMENT_LABELS[e] ?? e).join(", ")
          : "Not set";
      case "preferredSplit":
        return v ? SPLIT_LABELS[v as PreferredSplit] ?? v : "Not set";
      case "sessionDuration":
        return `${v} min`;
      case "trainingDays":
        return `${v} days/week`;
      case "preferredIngredients":
        return Array.isArray(v) && v.length > 0 ? v.join(", ") : "Not set";
      case "excludedIngredients":
        return Array.isArray(v) && v.length > 0 ? v.join(", ") : "Not set";
      case "cuisineStyle":
        return (v as string) || "Not set";
      default:
        return String(v ?? "Not set");
    }
  };

  // ——— Edit-mode renders ———
  const renderEditField = (field: keyof UserProfile) => {
    const v = values[field];
    const error = fieldErrors[field];

    const errorMsg = error ? (
      <p className="mt-1 text-body-sm text-error" role="alert">
        {error}
      </p>
    ) : null;

    switch (field) {
      // — weight —
      case "weightKg":
        return (
          <WeightEditor
            key={field}
            value={v as number | null}
            onChange={(val) => updateField("weightKg", val)}
            error={error}
          />
        );

      // — goal —
      case "goal":
        return (
          <div key={field}>
            <label className="mb-1 block text-label-caps text-on-surface-variant">
              Goal
            </label>
            <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Fitness goal">
              {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(
                ([goal, label]) => (
                  <button
                    key={goal}
                    type="button"
                    role="radio"
                    aria-checked={v === goal}
                    onClick={() => updateField("goal", goal)}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-body-sm transition-all ${
                      v === goal
                        ? "border-primary-container bg-primary-container/10 text-primary-container"
                        : "border-glass-border bg-surface text-on-surface hover:border-on-surface-variant"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        v === goal
                          ? "border-primary-container bg-primary-container"
                          : "border-outline"
                      }`}
                      aria-hidden="true"
                    >
                      {v === goal && (
                        <span className="h-1.5 w-1.5 rounded-full bg-on-primary" />
                      )}
                    </span>
                    {label}
                  </button>
                )
              )}
            </div>
            {errorMsg}
          </div>
        );

      // — numeric targets —
      case "caloricTarget":
      case "proteinTarget": {
        const labels = {
          caloricTarget: "Daily Caloric Target",
          proteinTarget: "Daily Protein Target",
        };
        const suffixes = { caloricTarget: " kcal", proteinTarget: " g" };
        const ranges = {
          caloricTarget: { min: 1200, max: 6000 },
          proteinTarget: { min: 30, max: 400 },
        };
        const r = ranges[field];
        return (
          <div key={field}>
            <label
              htmlFor={`edit-${field}`}
              className="mb-1 block text-label-caps text-on-surface-variant"
            >
              {labels[field]}
            </label>
            <input
              id={`edit-${field}`}
              type="number"
              inputMode="numeric"
              min={r.min}
              max={r.max}
              placeholder={String(r.min)}
              value={v ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  field,
                  val === "" ? null : parseInt(val, 10)
                );
              }}
              className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
              aria-label={labels[field]}
            />
            <span className="text-body-sm text-muted-foreground">
              {suffixes[field]}
            </span>
            {errorMsg}
          </div>
        );
      }

      // — equipment —
      case "equipment": {
        const selected = Array.isArray(v) ? (v as Equipment[]) : [];
        return (
          <div key={field}>
            <label className="mb-1 block text-label-caps text-on-surface-variant">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(EQUIPMENT_LABELS) as [Equipment, string][]).map(
                ([eq, label]) => {
                  const isSelected = selected.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => {
                        const next = isSelected
                          ? selected.filter((e) => e !== eq)
                          : [...selected, eq];
                        updateField("equipment", next);
                      }}
                      className={`rounded border px-2.5 py-2 text-left text-body-xs transition-all ${
                        isSelected
                          ? "border-primary-container bg-primary-container/10 text-primary-container"
                          : "border-glass-border bg-surface text-on-surface hover:border-on-surface-variant"
                      }`}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>
            {errorMsg}
          </div>
        );
      }

      // — preferred split —
      case "preferredSplit":
        return (
          <div key={field}>
            <label
              htmlFor="edit-preferredSplit"
              className="mb-1 block text-label-caps text-on-surface-variant"
            >
              Training Split
            </label>
            <select
              id="edit-preferredSplit"
              value={v ?? ""}
              onChange={(e) =>
                updateField(
                  "preferredSplit",
                  e.target.value || null
                )
              }
              className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
            >
              <option value="">Select split</option>
              {(Object.entries(SPLIT_LABELS) as [PreferredSplit, string][]).map(
                ([split, label]) => (
                  <option key={split} value={split}>
                    {label}
                  </option>
                )
              )}
            </select>
            {errorMsg}
          </div>
        );

      // — session duration, training days —
      case "sessionDuration":
      case "trainingDays": {
        const fieldLabels = {
          sessionDuration: "Session Duration (minutes)",
          trainingDays: "Training Days per Week",
        };
        const fieldMins = { sessionDuration: 15, trainingDays: 1 };
        const fieldMaxs = { sessionDuration: 180, trainingDays: 7 };
        return (
          <div key={field}>
            <label
              htmlFor={`edit-${field}`}
              className="mb-1 block text-label-caps text-on-surface-variant"
            >
              {fieldLabels[field]}
            </label>
            <input
              id={`edit-${field}`}
              type="number"
              inputMode="numeric"
              min={fieldMins[field]}
              max={fieldMaxs[field]}
              value={v ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  field,
                  val === "" ? null : parseInt(val, 10)
                );
              }}
              className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
              aria-label={fieldLabels[field]}
            />
            {errorMsg}
          </div>
        );
      }

      // — text arrays —
      case "preferredIngredients":
      case "excludedIngredients": {
        const labels = {
          preferredIngredients: "Preferred Ingredients",
          excludedIngredients: "Excluded Ingredients",
        };
        return (
          <div key={field}>
            <label
              htmlFor={`edit-${field}`}
              className="mb-1 block text-label-caps text-on-surface-variant"
            >
              {labels[field]}
            </label>
            <input
              id={`edit-${field}`}
              type="text"
              placeholder="Comma-separated, e.g. chicken, rice, broccoli"
              value={Array.isArray(v) ? v.join(", ") : ""}
              onChange={(e) => {
                const parts = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateField(field, parts);
              }}
              className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
              aria-label={labels[field]}
            />
            {errorMsg}
          </div>
        );
      }

      // — cuisine style —
      case "cuisineStyle":
        return (
          <div key={field}>
            <label
              htmlFor="edit-cuisineStyle"
              className="mb-1 block text-label-caps text-on-surface-variant"
            >
              Cuisine Style
            </label>
            <input
              id="edit-cuisineStyle"
              type="text"
              placeholder="e.g. Mediterranean, Asian, Italian"
              value={(v as string) ?? ""}
              onChange={(e) => updateField("cuisineStyle", e.target.value)}
              className="w-full border-b border-glass-border bg-transparent py-2 text-body-md text-on-surface outline-none transition-colors focus:border-secondary-container"
              aria-label="Preferred cuisine style"
            />
            {errorMsg}
          </div>
        );

      default:
        return null;
    }
  };

  // ——— Render function for a section ———
  const renderSection = (section: EditableSection) => {
    const isEditing = editingSection === section.id;
    const isSaving = savingSection === section.id;
    const hasFailed = failedSection === section.id;

    return (
      <div
        key={section.id}
        className={`rounded-card bg-surface-container-low border p-5 transition-all ${
          isEditing
            ? "border-primary-container"
            : "border-glass-border"
        }`}
      >
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-heading-sm text-on-surface">
            {section.label}
          </h2>
          {!isEditing && !hasFailed && (
            <button
              type="button"
              onClick={() => startEdit(section.id)}
              className="rounded-md px-3 py-1.5 text-label-caps text-primary-container transition-colors hover:bg-primary-container/10"
              aria-label={`Edit ${section.label}`}
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          // Edit mode
          <div className="flex flex-col gap-4">
            {section.fields.map((field) => renderEditField(field))}

            {/* Action buttons */}
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => saveSection(section)}
                disabled={isSaving}
                className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-body-sm font-semibold transition-all ${
                  isSaving
                    ? "cursor-not-allowed bg-surface-container-high text-muted-foreground"
                    : "bg-primary-container text-on-primary hover:brightness-110"
                }`}
                aria-label={isSaving ? "Saving..." : "Save changes"}
              >
                {isSaving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => cancelEdit(section)}
                disabled={isSaving}
                className="rounded-md border border-glass-border px-5 py-2.5 text-body-sm text-on-surface transition-colors hover:bg-surface-container-high"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>

            {/* Retry after failure */}
            {hasFailed && !isSaving && (
              <button
                type="button"
                onClick={() => saveSection(section)}
                className="mt-1 self-start rounded-md border border-error/50 px-4 py-1.5 text-label-caps text-error transition-colors hover:bg-error/10"
                aria-label="Retry save"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          // Read mode — show values
          <div className="flex flex-col gap-2.5">
            {section.fields.map((field) => (
              <div key={field} className="flex items-start justify-between gap-2">
                <span className="text-label-caps text-on-surface-variant">
                  {fieldLabel(field)}
                </span>
                <span
                  className={`text-right text-body-sm ${
                    renderReadValue(field) === "Not set"
                      ? "text-muted-foreground italic"
                      : "text-on-surface"
                  }`}
                >
                  {renderReadValue(field)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Retry banner for failed section (in read mode) */}
        {hasFailed && !isEditing && (
          <div className="mt-3 flex items-center justify-between rounded border border-error/30 bg-error/10 px-3 py-2">
            <span className="text-body-xs text-error">
              Save failed
            </span>
            <button
              type="button"
              onClick={() => startEdit(section.id)}
              className="rounded border border-error/50 px-3 py-1 text-label-caps text-error hover:bg-error/10"
              aria-label="Retry editing this section"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {SECTIONS.map(renderSection)}
      </div>

      {/* Goal-change regeneration prompt */}
      <AnimatePresence>
        {showRegenPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-5 pb-16"
            role="dialog"
            aria-modal="true"
            aria-label="Plan regeneration prompt"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md rounded-t-2xl bg-surface p-6"
            >
              <h3 className="mb-2 font-heading text-heading-sm text-on-surface">
                Goals updated
              </h3>
              <p className="mb-6 text-body-md text-muted-foreground">
                Your goals have changed — would you like to regenerate your
                weekly plan?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="w-full rounded-md bg-primary-container py-3 text-center text-body-md font-semibold text-on-primary transition-all hover:brightness-110"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleKeepPlan}
                  className="w-full rounded-md border border-glass-border py-3 text-center text-body-md text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Keep current plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ——— Helpers ———

function fieldLabel(field: keyof UserProfile): string {
  const labels: Partial<Record<keyof UserProfile, string>> = {
    weightKg: "Weight",
    goal: "Goal",
    caloricTarget: "Caloric Target",
    proteinTarget: "Protein Target",
    equipment: "Equipment",
    preferredSplit: "Training Split",
    sessionDuration: "Session Duration",
    trainingDays: "Training Days",
    preferredIngredients: "Preferred Ingredients",
    excludedIngredients: "Excluded Ingredients",
    cuisineStyle: "Cuisine Style",
  };
  return labels[field] ?? field;
}