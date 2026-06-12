"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

export default function InstallPrompt() {
  const { showPrompt, install, dismiss } = useInstallPrompt();
  const containerRef = useRef<HTMLDivElement>(null);
  const installBtnRef = useRef<HTMLButtonElement>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !containerRef.current) return;

    const focusable = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex="0"], a[href]'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!showPrompt) return;
    document.addEventListener("keydown", trapFocus);
    installBtnRef.current?.focus();
    return () => document.removeEventListener("keydown", trapFocus);
  }, [showPrompt, trapFocus]);

  if (!showPrompt) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install ONYX"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
    >
      <div
        ref={containerRef}
        className="glass-surface mx-4 mb-4 w-full max-w-sm rounded-lg p-6"
        onKeyDown={(e) => {
          if (e.key === "Escape") dismiss();
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-surface">
            <Image
              src="/icons/icon-192x192.png"
              alt="ONYX"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="onyx-headline-md mb-1 text-on-surface">Install ONYX</h2>
          <p className="onyx-body-md mb-6 text-on-surface-variant">
            Add ONYX to your home screen for the best experience
          </p>

          <div className="flex w-full flex-col gap-3">
            <button
              onClick={install}
              aria-label="Install ONYX application"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
              ref={installBtnRef}
            >
              Install
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-glass-border bg-transparent text-sm font-semibold text-on-surface transition-opacity hover:opacity-80"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}