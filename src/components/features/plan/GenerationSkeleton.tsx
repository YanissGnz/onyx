/**
 * GenerationSkeleton — Skeleton loading component for AI plan generation.
 *
 * Displays 3 pulsing skeleton cards with shimmer effect, "Generating your plan..."
 * text with Ice Blue accent dot indicator, and a Cancel button.
 *
 * Implements AC #3 from story 3.2.
 *
 * @see Story 3.2 (_bmad-output/implementation-artifacts/3-2-vibe-drawer.md)
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Color tokens from DESIGN.md (ONYX design system)
// ---------------------------------------------------------------------------

/** Ice Blue accent — loading indicator dot. */
const ICE_BLUE = "#00eefc";

/** Electric Lime — accent dot pulse color. */
const ELECTRIC_LIME = "#c3f400";

/** Surface container-low — skeleton card background. */
const SURFACE_LOW = "#1c1b1b";

/** Glass border — subtle edge highlight. */
const GLASS_BORDER = "rgba(255, 255, 255, 0.08)";

// ---------------------------------------------------------------------------
// SkeletonCard component
// ---------------------------------------------------------------------------

/**
 * A single skeleton card with shimmer animation.
 *
 * @param index - Card index for staggered animation timing
 */
function SkeletonCard({ index }: { index: number }) {
  const prefersReducedMotion = useReducedMotion();

  /** Shimmer animation keyframes for the overlay. */
  const shimmerKeyframes = prefersReducedMotion
    ? { opacity: [0.3, 0.5, 0.3] }
    : { opacity: [0.3, 0.5, 0.3] };

  return (
    <div
      className="relative overflow-hidden rounded-xl border"
      style={{
        borderColor: GLASS_BORDER,
        backgroundColor: SURFACE_LOW,
        minHeight: "80px",
      }}
      aria-hidden="true"
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        animate={shimmerKeyframes}
        transition={{
          duration: 2,
          ease: "easeInOut",
          delay: index * 0.3,
          repeat: Infinity,
        }}
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`,
        }}
      />

      {/* Skeleton content placeholders */}
      <div className="px-4 py-3 space-y-2">
        {/* Title bar */}
        <motion.div
          className="h-3 w-2/5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 2,
            delay: index * 0.3,
            repeat: Infinity,
          }}
        />
        {/* Body bars */}
        <div className="space-y-1.5">
          <motion.div
            className="h-2 w-full rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 2,
              delay: index * 0.3 + 0.1,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="h-2 w-4/5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 2,
              delay: index * 0.3 + 0.2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="h-2 w-3/5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 2,
              delay: index * 0.3 + 0.3,
              repeat: Infinity,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenerationSkeleton component
// ---------------------------------------------------------------------------

export interface GenerationSkeletonProps {
  /** Whether to show the Cancel button. */
  onCancel?: () => void;
  /** Whether the accent dot should pulse. */
  accentColor?: string;
}

/**
 * GenerationSkeleton component implementation.
 *
 * Key implementation details:
 * - 3 skeleton cards with staggered pulsing animation (Framer Motion)
 * - Each card: dark surface (`#1c1b1b`), rounded-xl, shimmer effect
 * - Text below cards: "Generating your plan..." with Ice Blue accent dot indicator
 * - Subtle pulse animation on the accent dot (Electric Lime or Ice Blue)
 * - Cancel button in header (glass style, top-right)
 * - `prefers-reduced-motion: no-preference` guard on all animations via useReducedMotion
 *
 * @param onCancel - Optional callback when Cancel is clicked
 * @param accentColor - Optional accent color for the pulsing dot
 * @returns The GenerationSkeleton component
 */
export default function GenerationSkeleton({
  onCancel,
  accentColor = ICE_BLUE,
}: GenerationSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [dotOpacity, setDotOpacity] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse the accent dot (only if reduced motion is not preferred)
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setDotOpacity((prev) => (prev === 1 ? 0.3 : 1));
    }, 600);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 py-6">
      {/* Cancel button (top-right) */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border bg-black/40 text-sm backdrop-blur-md transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-[${ICE_BLUE}]"
          style={{ borderColor: GLASS_BORDER }}
          aria-label="Cancel generation"
        >
          <X className="h-4 w-4" style={{ color: "var(--on-surface-variant, #c4c9ac)" }} />
        </button>
      )}

      {/* Skeleton cards */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>

      {/* Generating text with accent dot */}
      <div className="flex items-center gap-2">
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
        <span
          className="font-inter text-sm font-medium"
          style={{ color: "var(--on-surface-variant, #c4c9ac)" }}
        >
          Generating your plan...
        </span>
      </div>
    </div>
  );
}