// IndexedDB-specific type definitions for the offline sync layer

// ─── Workout Session ───────────────────────────────────────────────────────────

export interface OfflineWorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string | null;
  date: string; // ISO 8601
  exercises: OfflineExerciseSet[];
  duration_seconds: number;
  total_volume: number;
  status: "completed" | "partial" | "free-form";
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface OfflineExerciseSet {
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  distance: number | null;
  duration: number | null;
  distance_unit: string | null;
  duration_unit: string | null;
  note: string | null;
  completed: boolean;
}

// ─── Meal Log ──────────────────────────────────────────────────────────────────

export interface OfflineMealLog {
  id: string;
  user_id: string;
  meal_entry_id: string | null;
  meal_name: string;
  macros: MacroTotals;
  date: string;
  time_slot: "breakfast" | "lunch" | "dinner" | "snack" | "custom";
  custom_time: string | null;
  is_override: boolean;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

// ─── Weight Log ────────────────────────────────────────────────────────────────

export interface OfflineWeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

// ─── Cached Plan ───────────────────────────────────────────────────────────────

export interface OfflineCachedPlan {
  id: string; // "workout_week_{YYYY-WW}" or "meal_week_{YYYY-WW}"
  user_id: string;
  type: "workout_plan" | "meal_plan";
  week_start: string; // ISO 8601 Monday
  data: unknown;
  generated_at: string;
  updated_at: string;
}

// ─── Sync Queue Item ───────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  user_id: string;
  operation: "create" | "update" | "delete";
  entity_type: "workout_session" | "meal_log" | "weight_log";
  entity_id: string;
  payload: Record<string, unknown>;
  created_at: string;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
}

// ─── Shared Types ──────────────────────────────────────────────────────────────

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type EntityTypes = "workout_session" | "meal_log" | "weight_log";

export type OfflineEntity =
  | OfflineWorkoutSession
  | OfflineMealLog
  | OfflineWeightLog;

// ─── IDB Store Names ───────────────────────────────────────────────────────────

export const STORE_NAMES = {
  WORKOUT_SESSIONS: "workout_sessions",
  MEAL_LOGS: "meal_logs",
  WEIGHT_LOGS: "weight_logs",
  CACHED_PLANS: "cached_plans",
  SYNC_QUEUE: "sync_queue",
} as const;

// ─── IDB Schema Definition ─────────────────────────────────────────────────────

export interface IDBSchema {
  name: string;
  version: number;
  stores: Record<
    string,
    {
      keyPath: string;
      autoIncrement?: boolean;
      indexes: Array<{ name: string; keyPath: string | [string, ...string[]]; unique?: boolean }>;
    }
  >;
  upgrade?: (oldVersion: number, newVersion: number, db: IDBDatabase) => void;
}

export const ONYX_IDB_SCHEMA: IDBSchema = {
  name: "onyx-offline",
  version: 1,
  stores: {
    [STORE_NAMES.WORKOUT_SESSIONS]: {
      keyPath: "id",
      indexes: [
        { name: "user_id", keyPath: "user_id" },
        { name: "date", keyPath: "date" },
        { name: "synced", keyPath: "synced" },
        { name: "updated_at", keyPath: "updated_at" },
      ],
    },
    [STORE_NAMES.MEAL_LOGS]: {
      keyPath: "id",
      indexes: [
        { name: "user_id", keyPath: "user_id" },
        { name: "date", keyPath: "date" },
        { name: "synced", keyPath: "synced" },
        { name: "updated_at", keyPath: "updated_at" },
      ],
    },
    [STORE_NAMES.WEIGHT_LOGS]: {
      keyPath: "id",
      indexes: [
        { name: "user_id", keyPath: "user_id" },
        { name: "date", keyPath: "date" },
        { name: "synced", keyPath: "synced" },
        { name: "updated_at", keyPath: "updated_at" },
      ],
    },
    [STORE_NAMES.CACHED_PLANS]: {
      keyPath: "id",
      indexes: [
        { name: "user_id", keyPath: "user_id" },
        { name: "type_week", keyPath: ["type", "week_start"], unique: false },
        { name: "type", keyPath: "type" },
      ],
    },
    [STORE_NAMES.SYNC_QUEUE]: {
      keyPath: "id",
      autoIncrement: true,
      indexes: [
        { name: "user_id", keyPath: "user_id" },
        { name: "entity_type", keyPath: "entity_type" },
        { name: "created_at", keyPath: "created_at" },
        { name: "retry_count", keyPath: "retry_count" },
      ],
    },
  },
};