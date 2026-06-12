"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      {Icon && (
        <Icon
          className="mb-3 h-10 w-10 text-on-surface-variant"
          strokeWidth={2}
        />
      )}
      <h2 className="onyx-headline-md text-on-surface">
        {title}
      </h2>
      {description && (
        <p className="mt-1 onyx-body-md text-on-surface-variant">
          {description}
        </p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="mt-4 inline-flex h-[48px] min-h-[48px] items-center rounded-lg border border-glass-border bg-transparent px-6 text-body-md text-on-surface hover:bg-surface-container-low"
              style={{ minHeight: "48px" }}
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 inline-flex h-[48px] min-h-[48px] items-center rounded-lg border border-glass-border bg-transparent px-6 text-body-md text-on-surface hover:bg-surface-container-low"
              style={{ minHeight: "48px" }}
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}