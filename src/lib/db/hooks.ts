/**
 * React hooks for the offline sync layer
 *
 * Provides:
 * - useOnlineStatus: tracks navigator.onLine state
 * - useStoragePressure: monitors IndexedDB storage quota
 * - useSyncStatus: tracks sync queue pending items
 */

import { useCallback, useEffect, useState } from "react";

// ─── useOnlineStatus ──────────────────────────────────────────────────────────

/**
 * Returns the current online/offline status.
 * Listens to navigator.onLine and online/offline window events.
 */
export function useOnlineStatus(): {
  isOnline: boolean;
  isOffline: boolean;
  lastChangedAt: Date | null;
} {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChangedAt, setLastChangedAt] = useState<Date | null>(null);

  useEffect(() => {
    // Initial state
    const initial = navigator.onLine;
    setIsOnline(initial);

    const handleOnline = () => {
      setIsOnline(true);
      setLastChangedAt(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChangedAt(new Date());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastChangedAt,
  };
}

// ─── useStoragePressure ───────────────────────────────────────────────────────

/**
 * Monitors IndexedDB storage pressure and returns the current usage percentage.
 * Returns null if the quota is unavailable (e.g., Firefox private browsing).
 */
export function useStoragePressure(): {
  usageBytes: number | null;
  quotaBytes: number | null;
  usagePercent: number | null;
  isNearQuota: boolean;
} {
  const [state, setState] = useState({
    usageBytes: 0 as number | null,
    quotaBytes: 0 as number | null,
    usagePercent: 0 as number | null,
    isNearQuota: false,
  });

  useEffect(() => {
    // Only run in browsers with storage API support
    if (!("storage" in navigator && "estimate" in navigator.storage)) {
      return;
    }

    const estimate = async () => {
      try {
        const { quota = 0, usage = 0 } = await navigator.storage.estimate();
        const percent = quota > 0 ? (usage / quota) * 100 : 0;

        setState({
          usageBytes: usage,
          quotaBytes: quota,
          usagePercent: Math.round(percent * 100) / 100, // Round to 2 decimal places
          isNearQuota: percent > 85,
        });
      } catch {
        // Ignore errors (e.g., private browsing)
      }
    };

    // Initial estimate
    estimate();

    // Re-estimate periodically (every 30s)
    const interval = setInterval(estimate, 30_000);

    // Re-estimate on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        estimate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return state;
}

// ─── useSyncStatus ────────────────────────────────────────────────────────────

/**
 * Returns the current sync queue pending count and a function to refresh it.
 * Uses a custom event for real-time updates from the sync engine.
 */
export function useSyncStatus(): {
  pendingCount: number;
  hasPending: boolean;
  refresh: () => Promise<void>;
} {
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refresh = useCallback(async () => {
    // Import dynamically to avoid SSR issues
    const { dbGetPendingSyncItems } = await import("./index");
    try {
      const items = await dbGetPendingSyncItems();
      setPendingCount(items.length);
    } catch {
      // Ignore errors (e.g., DB not available)
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Listen for sync-progress events from the sync engine
    const handleSyncProgress = (e: Event) => {
      const detail = (e as CustomEvent).detail as { pending: number } | undefined;
      if (detail && typeof detail.pending === "number") {
        setPendingCount(detail.pending);
      }
    };

    window.addEventListener("sync-progress", handleSyncProgress);

    // Also listen for online/offline events
    const handleOnline = () => {
      refresh();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("sync-progress", handleSyncProgress);
      window.removeEventListener("online", handleOnline);
    };
  }, [refresh]);

  return {
    pendingCount,
    hasPending: pendingCount > 0,
    refresh,
  };
}

// ─── useOfflineCacheStatus ────────────────────────────────────────────────────

/**
 * Returns the count of pending items per entity type.
 */
export function useOfflineCacheStatus(): {
  workoutsPending: number;
  mealsPending: number;
  weightsPending: number;
  totalPending: number;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState({
    workoutsPending: 0,
    mealsPending: 0,
    weightsPending: 0,
    totalPending: 0,
  });

  const refresh = useCallback(async () => {
    const { dbGetPendingSyncItems } = await import("./index");
    try {
      const items = await dbGetPendingSyncItems();
      const workouts = items.filter((i) => i.entity_type === "workout_session").length;
      const meals = items.filter((i) => i.entity_type === "meal_log").length;
      const weights = items.filter((i) => i.entity_type === "weight_log").length;

      setState({
        workoutsPending: workouts,
        mealsPending: meals,
        weightsPending: weights,
        totalPending: workouts + meals + weights,
      });
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleSyncProgress = () => {
      refresh();
    };

    window.addEventListener("sync-progress", handleSyncProgress);

    return () => {
      window.removeEventListener("sync-progress", handleSyncProgress);
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}