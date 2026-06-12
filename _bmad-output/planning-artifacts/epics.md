---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-onyx-2026-06-08/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/EXPERIENCE.md"
workflowType: 'epics-and-stories'
project_name: 'onyx'
user_name: 'Yaniss Guendouzi'
date: '2026-06-08'
---

# onyx - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for onyx, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User Registration and Authentication — The user can sign up and authenticate via email/password or Google/Apple OAuth. Supabase Auth handles identity. Session persists across browser restarts. Unauthenticated users see landing/login screen.

FR2: Onboarding Wizard — The user can complete a multi-step onboarding capturing: current weight, goal (cut/maintain/bulk), weekly caloric target, protein target, equipment list, training split preference, session duration, training days per week, preferred ingredients, excluded ingredients, cuisine style reference. Progress persists if interrupted mid-way. Skippable with defaults.

FR3: Profile Management — After onboarding, the user can view and edit all profile settings (goals, body metrics, training preferences, nutrition preferences) from a Settings screen. Changing goals triggers a prompt to regenerate the weekly plan.

FR4: Generate Weekly Workout Plan via AI — The user can request an AI-generated weekly workout plan. System sends stored preferences + history to Gemini via backend proxy and returns a structured plan. Round-trip < 15s. Clear error message if Gemini unavailable.

FR5: AI Plan Uses Historical Context — Each AI generation builds on the user's logged history (4+ weeks of volume trends, completed exercises, progression data). Fresh users receive a reasonable starter plan.

FR6: Regenerate Specific Days — The user can regenerate individual days within the AI plan without regenerating the entire week. Context includes that day's muscle group and recent history.

FR7: Generate Weekly Meal Plan via AI — The user can request an AI-generated weekly meal plan. System sends nutrition preferences + Personal Meal Database entries to Gemini. Returns 7 days × 3-5 meals with estimated macros. User can accept, edit, or reject individual meals.

FR8: AI Plan Respects Personal Meal Database — AI preferentially uses meals from the user's Personal Meal Database for at least 60% of daily meals. New suggestions are marked as "New — estimated macros."

FR9: Create and Manage Exercise Templates — The user can create, edit, and delete Exercise Templates (name, default sets, default reps, default rest interval). Deleting a template does not remove it from past workouts.

FR10: Build Custom Workout — The user can build a workout from scratch by selecting exercises from their templates and specifying sets, reps, rest, and order. Exercises can be reordered via drag handle.

FR11: Edit AI-Generated Workout — The user can edit any aspect of an AI-generated workout — add/remove/reorder exercises, change sets/reps/rest. Edits do not trigger full regeneration. AI-created workouts show an "AI Generated" badge.

FR12: Personal Meal Database — Create Simple Meal — The user can create a Simple Meal with a name and total macros (calories, protein, carbs, fat). Saved to Personal Meal Database for reuse.

FR13: Personal Meal Database — Create Composite Meal (Recipe Builder) — The user can create a Composite Meal with a name and ingredient list (name, grams, macros). System calculates total macros. Editable ingredients.

FR14: Log Meal to Daily Intake — The user can log a meal from their Personal Meal Database to any day/time slot. Search filter available. Daily macro bar updates in real time.

FR15: Edit or Delete Logged Meal — The user can edit macros or delete a logged meal from any day. Overrides do not modify the database entry. Delete shows an undo toast for 5 seconds.

FR16: Track Body Weight — The user can log body weight (kg or lbs) and view a weight trend chart with optional 7-day moving average overlay. View history: 1W, 1M, 3M, All Time.

FR17: Track Lift Progression — The user can view progression curves for each exercise showing volume (sets × reps × weight) and estimated 1RM (Epley formula) over time. Date ranges: 1M, 3M, All Time.

FR18: Auto-Progression — System automatically adjusts target weight for next session based on logged performance. Configurable increments (default: 2.5kg lower body, 1.25kg upper body). User can override or disable per exercise.

FR19: Unified Stats Dashboard — The user can view a stats dashboard combining weight, workout, and nutrition data: Weight Trend, Lift Progression, Weekly Macro Adherence, Session Frequency.

FR20: Workout History View — The user can view a chronological list of completed sessions with date, duration, total volume, exercise count, and collapsible set details. Filterable by date range.

FR21: Nutrition History and Adherence View — The user can view daily and weekly nutrition logs with adherence to target macros. Color-coded macro bars (green/yellow/red). Weekly 7-day grid with averages.

FR22: Main Dashboard — The authenticated user lands on a dashboard showing today's workout status, logged macros vs target, and quick action buttons (Log Workout, Log Meal, Plan Week). Loads within 2 seconds on 4G.

FR23: Gemini Proxy Endpoint — Backend exposes POST /api/ai/generate with valid Supabase auth JWT. Accepts type (workout_plan, meal_plan, regenerate_day) + preferences + history. Constructs Gemini prompt, validates response, caches identical requests for 5 minutes.

FR24: Offline Logging — All write operations (log set, log meal, log weight) work without network connectivity. Data persisted to IndexedDB immediately. Offline indicator shown when disconnected.

FR25: Background Sync — When connectivity is restored, local changes sync to Supabase automatically. Silent sync with single "Synced" toast. Last-write-wins conflict resolution. Retries with exponential backoff (3 attempts).

FR26: Offline Cache for Plans — Current week's workout plan and meal plan are cached locally (IndexedDB) for offline viewing. "Cached" badge shown when offline. New AI generation requires connectivity.

FR27: PWA Installability — App meets PWA criteria: manifest (name, icons, theme_color, display standalone), Service Worker registration, beforeinstallprompt capture (max 2 appearances). Works in standalone mode.

FR28: Responsive Mobile-First Layout — Mobile-first responsive design. Mobile (<768px): single-column, bottom nav. Tablet (768-1024px): two-column. Desktop (>1024px): wider layout. Touch targets ≥44×44px. No horizontal scrolling on mobile.

FR29: Dark Theme — Single dark theme. Primary background near-black (#0D0D0D). Surface colors dark grays. Text white + light gray. Muted accent color for CTAs. No gamification elements.

### NonFunctional Requirements

NFR1: Initial page load (dashboard) completes in < 3 seconds on 4G mobile connection. Subsequent navigations < 300ms via client-side routing and local data.

NFR2: AI plan generation returns structured results in < 15 seconds (average case). Loading state with estimated time remaining.

NFR3: App bundle (JS/CSS/HTML) < 500 KB gzipped for initial load. Route-based code splitting for AI generation, stats dashboard, and settings.

NFR4: DB queries (workout history, meal history) return results in < 500ms for up to 12 months of data.

NFR5: All API communication over HTTPS. Supabase enforces RLS so users can only access their own data.

NFR6: Gemini API keys stored server-side only (backend proxy). No AI API credentials exposed to frontend.

NFR7: Auth tokens (Supabase JWT) stored in HTTP-only, Secure, SameSite=Strict cookies where possible; alternatively in memory with refresh rotation.

NFR8: User data isolated by Supabase user ID. No user can read or write another user's data.

NFR9: App must function offline for all logging and viewing of cached plans. If Supabase unreachable, user can still complete workout, log meal, log weight.

NFR10: Data sync must be lossless for write operations. No logged workout or meal lost due to network interruption.

NFR11: Gemini API failures (timeout, rate limit, malformed response) must not corrupt user's existing data or plans. User can retry generation.

NFR12: App logs key events (auth, plan generation, workout completion, meal log, sync success/failure) to telemetry system with user consent.

NFR13: Backend proxy logs Gemini API response times, error rates, and token usage for cost monitoring.

### Additional Requirements

- **Starter Template:** Project initialized via `npx create-next-app@latest onyx --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`. Post-scaffold dependencies: tailwindcss, @tailwindcss/postcss, lucide-react, framer-motion, shadcn/ui, @tanstack/react-query, @supabase/supabase-js, @supabase/ssr, @google/genai, next-pwa or @serwist/next.
- **Schema-first database design:** All Supabase tables + RLS policies designed upfront. Tables: workout_plans, exercise_templates, personal_meals, meal_logs, weight_logs, workout_sessions, profiles. Columns in snake_case.
- **Project structure:** src/app/ (route groups for auth, dashboard tabs, API), src/components/ui/ (shadcn primitives — CLI only), src/components/features/ (workout, nutrition, stats, plan, profile, shared), src/hooks/, src/lib/ (supabase, gemini, sync, validation), src/types/, src/styles/.
- **Naming conventions:** snake_case for DB, camelCase for TypeScript, PascalCase for components, UPPER_SNAKE_CASE for constants.
- **Zod schemas** shared between frontend and backend for runtime validation (Gemini responses + user input).
- **TanStack Query persistence** with IndexedDB adapter for offline-first data layer. Optimistic updates for log workout set, log meal, log weight.
- **Route-based code splitting** for AI generation views, stats dashboard, and settings — loaded lazily.
- **Design tokens** from STITCH_DESIGN_SYSTEM.md mapped to Tailwind CSS v4 via tokens.css.
- **Storage pressure monitoring** via `navigator.storage.estimate()`. Evict data >90 days under pressure.
- **5-min in-memory cache** for identical Gemini requests to reduce cost.
- **Gemini proxy** implemented as Next.js API route (POST /api/ai/generate). Single retry on validation failure.
- **Accessibility:** WCAG AA contrast, VoiceOver/TalkBack support, dynamic type scaling, reduced motion support, tap targets ≥44pt, color not sole identifier.
- **API response format:** `{ data: T, error: null }` on success; `{ data: null, error: { code: string, message: string } }` on failure.
- **Dates:** ISO 8601 strings everywhere (API, DB, IndexedDB). snake_case in DB → camelCase in frontend via converters.

### UX Design Requirements

UX-DR1: Implement dark theme color system with obsidian palette — surface (#131313), surface-container-low (#1c1b1b), primary (Electric Lime #c3f400), secondary (Ice Blue #00eefc), tertiary (Coral Red #ffdad7 family), glass-border (rgba(255,255,255,0.08)), neon glow effects. Map all DESIGN.md color tokens to Tailwind CSS custom properties.

UX-DR2: Implement typography system — Geist for headlines (display-stats 48px/700, headline-lg 32px/700, headline-md 24px/600), Inter for body text (body-lg 18px, body-md 16px), JetBrains Mono for data/labels (label-caps 12px/600, stat-label 14px/500). Mobile scaling: display-stats scales down to 36px.

UX-DR3: Implement glassmorphism component style — backdrop-blur-md with semi-transparent fill (rgba(18,18,18,0.8)) and 1px glass-border for floating elements (bottom nav, vibe drawer). No traditional drop shadows.

UX-DR4: Build Bottom Navigation component — 5 tabs (Workout/Dumbbell, Nutrition/Apple, Stats/BarChart3, Generate Plan/Sparkles, Profile/User). Glassmorphism bar, 64px height, backdrop-blur-md. Active tab Electric Lime accent, inactive on-surface-variant. Safe area inset for home indicator. Lucide React icons, 2px stroke.

UX-DR5: Build Primary Button (Electric Lime #c3f400 fill, #283500 text, rounded-lg, 48px height) and Glass Button (transparent fill, 1px glass-border, white text, rounded-lg) components.

UX-DR6: Build Exercise Card component — dark surface (#1c1b1b to #201f1f gradient). Default neutral border. Active state: 2px Electric Lime left border with neon glow. Shows exercise name (Geist), sets/reps/weight (JetBrains Mono), status indicator.

UX-DR7: Build minimalist Input Field component — no background fill, bottom-border style transitioning from glass-border to Ice Blue (#00eefc) on focus.

UX-DR8: Build Progress Bar component — dark charcoal track (#444933), Electric Lime or Ice Blue fill, rounded caps. Optional subtle animated pulse effect on fill.

UX-DR9: Build Fullscreen Workout Mode — background #0A0A0A, no nav/chrome. Timer in display-stats typography with Electric Lime glow. Exercise list with current highlighted (left neon border + bold name). Controls: Complete Set, Skip Exercise, Rest Timer. Exit button top-left (glass style, ≥44pt). Pause button next to timer. Set completion with checkmark icon + accent color. Completed exercises dimmer. Rest timer: circular countdown ring + numeric countdown (JetBrains Mono). Summary screen: total time, volume, exercises done, "Start Another" + "Done" buttons. PR detection post-session.

UX-DR10: Build Vibe Drawer (AI Plan Input) — bottom-anchored drawer with heavy backdrop blur. Natural language text area as sole focus. Ice Blue accent on send/submit icon. Swipe down to dismiss (cancels generation if in progress).

UX-DR11: Build Macro Ring component — circular progress ring split by protein/carbs/fat/fiber. Animated on change. Colors match progress bar tokens. Caps display at 110% with overflow indicator. Dashed segments for entries with incomplete macro data.

UX-DR12: Build Stats Card component — JetBrains Mono numeric values. Period picker (7d / 30d / 90d / All). Metric selector (volume, weight, reps, frequency). PR Highlights in Coral Red.

UX-DR13: Build Rest Timer component — circular countdown ring in Electric Lime. Numeric countdown in center (JetBrains Mono). Vibrate on completion. Swipe to dismiss early. Announces at :30, :15, :10, every second after :10, and on completion (screen reader).

UX-DR14: Implement responsive layout — mobile-first. Mobile: full bleed. Tablet/Desktop: centered 448px pillar (max-w-md). Consistent 1.25rem edge margins. 8px base vertical grid. Bottom nav and fullscreen workout account for device home indicators.

UX-DR15: Implement all state patterns — cold open (no plan/meals/data), active workout, paused workout (user-initiated + interruption), stale session (>15 min inactivity), workout complete (all + partial), empty session ended, AI generating/complete/failed, offline (normal + storage pressure >90% + full), empty search, save failed, online reconnection.

UX-DR16: Implement accessibility floor — screen readers (VoiceOver/TalkBack) with role + aria-label + aria-live regions. Dynamic type scaling (functional at largest size, display-stats scales down). Reduced motion (disable all animations on prefers-reduced-motion). Tap targets ≥44pt iOS / ≥48dp Android. Focus order top-to-bottom, left-to-right. Color not sole identifier (border glow + bold weight, checkmark icon + accent). Vibration on rest timer completion. WCAG AA contrast verified.

UX-DR17: Implement interaction primitives — tap to act, long-press on exercise card to edit set details, swipe down on Generate Plan to dismiss Vibe Drawer, pull-to-refresh on Workout and Stats, tap outside to dismiss keyboard. Banned: carousels, hero animations, parallax, badge counts, push notification re-engagement, infinite scroll.

UX-DR18: Implement microcopy voice and tone — technical, direct, encouraging without saccharine. Commands are short ("Start Workout." "Log Meal."). Feedback minimal ("Saved." "Logged."). Empty states helpful ("No workouts yet — tap Generate Plan to create your first."). Errors human ("Couldn't save — we'll retry when you're back online."). No gamification language.

UX-DR19: Implement offline indicators and storage pressure warnings — subtle cloud-off icon in bottom nav (dimly lit). No alert banner. Storage >90%: persistent warning on Workout and Nutrition tabs, cloud-off icon changes to storage-full variant. QuotaExceededError: alert + critical indicator in bottom nav. Cache eviction: completed workouts >90 days eligible.

UX-DR20: Build Plan Preview component — card stack showing generated plan. Swipe left/right between days. Swipe back to last 5 generated versions. Regenerate button. Confirm button. "Looks good? Confirm or regenerate." Toast on confirm: "Plan saved. Check Workout tab for your first session."

UX-DR21: Build Set Completion component — checkmark animation on set completion (subtle, only on prefers-reduced-motion: no-preference). Weight increments auto-adjust based on plan. Manual override available per set.

UX-DR22: Build Session Summary component — shown post-workout. Total time, volume (kg × reps), exercises done, "Start Another" button alongside "Done." Partial completion: "5/6 exercises done — Bench Press skipped." Empty session: "Free session logged — 15 min."

### FR Coverage Map

FR1: Epic 1 — User Registration and Authentication
FR2: Epic 1 — Onboarding Wizard
FR3: Epic 1 — Profile Management
FR4: Epic 4 — Generate Weekly Workout Plan via AI
FR5: Epic 4 — AI Plan Uses Historical Context
FR6: Epic 4 — Regenerate Specific Days
FR7: Epic 5 — Generate Weekly Meal Plan via AI
FR8: Epic 5 — AI Plan Respects Personal Meal Database
FR9: Epic 4 — Create and Manage Exercise Templates
FR10: Epic 4 — Build Custom Workout
FR11: Epic 4 — Edit AI-Generated Workout
FR12: Epic 5 — Personal Meal Database — Create Simple Meal
FR13: Epic 5 — Personal Meal Database — Create Composite Meal (Recipe Builder)
FR14: Epic 5 — Log Meal to Daily Intake
FR15: Epic 5 — Edit or Delete Logged Meal
FR16: Epic 6 — Track Body Weight
FR17: Epic 6 — Track Lift Progression
FR18: Epic 4 — Auto-Progression
FR19: Epic 6 — Unified Stats Dashboard
FR20: Epic 6 — Workout History View
FR21: Epic 6 — Nutrition History and Adherence View
FR22: Epic 2 — Main Dashboard
FR23: Epic 3 — Gemini Proxy Endpoint
FR24: Epic 2 — Offline Logging
FR25: Epic 2 — Background Sync
FR26: Epic 2 — Offline Cache for Plans
FR27: Epic 2 — PWA Installability
FR28: Epic 2 — Responsive Mobile-First Layout
FR29: Epic 2 — Dark Theme

## Epic List

### Epic 1: Foundation — Project Scaffold, Auth & Onboarding
User can sign up, log in, complete a multi-step onboarding wizard capturing goals, body metrics, training preferences, and nutrition preferences. Profile settings are editable post-onboarding.
**FRs covered:** FR1, FR2, FR3
**UX-DRs covered:** UX-DR16 (accessibility floor), UX-DR18 (microcopy)
**Key deliverables:** create-next-app scaffold + dependencies, Supabase schema migrations, auth pages (login/register), onboarding wizard, profile settings, Supabase SSR middleware.

### Epic 2: Core Shell — Dashboard, PWA, Theme & Offline Infrastructure
User lands on a polished dark-themed dashboard showing today's workout status and macro targets. The app is installable as a PWA, works offline for all logging, and syncs automatically when connectivity returns.
**FRs covered:** FR22, FR24, FR25, FR26, FR27, FR28, FR29
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5, UX-DR14, UX-DR15, UX-DR17, UX-DR19
**Key deliverables:** Dashboard layout, bottom navigation bar, PWA manifest + Service Worker, offline sync engine (IndexedDB + TanStack Query persistence), dark theme design tokens, responsive mobile-first shell.

### Epic 3: AI Engine — Gemini Proxy & Plan Generation UI
User can generate AI-powered workout and meal plans via natural language input. The Gemini proxy endpoint handles prompt construction, response validation, caching, and error handling. The Vibe Drawer provides the natural language input surface.
**FRs covered:** FR23
**UX-DRs covered:** UX-DR10 (vibe drawer), UX-DR20 (plan preview)
**Key deliverables:** POST /api/ai/generate endpoint, Gemini prompt templates (workout/meal/regen), Zod response validators, 5-min in-memory cache, Vibe Drawer component, Plan Preview card stack.

### Epic 4: Workout System — Plans, Templates & Session Logging
User can create exercise templates, build custom workouts from scratch, and edit AI-generated workouts. The fullscreen workout mode enables hands-free session logging with rest timers, set completion tracking, and auto-progression adjustment.
**FRs covered:** FR4, FR5, FR6, FR9, FR10, FR11, FR18
**UX-DRs covered:** UX-DR6 (exercise card), UX-DR9 (fullscreen workout), UX-DR13 (rest timer), UX-DR21 (set completion), UX-DR22 (session summary)
**Key deliverables:** Exercise template CRUD, workout builder UI, AI workout plan integration, fullscreen workout mode (timer, exercise list, controls), rest timer component, auto-progression logic (Epley formula), session summary.

### Epic 5: Nutrition System — Meal DB, Logging & AI Meal Plans
User can build a personal meal database with simple and composite meals, log meals to daily intake with real-time macro tracking, and generate AI meal plans that preferentially use their saved meals.
**FRs covered:** FR7, FR8, FR12, FR13, FR14, FR15
**UX-DRs covered:** UX-DR7 (input field), UX-DR11 (macro ring)
**Key deliverables:** Personal meal database (simple + composite meals), meal logging UI with search, macro ring component, AI meal plan integration, undo toast for deletions.

### Epic 6: Progress & Analytics — Unified Stats Dashboard
User can track body weight trends, lift progression curves, nutrition adherence over time, and view a unified stats dashboard combining all data with PR highlights.
**FRs covered:** FR16, FR17, FR19, FR20, FR21
**UX-DRs covered:** UX-DR8 (progress bar), UX-DR12 (stats card)
**Key deliverables:** Weight trend chart (1W/1M/3M/All), lift progression curves (volume + e1RM), nutrition adherence grid (daily + weekly), workout history view, unified stats dashboard layout.

**Dependency flow:** Epic 1 → Epic 2 → Epic 3 → Epics 4 & 5 (parallel) → Epic 6
Each epic is standalone and delivers complete user value without requiring future epics.

## Epic 1: Foundation — Project Scaffold, Auth & Onboarding

User can sign up, log in, complete a multi-step onboarding wizard capturing goals, body metrics, training preferences, and nutrition preferences. Profile settings are editable post-onboarding.
**FRs covered:** FR1, FR2, FR3
**UX-DRs covered:** UX-DR16 (accessibility floor), UX-DR18 (microcopy)

### Story 1.1: Project Scaffold and Supabase Schema

As a developer,
I want the Next.js project scaffolded with all dependencies, Supabase migrations created, and project structure established,
So that the development foundation is ready and consistent with the architecture.

**Acceptance Criteria:**

**Given** no project exists yet
**When** the developer runs the scaffold command
**Then** a Next.js 16 project is created with TypeScript, Tailwind CSS v4, ESLint, App Router, src/ directory, and @/* import alias
**And** all specified dependencies are installed: tailwindcss, @tailwindcss/postcss, lucide-react, framer-motion, shadcn/ui (initialized), @tanstack/react-query, @supabase/supabase-js, @supabase/ssr, @google/genai, @serwist/next

**Given** the project scaffold is complete
**When** the Supabase migration files are created
**Then** the following migration files exist under `supabase/migrations/`:
- 001_users.sql (extends Supabase auth.users with required columns)
- 002_profiles.sql (profiles table: user_id UUID PK, weight_kg DECIMAL, goal ENUM, caloric_target INT, protein_target INT, equipment TEXT[], preferred_split TEXT, session_duration INT, training_days INT, preferred_ingredients TEXT[], excluded_ingredients TEXT[], cuisine_style TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- 009_rls_policies.sql (RLS policies for all tables: select/insert/update/delete scoped to user_id)

**Given** the project structure is being set up
**When** directories are created
**Then** the following directory structure exists: src/app/(auth)/, src/app/(dashboard)/workout/, src/app/(dashboard)/nutrition/, src/app/(dashboard)/stats/, src/app/(dashboard)/plan/, src/app/(dashboard)/profile/onboarding/, src/app/api/ai/generate/, src/components/ui/, src/components/features/workout/, src/components/features/nutrition/, src/components/features/stats/, src/components/features/plan/, src/components/features/profile/, src/components/features/shared/, src/hooks/, src/lib/supabase/, src/lib/gemini/, src/lib/sync/, src/lib/validation/, src/types/, src/styles/

**Given** the scaffold is complete
**When** `npm run build` is executed
**Then** the project compiles without errors

### Story 1.2: User Authentication — Registration and Login

As a user,
I want to sign up and log in using email/password or Google/Apple OAuth,
So that I can access my personal ONYX data securely.

**Acceptance Criteria:**

**Given** I am an unauthenticated user visiting the app
**When** I navigate to any protected route
**Then** I am redirected to the login page

**Given** I am on the login page
**When** I enter my email and password and tap "Log In"
**Then** I am authenticated via Supabase Auth and redirected to the dashboard

**Given** I am on the registration page
**When** I enter my email, password, and tap "Sign Up"
**Then** a Supabase profile record is created with my user ID
**And** I am redirected to the onboarding wizard

**Given** I am on the login page
**When** I tap "Continue with Google" or "Continue with Apple"
**Then** the OAuth flow completes and I am redirected to the dashboard (or onboarding if first visit)

**Given** I have authenticated
**When** I close and reopen the browser
**Then** my session persists (JWT refresh token flow via Supabase SSR)
**And** I remain on the dashboard without re-authenticating

**Given** I am authenticated
**When** I access any route under `(auth)/`
**Then** I am redirected to the dashboard

**Given** I have an active session
**When** I tap "Log Out"
**Then** my session is destroyed and I am redirected to the login page

**Accessibility:** All form inputs have associated labels, error messages use aria-live regions, and OAuth buttons have descriptive aria-labels.

### Story 1.3: Onboarding Wizard

As a new user,
I want to complete a multi-step onboarding wizard that captures my goals, body metrics, training preferences, and nutrition preferences,
So that ONYX can generate personalized workout and meal plans.

**Acceptance Criteria:**

**Given** I am a newly registered user
**When** I first access the app after registration
**Then** I am presented with the onboarding wizard

**Given** I am on the first onboarding step
**When** I enter my current weight (kg or lbs) and select my goal (cut/maintain/bulk)
**Then** I can proceed to the next step

**Given** I am on the nutrition targets step
**When** I enter my weekly caloric target and protein target (g)
**Then** I can proceed to the next step

**Given** I am on the training preferences step
**When** I select my available equipment (checkboxes: barbell, dumbbells, cable machine, etc.), preferred split (PPL, Upper/Lower, Full Body, etc.), session duration (minutes), and training days per week
**Then** I can proceed to the next step

**Given** I am on the nutrition preferences step
**When** I enter preferred ingredients, excluded ingredients, and cuisine style
**Then** I can proceed to the review step

**Given** I am on any onboarding step
**When** I tap "Back"
**Then** I return to the previous step with all entered values preserved

**Given** I am mid-way through onboarding
**When** I close the browser or navigate away
**Then** my progress is saved as draft in local state
**And** when I return, I resume from where I left off

**Given** I do not want to complete onboarding
**When** I tap "Skip for now"
**Then** reasonable defaults are applied (goal=maintain, 4 training days/week, 60min sessions, basic PPL split, no excluded ingredients)
**And** I am taken to the dashboard

**Given** I have completed all onboarding steps
**When** I tap "Complete"
**Then** my preferences are saved to my Supabase profile
**And** I am taken to the dashboard with a "Generating your first plan..." state

**Accessibility:** Each step fits within a single mobile screen height. All inputs have labels. Error states are announced via aria-live. Touch targets ≥44pt.

### Story 1.4: Profile Management

As a user,
I want to view and edit my profile settings,
So that I can update my goals, body metrics, and preferences as they change.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I navigate to the Profile/Settings tab
**Then** I see my current profile settings: weight, goal, caloric target, protein target, equipment, split preference, session duration, training days, preferred ingredients, excluded ingredients, cuisine style

**Given** I am on the Profile screen
**When** I tap "Edit" on any field
**Then** I can modify that field's value

**Given** I edit a field
**When** I tap "Save"
**Then** the updated value is persisted to Supabase
**And** I see a "Saved" confirmation toast

**Given** I change my goal, caloric target, or training preferences
**When** I save the changes
**Then** I am prompted: "Your goals have changed — would you like to regenerate your weekly plan?"
**And** I can tap "Regenerate" or "Keep current plan"

**Given** I am on the Profile screen
**When** I view any field
**Then** the field shows my current saved value (not a default)

**Accessibility:** All editable fields have visible focus indicators. Save button has loading state. Error states (network failure) show retry option.

## Epic 2: Core Shell — Dashboard, PWA, Theme & Offline Infrastructure

User lands on a polished dark-themed dashboard showing today's workout status and macro targets. The app is installable as a PWA, works offline for all logging, and syncs automatically when connectivity returns.
**FRs covered:** FR22, FR24, FR25, FR26, FR27, FR28, FR29
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5, UX-DR14, UX-DR15, UX-DR17, UX-DR19

### Story 2.1: Design Token System and Dark Theme Shell

As a developer,
I want the design token system implemented with all colors, typography, spacing, and glassmorphism utilities from DESIGN.md,
So that all subsequent components use consistent styling and the dark theme is the visual foundation.

**Acceptance Criteria:**

**Given** the design token system is being set up
**When** I inspect `src/styles/tokens.css`
**Then** CSS custom properties exist for all DESIGN.md color tokens: surface (#131313), surface-container-low (#1c1b1b), surface-container (#201f1f), surface-container-high (#2a2a2a), on-surface (#e5e2e1), on-surface-variant (#c4c9ac), primary (#ffffff), primary-container (#c3f400), on-primary (#283500), secondary (#d3fbff), secondary-container (#00eefc), tertiary (#ffffff), tertiary-container (#ffdad7), error (#ffb4ab), glass-border (rgba(255,255,255,0.08)), neon-glow-lime (rgba(204,255,0,0.15)), neon-glow-cyan (rgba(0,240,255,0.15))

**Given** the typography system is configured
**When** I inspect the Tailwind config and global CSS
**Then** Geist is set as the font for headlines (display-stats 48px/700, headline-lg 32px/700, headline-md 24px/600), Inter for body text (body-lg 18px, body-md 16px), and JetBrains Mono for data/labels (label-caps 12px/600, stat-label 14px/500)
**And** display-stats scales down to 36px on mobile viewports

**Given** the glassmorphism utility is implemented
**When** I apply the glassmorphism class to an element
**Then** it has backdrop-blur-md, semi-transparent fill (rgba(18,18,18,0.8)), and 1px solid glass-border

**Given** the responsive layout is configured
**When** I view the app on a mobile viewport (<768px)
**Then** content uses full bleed width with consistent 1.25rem edge margins
**When** I view on tablet/desktop (>768px)
**Then** content is constrained to a centered 448px pillar (max-w-md)

**Given** the dark theme is applied
**When** I inspect the root layout
**Then** the background is near-black (#0D0D0D or #131313), text is white (#FFFFFF) and light gray (#B0B0B0) for secondary text
**And** no gamification elements (streaks, badges, levels) are present in the UI

### Story 2.2: Bottom Navigation and Tab Shell

As a user,
I want a glassmorphism bottom navigation bar with 5 tabs,
So that I can switch between Workout, Nutrition, Stats, Generate Plan, and Profile surfaces.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I view the app on mobile
**Then** a glassmorphism bottom navigation bar is visible at the bottom of the screen, 64px height, with backdrop-blur-md

**Given** the bottom nav is rendered
**When** I inspect the tabs
**Then** there are exactly 5 tabs with Lucide React icons (2px stroke): Workout (Dumbbell), Nutrition (Apple), Stats (BarChart3), Generate Plan (Sparkles), Profile (User)

**Given** I am on the Workout tab
**When** I view the bottom nav
**Then** the Workout icon is highlighted with Electric Lime (#c3f400) accent
**And** inactive tabs use on-surface-variant (#c4c9ac) color

**Given** I tap the Nutrition tab
**When** the navigation occurs
**Then** the Nutrition surface is displayed and the Nutrition icon becomes active (Electric Lime)

**Given** I am on any tab
**When** I re-tap the same tab
**Then** the surface scrolls to top

**Given** the bottom nav is rendered
**When** I inspect the layout
**Then** safe area inset is applied for device home indicators (padding-bottom: env(safe-area-inset-bottom))

**Given** I am on a desktop viewport
**When** I view the app
**Then** the bottom nav is still visible and functional (same behavior as mobile)

### Story 2.3: Main Dashboard — DEPRECATED (Default landing is /workout)

**Decision:** The root `page.tsx` gatekeeper (auth check + onboarding redirect) already exists at `/`. Rather than creating a separate dashboard page, the authenticated landing page is the **Workout tab** (`/workout`). 

**Why:** The root `/` route is occupied by the auth gatekeeper (checks session → onboarding → redirects). Adding a dashboard page at `(dashboard)/` would conflict with the root page. The Workout tab serves as the natural landing point — it's the primary action surface for the app.

**What was done:**
- Root `page.tsx` redirects authenticated + onboarded users to `/workout`
- No separate dashboard page exists
- The `(dashboard)/page.tsx` was created and then removed after the decision
- Shared components `GlassCard` and `EmptyState` remain available for reuse

**FRs originally covered by this story (FR22)** are now handled by the Workout tab experience.

### Story 2.4: PWA Shell — Manifest, Service Worker and Install Prompt

As a user,
I want ONYX to be installable as a PWA with offline support,
So that I can use it like a native app and access it without internet.

**Acceptance Criteria:**

**Given** the PWA manifest is configured
**When** I inspect `public/manifest.json`
**Then** it includes: name ("ONYX"), short_name, icons (192px and 512px), theme_color (#000000), display ("standalone"), start_url ("/")

**Given** the app loads in a browser
**When** I inspect the network tab
**Then** a Service Worker is registered on first load

**Given** I am using a supported browser
**When** the beforeinstallprompt event fires
**Then** a custom install prompt is presented on the dashboard (dismissable, max 2 appearances)

**Given** I install the app
**When** I open it from the home screen
**Then** it opens in standalone mode with no browser chrome visible

**Given** the Service Worker is active
**When** I go offline and reload the app
**Then** the app shell (layout, navigation, cached content) is displayed from the cache

### Story 2.5: Offline Sync Engine — IndexedDB, Background Sync and Indicators

As a user,
I want all my logging to work offline and sync automatically when I'm back online,
So that I never lose data even without internet.

**Acceptance Criteria:**

**Given** I am offline
**When** I log a workout set, meal, or body weight
**Then** the data is persisted to IndexedDB immediately
**And** I see a subtle cloud-off icon in the bottom nav (dimly lit)

**Given** I am offline
**When** I view the current week's workout plan or meal plan
**Then** the cached plan is displayed from IndexedDB with a subtle "Cached" badge

**Given** I am offline and connectivity is restored
**When** the reconnection event fires
**Then** all pending changes are synced to Supabase in order of creation time
**And** a single "Synced" toast appears when all pending operations complete
**And** the cloud-off icon disappears from the bottom nav

**Given** a sync conflict occurs (same record modified offline and online)
**When** the sync engine resolves the conflict
**Then** last-write-wins based on `updated_at` timestamp

**Given** a sync operation fails
**When** the first attempt fails
**Then** the system retries with exponential backoff (up to 3 attempts)

**Given** storage usage exceeds 90% of quota
**When** I view the Workout or Nutrition tab
**Then** a persistent warning is shown: "Storage almost full — export or delete old data in Settings"
**And** the cloud-off icon changes to a storage-full variant (exclamation)

**Given** storage is completely full (QuotaExceededError)
**When** I attempt to save data
**Then** an alert is shown: "Device storage full — workouts may not save. Export or delete old data in Settings."
**And** a critical indicator appears in the bottom nav

**Given** storage pressure is detected
**When** the system needs to free space
**Then** completed workouts older than 90 days are eligible for cache eviction

## Epic 3: AI Engine — Gemini Proxy & Plan Generation UI

User can generate AI-powered workout and meal plans via natural language input. The Gemini proxy endpoint handles prompt construction, response validation, caching, and error handling. The Vibe Drawer provides the natural language input surface.
**FRs covered:** FR23
**UX-DRs covered:** UX-DR10 (vibe drawer), UX-DR20 (plan preview)

### Story 3.1: Gemini Proxy Endpoint

As a developer,
I want a backend API endpoint that constructs prompts for Google Gemini, sends them, validates the structured JSON response, and returns it to the frontend,
So that AI plan generation is reliable, secure, and cost-efficient.

**Acceptance Criteria:**

**Given** the Gemini proxy endpoint exists
**When** I send a POST request to `/api/ai/generate` with a valid Supabase auth JWT
**Then** the endpoint returns a 200 response with structured JSON data

**Given** the request body specifies `type: "workout_plan"`
**When** the backend constructs the Gemini prompt
**Then** the prompt includes: user's equipment, preferred split, session duration, training days, injury notes, and last 4 weeks' completed workout history

**Given** the request body specifies `type: "meal_plan"`
**When** the backend constructs the Gemini prompt
**Then** the prompt includes: goal daily macros, preferred ingredients, excluded ingredients, cuisine style, and up to 20 most-used entries from Personal Meal Database
**And** the prompt instructs Gemini to prefer meals from the user's database for at least 60% of daily meals

**Given** the request body specifies `type: "regenerate_day"`
**When** the backend constructs the Gemini prompt
**Then** the prompt includes that day's muscle group, user's preferences, and recent history for that movement pattern

**Given** Gemini returns a response
**When** the backend receives it
**Then** the response is parsed as JSON and validated against the expected Zod schema
**And** if validation fails, the backend retries once
**And** if validation fails a second time, a descriptive error is returned

**Given** an identical request is made within 5 minutes
**When** the backend receives it
**Then** the cached response is returned without calling Gemini again

**Given** the request is missing a valid auth JWT
**When** the endpoint is called
**Then** a 401 Unauthorized error is returned

**Given** Gemini is unavailable or times out
**When** the endpoint is called
**Then** a descriptive error is returned: "AI generation is temporarily unavailable. Please try again."
**And** the user's existing data is not affected

**Given** the endpoint is called
**When** the request completes
**Then** the backend logs: response time, error status (if any), and token usage for cost monitoring

### Story 3.2: Vibe Drawer — AI Plan Input UI

As a user,
I want a natural language input interface for describing my training or nutrition preferences,
So that I can generate AI-powered plans by typing what I want.

**Acceptance Criteria:**

**Given** I am on the Generate Plan tab
**When** I tap the input area
**Then** a bottom-anchored drawer (Vibe Drawer) slides up with heavy backdrop blur
**And** the drawer contains a single natural language text area as the sole focus

**Given** the Vibe Drawer is open
**When** I inspect the send/submit icon
**Then** it uses Ice Blue (#00eefc) accent color

**Given** I type a training request and tap send
**When** the AI generation starts
**Then** I see skeleton cards (3, pulsing) with "Generating your plan..." text and an Ice Blue accent indicator
**And** a Cancel button is visible in the drawer header
**And** a hard client-side timeout of 20 seconds is active

**Given** AI generation is in progress
**When** I switch to another tab
**Then** generation continues in the background
**And** when I return to the Generate Plan tab, the result is shown if complete, or the skeleton state if still in progress

**Given** AI generation is in progress
**When** I swipe down to dismiss the Vibe Drawer
**Then** generation is cancelled

**Given** AI generation completes successfully
**When** the response is received
**Then** the skeleton cards transition to the plan preview

**Given** AI generation fails (timeout or server error)
**When** the error occurs
**Then** I see "Couldn't generate right now. Try again." with a glass-style retry button

**Given** the Vibe Drawer is open
**When** I tap outside the drawer or swipe down
**Then** the drawer dismisses

**Accessibility:** The Vibe Drawer is labeled with role="dialog". Focus is trapped within the drawer when open. The text area has an associated label. Loading state is announced via aria-live region.

### Story 3.3: Plan Preview and Confirmation

As a user,
I want to preview the AI-generated plan before confirming it,
So that I can review, regenerate, or adjust it before it becomes my active plan.

**Acceptance Criteria:**

**Given** AI generation completes successfully
**When** the plan preview is displayed
**Then** I see a card stack showing the generated plan with one card per day

**Given** I am viewing the plan preview
**When** I swipe left or right
**Then** I navigate between days in the plan

**Given** I want to see a previous version
**When** I swipe back
**Then** I can access the last 5 generated plans stored in the session

**Given** I am viewing the plan preview
**When** I tap "Regenerate"
**Then** a new plan is generated with different parameters

**Given** I am satisfied with the plan
**When** I tap "Confirm"
**Then** a toast appears: "Plan saved. Check Workout tab for your first session."
**And** the app navigates to the relevant tab (Workout for workout plans, Nutrition for meal plans)

**Given** I am viewing the plan preview
**When** I inspect the UI
**Then** I see "Looks good? Confirm or regenerate." with a Confirm button and a Regenerate button

**Given** the plan is a workout plan
**When** I confirm it
**Then** the workout plan appears on the Workout tab with today's session ready

**Given** the plan is a meal plan
**When** I confirm it
**Then** the meal plan appears on the Nutrition tab with today's meals listed

## Epic 4: Workout System — Plans, Templates & Session Logging

User can create exercise templates, build custom workouts from scratch, and edit AI-generated workouts. The fullscreen workout mode enables hands-free session logging with rest timers, set completion tracking, and auto-progression adjustment.
**FRs covered:** FR4, FR5, FR6, FR9, FR10, FR11, FR18
**UX-DRs covered:** UX-DR6 (exercise card), UX-DR9 (fullscreen workout), UX-DR13 (rest timer), UX-DR21 (set completion), UX-DR22 (session summary)

### Story 4.1: Exercise Template CRUD

As a user,
I want to create, edit, and delete exercise templates with default sets, reps, and rest intervals,
So that I can quickly build workouts from my saved exercise library.

**Acceptance Criteria:**

**Given** I am on the Workout tab
**When** I navigate to the exercise library
**Then** I see a list of my exercise templates sorted alphabetically

**Given** I want to create a new exercise template
**When** I tap "Create Template"
**Then** I can enter: name (free text), default sets (number), default reps (number), default rest interval (seconds)
**And** when I save, the template appears in my exercise library

**Given** I want to edit an existing template
**When** I tap "Edit" on a template
**Then** I can modify any field (name, default sets, default reps, rest interval)

**Given** I want to delete a template
**When** I confirm deletion
**Then** the template is removed from the exercise library
**And** it is not removed from any past workouts (data integrity preserved)

**Given** I am selecting an exercise for a workout
**When** I open the exercise picker
**Then** all my templates are listed alphabetically with their default sets/reps/rest

**Accessibility:** Each template card uses the Exercise Card component (dark surface, JetBrains Mono for sets/reps/rest). Edit and delete controls have minimum 44pt tap targets. Confirmation dialog for deletion.

### Story 4.2: Custom Workout Builder

As a user,
I want to build a custom workout by selecting exercises from my templates with specific sets, reps, rest, and order,
So that I can create exactly the training session I want.

**Acceptance Criteria:**

**Given** I am on the Workout tab
**When** I tap "Build Workout"
**Then** I see an empty workout builder

**Given** I am in the workout builder
**When** I tap "Add Exercise"
**Then** I see my exercise template list and can select one to add to the workout

**Given** I add an exercise to the workout
**When** the exercise appears
**Then** it shows the template's default sets, reps, and rest
**And** I can override these values per exercise without changing the template

**Given** I have added multiple exercises
**When** I use the drag handle on an exercise
**Then** I can reorder the exercises in the workout

**Given** I want to remove an exercise
**When** I tap "Remove" on an exercise
**Then** it is removed from the workout (template is not deleted)

**Given** my workout is complete
**When** I tap "Save Workout"
**Then** the workout is saved to my calendar on the specified day
**And** it appears on the Workout tab for that day

**Accessibility:** All touch targets ≥44pt. Drag handle has accessible label. Set/reps/rest inputs use minimalist bottom-border style. Saved workout shows confirmation.

### Story 4.3: AI Workout Plan Integration and Editing

As a user,
I want AI-generated workout plans to be fully editable in the workout builder,
So that I can customize any part of the AI's suggestions.

**Acceptance Criteria:**

**Given** I have generated an AI workout plan and confirmed it
**When** I view the plan on the Workout tab
**Then** each workout shows an "AI Generated" badge

**Given** I am viewing an AI-generated workout
**When** I tap "Edit"
**Then** the workout opens in the same workout builder UI used for manual workouts

**Given** I am editing an AI-generated workout
**When** I add, remove, or reorder exercises
**Then** only that specific day is changed — no full regeneration occurs

**Given** I am editing an AI-generated workout
**When** I change sets, reps, or rest for any exercise
**Then** those values are updated for that day only

**Given** I long-press on a day in the weekly view
**When** I select "Regenerate Day"
**Then** only that day's exercises are regenerated via the Gemini proxy
**And** the context includes that day's muscle group and my recent history for that movement pattern

**Given** I have edited an AI-generated workout
**When** I save
**Then** the edited workout is saved to my calendar
**And** the "AI Generated" badge remains to indicate its origin

### Story 4.4: Fullscreen Workout Mode

As a user,
I want a distraction-free fullscreen workout mode with a timer, rest timer, set logging, and session summary,
So that I can focus on my training without app chrome.

**Acceptance Criteria:**

**Given** I am on the Workout tab viewing a workout
**When** I tap "Start Workout"
**Then** the app transitions to fullscreen mode with background #0A0A0A, no navigation, no chrome

**Given** fullscreen workout mode is active
**When** I view the screen
**Then** I see: timer at the top (display-stats typography, Electric Lime glow), exercise list (scrollable, current exercise highlighted with left neon border + bold name), and controls (Complete Set, Skip Exercise, Rest Timer)

**Given** I complete a set
**When** I tap "Complete Set"
**Then** a subtle checkmark appears on that set
**And** the rest timer starts counting down

**Given** the rest timer is active
**When** I view it
**Then** I see a circular countdown ring in Electric Lime with numeric countdown in the center (JetBrains Mono)
**And** it vibrates on completion (haptic on supported devices)
**And** I can swipe to dismiss it early

**Given** all sets for an exercise are complete
**When** the last set is completed
**Then** the exercise card dims slightly with a checkmark icon visible

**Given** I want to pause my workout
**When** I tap the pause icon next to the timer
**Then** the timer pauses, the overlay dims, and I see "Resume" (primary button) and "End Workout" (glass button)

**Given** I receive an interruption (call or app switch)
**When** I return to the app
**Then** all timers (workout + rest) are paused and I must tap "Resume" to continue

**Given** I have been inactive for more than 15 minutes
**When** I return to the app
**Then** I see: "It looks like you stepped away — End workout or Resume?"
**And** if no action is taken for 5 minutes, the workout auto-ends

**Given** I complete all exercises in the workout
**When** the last exercise is done
**Then** I see: "Workout complete — Great work." with summary (total time, volume in kg × reps, exercises done)
**And** "Start Another" button alongside "Done"

**Given** I end the workout with uncompleted exercises
**When** I tap "End Workout"
**Then** I see a confirmation dialog: "You have completed 5 of 6 exercises. Save progress and end?"
**And** the summary shows "5/6 exercises done — Bench Press skipped"
**And** the Workout tab shows "Completed (partial)"

**Given** I started an empty session with no exercises
**When** I end it
**Then** I see "Free session logged — 15 min" with zero volume
**And** if any sets were logged, data appears in Stats as "Free-form"

**Given** the session completes
**When** post-session processing runs
**Then** PR detection compares each exercise against historical data by normalized name
**And** if a new PR is detected, a Coral Red badge appears on the relevant exercise

**Given** I am offline
**When** I start and complete a fullscreen workout
**Then** all data is logged to IndexedDB
**And** syncs when connectivity is restored

**Accessibility:** Timer announced every 60s via screen reader. Rest timer announces at :30, :15, :10, every second after :10, and on completion. All buttons ≥44pt. Exit button top-left (glass style, ≥44pt). Color not sole identifier (border glow + bold name for active exercise, checkmark icon + accent for completion). Set completion animation only on prefers-reduced-motion: no-preference.

### Story 4.5: Auto-Progression Engine

As a user,
I want the system to automatically adjust my target weights based on my logged performance,
So that I progressively overload without manually calculating weight increases.

**Acceptance Criteria:**

**Given** I have completed all target reps for all sets of an exercise
**When** the next session is generated or loaded
**Then** the target weight is increased by the configured increment
**And** the default increment is 2.5 kg for lower body exercises and 1.25 kg for upper body exercises

**Given** I failed to reach target reps on any set of an exercise
**When** the next session is generated or loaded
**Then** the target weight stays the same

**Given** I have failed to reach target reps for 3 consecutive sessions of the same exercise
**When** the next session is generated or loaded
**Then** the target weight decreases by one increment

**Given** I want to customize progression for a specific exercise
**When** I open the exercise settings
**Then** I can override the auto-progression increment per exercise
**And** I can disable auto-progression for that exercise entirely

**Given** auto-progression is applied
**When** I view the workout in the builder
**Then** I see the adjusted target weight pre-filled for each exercise

**Given** I have no logged history for an exercise
**When** auto-progression runs
**Then** the weight stays at the initial value set in the plan (no change)

## Epic 5: Nutrition System — Meal DB, Logging & AI Meal Plans

User can build a personal meal database with simple and composite meals, log meals to daily intake with real-time macro tracking, and generate AI meal plans that preferentially use their saved meals.
**FRs covered:** FR7, FR8, FR12, FR13, FR14, FR15
**UX-DRs covered:** UX-DR7 (input field), UX-DR11 (macro ring)

### Story 5.1: Personal Meal Database — Simple and Composite Meals

As a user,
I want to build a personal meal database with both simple meals and composite meals (recipes),
So that I can log my home-cooked food quickly and accurately.

**Acceptance Criteria:**

**Given** I am on the Nutrition tab
**When** I tap "Create Meal"
**Then** I can choose between "Simple Meal" and "Composite Meal (Recipe)"

**Given** I choose "Simple Meal"
**When** I enter a meal name and total macros (calories, protein g, carbs g, fat g)
**Then** the meal is saved to my Personal Meal Database

**Given** I choose "Composite Meal (Recipe)"
**When** I enter a meal name and add ingredients one by one (ingredient name, grams, macros for that gram amount)
**Then** the system displays running total macros as ingredients are added
**And** when I save, the Composite Meal is stored with per-ingredient data and total macros

**Given** I am adding ingredients to a composite meal
**When** I need to edit or remove an ingredient
**Then** I can edit the gram amount or macros of any ingredient, or remove it entirely

**Given** I want to view my saved meals
**When** I navigate to my meal database
**Then** meals are listed with a search filter at the top

**Given** I want to edit a saved meal
**When** I tap "Edit"
**Then** I can modify the name, macros (simple), or ingredients (composite)

**Given** I want to delete a saved meal
**When** I confirm deletion
**Then** the meal is removed from my database
**And** it is not removed from any past meal logs

**Accessibility:** Input fields use minimalist bottom-border style (UX-DR7). All touch targets ≥44pt.

### Story 5.2: Meal Logging to Daily Intake

As a user,
I want to log meals from my database to any day and time slot,
So that I can track my daily nutrition intake.

**Acceptance Criteria:**

**Given** I am on the Nutrition tab
**When** I tap "Log Meal"
**Then** I can pick a date and meal time (breakfast, lunch, dinner, snack, or custom time)

**Given** I am selecting a meal to log
**When** I search or browse my Personal Meal Database
**Then** I can filter meals by name using the search input

**Given** I select a meal from my database
**When** I confirm the log
**Then** the meal's macros are added to that day's totals
**And** the daily macro bar updates in real time

**Given** I want to log the same meal multiple times on the same day
**When** I select it again
**Then** it is logged as a separate entry with cumulative macros

**Given** I am offline
**When** I log a meal
**Then** the meal data is saved to IndexedDB
**And** the macro ring updates from cached data
**And** syncs when connectivity is restored

**Given** I am logging a meal with incomplete macro data (some fields null)
**When** I confirm the log
**Then** the entry is saved with the available data
**And** the macro ring shows dashed segments for incomplete macro entries

### Story 5.3: Macro Ring and Daily Nutrition View

As a user,
I want to see a circular macro ring showing my daily macro progress,
So that I can quickly see how my logged meals track against my targets.

**Acceptance Criteria:**

**Given** I am on the Nutrition tab
**When** the daily view loads
**Then** I see a circular macro ring split by protein, carbs, and fat, with colors matching progress bar tokens

**Given** I log a meal
**When** the macro ring updates
**Then** the segments animate to reflect the new totals
**And** the caps display at 110% with an overflow indicator if macros exceed targets

**Given** I have a logged meal with incomplete macro data
**When** the macro ring renders
**Then** dashed segments are shown for entries with null macro values

**Given** I am viewing the daily nutrition view
**When** I look at the macro bar
**Then** I see actual vs target for calories, protein, carbs, and fat, color-coded: green (±10%), yellow (±20%), red (>20%)

**Given** I want to edit a logged meal
**When** I tap on a meal entry
**Then** I can adjust its macros (overrides do not modify the database entry, only the instance)

**Given** I want to delete a logged meal
**When** I confirm deletion
**Then** the macros are subtracted from the day's totals
**And** an undo toast appears for 5 seconds with "Undo" option

### Story 5.4: AI Meal Plan Integration

As a user,
I want AI-generated meal plans to appear on my Nutrition tab,
So that I can see my planned meals and accept, edit, or reject individual suggestions.

**Acceptance Criteria:**

**Given** I have generated and confirmed an AI meal plan
**When** I navigate to the Nutrition tab
**Then** I see the AI-generated meals for each day

**Given** I am viewing the AI meal plan
**When** I inspect the meal suggestions
**Then** meals that exist in my Personal Meal Database use exact stored macros
**And** new meal suggestions are marked "New — estimated macros"

**Given** I want to accept a suggested meal
**When** I tap "Accept"
**Then** the meal is logged to that day and time slot

**Given** I want to edit a suggested meal
**When** I tap "Edit"
**Then** I can modify the macros before logging

**Given** I want to reject a suggested meal
**When** I tap "Reject"
**Then** the meal is removed from that day's plan

**Given** I accept a new meal suggestion (marked "New — estimated macros")
**When** I confirm
**Then** the meal is saved to my Personal Meal Database with the estimated macros
**And** it is logged to the selected day/time slot

**Given** I am generating a new AI meal plan
**When** the system sends the prompt to Gemini
**Then** it instructs Gemini to prefer meals from my database for at least 60% of daily meals

## Epic 6: Progress & Analytics — Unified Stats Dashboard

User can track body weight trends, lift progression curves, nutrition adherence over time, and view a unified stats dashboard combining all data with PR highlights.
**FRs covered:** FR16, FR17, FR19, FR20, FR21
**UX-DRs covered:** UX-DR8 (progress bar), UX-DR12 (stats card)

### Story 6.1: Body Weight Tracking

As a user,
I want to log my body weight and view a trend chart over time,
So that I can track my weight changes and see the trend.

**Acceptance Criteria:**

**Given** I am on the Stats tab or Dashboard
**When** I tap the weight quick-input
**Then** I can enter my weight (kg or lbs, configurable in settings)

**Given** I log my weight
**When** I save the entry
**Then** it is plotted on the weight trend chart
**And** I can see an optional 7-day moving average overlay

**Given** I am viewing the weight trend chart
**When** I change the period picker
**Then** I can view weight history for 1W, 1M, 3M, or All Time

**Given** I have no weight entries logged
**When** I view the weight section
**Then** I see "Log your first weight entry to see a trend"

**Given** I am offline
**When** I log my weight
**Then** the entry is saved to IndexedDB and syncs when connectivity is restored

**Accessibility:** Chart data is available via screen reader (data points announced on focus). Touch targets for period picker ≥44pt.

### Story 6.2: Lift Progression and Workout History

As a user,
I want to view progression curves for each exercise and a chronological list of completed sessions,
So that I can track my strength gains over time and review past workouts.

**Acceptance Criteria:**

**Given** I am on the Stats tab
**When** I view lift progression
**Then** I see a chart for each exercise showing volume (sets × reps × weight) and estimated 1RM (Epley formula: weight × (1 + reps/30)) over time

**Given** I am viewing a lift progression chart
**When** I change the date range
**Then** I can view data for 1M, 3M, or All Time

**Given** I tap on a data point in the lift chart
**When** the detail appears
**Then** I see the date and logged sets for that session

**Given** I am viewing workout history
**When** the list loads
**Then** I see a chronological list of completed sessions sorted by date (most recent first)
**And** each session shows: date, duration, total volume, number of exercises

**Given** I tap on a past session
**When** the detail expands
**Then** I see a collapsible list of logged sets with exercise name, weight, reps, and RPE if recorded

**Given** I want to filter workout history
**When** I use the date range filter
**Then** only sessions within the selected range are shown

**Given** I have no workout data
**When** I view the progression or history sections
**Then** I see "Log your first workout to see progress"

**Given** I have fewer than 3 workouts logged
**When** I view the progression charts
**Then** I see "More data needed. Log at least 3 sessions to show trends."

### Story 6.3: Nutrition History and Adherence View

As a user,
I want to view my nutrition history with adherence to target macros,
So that I can track how well I'm meeting my nutrition goals over time.

**Acceptance Criteria:**

**Given** I am on the Stats tab
**When** I view the nutrition section
**Then** I see a daily macro bar showing actual vs target for calories, protein, carbs, and fat
**And** each bar is color-coded: green (±10%), yellow (±20%), red (>20%)

**Given** I am viewing the weekly nutrition view
**When** the grid loads
**Then** I see a 7-day grid showing each day's macro adherence with a 7-day average

**Given** I tap on a specific day in the weekly grid
**When** the detail opens
**Then** I see a meal-by-meal breakdown of what was logged that day

**Given** I have no nutrition data
**When** I view the nutrition section
**Then** I see "Log your first meal to see nutrition trends"

**Given** I am viewing the adherence view
**When** the data loads
**Then** all metrics are computed from logged meal data only

### Story 6.4: Unified Stats Dashboard

As a user,
I want a unified stats dashboard that combines weight, workout, and nutrition data in one view,
So that I can see a complete picture of my progress at a glance.

**Acceptance Criteria:**

**Given** I am an authenticated user
**When** I navigate to the Stats tab
**Then** the stats dashboard loads (lazy-loaded route, not in initial bundle)

**Given** the stats dashboard loads
**When** I view the sections
**Then** I see: Weight Trend (last 4 weeks), Lift Progression (last 4 weeks, top 4 exercises by volume), Weekly Macro Adherence (calories + protein grid), Session Frequency (days trained this week / this month)

**Given** I have a new personal record
**When** the stats dashboard loads
**Then** PR Highlights are shown in Coral Red (e.g., "Bench Press — 185 lbs × 5 (new PR)")

**Given** I tap on any section
**When** the interaction occurs
**Then** I am taken to the full detail view for that metric

**Given** I have no data
**When** the stats dashboard loads
**Then** I see "Log your first workout to see progress" — no placeholder charts or fake data

**Given** I have insufficient data (1-2 workouts)
**When** the stats dashboard loads
**Then** I see "More data needed. Log at least 3 sessions to show trends."

**Given** a trend is flat or decreasing
**When** the chart renders
**Then** it is shown honestly with a context note: "Volume down 12% this month — this is normal with deload weeks, schedule changes, or fatigue"
**And** no gamification or celebration UI is shown
