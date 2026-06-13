/**
 * DashboardShell — Client-side wrapper for the dashboard layout.
 *
 * This component wraps all dashboard pages with the AIPlanDrawerProvider,
 * InstallPrompt, and BottomNav components.
 */

"use client";

import { AIPlanDrawerContent } from "@/components/features/plan/AIPlanDrawerContent";
import InstallPrompt from "@/components/features/pwa/InstallPrompt";
import BottomNav from "@/components/features/shared/BottomNav";
import { AIPlanDrawerProvider } from "@/hooks/useAIPlanDrawer";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AIPlanDrawerProvider>
      <div className="flex min-h-screen flex-col bg-surface">
        <InstallPrompt />
        <main className="flex-1 onyx-container pb-[calc(64px+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
      <AIPlanDrawerContent />
    </AIPlanDrawerProvider>
  );
}