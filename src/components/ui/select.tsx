"use client";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select component must be used within a Select.Root");
  }
  return context;
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface SelectRootProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function SelectRoot({ value, onValueChange, children, className }: SelectRootProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className={`relative ${className || ""}`}>{children}</div>
    </SelectContext.Provider>
  );
}

// ── Trigger ───────────────────────────────────────────────────────────────────

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function SelectTrigger({ children, className, placeholder }: SelectTriggerProps) {
  const { value, onValueChange } = useSelect();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);

  const displayedValue = value || placeholder || "Select...";

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#c3f400] ${
          open ? "border-[#c3f400]" : ""
        } ${className || ""}`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "#e5e2e1",
        }}
        aria-expanded={open}
      >
        {children ? (
          children
        ) : (
          <span className="text-[rgba(196,201,172,0.5)]">{displayedValue}</span>
        )}
        {open ? (
          <ChevronUpIcon className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        )}
      </button>

      {open && (
        <SelectPortal>
          <SelectContent position="popper" side="bottom" sideOffset={4}>
            <SelectViewport>{children}</SelectViewport>
          </SelectContent>
        </SelectPortal>
      )}
    </>
  );
}

// ── Portal (simple absolute positioning fallback) ─────────────────────────────

function SelectPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ── Content ───────────────────────────────────────────────────────────────────

interface SelectContentProps {
  children: React.ReactNode;
  position?: "popper" | "item-aligned";
  side?: "top" | "bottom";
  sideOffset?: number;
  className?: string;
}

function SelectContent({ children, position, side, sideOffset, className }: SelectContentProps) {
  return (
    <div
      className={`z-[100] overflow-hidden rounded-lg border shadow-lg ${className || ""}`}
      style={{
        backgroundColor: "#1c1b1b",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: "1px",
        position: "absolute",
        top: side === "top" ? `calc(100% - ${sideOffset || 0}px)` : undefined,
        marginTop: side === "top" ? `-${sideOffset || 0}px` : undefined,
        bottom: side === "bottom" ? `calc(100% + ${sideOffset || 0}px)` : undefined,
        minWidth: "100%",
      }}
    >
      {children}
    </div>
  );
}

// ── Viewport ──────────────────────────────────────────────────────────────────

function SelectViewport({ children }: { children: React.ReactNode }) {
  return <div className="p-1">{children}</div>;
}

// ── Item ──────────────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelect();
  const isSelected = selectedValue === value;
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus:outline-none ${
        isSelected
          ? "bg-white/10 text-white"
          : "text-[#c4c9ac] hover:bg-white/5 hover:text-white"
      } ${className || ""}`}
    >
      {isSelected && <CheckIcon className="h-4 w-4 text-[#c3f400]" />}
      <span className={isSelected ? "ml-4" : ""}>{children}</span>
    </button>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────

function SelectSeparator({ className }: { className?: string }) {
  return (
    <div
      className={`my-1 h-px bg-[rgba(255,255,255,0.08)] ${className || ""}`}
      aria-hidden="true"
    />
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────

function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`px-3 py-2 text-xs font-semibold text-[#c4c9ac] ${className || ""}`}
      role="presentation"
    >
      {children}
    </div>
  );
}

// ── Group ─────────────────────────────────────────────────────────────────────

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div role="group">{children}</div>;
}

// ── Value ─────────────────────────────────────────────────────────────────────

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useSelect();
  if (!value) {
    return <span className={`text-[rgba(196,201,172,0.5)] ${className || ""}`}>{placeholder}</span>;
  }
  return <span className={className || ""}>{value}</span>;
}

// ── Export components ─────────────────────────────────────────────────────────

const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  Separator: SelectSeparator,
  Label: SelectLabel,
  Group: SelectGroup,
  Value: SelectValue,
});

export {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectRoot, SelectSeparator, SelectTrigger, SelectValue, SelectViewport, useSelect
};
