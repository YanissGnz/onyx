// IDB schema definitions using the localDB pattern (createIndexSchema factory)
// Minimal IndexedDB wrapper following Jake Archibald's approach


// ─── Schema Utility ────────────────────────────────────────────────────────────

/**
 * Create an index schema definition for use with custom IDB setups.
 * Follows the localDB pattern from Chrome's offline work guidance.
 */
export function createIndexSchema(
  storeName: string,
  keyPath: string,
  indexes: Array<{ name: string; keyPath: string; unique?: boolean }>
): {
  name: string;
  keyPath: string;
  indexes: typeof indexes;
} {
  return { name: storeName, keyPath, indexes };
}

// ─── Store Name Constants ──────────────────────────────────────────────────────

// Re-export from types.ts for convenience
export type { IDBSchema } from "./types";

