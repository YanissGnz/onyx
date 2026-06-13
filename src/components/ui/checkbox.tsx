"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";

const CheckboxContext = React.createContext<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
} | null>(null);

function useCheckbox() {
  const context = React.useContext(CheckboxContext);
  if (!context) {
    throw new Error("Checkbox component must be used within a Checkbox.Root");
  }
  return context;
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface CheckboxRootProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

function CheckboxRoot({ checked, onCheckedChange, children, className }: CheckboxRootProps) {
  return (
    <CheckboxContext.Provider value={{ checked, onCheckedChange }}>
      <div className={`${className || ""}`}>{children}</div>
    </CheckboxContext.Provider>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

interface CheckboxIndicatorProps {
  className?: string;
}

function CheckboxIndicator({ className }: CheckboxIndicatorProps) {
  const { checked } = useCheckbox();
  if (!checked) return null;

  return <CheckIcon className={`h-4 w-4 text-black ${className || ""}`} />;
}

// ── Label ─────────────────────────────────────────────────────────────────────

interface CheckboxLabelProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function CheckboxLabel({ children, className, onClick }: CheckboxLabelProps) {
  const { checked, onCheckedChange } = useCheckbox();

  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
        checked
          ? "border-[#c3f400] bg-[#c3f400]/10 text-white"
          : "border-[rgba(255,255,255,0.1)] bg-transparent text-[#c4c9ac] hover:border-[rgba(255,255,255,0.2)] hover:text-white"
      } ${className || ""}`}
      style={{
        backgroundColor: checked ? "rgba(195, 244, 0, 0.1)" : "transparent",
      }}
      aria-pressed={checked}
    >
      <div
        className="flex h-4 w-4 items-center justify-center rounded border transition-colors"
        style={{
          backgroundColor: checked ? "#c3f400" : "transparent",
          borderColor: checked ? "#c3f400" : "rgba(255, 255, 255, 0.3)",
        }}
      >
        {checked && <CheckIcon className="h-3 w-3 text-black" />}
      </div>
      <span>{children}</span>
    </button>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
});

export { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxRoot, useCheckbox };
