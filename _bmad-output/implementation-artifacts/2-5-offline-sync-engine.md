---
baseline_commit: NO_VCS
---

# Story 2.5: Offline Sync Engine — IndexedDB, Background Sync and Indicators

Status: ready-for-dev

## Story

As a user,
I want all my logging to work offline and sync automatically when I'm back online,
So that I never lose data even without internet.

## Acceptance Criteria

### AC-1: Offline Write Persistence to IndexedDB

- Given I am offline
- When I log a workout set
- Then the data is persisted to IndexedDB immediately
- And the UI updates optimistically (set appears as completed)

- Given I am offline
- When I log a meal to daily intake
- Then the meal is persisted to IndexedDB immediately
- And the macro ring updates from cached data

- Given I am offline
- When I log my body weight
- Then the entry is persisted to IndexedDB immediately
- And the weight trend chart updates from cached data

### AC-2: Offline Indicator in Bottom Nav

- Given I am offline
- When I view the bottom navigation
- Then a subtle cloud-off icon (dimly lit) appears in the nav

- Given I am online
- When I view the bottom navigation
- Then the cloud-off icon does not appear (cloud icon shown instead)

### AC-3: Offline Plan Caching with "Cached" Badge

- Given I am offline
- When I view the current week's workout plan
- Then the cached plan is displayed from IndexedDB
- And a subtle "Cached" badge is shown

- Given I am offline
- When I view the current week's meal plan
- Then the cached plan is displayed from IndexedDB
- And a subtle "Cached" badge is shown

### AC-4: Background Sync on Reconnection

- Given I am offline with pending changes
- When connectivity is restored (reconnection event fires)
- Then all pending changes are synced to Supabase in order of creation time
- And a single "Synced" toast appears when all pending operations complete
- And the cloud-off icon disappears from the bottom nav

### AC-5: Last-Write-Wins Conflict Resolution

- Given a sync conflict occurs (same record modified offline and online)
- When the sync engine resolves the conflict
- Then last-write-wins based on `updated_at` timestamp

### AC-6: Retry with Exponential Backoff

- Given a sync operation fails
- When the first attempt fails
- Then the system retries with exponential backoff (up to 3 attempts)
- And after all retries exhausted, the mutation stays in the queue for later

### AC-7: Storage Pressure Warning (>90%)

- Given storage usage exceeds 90% of quota
- When I view the Workout or Nutrition tab
- Then a persistent warning is shown: "Storage almost full — export or delete old data in Settings"
- And the cloud-off icon changes to a storage-full variant (exclamation)

### AC-8: QuotaExceededError Alert

- Given storage is completely full
- When I attempt to save data
- Then an alert is shown: "Device storage full — workouts may not save. Export or delete old data in Settings."
- And a critical indicator appears in the bottom nav

### AC-9: Cache Eviction Under Pressure

- Given storage pressure is detected
- When the system needs to free space
- Then completed workouts older than 90 days are eligible for cache eviction

## Tasks / Subtasks

- [ ] Task 1: Create IndexedDB database schema and initialization (AC: 1, 3, 9)
- [ ] Task 2: Create offline mutation queue (AC: 1, 4, 5, 6)
- [ ] Task 3: Create background sync engine (AC: 4, 5, 6)
- [ ] Task 4: Create online/offline status hook (AC: 2)
- [ ] Task 5: Create storage pressure hook (AC: 7, 8, 9)
- [ ] Task 6: Create sync status hook (AC: 2, 4)
- [ ] Task 7: Update BottomNav to show offline indicator (AC: 2, 7)
- [ ] Task 8: Cache current week plans to IndexedDB (AC: 3)
- [ ] Task 9: Verify build integrity (AC: all)

## Dev Agent Record

### Project Context

This is the **fifth story of Epic 2: Core Shell**. Stories 2.1 (Design Token System), 2.2 (Bottom Navigation), 2.3 (Main Dashboard — deprecated), and 2.4 (PWA Shell) are complete. Now we build the offline sync engine — the data layer that makes ONYX work without internet.

**What exists today:**

- **Next.js 16** app with App Router, TypeScript, Tailwind CSS v4
- **Supabase** installed (`@supabase/supabase-js`, `@supabase/ssr`) — Auth + DB ready
- **TanStack Query v5** installed (`@tanstack/react-query`) — server state management
- **@serwist/next** v9.5.11 configured — Service Worker active for PWA
- **shadcn/ui** initialized — toast, dialog, card primitives available
- **Lucide React** — icons for offline/online indicators
- **Framer Motion** — animations available
- **Database tables created** (from Story 1.1): `profiles`, `workout_plans`, `exercise_templates`, `workout_sessions`, `personal_meals`, `meal_logs`, `weight_logs` — all with RLS policies
- **Dashboard layout** with BottomNav (5 tabs), auth guard, glassmorphism styling
- **InstallPrompt** component already built (Story 2.4)

**Key existing files:**

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/supabase/middleware.ts` | Supabase SSR middleware |
| `src/lib/supabase/converters.ts` | snake_case ↔ camelCase converters |
| `src/hooks/useInstallPrompt.ts` | PWA install prompt hook |
| `src/components/features/shared/BottomNav.tsx` | Bottom navigation bar |
| `src/components/features/shared/GlassCard.tsx` | Glass card UI primitive |
| `src/components/features/shared/EmptyState.tsx` | Empty state UI primitive |
| `src/styles/tokens.css` | Design tokens (CSS custom properties) |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with BottomNav |
| `src/app/sw.ts` | Service Worker entry (Serwist) |
| `src/types/` | Shared TypeScript types |

**What does NOT exist yet:**

- IndexedDB database layer
- Offline mutation queue
- Background sync orchestrator
- Online/offline status detection
- Storage pressure monitoring
- Sync status tracking
- Cached plan persistence

### IndexedDB Database Schema

**Database name:** `onyx-offline`

**Object stores:**

```
workout_sessions (keyPath: "id")
  - id: string (UUID) — unique identifier
  - user_id: string
  - workout_plan_id: string | null
  - date: string (ISO 8601)
  - exercises: ExerciseSet[] — full workout data
  - duration_seconds: number
  - total_volume: number
  - status: "completed" | "partial" | "free-form"
  - created_at: string (ISO 8601)
  - updated_at: string (ISO 8601)
  - synced: boolean — whether synced to Supabase

meal_logs (keyPath: "id")
  - id: string (UUID)
  - user_id: string
  - meal_entry_id: string | null — reference to personal_meals entry if from DB
  - meal_name: string
  - macros: { calories: number, protein: number, carbs: number, fat: number }
  - date: string (ISO 8601)
  - time_slot: "breakfast" | "lunch" | "dinner" | "snack" | "custom"
  - custom_time: string | null
  - is_override: boolean — true if macros were manually adjusted
  - created_at: string (ISO 8601)
  - updated_at: string (ISO 8601)
  - synced: boolean

weight_logs (keyPath: "id")
  - id: string (UUID)
  - user_id: string
  - weight_kg: number
  - date: string (ISO 8601)
  - created_at: string (ISO 8601)
  - updated_at: string (ISO 8601)
  - synced: boolean

cached_plans (keyPath: "id")
  - id: string — key format: "workout_week_{YYYY-WW}" or "meal_week_{YYYY-WW}"
  - user_id: string
  - type: "workout_plan" | "meal_plan"
  - week_start: string (ISO 8601) — Monday of the week
  - data: any — full plan JSON
  - generated_at: string (ISO 8601)
  - updated_at: string (ISO 8601)
```

### Offline Mutation Queue Design

The mutation queue stores operations to be replayed when connectivity is restored.

**Queue item structure:**

```typescript
interface SyncQueueItem {
  id: string;           // UUID
  user_id: string;
  operation: "create" | "update" | "delete";
  entity_type: "workout_session" | "meal_log" | "weight_log";
  entity_id: string;    // UUID of the entity being operated on
  payload: Record<string, any>;  // Full entity data for the operation
  created_at: string;   // ISO 8601 — order of operations
  retry_count: number;  // 0, 1, 2
  max_retries: 3;
  last_error: string | null;
}
```

**Queue operations (in order of creation time):**

1. Read all pending items from IndexedDB queue store
2. Sort by `created_at` ascending
3. For each item, attempt the corresponding Supabase operation
4. On success: remove from queue, mark entity as synced
5. On failure: increment retry_count, apply exponential backoff (1s, 2s, 4s)
6. After 3 retries: leave in queue, mark with last_error, retry on next reconnection

**Conflict resolution: Last-Write-Wins**

- All entities have `updated_at` timestamp
- When syncing an update, compare server's `updated_at` with client's `updated_at`
- If client's `updated_at` > server's `updated_at`: apply the change
- If client's `updated_at` <= server's `updated_at`: skip (server is newer), log warning

### Online/Offline Detection

**Strategy:** Use `navigator.onLine` as a hint + attempt a network request.

```typescript
// useOnlineStatus.ts
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Note:** `navigator.onLine` is not 100% reliable. The sync engine should also attempt actual network requests and detect failures.

### Storage Pressure Monitoring

```typescript
// useStoragePressure.ts
export function useStoragePressure(): {
  usagePercent: number;
  isCritical: boolean;  // >95% or QuotaExceededError
  isWarning: boolean;   // >90%
  message: string;
} {
  // Uses navigator.storage.estimate() to get quota and usage
  // Computes usagePercent = (usage / quota) * 100
  // Tracks QuotaExceededError state from sync attempts
}
```

### Reusable UI Primitives Available

| Component | Path | Purpose |
|-----------|------|---------|
| `GlassCard` | `src/components/features/shared/GlassCard.tsx` | Glassmorphism card for warnings/toasts |
| `EmptyState` | `src/components/features/shared/EmptyState.tsx` | Empty state display |
| `toast` | `src/components/ui/toast.tsx` (sonner) | Toast notifications |
| `Button` | `src/components/ui/button.tsx` | Button primitives |
| `Dialog` | `src/components/ui/dialog.tsx` | Alert dialog for critical errors |

### Design System Reference

**Colors (from `src/styles/tokens.css` / `STITCH_DESIGN_SYSTEM.md`):**

| Token | Value | Usage |
|-------|-------|-------|
| `--onyx-surface` | `#131313` | Card backgrounds |
| `--onyx-surface-container-low` | `#1c1b1b` | Warning card backgrounds |
| `--onyx-surface-container` | `#201f1f` | Elevated surfaces |
| `--onyx-primary-container` | `#c3f400` | Electric Lime (primary actions) |
| `--onyx-secondary-container` | `#00eefc` | Ice Blue (secondary accents) |
| `--onyx-tertiary-container` | `#ffdad7` | Coral Red (error/warning) |
| `--onyx-on-surface` | `#e5e2e1` | Primary text |
| `--onyx-on-surface-variant` | `#c4c9ac` | Muted text / inactive states |
| `--onyx-glass-border` | `rgba(255,255,255,0.08)` | Glass borders |

**Icons (Lucide React):**

| Icon | Import | Usage |
|------|--------|-------|
| `Cloud` | `lucide-react` | Online indicator (bottom nav) |
| `CloudOff` | `lucide-react` | Offline indicator (dimmed) |
| `CloudAlert` | `lucide-react` | Storage warning indicator |
| `AlertTriangle` | `lucide-react` | Critical storage alert |

### Critical: What Must Be Preserved

- **Existing Supabase client** — Do not modify `src/lib/supabase/client.ts`. Use it for online operations.
- **Existing converters** — Do not modify `src/lib/supabase/converters.ts`. Use for snake_case ↔ camelCase.
- **Existing BottomNav** — Add offline indicator as a subtle overlay/badge, do not replace the nav.
- **Existing dashboard layout** — Storage warning is a persistent banner on Workout/Nutrition tabs only.
- **Existing TanStack Query setup** — The sync engine should work alongside TanStack Query, not replace it.
- **Existing Service Worker** — Serwist handles static asset caching; the sync engine handles data-level offline.
- **No shadcn/ui manual edits** — Only add or update via `npx shadcn@latest add {component}`.

### Library & Framework Requirements

| Dependency | Version | Purpose | Action |
|-----------|---------|---------|--------|
| `idb` | ^8.0.0 | IndexedDB wrapper (localDB pattern) | **NEW — install** |
| `@tanstack/react-query` | already installed | Server state, offline support | Already in package.json |
| `@supabase/supabase-js` | already installed | Supabase client for sync | Already in package.json |
| `lucide-react` | already installed | Icons for offline indicators | Already in package.json |
| `sonner` | already installed | Toast notifications | Already in package.json |

**New dependency:**

```bash
npm install idb
```

`idb` is a minimal (4.5KB) IndexedDB wrapper by Jake Archibald. It uses the localDB pattern (createIndexSchema factory) and is the recommended approach for IndexedDB.

**Alternative:** Use `localforage` (10KB) if a simpler API is preferred. However, `idb` is lighter and the project already has TanStack Query which pairs well with `idb`.

**Decision: Use `idb`** — it's the industry standard (used by Chrome, PWA Toolkit) and provides the cleanest DX with async/await.

### Implementation Architecture

**File structure to create:**

```
src/
├── lib/
│   ├── db/                       # NEW — IndexedDB layer
│   │   ├── index.ts              # Database initialization + exports
│   │   ├── schema.ts             # IDB schema definitions
│   │   └── types.ts              # IndexedDB-specific types
│   ├── sync/                     # NEW — Sync layer (architecture planned)
│   │   ├── queue.ts              # Mutation queue operations
│   │   ├── sync-engine.ts        # Background sync orchestrator
│   │   └── conflict.ts           # Last-write-wins resolver
│   └── storage.ts                # NEW — Storage pressure monitoring
├── hooks/
│   ├── useOnlineStatus.ts        # NEW — Online/offline detection
│   ├── useSyncStatus.ts          # NEW — Sync status + pending count
│   └── useStoragePressure.ts     # NEW — Storage pressure monitoring
└── components/
    └── features/
        └── shared/
            ├── OfflineIndicator.tsx   # NEW — Cloud icon in bottom nav
            └── StorageWarning.tsx     # NEW — Persistent storage warning
```

### Sync Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Action (offline)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   IndexedDB (immediate write)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ workout_     │  │ meal_logs    │  │ weight_logs  │      │
│  │ sessions     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                             │
│  │ sync_queue   │ ← new operations queued here              │
│  └──────────────┘                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Sync Engine (on reconnect)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Read queue   │→ │ Retry w/     │→ │ Apply LWW    │      │
│  │ (ordered)    │  │ backoff      │  │ resolution   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│                    ┌───────┴───────┐                        │
│                    │ Success /     │                        │
│                    │ Failure       │                        │
│                    └───────────────┘                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase (online DB)                       │
└─────────────────────────────────────────────────────────────┘
```

### Testing Requirements

- **Offline verification:**
  - Chrome DevTools → Application → Offline → check "Offline"
  - Log a workout set → verify it appears in UI immediately
  - Log a meal → verify macro ring updates
  - Log weight → verify weight chart updates
  - Reload page while offline → verify data persists
  - Go online → verify sync happens automatically
  - Verify "Synced" toast appears after sync

- **Conflict resolution verification:**
  - Log a weight entry offline
  - Log the same weight entry online (different value)
  - Go offline, change the offline entry
  - Sync → verify last-write-wins behavior

- **Storage pressure verification:**
  - Simulate storage pressure via Chrome DevTools → Application → Storage
  - Verify warning appears on Workout/Nutrition tabs at >90%

- **Build verification:**
  - `npm run build` succeeds with no errors
  - No TypeScript compilation errors

### Edge Cases to Handle

1. **First-time user with no IndexedDB data** — Sync queue is empty, no error
2. **Browser with no IndexedDB support** — Graceful fallback to online-only mode (rare in modern browsers)
3. **Sync queue overflow** — If queue exceeds 1000 items, evict oldest items and log warning
4. **Multiple tabs open** — Each tab has its own sync queue; use `BroadcastChannel` API to coordinate sync across tabs
5. **User logs out while pending sync** — Clear sync queue on logout, optionally re-queue with new user_id
6. **Network flapping** (rapid online/offline transitions) — Debounce reconnection attempts (1s delay)
7. **Supabase downtime** — All retries exhausted, items stay in queue indefinitely until connectivity restored
8. **Large batch sync** (>50 items) — Process in batches of 10 with 100ms delay between batches to avoid blocking

### Previous Story Intelligence

**From Story 2.4 (PWA Shell):**
- `@serwist/next` handles Service Worker for static assets
- InstallPrompt component built and integrated
- Service Worker precaches app shell
- **Gap:** Service Worker handles app shell caching, NOT data-level offline — this story fills that gap

**From Story 2.1 (Design Token System):**
- Design tokens in `src/styles/tokens.css` as `--onyx-*` CSS custom properties
- Glassmorphism utilities: `.glass-surface`, `.glass-card`
- Layout utility: `.onyx-container`

**From Story 1.1 (Project Scaffold):**
- Database schema exists: `workout_sessions`, `meal_logs`, `weight_logs`, `cached_plans`
- RLS policies already configured
- Converters in `src/lib/supabase/converters.ts` for snake_case ↔ camelCase

### MANIFEST_REGISTRATION: Design system and design tokens

- Offline indicator: CloudOff icon in `--onyx-on-surface-variant` (dimmed) when offline, Cloud icon in `--onyx-on-surface` when online
- Storage warning: Glass card with `--onyx-tertiary-container` border (Coral Red family)
- Critical alert: Glass card with `--onyx-tertiary-container` background
- Toast: Use sonner for "Synced" confirmation (default style, dark theme compatible)

### Files to Create

| File | Action | Notes |
|------|--------|-------|
| `src/lib/db/index.ts` | **Create** | IndexedDB initialization, database schema, CRUD helpers |
| `src/lib/db/schema.ts` | **Create** | IDB object store definitions with localDB pattern |
| `src/lib/db/types.ts` | **Create** | IndexedDB-specific type definitions |
| `src/lib/sync/queue.ts` | **Create** | Mutation queue operations (enqueue, process, retry) |
| `src/lib/sync/sync-engine.ts` | **Create** | Background sync orchestrator |
| `src/lib/sync/conflict.ts` | **Create** | Last-write-wins conflict resolver |
| `src/lib/storage.ts` | **Create** | Storage pressure monitoring |
| `src/hooks/useOnlineStatus.ts` | **Create** | Online/offline detection |
| `src/hooks/useSyncStatus.ts` | **Create** | Sync status + pending count |
| `src/hooks/useStoragePressure.ts` | **Create** | Storage pressure monitoring |
| `src/components/features/shared/OfflineIndicator.tsx` | **Create** | Cloud icon indicator in bottom nav |
| `src/components/features/shared/StorageWarning.tsx` | **Create** | Persistent storage warning banner |

### Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/features/shared/BottomNav.tsx` | **Modify** | Add OfflineIndicator component, pass sync status |
| `src/app/(dashboard)/workout/page.tsx` | **Modify** | Cache workout plans to IndexedDB on load |
| `src/app/(dashboard)/nutrition/page.tsx` | **Modify** | Cache meal plans to IndexedDB on load |
| `package.json` | **Modify** | Add `idb` dependency |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/app/layout.tsx` | No changes needed — root layout is fine |
| `src/styles/tokens.css` | No new design tokens needed |
| `src/app/globals.css` | Existing utilities cover all needed styling |
| `src/lib/supabase/client.ts` | Do not modify — use as-is for online operations |
| `src/lib/supabase/converters.ts` | Do not modify — use as-is for snake_case ↔ camelCase |
| `src/app/sw.ts` | Service Worker handles static assets, not data |
| `next.config.ts` | No config changes needed |

### References

- [Source: epics.md#L518-L562] — Story 2.5 acceptance criteria
- [Source: architecture.md#L157] — TanStack Query persistQueryClient + IndexedDB pattern
- [Source: architecture.md#L414-L417] — Sync layer structure (queue, sync-engine, conflict)
- [Source: architecture.md#L421-L422] — storage.ts for IndexedDB helpers + navigator.storage
- [Source: architecture.md#L431] — sync.ts types (SyncQueueItem, SyncStatus)
- [Source: architecture.md#L485] — Offline ↔ Online flow: IndexedDB → sync queue → Supabase
- [Source: STITCH_DESIGN_SYSTEM.md] — Design token reference
- [Source: Sprint status] — Epic 2 in-progress, stories 2.1–2.4 done, 2.5 backlog