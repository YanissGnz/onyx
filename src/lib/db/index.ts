// IndexedDB database initialization and CRUD helpers for the offline sync layer
// Uses the `idb` library (Jake Archibald's localDB pattern)

"use client";

import { openDB, type IDBPDatabase } from "idb";
import type {
  MacroTotals,
  OfflineCachedPlan,
  OfflineMealLog,
  OfflineWeightLog,
  OfflineWorkoutSession,
  SyncQueueItem,
} from "./types";
import { ONYX_IDB_SCHEMA, STORE_NAMES } from "./types";

// ─── Database singleton ────────────────────────────────────────────────────────

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(ONYX_IDB_SCHEMA.name, ONYX_IDB_SCHEMA.version, {
    upgrade(db) {
      for (const [storeName, storeDef] of Object.entries(
        ONYX_IDB_SCHEMA.stores
      )) {
        if (db.objectStoreNames.contains(storeName)) continue;
        const store = db.createObjectStore(storeName, {
          keyPath: storeDef.keyPath,
          autoIncrement: storeDef.autoIncrement ?? false,
        });
        for (const idx of storeDef.indexes) {
          store.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
        }
      }
    },
  });
  return _db;
}

// ─── Workout Sessions ──────────────────────────────────────────────────────────

export async function dbSaveWorkoutSession(session: OfflineWorkoutSession): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAMES.WORKOUT_SESSIONS, session);
}

export async function dbGetWorkoutSession(id: string): Promise<OfflineWorkoutSession | null> {
  const db = await getDB();
  return db.get(STORE_NAMES.WORKOUT_SESSIONS, id);
}

export async function dbGetWorkoutSessionsByDate(
  userId: string,
  date: string
): Promise<OfflineWorkoutSession[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.WORKOUT_SESSIONS, "readonly");
  const sessions = await tx.store.index("user_id").getAll(userId);
  await tx.done;
  return sessions.filter((s) => s.date === date);
}

export async function dbGetPendingWorkouts(): Promise<OfflineWorkoutSession[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.WORKOUT_SESSIONS, "readonly");
  const index = tx.store.index("synced");
  const result = await index.getAll(IDBKeyRange.only(false));
  await tx.done;
  return result;
}

export async function dbDeleteWorkoutSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAMES.WORKOUT_SESSIONS, id);
}

// ─── Meal Logs ─────────────────────────────────────────────────────────────────

export async function dbSaveMealLog(meal: OfflineMealLog): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAMES.MEAL_LOGS, meal);
}

export async function dbGetMealLog(id: string): Promise<OfflineMealLog | null> {
  const db = await getDB();
  return db.get(STORE_NAMES.MEAL_LOGS, id);
}

export async function dbGetMealLogsByDate(
  userId: string,
  date: string
): Promise<OfflineMealLog[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.MEAL_LOGS, "readonly");
  const meals = await tx.store.index("user_id").getAll(userId);
  await tx.done;
  return meals.filter((m) => m.date === date);
}

export async function dbGetPendingMeals(): Promise<OfflineMealLog[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.MEAL_LOGS, "readonly");
  const index = tx.store.index("synced");
  const result = await index.getAll(IDBKeyRange.only(false));
  await tx.done;
  return result;
}

export async function dbDeleteMealLog(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAMES.MEAL_LOGS, id);
}

// ─── Weight Logs ───────────────────────────────────────────────────────────────

export async function dbSaveWeightLog(log: OfflineWeightLog): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAMES.WEIGHT_LOGS, log);
}

export async function dbGetWeightLog(id: string): Promise<OfflineWeightLog | null> {
  const db = await getDB();
  return db.get(STORE_NAMES.WEIGHT_LOGS, id);
}

export async function dbGetWeightLogsByDate(
  userId: string,
  date: string
): Promise<OfflineWeightLog[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.WEIGHT_LOGS, "readonly");
  const logs = await tx.store.index("user_id").getAll(userId);
  await tx.done;
  return logs.filter((l) => l.date === date);
}

export async function dbGetPendingWeights(): Promise<OfflineWeightLog[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.WEIGHT_LOGS, "readonly");
  const index = tx.store.index("synced");
  const result = await index.getAll(IDBKeyRange.only(false));
  await tx.done;
  return result;
}

export async function dbDeleteWeightLog(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAMES.WEIGHT_LOGS, id);
}

// ─── Cached Plans ──────────────────────────────────────────────────────────────

export async function dbSaveCachedPlan(plan: OfflineCachedPlan): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAMES.CACHED_PLANS, plan);
}

export async function dbGetCachedPlan(id: string): Promise<OfflineCachedPlan | null> {
  const db = await getDB();
  return db.get(STORE_NAMES.CACHED_PLANS, id);
}

export async function dbGetCachedPlansByWeek(
  userId: string,
  type: "workout_plan" | "meal_plan"
): Promise<OfflineCachedPlan[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.CACHED_PLANS, "readonly");
  const plans = await tx.store.index("type").getAll(type);
  await tx.done;
  return plans.filter((p) => p.user_id === userId);
}

export async function dbDeleteCachedPlan(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAMES.CACHED_PLANS, id);
}

// ─── Sync Queue ────────────────────────────────────────────────────────────────

export async function dbEnqueueSyncItem(item: Omit<SyncQueueItem, "id">): Promise<SyncQueueItem> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const queueItem: SyncQueueItem = {
    ...item,
    id,
    retry_count: 0,
    max_retries: 3,
    last_error: null,
  };
  await db.add(STORE_NAMES.SYNC_QUEUE, queueItem);
  return queueItem;
}

export async function dbGetPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.SYNC_QUEUE, "readonly");
  const index = tx.store.index("retry_count");
  const items = await index.getAll(IDBKeyRange.only(0));
  await tx.done;
  // Sort by created_at ascending for FIFO processing
  return items.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function dbRemoveFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAMES.SYNC_QUEUE, id);
}

export async function dbUpdateSyncItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await getDB();
  const item = await db.get(STORE_NAMES.SYNC_QUEUE, id);
  if (item) {
    await db.put(STORE_NAMES.SYNC_QUEUE, { ...item, ...updates });
  }
}

// ─── Cache Eviction ────────────────────────────────────────────────────────────

/**
 * Evict completed workout sessions older than the given number of days.
 * Returns the number of items evicted.
 */
export async function dbEvictOldWorkouts(daysOld: number): Promise<number> {
  const db = await getDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  const cutoffISO = cutoff.toISOString();

  const tx = db.transaction(STORE_NAMES.WORKOUT_SESSIONS, "readwrite");
  const store = tx.store;
  const index = store.index("date");

  const allSessions = await index.getAll();
  let evicted = 0;

  for (const session of allSessions) {
    if (session.synced === true && session.updated_at < cutoffISO) {
      await store.delete(session.id);
      evicted++;
    }
  }

  await tx.done;
  return evicted;
}

// ─── Bulk Operations ───────────────────────────────────────────────────────────

/**
 * Get all pending (unsynced) entities across all stores.
 */
export async function dbGetAllPending(): Promise<{
  workouts: OfflineWorkoutSession[];
  meals: OfflineMealLog[];
  weights: OfflineWeightLog[];
}> {
  const db = await getDB();
  const tx = db.transaction(
    [STORE_NAMES.WORKOUT_SESSIONS, STORE_NAMES.MEAL_LOGS, STORE_NAMES.WEIGHT_LOGS],
    "readonly"
  );

  const workoutIndex = tx.objectStore(STORE_NAMES.WORKOUT_SESSIONS).index("synced");
  const mealIndex = tx.objectStore(STORE_NAMES.MEAL_LOGS).index("synced");
  const weightIndex = tx.objectStore(STORE_NAMES.WEIGHT_LOGS).index("synced");

  const [workouts, meals, weights] = await Promise.all([
    workoutIndex.getAll(IDBKeyRange.only(false)),
    mealIndex.getAll(IDBKeyRange.only(false)),
    weightIndex.getAll(IDBKeyRange.only(false)),
  ]);

  await tx.done;

  return { workouts, meals, weights };
}

/**
 * Mark all pending entities as synced.
 */
export async function dbMarkAllAsSynced(): Promise<void> {
  const db = await getDB();

  // Mark workouts as synced
  {
    const tx = db.transaction([STORE_NAMES.WORKOUT_SESSIONS], "readwrite");
    const store = tx.objectStore(STORE_NAMES.WORKOUT_SESSIONS);
    const pending = await store.index("synced").getAll(IDBKeyRange.only(false));
    for (const entry of pending) {
      entry.synced = true;
      await store.put(entry);
    }
    await tx.done;
  }

  // Mark meals as synced
  {
    const tx = db.transaction([STORE_NAMES.MEAL_LOGS], "readwrite");
    const store = tx.objectStore(STORE_NAMES.MEAL_LOGS);
    const pending = await store.index("synced").getAll(IDBKeyRange.only(false));
    for (const entry of pending) {
      entry.synced = true;
      await store.put(entry);
    }
    await tx.done;
  }

  // Mark weights as synced
  {
    const tx = db.transaction([STORE_NAMES.WEIGHT_LOGS], "readwrite");
    const store = tx.objectStore(STORE_NAMES.WEIGHT_LOGS);
    const pending = await store.index("synced").getAll(IDBKeyRange.only(false));
    for (const entry of pending) {
      entry.synced = true;
      await store.put(entry);
    }
    await tx.done;
  }
}

// ─── Export for external use ───────────────────────────────────────────────────

export { getDB, ONYX_IDB_SCHEMA, STORE_NAMES };
export type {
  MacroTotals, OfflineCachedPlan, OfflineMealLog,
  OfflineWeightLog, OfflineWorkoutSession, SyncQueueItem
};

