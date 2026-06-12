---
title: "PRD: ONYX"
created: 2026-06-08
updated: 2026-06-08
status: draft
---

# PRD: ONYX
*Unified workout and nutrition orchestrator — one app where planning, logging, tracking, and analytics live together.*

*Working title — confirm.*

## 0. Document Purpose

This PRD is for the product owner (Yaniss), developer, and any downstream workflow owners (UX, architecture, epics). It defines the vision, features, functional requirements, and success criteria for ONYX v1. The document is structured with Glossary-anchored vocabulary, features grouped with globally numbered FRs, and assumptions tagged inline and indexed in §9. This PRD builds on the Product Brief (`brief-onyx-2026-06-08`); it does not duplicate it but formalizes its content into implementable requirements.

## 1. Vision

ONYX is a premium, unified workout and nutrition orchestrator — one app where planning, logging, tracking, and analytics live together. It's built for people who train with purpose and eat real food, starting with the founder and friends, designed to scale if the product proves itself.

Fitness apps today are fragmented and expensive. MyFitnessPal handles calories but ignores workouts, and its database assumes a Western diet. ChatGPT can write a routine but has no memory of your equipment, your history, or your body. Strong and Hevy nail workout tracking but don't touch nutrition. The result: users juggle multiple tools, pay multiple subscriptions, and still never see a complete picture of their progress.

ONYX solves this by bringing everything under one roof. AI-powered planning (via Google Gemini) transforms natural language into structured weekly workout and meal plans — and because ONYX knows your history, every generation builds on the last. Manual planning gives full control with saved exercise templates and a personal meal database that grows with the user. Progress tracking unifies weight, lifts, calories, and macros with rich analytics and auto-progression. The experience is wrapped in a minimalist dark interface that feels premium without being flashy, works offline-first as a PWA, and is free now with a subscription path later.

Built first for the founder and friends — designed to scale if the product proves itself. In 2-3 years, ONYX could be the go-to fitness platform for people who cook real food, train with purpose, and want data that actually helps.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** Plan weekly workouts and meals in one place without switching apps. Log workouts and meals with minimal friction. Track progress across weight, lifts, and nutrition in a unified view. Get AI-generated plans that remember my history, equipment, and preferences.
- **Emotional:** Feel confident that my fitness data is complete and connected. Trust that the app respects my attention — no bloat, no upselling, no gamification noise. Feel seen as someone who eats real food, not packaged products.
- **Social:** Share the app with friends who train similarly. Be part of something built by someone like me, not a faceless corporation.
- **Contextual:** Log on mobile at the gym or at the dinner table. Plan on desktop on Sunday evening. Use offline when the gym has no signal.

### 2.2 Non-Users (v1)

- People who rely on barcode scanning and pre-built food databases (they need MyFitnessPal's catalogue).
- People who want wearable/Apple Health integration.
- People who want social features, challenges, or leaderboards.
- People who want native iOS/Android apps (PWA-only in v1).
- People who want professional coaching or personal trainer marketplace.
- People who want meal photo recognition (AI from image).

### 2.3 Key User Journeys

- **UJ-1. Yaniss sets up ONYX for the first time.**
  - **Persona + context:** Yaniss, a serious lifter who eats home-cooked Algerian meals, just discovered ONYX. He wants one app to replace his current juggle of notes app + MyFitnessPal + spreadsheets.
  - **Entry state:** Fresh install, no account. Opens the PWA on mobile.
  - **Path:**
    1. Signs up via email/password or Google/Apple OAuth. Supabase creates profile.
    2. Onboarding screen: enters current weight, goal (e.g., "maintain with recomp"), weekly caloric target, protein target.
    3. Specifies training preferences: equipment available (barbell, dumbbells, cable machine), preferred split (PPL), session duration (60 min), number of training days (6/week).
    4. Specifies nutrition preferences: ingredients he loves (chicken, rice, eggs, olive oil, chickpeas), ingredients to avoid (dairy, shellfish). Also specifies "Algerian cuisine" as a style reference.
    5. Reaches the dashboard — a dark, premium home screen with current week's workout plan and meal plan summary.
  - **Climax:** Sees a full AI-generated week: 6 days of workouts with sets/reps, and 7 days of meals with macros — all in one screen, all built for his equipment and his kitchen.
  - **Resolution:** He opens Day 1's workout, sees the first exercise with last session's weight pre-filled, and hits "Start" — he's logging.
  - **Edge case:** If he closes onboarding mid-way, his preferences are saved as draft. Next open resumes from where he left off.

- **UJ-2. Yaniss finishes a workout and logs it.**
  - **Persona + context:** Yaniss is at the gym on Day 2 of his PPL split. His phone is in airplane mode (poor signal).
  - **Entry state:** Opens the PWA offline. The day's workout plan is cached.
  - **Path:**
    1. Taps "Today's Workout" on the dashboard.
    2. Sees the AI-generated plan: 4 exercises with sets, reps, rest intervals.
    3. Starts a session. App shows rest timer between sets.
    4. Logs each set: weight lifted and reps completed. For exercises with auto-progression, the previous session's weight is pre-filled as a baseline.
    5. Completes the workout. App shows session summary: total volume, duration, exercises completed.
    6. Taps "Finish" — data is saved to local IndexedDB.
  - **Climax:** Exits the gym and signal returns. Data syncs silently to Supabase in the background. Opens the app later at home and sees the session in his workout history — no data loss, no manual sync.
  - **Resolution:** Later that week, the auto-progression system adjusts his next session's weights based on this performance.

- **UJ-3. Yaniss logs a home-cooked meal.**
  - **Persona + context:** Yaniss just ate dinner: grilled chicken, couscous, roasted vegetables with olive oil. He wants to log it quickly.
  - **Entry state:** On the meal logging screen, offline or online.
  - **Path:**
    1. Taps "Log Meal" from the nutrition section.
    2. Searches his personal database — finds "Grilled Chicken Breast (150g)" and "Couscous (200g cooked)" from previous entries.
    3. Adds both. For the roasted vegetables, he uses the recipe builder: enters ingredients (zucchini, bell pepper, onion, olive oil) with gram amounts, app calculates total macros.
    4. Saves the meal as "Dinner 2026-06-08" with combined macros.
  - **Climax:** The daily macro bar updates in real time: 840 cal logged, 62g protein, 45g remaining. He can see how today tracks against his weekly targets.
  - **Resolution:** The vegetable mix recipe is saved to his personal database for next time — one tap to re-log.
  - **Edge case:** If he enters a meal offline, it syncs when connectivity returns.

- **UJ-4. Yaniss reviews his weekly progress.**
  - **Persona + context:** Sunday evening, Yaniss is on his desktop planning the next week.
  - **Entry state:** Opens ONYX on desktop browser, already authenticated.
  - **Path:**
    1. Navigates to the Stats dashboard.
    2. Sees a weight trend chart for the past 4 weeks.
    3. Sees lift progression charts for each major lift (squat, bench, deadlift, OHP) — each showing volume and estimated 1RM over time.
    4. Sees a weekly macro adherence summary: calories, protein, carbs, fat — actual vs. target for each day.
    5. Opens the "Insights" section: notices that on high-protein days (>150g), his gym performance was measurably better (+8% volume).
  - **Climax:** He generates next week's AI plan with one tap. Gemini uses his history (completed workouts, logged meals, progression data) to adjust volume, intensity, and calories for the coming week. The weekly plan is generated and presented for review.
  - **Resolution:** He tweaks Friday's upper body workout (swaps an exercise), adjusts Saturday's protein target up by 10g, and saves the week. The plan is available on mobile when he wakes up tomorrow.

## 3. Glossary

*Downstream workflows and readers must use these terms exactly. FRs, UJs, and SMs use Glossary terms verbatim; introducing a synonym anywhere in the PRD is a discipline violation.*

- **Workout Plan** — A structured weekly schedule of training sessions. Each session contains exercises with sets, reps, rest intervals, and optionally RPE/RIR. A Workout Plan is either AI-generated or manually built.
- **Meal Plan** — A structured weekly schedule of meals. Each meal has a name, timestamp, and associated macros. A Meal Plan is either AI-generated or manually built.
- **Exercise Template** — A saved exercise definition (name, default sets, default reps, default rest interval) that can be reused across workouts.
- **Personal Meal Database** — A user-owned collection of saved meals. Each meal may be *Simple* (name + total macros) or *Composite* (name + ingredient list with per-ingredient macros). The database grows as the user logs meals.
- **Simple Meal** — A meal logged with only a name and total macros (calories, protein, carbs, fat). No ingredient breakdown.
- **Composite Meal** — A meal logged with a name and a list of ingredients, each with its own macros. The system calculates total macros from ingredients.
- **Auto-Progression** — The system automatically adjusts exercise weights for the next session based on the user's logged performance (sets x reps x weight) against target.
- **Session** — A single training instance (one gym visit). Contains one or more completed exercises with logged sets, reps, and weights.
- **Macro** — Macronutrient: calories, protein (g), carbohydrates (g), fat (g).
- **Progression Curve** — A chart or data series showing the change in a metric (weight, lift volume, calorie adherence, etc.) over time.
- **Offline-First** — The app stores data locally (IndexedDB) and syncs to Supabase when connectivity is available. All core logging features work without internet.
- **PWA** — Progressive Web App. Installable on mobile and desktop via browser, works offline via Service Worker, supports push notifications if needed.

## 4. Features

### 4.1 Onboarding and Profile Setup

**Description:** The first-time user experience that establishes goals, body metrics, training preferences, and nutrition preferences. After completion, the user reaches the main dashboard with an AI-generated first week. The onboarding is designed to be completed in under 5 minutes on mobile. If interrupted, progress is saved as draft and resumes from the point of interruption. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: User Registration and Authentication

The user can sign up and authenticate via email/password or Google/Apple OAuth. Supabase Auth handles identity.

**Consequences (testable):**
- User can register with email + password, Google OAuth, or Apple OAuth.
- After registration, a Supabase profile record is created with a unique user ID.
- Session persists across browser restarts (JWT refresh token flow via Supabase).
- Unauthenticated users can only see a landing/login screen.

**Out of Scope:**
- SMS/phone-based auth.
- Multi-factor authentication.

#### FR-2: Onboarding Wizard

The user can complete a multi-step onboarding that captures: current weight, goal (cut/maintain/bulk), weekly caloric target, protein target, equipment list, training split preference, session duration, training days per week, preferred ingredients, excluded ingredients, cuisine style reference.

**Consequences (testable):**
- All fields can be completed on a single mobile screen height per step (no scrolling within step).
- User can navigate back to previous steps and edit values.
- Onboarding progress persists in local state if interrupted mid-way.
- Onboarding is skippable with defaults; skipped fields use reasonable `[ASSUMPTION]`-tagged defaults (see §9).
- Completion of onboarding triggers an AI generation call to produce the first week's plans.

#### FR-3: Profile Management

After onboarding, the user can view and edit all profile settings (goals, body metrics, training preferences, nutrition preferences) from a Settings screen.

**Consequences (testable):**
- Every field from FR-2 is editable post-onboarding.
- Changing goals or caloric targets triggers an `[ASSUMPTION]` — the user is asked if they want to regenerate their weekly plan.
- Profile data is stored in Supabase and synced on next connectivity.

### 4.2 AI-Generated Workout Plans

**Description:** The user describes their training intent in natural language (equipment, muscle groups, duration, split preference). Google Gemini (accessed via backend proxy) transforms this into a structured weekly workout plan with exercises, sets, reps, and rest intervals. Because ONYX knows the user's workout history, every generation builds on the last — no blank slate. Realizes UJ-1, UJ-4.

**Functional Requirements:**

#### FR-4: Generate Weekly Workout Plan via AI

The user can request an AI-generated weekly workout plan. The system sends the user's stored preferences (equipment, split, duration, training days, history) to Gemini via a backend proxy and returns a structured plan.

**Consequences (testable):**
- User taps "Generate Workout Plan" on the planning screen.
- System sends a prompt to Gemini (via backend proxy) containing: user's equipment, preferred split, session duration, training days, injury notes, and last 4 weeks' completed workout history.
- Gemini returns a structured JSON response with 7 days; training days contain exercises with sets, reps, rest (seconds), and optional RPE.
- Response is parsed, validated, and presented as an editable weekly calendar.
- Total round-trip time < 15 seconds on average connection.
- If Gemini is unavailable, the user sees a clear error message and can retry.

#### FR-5: AI Plan Uses Historical Context

Each AI generation builds on the user's logged history so the plan progresses intelligently.

**Consequences (testable):**
- If the user has 4+ weeks of logged workouts, Gemini receives a summary of recent volume trends, completed exercises, and progression data.
- The generated plan adjusts volume, exercise selection, and intensity relative to history (e.g., more volume if user has been underrecovering, deload week if fatigue is high).
- Fresh users (no history) receive a reasonable starter plan based on their stated preferences.

#### FR-6: Regenerate Specific Days

The user can regenerate individual days within the AI plan without regenerating the entire week.

**Consequences (testable):**
- Long-press on a day in the weekly view shows "Regenerate Day" option.
- Only that day's exercises are regenerated; other days remain unchanged.
- Context for the regeneration includes that day's muscle group, user's preferences, and recent history for that movement pattern.

### 4.3 AI-Generated Meal Plans

**Description:** The user describes their nutrition preferences in natural language (ingredients they love and avoid, goal macros, cuisine style). Gemini generates a structured weekly meal plan with meals mapped to daily macros, pulling from the user's Personal Meal Database and suggesting new meals with estimated macros where gaps exist. Realizes UJ-1, UJ-4.

**Functional Requirements:**

#### FR-7: Generate Weekly Meal Plan via AI

The user can request an AI-generated weekly meal plan. The system sends stored nutrition preferences (goal macros, preferred ingredients, excluded ingredients, cuisine style, Personal Meal Database entries) to Gemini via backend proxy.

**Consequences (testable):**
- User taps "Generate Meal Plan" on the planning screen.
- System sends Gemini prompt containing: goal daily macros (calories, protein, carbs, fat), preferred ingredients, excluded ingredients, cuisine style, and up to 20 most-used entries from Personal Meal Database.
- Gemini returns structured JSON: 7 days × 3-5 meals per day, each with name, estimated macros, and a flag indicating whether this meal exists in the user's database or is a new suggestion.
- If a meal exists in the Personal Meal Database, exact stored macros are used. If it's a new suggestion, Gemini provides estimated macros.
- User can accept, edit, or reject individual meals.

#### FR-8: AI Plan Respects Personal Meal Database

The AI preferentially uses meals from the user's Personal Meal Database before suggesting new ones.

**Consequences (testable):**
- When generating, the system instructs Gemini to prefer meals from the user's database for at least 60% of daily meals.
- Suggested new meals are marked as "New — estimated macros" and require user confirmation before they're saved.
- Over time, as the database grows, AI suggestions increasingly draw from logged meals.

### 4.4 Manual Workout Builder

**Description:** Full manual control over workout plans. Users can build workouts from scratch using Exercise Templates, edit any AI-generated workout, and save custom routines. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-9: Create and Manage Exercise Templates

The user can create, edit, and delete Exercise Templates (name, default sets, default reps, default rest interval).

**Consequences (testable):**
- User can create a template with name, default sets (int), default reps (int), rest interval (seconds).
- Templates are listed alphabetically in the exercise picker.
- User can edit any field of an existing template.
- Deleting a template does not remove it from past workouts (data integrity).

#### FR-10: Build Custom Workout

The user can build a workout from scratch by selecting exercises from their templates and specifying sets, reps, rest, and order.

**Consequences (testable):**
- User can add exercises from their template library to a workout.
- Each exercise in the workout has its own sets, reps, rest (overrides template defaults if specified).
- User can reorder exercises via drag handle.
- User can remove an exercise from the workout without deleting the template.
- Workout is saved and appears on the calendar.

#### FR-11: Edit AI-Generated Workout

The user can edit any aspect of an AI-generated workout — add/remove/reorder exercises, change sets/reps/rest, replace an exercise with another.

**Consequences (testable):**
- Every generated workout is fully editable with the same UI as the manual builder.
- Edits to an AI workout do not trigger a full regeneration; only the modified day is changed.
- A small "AI Generated" badge is shown on AI-created workouts to distinguish them from manual ones.

### 4.5 Manual Meal Logging

**Description:** Users log meals by selecting from their Personal Meal Database or creating new entries. Supports both Simple Meals and Composite Meals. Weekly and daily views give full control. Realizes UJ-3.

**Functional Requirements:**

#### FR-12: Personal Meal Database — Create Simple Meal

The user can create a Simple Meal with a name and total macros (calories, protein, carbs, fat).

**Consequences (testable):**
- User enters meal name (free text) and macros (calories, protein g, carbs g, fat g).
- Meal is saved to the user's Personal Meal Database.
- User can re-use any saved meal in future logs with one tap.

#### FR-13: Personal Meal Database — Create Composite Meal (Recipe Builder)

The user can create a Composite Meal with a name and a list of ingredients, each with its own name, gram amount, and macros. The system calculates and displays total macros.

**Consequences (testable):**
- User enters meal name, then adds ingredients one by one: ingredient name, grams, macros for that gram amount.
- System displays running total macros as ingredients are added.
- User can edit or remove individual ingredients.
- On save, the Composite Meal is stored with both per-ingredient data and total macros.
- User can log the meal later with one tap; macros are calculated from stored ingredients.

#### FR-14: Log Meal to Daily Intake

The user can log a meal from their Personal Meal Database to any day/time slot.

**Consequences (testable):**
- User picks a date and meal time (breakfast/lunch/dinner/snack or custom time).
- Selects a meal from their Personal Meal Database (search filter available).
- On selection, the meal's macros are added to that day's totals.
- User can log the same meal multiple times on the same day.
- Daily macro bar updates in real time.

#### FR-15: Edit or Delete Logged Meal

The user can edit the macros or delete a logged meal from any day.

**Consequences (testable):**
- User can adjust macros of a logged meal (overrides do not modify the database entry, only the instance).
- User can delete a logged meal; macros are subtracted from day totals.
- Deleting a logged meal shows an undo toast for 5 seconds.

### 4.6 Unified Progress Tracking

**Description:** Weight, lifts, calories, and all macros in one place. Auto-progression adjusts weights based on logged performance. Detailed history and rich analytics connect the dots. Realizes UJ-4.

**Functional Requirements:**

#### FR-16: Track Body Weight

The user can log their body weight and view a weight trend chart over time.

**Consequences (testable):**
- User can enter weight (kg or lbs, configurable) manually via quick input on dashboard or in Stats section.
- Weight entries are plotted on a trend chart with optional 7-day moving average overlay.
- User can view weight history: 1W, 1M, 3M, All Time.

#### FR-17: Track Lift Progression

The user can view progression curves for each exercise they've logged, showing volume (sets × reps × weight) and estimated 1RM over time.

**Consequences (testable):**
- For each exercise, a chart shows volume and estimated 1RM (using Epley formula: weight × (1 + reps/30)) over time.
- Charts are scoped by exercise name (exact match from Exercise Template).
- User can select date ranges: 1M, 3M, All Time.
- Each data point represents one session, with date and logged sets visible on tap.

#### FR-18: Auto-Progression

The system automatically adjusts the target weight for the next session of each exercise, based on the user's logged performance against the previous target.

**Consequences (testable):**
- If the user completes all target reps for all sets of an exercise, the system increases the target weight for the next session by the configured increment (configurable per-exercise, default: 2.5 kg / 5 lbs for lower body, 1.25 kg / 2.5 lbs for upper body).
- If the user fails to reach target reps on any set, the weight stays the same for the next session.
- If the user fails for 3 consecutive sessions, the system decreases the target weight by one increment.
- Auto-progression is applied when generating a new workout plan or when the user opens an existing template with progression data.
- User can override or disable auto-progression per exercise.

#### FR-19: Unified Stats Dashboard

The user can view a stats dashboard that combines weight, workout, and nutrition data in one view.

**Consequences (testable):**
- Dashboard sections: Weight Trend (last 4 weeks), Lift Progression (last 4 weeks, top 4 exercises), Weekly Macro Adherence (calories + protein only in grid, detail in separate view), Session Frequency (days trained this week / this month).
- All sections are read-only display of computed data.
- Tapping any section opens the full detail view for that metric.

#### FR-20: Workout History View

The user can view a chronological list of completed sessions with summary data.

**Consequences (testable):**
- Each session shows: date, duration, total volume (kg × reps), number of exercises, and a collapsible list of logged sets.
- User can filter by date range.
- User can tap a past session to see full set-by-set detail.

#### FR-21: Nutrition History and Adherence View

The user can view daily and weekly nutrition logs with adherence to target macros.

**Consequences (testable):**
- Daily view: macro bar showing calories, protein, carbs, fat with actual vs. target, color-coded (green = on target ±10%, yellow = within 20%, red = outside 20%).
- Weekly view: 7-day grid showing each day's macro adherence, with a 7-day average.
- User can tap any day to see meal-by-meal breakdown.

### 4.7 Dashboard

**Description:** The main screen after login, serving as the launch point for everything. Shows the current week's workout and meal plan status, quick actions, and a snapshot of today's targets. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-22: Main Dashboard

The authenticated user lands on the dashboard, which displays today's workout status (pending / in progress / completed), today's logged macros vs target, and quick action buttons (Log Workout, Log Meal, Plan Week).

**Consequences (testable):**
- Dashboard loads within 2 seconds on mobile 4G connection.
- All elements are tappable with clear visual feedback.
- If today's workout is incomplete, it's shown at the top with a "Start" button.
- If no plan exists for the current week, the dashboard prompts the user to generate or build one.

### 4.8 Backend Proxy for Gemini

**Description:** A server-side endpoint that receives structured requests from the frontend, assembles prompts for Google Gemini, sends the request, validates the response, and returns structured data to the frontend. This keeps API keys server-side and provides a layer for prompt management, response validation, and error handling.

**Functional Requirements:**

#### FR-23: Gemini Proxy Endpoint

The backend exposes an authenticated endpoint (`POST /api/ai/generate`) that accepts a request type (`workout_plan`, `meal_plan`, `regenerate_day`) and relevant parameters, and returns structured AI output.

**Consequences (testable):**
- Endpoint requires valid Supabase auth JWT in the Authorization header.
- Request body specifies: `type` (enum), `preferences` (object with relevant user preferences), `history` (object with recent activity summary, optional).
- Backend constructs a Gemini prompt from the request parameters using templated prompt structures.
- Backend sends the prompt to Gemini API, parses the JSON response, and validates its structure against the expected schema.
- On validation failure, the backend retries once; on second failure, returns a descriptive error.
- Backend caches identical requests for 5 minutes (same user, same type, same preferences).
- Response is returned as structured JSON to the frontend.

### 4.9 Offline Support

**Description:** All core logging features work without internet connectivity. Data is stored locally in IndexedDB and synced to Supabase when connectivity is restored. Realizes UJ-2, UJ-3.

**Functional Requirements:**

#### FR-24: Offline Logging

The user can log workouts, meals, and body weight while offline.

**Consequences (testable):**
- All write operations (log set, log meal, log weight) work without network connectivity.
- Data is persisted to IndexedDB immediately on user action.
- User sees an offline indicator (subtle icon) when disconnected.

#### FR-25: Background Sync

When connectivity is restored, local changes are synced to Supabase automatically in the background.

**Consequences (testable):**
- On connectivity restored event, the system queues and sends all pending changes to Supabase in order of creation time.
- Sync is silent — no user-facing progress bar. A single "Synced" toast appears when all pending operations complete.
- Conflict resolution: last-write-wins based on `updated_at` timestamp (acceptable for single-user-per-device pattern).
- Network request to sync completes within 5 seconds; if it fails, retries with exponential backoff (3 attempts).

#### FR-26: Offline Cache for Plans

The current week's workout plan and meal plan are cached locally so they are viewable and actionable offline.

**Consequences (testable):**
- When the user views a week's plan while online, it's cached to IndexedDB.
- Offline, the cached plan is displayed. A subtle "Cached" badge is shown.
- New AI plan generation requires connectivity.

### 4.10 PWA Shell

**Description:** The app is installable as a PWA on mobile and desktop. Provides a full-screen, native-like experience with offline Service Worker support. Mobile-first responsive design — phone browser is the primary surface, desktop is secondary.

**Functional Requirements:**

#### FR-27: PWA Installability

The app meets PWA installability criteria and prompts the user to install on supported browsers.

**Consequences (testable):**
- Manifest includes: name ("ONYX"), short_name, icons (192px, 512px), theme_color (#000000 or dark variant), display ("standalone"), start_url.
- Service Worker registers on first load.
- beforeinstallprompt event is captured and presented as a custom install prompt on the dashboard (dismissable, max 2 appearances).
- App works in standalone mode with no browser chrome visible.

#### FR-28: Responsive Mobile-First Layout

The UI is designed mobile-first, with a responsive layout that adapts gracefully to desktop viewports.

**Consequences (testable):**
- On mobile (viewport < 768px): single-column layout, bottom navigation bar, full-width content areas.
- On tablet (768px-1024px): two-column layout for dashboard and stats views.
- On desktop (> 1024px): wider layout with side panels where appropriate, but functionally identical to mobile.
- All touch targets are at least 44×44px on mobile.
- No horizontal scrolling on mobile.

### 4.11 Dark Premium Interface

**Description:** The visual design is minimal, dark-themed, and premium. Stealth-wealth aesthetic — no bright colors, no gamification badges, no unnecessary animations. The interface respects the user's attention.

**Functional Requirements:**

#### FR-29: Dark Theme

The app uses a dark color scheme as the default (and only) theme for v1.

**Consequences (testable):**
- Primary background: near-black (#0D0D0D or similar).
- Surface colors: dark grays (#1A1A1A, #2A2A2A).
- Text: white (#FFFFFF) and light gray (#B0B0B0) for secondary text.
- Accent: a single muted accent color (e.g., warm gold #C9A84C or deep amber) for CTAs and highlights — confirm with Yaniss.
- No bright, saturated colors. No gradients unless very subtle.
- No gamification elements (streaks, badges, levels, confetti).

## 5. Non-Functional Requirements (Cross-Cutting)

### 5.1 Performance

- **NFR-1:** Initial page load (dashboard) completes in < 3 seconds on 4G mobile connection. Subsequent navigations feel instant (< 300ms) due to client-side routing and local data.
- **NFR-2:** AI plan generation returns structured results in < 15 seconds (average case). Users see a loading state with estimated time remaining.
- **NFR-3:** The app bundle (JS/CSS/HTML) is < 500 KB gzipped for initial load. Route-based code splitting is used for AI generation views, stats dashboard, and settings — these are loaded lazily.
- **NFR-4:** DB queries (workout history, meal history) return results in < 500ms for up to 12 months of data.

### 5.2 Security

- **NFR-5:** All API communication is over HTTPS. Supabase enforces RLS (Row-Level Security) so users can only access their own data.
- **NFR-6:** Gemini API keys are stored server-side only (backend proxy). No AI API credentials are exposed to the frontend.
- **NFR-7:** Auth tokens (Supabase JWT) are stored in HTTP-only, Secure, SameSite=Strict cookies where possible; alternatively in memory with refresh rotation.
- **NFR-8:** User data is isolated by Supabase user ID. No user can read or write another user's data.

### 5.3 Reliability

- **NFR-9:** The app must function offline for all logging and viewing of cached plans. If Supabase is unreachable, the user can still complete a workout, log a meal, and log weight.
- **NFR-10:** Data sync must be lossless for write operations. No logged workout or meal is lost due to network interruption.
- **NFR-11:** Gemini API failures (timeout, rate limit, malformed response) must not corrupt the user's existing data or plans. The user can retry generation.

### 5.4 Observability

- **NFR-12:** The app logs key events (auth, plan generation, workout completion, meal log, sync success/failure) to Supabase Analytics or a similar telemetry system, with user consent.
- **NFR-13:** Backend proxy logs Gemini API response times, error rates, and token usage for cost monitoring.

## 6. Constraints and Guardrails

### 6.1 Privacy

- **C-1:** User body weight and meal data are personal health data. No data is shared, sold, or used for ad targeting. Telemetry is opt-in.
- **C-2:** AI prompts sent to Gemini include the minimum necessary user data (preferences, history summaries — never full raw data).

### 6.2 Cost

- **C-3:** Gemini API cost must stay under $0.50/user/month at v1 scale (< 50 users). If exceeded, implement usage limits or a generation cooldown.
- **C-4:** Supabase free tier (500 MB database, 5 GB bandwidth, 50,000 monthly active users) must be sufficient for initial launch.

### 6.3 Technical

- **C-5:** The app must work on the latest two versions of Chrome, Safari, Firefox, and Samsung Internet (mobile). iOS Safari PWA support is required.
- **C-6:** No external fitness APIs (Apple Health, Google Fit, Garmin) are integrated in v1. All data is entered manually within ONYX.

## 7. Non-Goals (Explicit)

- ONYX will not be a social fitness platform in v1. No sharing, leaderboards, challenges, or friend feeds.
- ONYX will not include barcode scanning or a pre-built food database. Users build their own Personal Meal Database.
- ONYX will not integrate with wearables, smart gym equipment, or health platforms (Apple Health, Google Fit, etc.).
- ONYX will not have native iOS/Android apps — PWA only.
- ONYX will not include photo-based meal recognition, workout video playback, or progress photo uploads.
- ONYX will not have a payment or subscription system in v1.
- ONYX will not offer coaching, personal trainer marketplace, or community recipes.
- ONYX will not have multi-language support, gamification, or public API in v1.

## 8. MVP Scope

### 8.1 In Scope

- User onboarding (goals, weight, caloric targets, training preferences, nutrition preferences)
- AI-generated weekly workout plans (via Gemini, with historical context)
- AI-generated weekly meal plans (via Gemini, preferring Personal Meal Database)
- Manual workout builder with Exercise Templates
- Manual meal logging (Simple and Composite meals) with Personal Meal Database
- Unified progress tracking (weight, lifts, calories, protein, macros)
- Auto-progression based on logged performance
- Workout history and stats dashboard
- Nutrition history and adherence view
- Supabase auth (email/password + Google/Apple OAuth) and profile management
- Gemini backend proxy
- PWA with offline support (cache-then-network)
- Mobile-first responsive design, dark premium interface

### 8.2 Out of Scope for MVP

- Barcode scanning — deferred to v2 (or indefinitely)
- Wearable/Apple Health integration — deferred to v2
- Social features — deferred to v2
- Pre-built meal database — deferred (users build their own from day one; shared database considered for v2)
- Coaching/training plans from human coaches — deferred to v2
- Payment/subscription system — deferred to v2+
- Progress photo uploads — deferred to v2
- Workout video playback — deferred
- Multi-language support — deferred
- Public API — deferred
- Meal photo recognition — deferred
- Community recipes / shared meal database — deferred
- Gamification (streaks, badges) — deferred
- Personal trainer marketplace — deferred

## 9. Success Metrics

**Primary**

- **SM-1 (Adoption):** At least the founder and 2 friends are daily active users (logging workouts + meals ≥ 4 days/week) within 30 days of launch. Validates FR-1 through FR-21.
- **SM-2 (AI Utility):** AI-generated workout and meal plans are used as-is or with minor edits ≥ 70% of the time — not completely rewritten. Validates FR-4, FR-5, FR-6, FR-7, FR-8.

**Secondary**

- **SM-3 (Retention):** Users are still logging consistently at 30 days post-onboarding. Validates FR-16 through FR-21.
- **SM-4 (Offline Reliability):** Zero data loss incidents reported from offline logging over the first 90 days. Validates FR-24, FR-25, FR-26.

**Counter-metrics (do not optimize)**

- **SM-C1 (Plan Overgeneration):** User does not generate more than 3 full plan regenerations per week on average. If this metric is high, it signals the AI quality is too low or the user is over-iterating rather than training/eating. Counterbalances SM-2.

## 10. Open Questions (Resolved)

The following items from the initial draft have been resolved and are recorded here for traceability:

1. ~~**Accent color for dark theme.**~~ → **Deferred to Stitch design.** Yaniss will use Stitch to design the app's visual identity, including the accent color. The PRD defines the structural theme constraints (dark backgrounds, muted palette, no gamification). The exact accent color comes from the Stitch design.
2. ~~**Default weight increment for auto-progression.**~~ → **Per-exercise configuration.** Default: 2.5 kg / 5 lbs for lower body exercises, 1.25 kg / 2.5 lbs for upper body exercises. User can override per exercise.
3. ~~**AI deload weeks.**~~ → **User-managed for v1.** The AI will not automatically detect fatigue or suggest deloads. Users manage deload weeks manually.
4. ~~**Meal plan detail level.**~~ → **Meal names + estimated macros.** AI meal plans include meal name and estimated macros (calories, protein, carbs, fat). Users log the actual amounts when they eat.
5. ~~**Desktop-specific features.**~~ → **Functionally identical to mobile + extras that make sense on desktop.** The desktop view should not have features unavailable on mobile, but can use the larger viewport to show more data at once (e.g., full weekly calendar, side-by-side views, drag-and-drop).

## 11. Assumptions Index

- **§4.1 FR-2:** If onboarding is skipped, defaults are used: goal = maintain, 4 training days/week, 60 min sessions, no excluded ingredients, basic PPL split. User can edit later.
- **§4.2 FR-4:** Gemini returns structured JSON reliably. Validation layer handles malformed responses. Retry logic exists for transient failures.
- **§4.3 FR-7:** Gemini can generate reasonable macro estimates for novel meals (meals not in the user's database). Estimates are flagged as such.
- **§4.6 FR-18:** Epley formula is an acceptable approximation for estimated 1RM. No alternative formulas (Brzycki, Lombardi) are offered in v1.
- **§4.8 FR-23:** Backend proxy is implemented as a simple serverless function or Express route. No streaming responses needed — full response is returned.
- **§4.10 FR-28:** Browser support for PWA features (Service Worker, IndexedDB, Cache API) is adequate on target browsers. No polyfills needed beyond standard service worker registration.
- **§5.4 NFR-13:** Backend proxy logs are sufficient for cost monitoring. No separate observability platform (e.g., DataDog) in v1.