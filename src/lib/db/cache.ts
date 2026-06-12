/**
 * Offline cache helpers for the dashboard
 *
 * Provides:
 * - Cache current week's workout plan to IndexedDB
 * - Cache current week's meal plan to IndexedDB
 * - Retrieve cached plans when offline
 */

import { dbGetCachedPlan, dbSaveCachedPlan } from "./index";
import type { OfflineCachedPlan } from "./types";

// ─── Cache Keys ────────────────────────────────────────────────────────────────

/**
 * Generate a consistent cache key for a given week type.
 */
export function getCacheKey(
  type: "workout_plan" | "meal_plan",
  weekStart: string
): string {
  return `${type}_${weekStart}`;
}

/**
 * Get the current week's Monday in ISO 8601 format (YYYY-MM-DD).
 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

/**
 * Get the current week identifier (YYYY-WW).
 */
export function getCurrentWeekIdentifier(): string {
  const now = new Date();
  const firstOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = ((now.getTime() - firstOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((pastDays + firstOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ─── Workout Plan Cache ────────────────────────────────────────────────────────

/**
 * Cache a workout plan for the current week.
 */
export async function cacheWorkoutPlan(
  userId: string,
  planData: unknown
): Promise<void> {
  const weekStart = getCurrentWeekMonday();
  const key = getCacheKey("workout_plan", weekStart);

  const plan: OfflineCachedPlan = {
    id: key,
    user_id: userId,
    type: "workout_plan",
    week_start: weekStart,
    data: planData,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await dbSaveCachedPlan(plan);
}

/**
 * Get a cached workout plan.
 */
export async function getCachedWorkoutPlan(
  userId: string,
  weekStart?: string
): Promise<OfflineCachedPlan | null> {
  const targetWeek = weekStart ?? getCurrentWeekMonday();
  const key = getCacheKey("workout_plan", targetWeek);
  return dbGetCachedPlan(key);
}

// ─── Meal Plan Cache ───────────────────────────────────────────────────────────

/**
 * Cache a meal plan for the current week.
 */
export async function cacheMealPlan(
  userId: string,
  planData: unknown
): Promise<void> {
  const weekStart = getCurrentWeekMonday();
  const key = getCacheKey("meal_plan", weekStart);

  const plan: OfflineCachedPlan = {
    id: key,
    user_id: userId,
    type: "meal_plan",
    week_start: weekStart,
    data: planData,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await dbSaveCachedPlan(plan);
}

/**
 * Get a cached meal plan.
 */
export async function getCachedMealPlan(
  userId: string,
  weekStart?: string
): Promise<OfflineCachedPlan | null> {
  const targetWeek = weekStart ?? getCurrentWeekMonday();
  const key = getCacheKey("meal_plan", targetWeek);
  return dbGetCachedPlan(key);
}

// ─── Cache Management ─────────────────────────────────────────────────────────

/**
 * Clear all cached plans for a user.
 */
export async function clearAllCache(userId: string): Promise<void> {
  const { getDB, STORE_NAMES } = await import("./index");
  const db = await getDB();

  const tx = db.transaction(STORE_NAMES.CACHED_PLANS, "readwrite");
  const store = tx.objectStore(STORE_NAMES.CACHED_PLANS);
  const userIndex = store.index("user_id");
  const userPlans = await userIndex.getAll(userId);

  for (const plan of userPlans) {
    await store.delete(plan.id);
  }

  await tx.done;
}

/**
 * Get total cache size in bytes.
 */
export async function getCacheSize(userId: string): Promise<number> {
  const { getDB, STORE_NAMES } = await import("./index");
  const db = await getDB();

  const tx = db.transaction(STORE_NAMES.CACHED_PLANS, "readonly");
  const userIndex = tx.objectStore(STORE_NAMES.CACHED_PLANS).index("user_id");
  const userPlans = await userIndex.getAll(userId);

  // Approximate size using JSON serialization
  let totalSize = 0;
  for (const plan of userPlans) {
    const serialized = JSON.stringify(plan);
    totalSize += new Blob([serialized]).size;
  }

  await tx.done;
  return totalSize;
}