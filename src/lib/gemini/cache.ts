/**
 * 5-minute in-memory cache for Gemini responses.
 *
 * Reduces Gemini API cost by returning cached results for identical requests
 * within a 5-minute window (PRD FR-23).
 *
 * @see Architecture: API & Communication Patterns
 *     (_bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns)
 * @see PRD: FR-23
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Cached response entry with TTL metadata. */
interface CacheEntry {
  /** The serialized response string. */
  data: string
  /** Unix timestamp (ms) when this entry was cached. */
  cachedAt: number
}

// ---------------------------------------------------------------------------
// Cache store
// ---------------------------------------------------------------------------

/** In-memory Map: cache key → entry. */
const cache = new Map<string, CacheEntry>()

/** 5 minutes in milliseconds. */
const TTL_MS = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic cache key from the request body.
 *
 * The key is derived from the request type and normalized user preferences
 * so that semantically identical requests share a cache key.
 */
export function generateCacheKey(request: {
  type: string
  user_id: string
  preferences: Record<string, unknown>
  history?: Record<string, unknown>
}): string {
  // Normalize preferences: sort keys, stringify
  const normalized = JSON.stringify({
    type: request.type,
    user_id: request.user_id,
    preferences: sortKeys(request.preferences),
    history: request.history ? sortKeys(request.history) : undefined,
  })
  return normalized
}

/**
 * Recursively sorts object keys for deterministic serialization.
 */
function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map(sortKeys)
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      return { ...acc, [key]: sortKeys((obj as Record<string, unknown>)[key]) }
    }, {} as Record<string, unknown>)
}

/**
 * Retrieves a cached response for the given request.
 * Returns `null` if no valid cache entry exists.
 * Also sweeps expired entries (M1 fix).
 */
export function getCachedResponse(request: {
  type: string
  user_id: string
  preferences: Record<string, unknown>
  history?: Record<string, unknown>
}): string | null {
  // M1 fix: sweep expired entries on each read
  sweepExpired()

  const key = generateCacheKey(request)
  const entry = cache.get(key)

  if (!entry) return null

  // Check TTL
  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Stores a response in the cache.
 * Evicts oldest entry if cache is full (M1 fix).
 */
export function setCachedResponse(
  request: {
    type: string
    user_id: string
    preferences: Record<string, unknown>
    history?: Record<string, unknown>
  },
  data: string,
): void {
  // M1 fix: evict oldest entry if cache is full
  if (cache.size >= MAX_CACHE_ENTRIES) {
    evictOldest()
  }

  const key = generateCacheKey(request)
  cache.set(key, {
    data,
    cachedAt: Date.now(),
  })
}

/**
 * Clears all cached entries. Useful for testing or cache invalidation.
 * @internal — use _clearCacheInternal in production code (M4 fix)
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Clears all cached entries. For testing/internal use only.
 * Renamed from clearCache to discourage external use (M4 fix).
 */
export function _clearCacheInternal(): void {
  cache.clear()
}

/** Maximum number of entries in the cache (M1 fix). */
const MAX_CACHE_ENTRIES = 1000

/** Sweep expired entries from the cache. Called lazily on each getCachedResponse(). (M1 fix) */
function sweepExpired(): void {
  const now = Date.now()
  const expiredKeys: string[] = []
  for (const [key, entry] of cache.entries()) {
    if (now - entry.cachedAt > TTL_MS) {
      expiredKeys.push(key)
    }
  }
  for (const key of expiredKeys) {
    cache.delete(key)
  }
}

/**
 * Evicts the oldest entry when the cache is full. (M1 fix)
 */
function evictOldest(): void {
  let oldestKey = ""
  let oldestTime = Infinity
  for (const [key, entry] of cache.entries()) {
    if (entry.cachedAt < oldestTime) {
      oldestTime = entry.cachedAt
      oldestKey = key
    }
  }
  if (oldestKey) {
    cache.delete(oldestKey)
  }
}
