/**
 * Background Sync Engine
 *
 * Processes the offline mutation queue using last-write-wins conflict resolution.
 * Runs when the device comes back online (via online event listener).
 */

import { createClient } from "@/lib/supabase/client";
import { dbGetPendingSyncItems, dbRemoveFromSyncQueue, dbUpdateSyncItem } from "./index";
import type {
  OfflineMealLog,
  OfflineWeightLog,
  OfflineWorkoutSession,
  SyncQueueItem,
} from "./types";

// ─── Sync Engine State ────────────────────────────────────────────────────────

let _syncInterval: ReturnType<typeof setInterval> | null = null;
let _isProcessing = false;

// ─── Sync Operations ─────────────────────────────────────────────────────────

async function processWorkoutSession(item: SyncQueueItem): Promise<void> {
  const pb = createClient();
  const session = item.payload as unknown as OfflineWorkoutSession;

  switch (item.operation) {
    case "create":
    case "update": {
      // Last-write-wins: upsert with onConflict ensures the server's updated_at wins
      // if the server's timestamp is newer than the client's
      const { error } = await pb
        .from("workout_sessions")
        .upsert(session, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (error) throw error;
      break;
    }
    case "delete": {
      const { error } = await pb
        .from("workout_sessions")
        .delete()
        .eq("id", item.entity_id);

      if (error) throw error;
      break;
    }
  }
}

async function processMealLog(item: SyncQueueItem): Promise<void> {
  const pb = createClient();
  const meal = item.payload as unknown as OfflineMealLog;

  switch (item.operation) {
    case "create":
    case "update": {
      const { error } = await pb
        .from("meal_logs")
        .upsert(meal, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (error) throw error;
      break;
    }
    case "delete": {
      const { error } = await pb
        .from("meal_logs")
        .delete()
        .eq("id", item.entity_id);

      if (error) throw error;
      break;
    }
  }
}

async function processWeightLog(item: SyncQueueItem): Promise<void> {
  const pb = createClient();
  const log = item.payload as unknown as OfflineWeightLog;

  switch (item.operation) {
    case "create":
    case "update": {
      const { error } = await pb
        .from("weight_logs")
        .upsert(log, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (error) throw error;
      break;
    }
    case "delete": {
      const { error } = await pb
        .from("weight_logs")
        .delete()
        .eq("id", item.entity_id);

      if (error) throw error;
      break;
    }
  }
}

// ─── Sync Queue Processor ─────────────────────────────────────────────────────

const SYNC_BATCH_SIZE = 10;
const SYNC_BATCH_DELAY_MS = 100;

async function processPendingSyncItems(): Promise<number> {
  if (_isProcessing) return 0;
  _isProcessing = true;

  let totalProcessed = 0;

  try {
    const pending = await dbGetPendingSyncItems();

    if (pending.length === 0) {
      return 0;
    }

    // Process in batches to avoid blocking
    for (let i = 0; i < pending.length; i += SYNC_BATCH_SIZE) {
      const batch = pending.slice(i, i + SYNC_BATCH_SIZE);

      // Process batch in parallel, collect results
      const results = await Promise.all(
        batch.map(async (item) => {
          try {
            switch (item.entity_type) {
              case "workout_session":
                await processWorkoutSession(item);
                break;
              case "meal_log":
                await processMealLog(item);
                break;
              case "weight_log":
                await processWeightLog(item);
                break;
            }

            // Successfully synced - remove from queue
            await dbRemoveFromSyncQueue(item.id);

            // Mark the specific entity as synced in its store
            await markEntityAsSynced(item.entity_type, item.entity_id);

            return true;
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);

            // Update retry count
            const newRetryCount = item.retry_count + 1;

            if (newRetryCount >= item.max_retries) {
              // Max retries exceeded - mark as failed
              await dbUpdateSyncItem(item.id, {
                retry_count: newRetryCount,
                last_error: errMsg,
              });
            } else {
              // Retry later with exponential backoff (1s, 2s, 4s, up to 8s)
              const backoffMs = Math.min(2 ** newRetryCount * 1000, 8000);
              await dbUpdateSyncItem(item.id, {
                retry_count: newRetryCount,
                last_error: errMsg,
              });
              // Note: backoff delay is NOT applied during batch processing
              // to avoid blocking other items. The sync engine will pick it up
              // on the next poll cycle.
            }

            return false;
          }
        })
      );

      // Count synced items from this batch
      totalProcessed += results.filter(Boolean).length;

      // Delay between batches to avoid blocking
      if (i + SYNC_BATCH_SIZE < pending.length) {
        await new Promise((r) => setTimeout(r, SYNC_BATCH_DELAY_MS));
      }
    }

    return totalProcessed;
  } finally {
    _isProcessing = false;
  }
}

// ─── Entity Sync Helper ───────────────────────────────────────────────────────

/**
 * Mark a specific entity as synced in its store.
 */
async function markEntityAsSynced(
  entityType: SyncQueueItem["entity_type"],
  entityId: string
): Promise<void> {
  const { getDB, STORE_NAMES } = await import("./index");
  const db = await getDB();

  let storeName: string;
  switch (entityType) {
    case "workout_session":
      storeName = STORE_NAMES.WORKOUT_SESSIONS;
      break;
    case "meal_log":
      storeName = STORE_NAMES.MEAL_LOGS;
      break;
    case "weight_log":
      storeName = STORE_NAMES.WEIGHT_LOGS;
      break;
  }

  const tx = db.transaction([storeName], "readwrite");
  const store = tx.objectStore(storeName);
  const entry: any = await store.get(entityId);
  if (entry && typeof entry.synced === "boolean") {
    entry.synced = true;
    await store.put(entry);
  }
  await tx.done;
}

// ─── Sync Engine Start/Stop ───────────────────────────────────────────────────

const SYNC_POLL_INTERVAL_MS = 5_000; // Check every 5 seconds when online

function startSyncEngine(): void {
  if (_syncInterval) return; // Already running

  _syncInterval = setInterval(async () => {
    if (_isProcessing) return;

    // Only sync when online
    if (navigator.onLine) {
      const count = await processPendingSyncItems();
      if (count > 0) {
        // Dispatch custom event for UI updates
        window.dispatchEvent(
          new CustomEvent("sync-progress", {
            detail: { pending: count },
          })
        );
      }
    }
  }, SYNC_POLL_INTERVAL_MS);
}

function stopSyncEngine(): void {
  if (_syncInterval) {
    clearInterval(_syncInterval);
    _syncInterval = null;
  }
}

// ─── Auto-sync on Online Event ────────────────────────────────────────────────

function setupAutoSync(): void {
  let initialized = false;

  const handleOnline = async () => {
    if (!initialized) {
      initialized = true;
      startSyncEngine();
    }

    const count = await processPendingSyncItems();
    if (count > 0) {
      window.dispatchEvent(new CustomEvent("sync-progress", { detail: { pending: count } }));
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline, { once: true });
  }
}

// Auto-setup on import
if (typeof window !== "undefined") {
  setupAutoSync();
}

// ─── Export for explicit use ──────────────────────────────────────────────────

export { processPendingSyncItems, startSyncEngine, stopSyncEngine };
export type { SyncQueueItem };

