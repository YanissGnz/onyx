---
baseline_commit: NO_VCS
---

# Story 2.3: Main Dashboard

Status: review

## Story

As a user,
I want a dashboard that shows my today's workout status, logged macros vs target, and quick action buttons,
So that I can see my daily status at a glance and take action quickly.

## Acceptance Criteria

### AC-1: Authenticated Landing Page

- Given I am an authenticated user
- When I log in
- Then I land on the dashboard at `/` (the root of `(dashboard)` route group)

- Given I am unauthenticated
- When I access `/`
- Then I am redirected to `/login` by the existing auth guard in layout.tsx

### AC-2: Dashboard Content Sections

- Given the dashboard loads
- When I view the content
- Then I see three clearly separated sections (using glass card components):
  1. **Today's Workout Status** — Shows pending/in progress/completed status for today's session
  2. **Today's Macros vs Target** — Calories and protein logged vs target
  3. **Quick Actions** — "Log Workout", "Log Meal", "Plan Week" buttons

- Given I have an incomplete workout for today
- When I view the dashboard
- Then the workout section is shown at the top with a "Start" button (Electric Lime primary button)

- Given I have no plan for the current week
- When I view the dashboard
- Then I see a prompt to generate or build a plan (with a "Generate Plan" CTA)

### AC-3: Cold Open (Empty Data) States

- Given I have no workouts logged yet (cold open)
- When I view the dashboard
- Then I see "No workouts yet — tap Generate Plan to create your first" with a Generate Plan CTA

- Given I have no meals logged today (cold open)
- When I view the nutrition section of the dashboard
- Then I see "No meals logged today" with a Quick-log CTA

- Given I have a completed workout today
- When I view the dashboard
- Then the workout section shows "Today's workout complete" with a summary

### AC-4: Quick Action Navigation

- Given I tap "Log Workout"
- When the action is triggered
- Then I am navigated to the Workout tab (`/workout`)

- Given I tap "Log Meal"
- When the action is triggered
- Then I am navigated to the Nutrition tab (`/nutrition`)

- Given I tap "Plan Week"
- When the action is triggered
- Then I am navigated to the Generate Plan tab (`/plan`)

### AC-5: Microcopy Voice

- Given I am viewing the dashboard in any state
- When I read the text
- Then it follows ONYX voice: technical, direct, encouraging without saccharine
- **Cold open (workout):** "No workouts yet — tap Generate Plan to create your first."
- **Cold open (meals):** "No meals logged today."
- **With plan but not started:** "Today's workout ready — tap Start when you're in the gym."
- **Completed workout:** "Today's workout complete."
- **Quick action labels:** "Log Workout", "Log Meal", "Plan Week"
- **No gamification language:** No "streak", "level up", "achievement unlocked", "days in a row"

### AC-6: Performance — 2 Second Load Time

- Given the dashboard loads
- When I measure the load time on 4G
- Then the dashboard loads within 2 seconds
- **Implementation note:** Use server components for initial render, minimal client components. Data fetching via Supabase server client for workout/macro data.

### AC-7: Responsive Layout

- Given I am on a mobile viewport (<768px)
- When I view the dashboard
- Then sections are stacked vertically with consistent 1.25rem edge margins (via `onyx-container`)

- Given I am on a desktop viewport (>768px)
- When I view the dashboard
- Then content is constrained to the centered 448px pillar (`max-w-md` via `onyx-container`)

### AC-8: Offline Behavior

- Given I am offline
- When I view the dashboard
- Then any cached data (plan status, today's meals) is shown from IndexedDB
- **Note:** Full offline dashboard with cached data is covered by Story 2.5 (Offline Sync Engine). This story focuses on the online-first rendering. If no cached data, show loading state gracefully with offline indicator.

### AC-9: Accessibility

- Given I am using a screen reader
- When I view the dashboard
- Then each section has proper heading hierarchy (`<h1>`, `<h2>`)
- And quick action buttons have descriptive `aria-label` attributes
- And loading/empty states are announced via `aria-live` regions
- And all touch targets are ≥44pt

### AC-10: Build Integrity

- Given the dashboard is implemented
- When I run `npm run build`
- Then the build succeeds with no errors

## Tasks / Subtasks

- [x] Task 1: Create `src/app/(dashboard)/page.tsx` — Main dashboard server component
  - [x] Set up server component with Supabase server client data fetching
  - [x] Fetch today's workout status, today's meal macros, and user profile
  - [x] Render three sections: Workout Status, Nutrition Summary, Quick Actions
  - [x] Handle all states: loading, empty (cold open), with data, offline
  - [x] Apply proper heading hierarchy and ARIA labels
  - [x] Follow ONYX microcopy voice for all text

- [x] Task 2: Create `src/components/features/shared/DashboardWorkoutStatus.tsx` — Workout status section
  - [x] Display today's workout plan status (no plan, plan ready, in progress, completed)
  - [x] "Start" button (Electric Lime primary) when workout ready but not started
  - [x] "Generate Plan" CTA when no plan exists (cold open)
  - [x] Completed state with summary
  - [x] Use GlassCard component styling

- [x] Task 3: Create `src/components/features/shared/DashboardNutritionSummary.tsx` — Macro summary section
  - [x] Display today's logged calories and protein vs target
  - [x] Empty state: "No meals logged today" + Quick-log CTA
  - [x] With data: "X / Y cal" and "X / Y g protein"
  - [x] Use GlassCard component styling

- [x] Task 4: Create `src/components/features/shared/QuickActions.tsx` — Quick action buttons
  - [x] Three buttons: "Log Workout" (links to /workout), "Log Meal" (links to /nutrition), "Plan Week" (links to /plan)
  - [x] Glass button styling (transparent, 1px glass-border, white text)
  - [x] Each button ≥44pt height
  - [x] aria-label for each button

- [x] Task 5: Create `src/components/features/shared/GlassCard.tsx` — Reusable glass card component
  - [x] Glassmorphism surface styling (backdrop-blur, semi-transparent fill, glass-border)
  - [x] Accept `children` and optional `className` prop
  - [x] Use design tokens from tokens.css

- [x] Task 6: Create `src/components/features/shared/EmptyState.tsx` — Reusable empty state component
  - [x] Accept `title`, `description`, and optional `action` (button with href)
  - [x] Follow ONYX microcopy — helpful, no gamification
  - [x] Centered layout within glass card

- [x] Task 7: Verify build integrity
  - [x] Run `npm run build`
  - [x] Verify no TypeScript, CSS, or import errors
  - [x] Verify dev server loads without issues

## Dev Notes

### Project Context

This is the **third story of Epic 2: Core Shell**. Stories 2.1 (Design Token System) and 2.2 (Bottom Navigation) are complete. Now we build the main dashboard that serves as the authenticated landing page.

**The dashboard lives at the root of `(dashboard)` route group.** Currently there is no `page.tsx` at `src/app/(dashboard)/page.tsx` — so visiting `/` after auth shows nothing (layout renders with `children` being empty). This story creates that page.

### User Journeys

- **Returning user with active plan:** Lands on dashboard → sees "Today's workout ready" → taps "Start" → enters fullscreen workout
- **New user after onboarding:** Lands on dashboard → sees "No workouts yet" → taps "Generate Plan" → Vibe Drawer opens
- **User mid-day:** Sees macro progress → knows if they need to eat more → taps "Log Meal" to add food

### ONYX Design System — Critical Rules

1. **Do NOT invent custom colors.** All values come from `STITCH_DESIGN_SYSTEM.md` and `DESIGN.md`:
   - **Electric Lime (primary action):** `#c3f400` / `--onyx-primary-container`
   - **Surface:** `#131313` / `--onyx-surface`
   - **Surface-container-low:** `#1c1b1b` / `--onyx-surface-container-low`
   - **On-surface:** `#e5e2e1` / `--onyx-on-surface`
   - **On-surface-variant:** `#c4c9ac` / `--onyx-on-surface-variant`
   - **Glass fill:** `rgba(18, 18, 18, 0.8)` with `backdrop-blur-md`
   - **Glass border:** `rgba(255, 255, 255, 0.08)`
   - **Neon glow lime:** `rgba(204, 255, 0, 0.15)`

2. **Typography:**
   - **Headlines:** Geist — headline-lg (32px/700), headline-md (24px/600)
   - **Body:** Inter — body-md (16px), body-lg (18px)
   - **Data/Labels:** JetBrains Mono — label-caps (12px/600), stat-label (14px/500)

3. **Glassmorphism:** Apply `backdrop-blur-md bg-[rgba(18,18,18,0.8)] border border-glass-border` for glass cards.

4. **Buttons:**
   - **Primary (Electric Lime):** `bg-[#c3f400] text-[#283500] rounded-lg h-[48px] px-6 font-semibold`
   - **Glass:** `bg-transparent border border-[rgba(255,255,255,0.08)] text-white rounded-lg h-[48px] px-6`

5. **No drop shadows.** Depth comes from tonal layering + backdrop blur only.

6. **No gamification language.** No streaks, badges, levels, XP, or celebration UI.

### Data Fetching Strategy

**Server Component Pattern (recommended for dashboard):**
```tsx
// src/app/(dashboard)/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch today's workout plan
  const { data: todayWorkout } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", todayISO)
    .single();

  // Fetch today's meal logs with macro totals
  const { data: mealLogs } = await supabase
    .from("meal_logs")
    .select("calories, protein, carbs, fat")
    .eq("user_id", user.id)
    .eq("logged_date", todayISO);

  // Fetch user profile for macro targets
  const { data: profile } = await supabase
    .from("profiles")
    .select("caloric_target, protein_target")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-4">
      <h1 className="onyx-headline-lg">Dashboard</h1>
      {/* Pass data to client components as needed */}
      <DashboardWorkoutStatus workout={todayWorkout} />
      <DashboardNutritionSummary logs={mealLogs} targets={profile} />
      <QuickActions />
    </div>
  );
}
```

**Notes:**
- Use the Supabase **server client** (`createClient` from `@/lib/supabase/server`) for dashboard data
- The server component fetches data and passes it as props to client components
- **No streaming (loading.tsx) needed for v1** — keep it simple with synchronous server fetch
- If data is not found (null), pass appropriate empty state flags

### Architecture Compliance

| File | Action | Notes |
|------|--------|-------|
| `src/app/(dashboard)/page.tsx` | **Create** | Main dashboard page — server component |
| `src/components/features/shared/DashboardWorkoutStatus.tsx` | **Create** | Today's workout status section |
| `src/components/features/shared/DashboardNutritionSummary.tsx` | **Create** | Today's macro vs target section |
| `src/components/features/shared/QuickActions.tsx` | **Create** | Quick action buttons (Log Workout, Log Meal, Plan Week) |
| `src/components/features/shared/GlassCard.tsx` | **Create** | Reusable glass card wrapper component |
| `src/components/features/shared/EmptyState.tsx` | **Create** | Reusable empty state component |

**No existing files need modification.** The dashboard layout already handles auth guard, BottomNav, and responsive container.

### File Structure Requirements

| File | Action | Notes |
|------|--------|-------|
| `src/app/(dashboard)/page.tsx` | **Create** | Dashboard server component — fetches data, renders three sections |
| `src/components/features/shared/DashboardWorkoutStatus.tsx` | **Create** | "use client" — workout status, Start button, empty state |
| `src/components/features/shared/DashboardNutritionSummary.tsx` | **Create** | "use client" — macro summary, empty state |
| `src/components/features/shared/QuickActions.tsx` | **Create** | "use client" — three quick action buttons with navigation |
| `src/components/features/shared/GlassCard.tsx` | **Create** | Can be server or client — wrapper with glassmorphism styling |
| `src/components/features/shared/EmptyState.tsx` | **Create** | "use client" — reusable empty state with optional CTA |

### Library & Framework Requirements

| Dependency | Version | Purpose | Action |
|-----------|---------|---------|--------|
| `next` | 16 | App Router, server components, `usePathname` | Already in package.json |
| `@supabase/supabase-js` | Already installed | Supabase server client for data fetching | Already in package.json |
| `lucide-react` | Already installed | Icons for quick actions and status indicators | Already in package.json |
| `@tanstack/react-query` | Already installed | Client-side data fetching (if needed) | Already in package.json |

**No new npm packages are needed.** All dependencies are already installed.

### Critical: What Must Be Preserved

- **Existing layout auth guard** — layout.tsx redirects unauthenticated users. The dashboard page must NOT duplicate this logic.
- **BottomNav** — Already in layout, must remain visible on dashboard. Dashboard is the landing page.
- **`onyx-container`** — Content constrained to 448px max-width with 1.25rem margins. Dashboard must use this utility.
- **Design tokens** — All colors/typography from tokens.css must be used. No custom CSS values.
- **TanStack Query providers** — Must be in root layout. Dashboard must work within existing provider hierarchy.

### Previous Story Intelligence

**From Story 2.1 (Design Token System & Dark Theme Shell):**
- Design tokens in `src/styles/tokens.css` as `--onyx-*` CSS custom properties
- Tailwind v4 theme mapping in `src/app/globals.css` via `@theme inline`
- Typography classes: `.onyx-display-stats`, `.onyx-headline-lg`, `.onyx-headline-md`, `.onyx-body-lg`, `.onyx-body-md`, `.onyx-label-caps`, `.onyx-stat-label`
- Glassmorphism utilities: `.glass-surface`, `.glass-card`, `.neon-glow-lime`, `.neon-glow-cyan`
- Layout utility: `.onyx-container` (max-w-448px, centered, 1.25rem edge margin)
- ThemeProvider in `src/components/providers/ThemeProvider.tsx` forced to dark

**From Story 2.2 (Bottom Navigation and Tab Shell):**
- BottomNav created with 5 tabs (Workout, Nutrition, Stats, Plan, Profile)
- Dashboard layout updated — removed old header, added BottomNav, auth guard preserved
- Routes: `/workout`, `/nutrition`, `/stats`, `/plan`, `/profile`
- Log-out moved to Profile screen
- Build verified successful

**Key patterns to follow:**
- Server components for data fetching via Supabase SSR
- Client components for interactive UI (buttons, navigation)
- CSS custom properties for all design tokens
- Tailwind arbitrary values for specific design token references
- Glassmorphism via `backdrop-blur-md bg-[rgba(18,18,18,0.8)] border-t border-glass-border`

### UI Component Style Requirements

**GlassCard (reusable):**
- Glassmorphism surface: `backdrop-blur-md bg-[rgba(18,18,18,0.8)] border border-[rgba(255,255,255,0.08)] rounded-lg`
- Padding: `p-4` (1rem)
- Optional: `space-y-3` for stacked content
- No drop shadows

**DashboardWorkoutStatus:**
- If no plan exists:
  - GlassCard with `Dumbbell` icon (on-surface-variant)
  - "No workouts yet — tap Generate Plan to create your first."
  - "Generate Plan" glass button → navigates to `/plan`
- If plan exists but not started:
  - GlassCard with `CalendarCheck` icon (Electric Lime)
  - "Today's workout ready — tap Start when you're in the gym."
  - "Start Workout" Electric Lime primary button → navigates to `/workout`
- If workout in progress:
  - GlassCard with `Play` icon (Electric Lime with neon glow)
  - "Workout in progress" with "Resume" button
- If completed:
  - GlassCard with `CheckCircle2` icon (Electric Lime)
  - "Today's workout complete — Great work."
  - "View Summary" glass button

**DashboardNutritionSummary:**
- If no meals logged today:
  - GlassCard with `Apple` icon (on-surface-variant)
  - "No meals logged today."
  - "Log Meal" glass button → navigates to `/nutrition`
- If meals logged:
  - GlassCard with macro summary
  - "X / Y cal" and "X / Y g protein" in JetBrains Mono stat-label
  - Color coding: green (≥80% of target), yellow (50-80%), red (<50%)
  - Simple progress bars (no macro ring in v1 dashboard — that's Story 5.3)

**QuickActions:**
- Three glass buttons in a horizontal row (or vertical stack on very small screens)
- Each button: glass style, ≥44pt height, icon + label
- "Log Workout" — `Dumbbell` icon → `/workout`
- "Log Meal" — `Apple` icon → `/nutrition`
- "Plan Week" — `Sparkles` icon → `/plan`
- Equal width distribution (`grid grid-cols-3 gap-3`)

**EmptyState:**
- Centered layout within container
- Optional icon (Lucide) in on-surface-variant
- Title in onyx-headline-md (Geist)
- Description in onyx-body-md (Inter, on-surface-variant)
- Optional action button (glass style)
- No animation, no illustration

### Dashboard Data Model

```typescript
// Today's workout plan (from workout_plans table)
interface TodayWorkout {
  id: string;
  scheduled_date: string; // ISO 8601 date
  status: 'pending' | 'in_progress' | 'completed' | 'partial';
  exercise_count: number;
  completed_exercises: number;
}

// Today's meal logs aggregate (from meal_logs table)
interface TodayMacros {
  total_calories: number;
  total_protein: number;  // grams
  total_carbs: number;    // grams
  total_fat: number;      // grams
}

// User profile targets (from profiles table)
interface MacroTargets {
  caloric_target: number;  // daily calories
  protein_target: number;  // grams
}
```

### Quick Action Route Map

| Action | Route | Icon (Lucide) | Label |
|--------|-------|---------------|-------|
| Log Workout | `/workout` | `Dumbbell` | Log Workout |
| Log Meal | `/nutrition` | `Apple` | Log Meal |
| Plan Week | `/plan` | `Sparkles` | Plan Week |

### Implementation Notes

**Dashboard Page (`page.tsx`) — Server Component Pattern:**
```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardWorkoutStatus from "@/components/features/shared/DashboardWorkoutStatus";
import DashboardNutritionSummary from "@/components/features/shared/DashboardNutritionSummary";
import QuickActions from "@/components/features/shared/QuickActions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Note: auth guard is in layout, but we fetch user for data queries

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Parallel data fetching
  const [workoutResult, mealResult, profileResult] = await Promise.all([
    supabase.from("workout_plans")
      .select("id, scheduled_date, status, exercise_count, completed_exercises")
      .eq("user_id", user!.id)
      .eq("scheduled_date", today)
      .maybeSingle(),
    supabase.from("meal_logs")
      .select("calories, protein")
      .eq("user_id", user!.id)
      .eq("logged_date", today),
    supabase.from("profiles")
      .select("caloric_target, protein_target")
      .eq("user_id", user!.id)
      .single(),
  ]);

  // Compute macro totals
  const macros = (mealResult.data || []).reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
    }),
    { calories: 0, protein: 0 }
  );

  return (
    <div className="space-y-4 pt-4">
      <h1 className="sr-only">Dashboard</h1>
      <DashboardWorkoutStatus workout={workoutResult.data} />
      <DashboardNutritionSummary
        macros={macros}
        targets={profileResult.data}
      />
      <QuickActions />
    </div>
  );
}
```

**Client Components pattern:**
All interactive components use `"use client"` and receive data as props from the server component. This keeps the page server-rendered while allowing client interactivity.

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
```

**No loading.tsx required** since the server component fetches data directly and blocks render until complete. For the 2-second load time target, keep queries lightweight (simple select + count queries, indexed by user_id and date).

### Empty State Microcopy Reference

| Context | Title | Description | Action |
|---------|-------|-------------|--------|
| No workouts | "No workouts yet" | "tap Generate Plan to create your first." | Generate Plan |
| No meals | "No meals logged today" | (no description) | Log Meal |
| With plan, not started | "Today's workout ready" | "tap Start when you're in the gym." | Start Workout |
| Workout complete | "Today's workout complete" | "Great work." | View Summary |

### Testing Requirements

- **Visual verification:** Dashboard renders three sections (workout, nutrition, quick actions)
- **Empty state verification:** Cold open shows helpful empty states with CTAs
- **Workout status verification:** Pending/in-progress/completed states render correctly
- **Macro display verification:** Calories and protein show logged vs target with color coding
- **Quick action verification:** All three buttons navigate to correct routes
- **Accessibility verification:** Heading hierarchy, aria-labels, aria-live regions, 44pt touch targets
- **Responsive verification:** Sections stack vertically on mobile, constrained to 448px on desktop
- **Build verification:** `npm run build` succeeds

## Project Context Reference

**Project:** onyx — Unified workout and nutrition orchestrator
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide React, Framer Motion, TanStack Query v5, Supabase (Auth + DB), Google Gemini
**Design System:** Dark theme (obsidian palette), glassmorphism, Electric Lime (#c3f400) primary, Ice Blue (#00eefc) secondary, Geist/Inter/JetBrains Mono typography
**Status:** Epic 2 in-progress. Stories 2.1 (Design Tokens) and 2.2 (Bottom Nav) done. Stories 2.4 (PWA), 2.5 (Offline Sync) backlog.
**Previous Story 2.2 Learnings:**
- BottomNav created at `src/components/features/shared/BottomNav.tsx`
- Dashboard layout updated — removed old header, added BottomNav, auth guard preserved
- Routes: `/workout`, `/nutrition`, `/stats`, `/plan`, `/profile`
- No git history — project not yet committed
- Build verified successful after Story 2.2

## File List

| File | Action |
|------|--------|
| `src/app/(dashboard)/page.tsx` | **Create** — Main dashboard server component |
| `src/components/features/shared/DashboardWorkoutStatus.tsx` | **Create** — "use client" — Today's workout status section |
| `src/components/features/shared/DashboardNutritionSummary.tsx` | **Create** — "use client" — Macro summary section |
| `src/components/features/shared/QuickActions.tsx` | **Create** — "use client" — Quick action buttons |
| `src/components/features/shared/GlassCard.tsx` | **Create** — Reusable glass card wrapper |
| `src/components/features/shared/EmptyState.tsx` | **Create** — "use client" — Reusable empty state |

## Change Log

- 2026-06-11: Created story for main dashboard implementation
- 2026-06-11: Implemented dashboard — created 6 files, build passes with zero errors

## Dev Agent Record

### Implementation Plan

**Approach:** Create a server component for the dashboard page that fetches today's workout plan, meal log aggregates, and user profile targets from Supabase. Render three sections using client components for interactivity (workout status with Start button, macro summary with color-coded progress, quick action navigation buttons). Use GlassCard wrapper for consistent glassmorphism styling. Handle all states: cold open (no data), with data, and transitions.

**Key Technical Decisions:**
- Dashboard page is a **server component** for fast initial render (<2s target)
- Client components receive data as props — minimal client JS
- Use Supabase server client for data fetching (already set up in layout)
- Simple aggregate queries (SUM) for meal macros — no TanStack Query needed since data is fetched server-side for initial load
- Use `useRouter` for programmatic navigation in client components
- No loading.tsx — synchronous server fetch blocks render until data available
- GlassCard as reusable wrapper for consistent section styling

**Component Tree:**
```
DashboardPage (server)
├── DashboardWorkoutStatus (client)
│   ├── EmptyState (no plan)
│   ├── StartButton (plan ready)
│   └── CompletedState (done)
├── DashboardNutritionSummary (client)
│   ├── EmptyState (no meals)
│   └── MacroProgress (with data)
└── QuickActions (client)
    ├── LogWorkout → /workout
    ├── LogMeal → /nutrition
    └── PlanWeek → /plan
```

**Route Detection:**
- Dashboard is at `/` (root of `(dashboard)` route group)
- Quick actions use `<Link>` from `next/link` or `router.push()` for programmatic nav

**Dashboard sections use GlassCard:**
```tsx
// GlassCard component
export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-[rgba(18,18,18,0.8)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] p-4 ${className || ""}`}>
      {children}
    </div>
  );
}
```

### Completion Notes

**Implementation Summary:**

1. **Dashboard page** (`src/app/(dashboard)/page.tsx`):
   - Created server component with Supabase server client data fetching
   - Fetches today's workout plan, meal logs aggregate, and user profile targets in parallel via Promise.all
   - Renders three sections: Workout Status, Nutrition Summary, Quick Actions
   - Handles all states: cold open, with data, completed
   - Proper heading hierarchy with sr-only h1

2. **DashboardWorkoutStatus component:**
   - Handles 4 states: no plan → empty state with Generate Plan CTA, plan ready → Start button, in progress → Resume, completed → summary
   - Uses Electric Lime primary button for Start, glass button for CTAs
   - Lucide React icons: Dumbbell, CalendarCheck, Play, CheckCircle2

3. **DashboardNutritionSummary component:**
   - Empty state: "No meals logged today" with Log Meal CTA
   - With data: calorie and protein progress with color coding
   - Color coding thresholds: green (≥80%), yellow (50-80%), red (<50%)

4. **QuickActions component:**
   - Three glass buttons: Log Workout, Log Meal, Plan Week
   - Grid layout (`grid-cols-3`), each button ≥44pt height
   - Navigates to correct route on tap
   - Proper aria-labels for accessibility

5. **GlassCard component:**
   - Reusable glassmorphism wrapper with backdrop-blur, glass-border, rounded-lg, padding
   - Accepts children and optional className

6. **EmptyState component:**
   - Reusable component with optional icon, title, description, and action button
   - Follows ONYX microcopy voice

### Build Verification

- `npm run build` completed successfully with no errors