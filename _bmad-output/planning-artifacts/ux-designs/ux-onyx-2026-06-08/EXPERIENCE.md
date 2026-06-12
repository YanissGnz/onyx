---
name: ONYX
status: final
sources:
  - {planning_artifacts}/prds/prd-onyx-2026-06-08/prd.md
  - {planning_artifacts}/prds/prd-onyx-2026-06-08/stitch-design-prompt.md
  - {planning_artifacts}/ux-designs/ux-onyx-2026-06-08/DESIGN.md
updated: 2026-06-08
---

# EXPERIENCE.md — ONYX

> Unified workout and nutrition orchestrator. Mobile-first PWA. Dark HUD aesthetic. Casual gym-goers, not pros.

## Foundation

**Form-factor:** Mobile-first Progressive Web App (PWA). Single-surface mobile with desktop pillar (448px centered) on larger viewports. Offline-capable via IndexedDB with storage pressure detection (`navigator.storage.estimate()`).

**UI System:** Custom design system defined in `DESIGN.md`. No third-party component library — the glassmorphism + obsidian visual language is bespoke. Tokens referenced from `DESIGN.md` frontmatter using `{DESIGN.md.colors.*}`, `{DESIGN.md.typography.*}`, `{DESIGN.md.rounded.*}`, `{DESIGN.md.spacing.*}`, `{DESIGN.md.components.*}` syntax.

**User Posture:** Casual gym-goer. Self-directed. Wants simplicity — log a workout, track meals, see progress. No interest in social features, streaks, or badges.

**Navigation Model:** Bottom tab bar with 5 surfaces. One fullscreen overlay (workout mode). One bottom drawer (AI plan input).

## Information Architecture

| # | Surface | Icon | Purpose | Core Actions |
|---|---|---|---|---|
| 1 | **Workout** | Dumbbell | View today's/workout plan, browse exercise library | Start Workout (→ fullscreen), View exercises, Log weights/reps |
| 2 | **Nutrition** | Apple | Log meals, track macros, view meal plan | AI meal log, Manual entry, View macro breakdown |
| 3 | **Stats** | BarChart3 | Historical progress tracking | View volume trends, Weight progress, PR highlights |
| 4 | **Generate Plan** | Sparkles | AI-powered workout/meal plan generation | Natural language input, Select plan type, Confirm/regenerate |
| 5 | **Profile/Settings** | User | Account, preferences, app settings | Edit profile, Set goals, Theme toggle, Export data |

**Navigation hierarchy:**
- Bottom tab bar always visible on main surfaces.
- Fullscreen workout mode hides tab bar entirely (exit button in top-left).
- Vibe Drawer (plan generation) is a bottom sheet overlay — tab bar remains dimmed behind it.
- No hamburger menu, no nested navigators beyond one level deep.

**Surface relationships:**
- Workout → Fullscreen Workout (push transition, full bleed)
- Generate Plan → Workout or Nutrition (generated plan surfaces on the relevant tab)
- Stats → no drill-down in v1 (flat data surface with filters)

## Voice and Tone

**Personality:** Technical, direct, encouraging without being saccharine. This is a tool, not a cheerleader.

**Microcopy Principles:**
- **Commands are short.** "Start Workout." "Log Meal." "Generate Plan."
- **Feedback is minimal.** "Saved." "Logged." "Plan generated."
- **Empty states are helpful.** "No workouts yet — tap Generate Plan to create your first." "No meals logged today."
- **Errors are human.** "Couldn't save — we'll retry when you're back online."
- **No gamification language.** No "streak," "level up," "achievement unlocked," "days in a row."

**Tone spectrum:**

| Context | Tone | Example |
|---|---|---|
| Action buttons | Imperative, direct | "Start Workout" |
| Feedback/confirmation | Minimal, neutral | "Logged 3 sets." |
| Empty states | Helpful, low-friction | "No plan for today — generate one in 10 seconds." |
| AI-generated content | Informational, transparent | "Plan created from your goal: build strength." |
| Errors | Apologetic, solution-oriented | "Save failed. Your data is safe on this device." |
| Fullscreen workout | Invisible until needed | Only timer, exercise, controls — no text beyond what's functional |

## Component Patterns

*Behavioral specs. Visual specs live in `DESIGN.md.Components`.*

| Component | Surface | Behavioral Rules |
|---|---|---|
| **Bottom Nav** | All main surfaces | 5 tabs, persistent. Active tab highlighted with {DESIGN.md.colors.primary-fixed-dim}. Tap → surface. Re-tap active → scroll to top. |
| **Start Workout Button** | Workout | Electric Lime primary button, full-width. Disabled if no exercises in plan. Tap → fullscreen mode. |
| **Exercise Card** | Workout, Fullscreen | Shows name, sets × reps × weight. Fullscreen variant: current exercise has glowing left border. Tap → toggle set completion. Long-press → edit set details (weight/reps). |
| **Meal Log Entry** | Nutrition | Minimal input: search or type food name. AI suggestions as user types. Tap suggestion → auto-fill macros. Manual entry falls back to macro input fields. |
| **Macro Ring** | Nutrition | Circular progress ring. Split by protein/carbs/fat/fiber. Animated on change. Colors match {DESIGN.md.components.progress-bar}. |
| **Stats Card** | Stats | JetBrains Mono numeric values. Period picker (7d / 30d / 90d / All). Metric selector (volume, weight, reps, frequency). |
| **AI Plan Input (Vibe Drawer)** | Generate Plan | Open via "+" or "Generate" trigger. Natural language text area. "I want to build chest and triceps twice a week at 60 minutes each." Send → loading state → plan preview. |
| **Plan Preview** | Generate Plan | Card stack showing generated plan. Swipe to dismiss individual items? Regenerate button. Confirm → plan surfaces on Workout or Nutrition tab. |
| **Fullscreen Workout** | Overlay | No nav, no status bar. Timer at top (display-stats). Exercise list scrollable. Current exercise highlighted. Controls: Complete Set, Skip Exercise, Rest Timer. Exit: top-left arrow. |
| **Rest Timer** | Fullscreen overlay | Circular countdown ring in Electric Lime. Numeric countdown in center (JetBrains Mono). Vibrate on completion. Swipe to dismiss early. |
| **Set Completion** | Fullscreen | Checkmark animation on set completion (subtle). Weight increments auto-adjust based on plan. Manual override available per set. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| **Cold open (no plan)** | Workout | "No workout plan yet." + Generate Plan CTA (Electric Lime). Quick-start: "Start empty session" as glass button. |
| **Cold open (no meals)** | Nutrition | "No meals logged today." + Quick-log CTA. AI suggest: "Log 'post-workout shake'?" |
| **Cold open (no data)** | Stats | "Log your first workout to see progress." No fake data, no placeholder charts. |
| **Active workout** | Fullscreen | Timer running. Exercise list with current highlighted. Set counters. Rest timer alternating. |
| **Workout paused (user-initiated)** | Fullscreen | User taps pause icon (next to timer). Timer pauses, overlay dimmed. "Resume" primary button. "End Workout" glass button. |
| **Workout paused (interruption — call, background)** | Fullscreen | All timers (workout + rest) pause. On return, show paused state regardless of interruption type. User must tap "Resume". |
| **Stale session (inactivity > 15 min)** | Fullscreen | On return from long interruption, prompt: "It looks like you stepped away — End workout or Resume?" If no action for 5 min, auto-end. |
| **Workout complete (all exercises done)** | Fullscreen | "Workout complete — Great work." Summary: total time, volume, exercises done. "Done" → Workout tab. "Start Another" button also available. |
| **Workout complete (partial — ended early)** | Fullscreen | Confirmation dialog: "You have completed X of Y exercises. Save progress and end?" Completion summary: "5/6 exercises done — Bench Press skipped." "Done" → Workout tab shows "Completed (partial)". Stats only count completed sets toward volume. |
| **Empty session ended** | Fullscreen | If user started empty session and ends it (no sets logged): "Free session logged — 15 min." Summary shows zeros. If some exercises were done: logged as free-form session, data appears in Stats as "Free-form." |
| **AI generating plan** | Generate Plan | Skeleton cards (3, pulsing). "Generating your plan..." Ice Blue accent indicator. Cancel button visible. Hard timeout at 20s → transitions to AI generation failed. Generation continues in background if user switches tabs; on return, show result if complete, skeleton if still in progress. Swipe-dismissing the Vibe Drawer cancels generation. |
| **AI generation complete** | Generate Plan | Plan preview cards animate in. "Looks good? Confirm or regenerate." Last 5 generated plans stored in session — user can swipe back. |
| **AI generation failed** | Generate Plan | "Couldn't generate right now. Try again." Glass retry button. Reason: timeout (20s) or server error. |
| **Offline** | All surfaces | Writes save to IndexedDB. Subtle indicator: cloud-off icon in bottom nav dimly lit. No alert banner. Syncs on next foreground with connection. |
| **Offline — storage pressure (>90% quota)** | All surfaces | Persistent warning on Workout and Nutrition tabs: "Storage almost full — export or delete old data in Settings." Cloud-off icon changes to storage-full variant (exclamation). IndexedDB writes monitored via `navigator.storage.estimate()`. Cache eviction: old completed workouts >90 days eligible for eviction under pressure. |
| **Offline — storage full (QuotaExceededError)** | Any surface | Alert: "Device storage full — workouts may not save. Export or delete old data in Settings." Critical indicator in bottom nav. |
| **Offline — fullscreen workout** | Fullscreen | Works fully offline. Timer, sets, rest — all local. Sync on completion when connected. Storage check runs before first set. |
| **Empty search** | Nutrition, Workout | "No matches." No suggestions for alternate terms. Tap outside or clear input → restores previous results. |
| **Error — save failed** | Any surface with input | "Save failed. Data safe on device." Retry button on affected input. If retry fails twice, show: "Still having trouble — your data is saved locally and will sync when possible." |
| **Online reconnection** | All surfaces | Cloud-off indicator disappears. Automatic sync trigger. Subtle toast: "Synced." No banner. |


## Interaction Primitives

- **Tap** to act (start, select, complete, navigate).
- **Long-press** on exercise card → edit set details (weight/reps).
- **Swipe down** on Generate Plan → dismiss Vibe Drawer (cancels generation if in progress).
- **Pull-to-refresh** on Workout tab → re-sync plan from server.
- **Pull-to-refresh** on Stats → refresh computed metrics.
- **Tap outside** → dismiss keyboard/input focus.
- **Pause gesture** in fullscreen workout → tap pause icon next to timer.
- **Banned:** Carousels, hero animations on load, parallax scrolling, badge count indicators, push notification re-engagement, infinite scroll (lists are finite — today's workout, search results).

## Accessibility Floor

*Behavioral. Visual contrast lives in `DESIGN.md`.*

- **Screen readers (VoiceOver/TalkBack):** Every interactive element labeled with role + state. Timer announces elapsed time every 60s in fullscreen mode. Set completion announced. Vibe Drawer labeled with role `dialog`. Macro ring values announced on change. Rest timer countdown announces at :30, :15, :10, every second after :10, and on completion.
- **Dynamic type:** All text scales with system font settings. UI must remain functional at largest accessibility size — no truncation of critical controls or data. `display-stats` (48px) scales down to 36px on mobile and further if needed to fit 448px container at max accessibility setting. All component heights use relative units (`rem`) where possible.
- **Reduce motion:** Disable timer pulse animation, rest timer ring animation, set completion checkmark animation, progress bar pulse effect, macro ring animation. Skip fade transitions. Show static counters for timer and progress. All animations default to `prefers-reduced-motion: no-preference`.
- **Tap targets:** ≥ 44pt (iOS) / ≥ 48dp (Android) for all interactive elements. Fullscreen exit button must be ≥ 44pt. Exercise card controls sized accordingly. Bottom nav tabs ≥ 48pt height.
- **Focus order:** Top-to-bottom, left-to-right within each surface. Fullscreen mode: timer → current exercise → controls → next exercise. Vibe Drawer traps focus within the drawer overlay. Bottom nav uses arrow-key navigation between tabs. Macro ring is keyboard-navigable (tab to focus, arrow keys to cycle metrics).
- **Color not sole identifier:** Active state uses border glow + bold weight, not color alone. Set completion uses checkmark icon + accent color, not color alone. Rest timer ring uses numeric countdown text + color — never color alone. Fullscreen active exercise highlighted by left border glow + bold exercise name.
- **Vibration:** Rest timer completion triggers haptic on supported devices. Configurable in Settings.
- **Contrast:** All critical text and controls meet WCAG AA (4.5:1 for normal text, 3:1 for large text). {DESIGN.md.colors.on-surface} on {DESIGN.md.colors.surface} is verified (14.42:1). {DESIGN.md.colors.outline} on {DESIGN.md.colors.surface} is verified (5.84:1).
- **ARIA implementation note:** During development, assign each component: role (button, dialog, progressbar, timer), aria-label, aria-live region for state announcements (timer, save indicator, generation status).

## Key Flows

### Flow 1 — Walk into the gym and start a programmed workout (Alex, casual gym-goer, lunch break)

1. Alex opens ONYX. Workout tab shows today's pre-generated strength plan.
2. He sees: "Upper Body A" with 6 exercises, sets × reps, target weights.
3. He taps the Electric Lime **Start Workout** button.
4. The app transitions to **Fullscreen Workout mode** — nav disappears, timer starts.
5. **Climax:** Alex is in the zone. The current exercise (Bench Press) has a glowing left border. He completes his set, taps **Complete Set**, a subtle checkmark appears. The rest timer starts counting down from 90s. When it rings (haptic + numeric display), the next exercise auto-highlights.
6. He finishes the last set. "Workout complete — Great work." Summary: 42 min, 14,500 lbs volume, 6 exercises. A "Start Another" button appears alongside "Done" for back-to-back sessions.
7. He taps **Done** and returns to the Workout tab, now showing the completed workout. PRs detected post-session; if a new PR was set, a Coral Red badge appears on the completed exercise.

**Edge cases:**
- No plan → empty state redirects to Generate Plan or "Start empty session." Empty session completion produces a "Free session" summary — data appears in Stats if any sets were logged.
- Mid-workout interruption (call, leaves app) → all timers pause, state preserved on return. If absent >15 min, stale session prompt: "Step away? Resume or End workout." Auto-ends after 5 min of inactivity.
- Offline mid-workout → all data logs locally, syncs later. Storage check before first set — if near capacity, warning persists.
- Partial completion (ends early with uncompleted exercises) → confirmation dialog, summary shows "5/6 exercises done," Workout tab shows "Completed (partial)."
- Phone call during rest timer → rest timer also pauses (not just workout timer). On return, manual "Resume" required.

### Flow 2 — Log a meal after training (Alex, post-workout, holding a shake)

1. Alex taps the **Nutrition** tab.
2. Empty state: "No meals logged today." Quick suggestion: "Log 'post-workout shake'?"
3. He taps the input field, starts typing "protein shake."
4. AI suggestions populate: "Whey Protein Shake (2 scoops, water)" — 240 cal, 48g protein.
5. He taps the suggestion. Macros auto-fill. He adjusts: "Add banana."
6. **Climax:** He taps **Log Meal**. The macro ring updates smoothly — protein needle moves, calories increment. "Logged." Faint haptic. A 3-second undo toast appears: "Logged. ✗ Undo."
7. He sees his day's totals: 760 cal / 62g protein so far. Macro ring caps display at 110% with an overflow indicator if macros exceed targets.

**Edge cases:**
- No connection → meal logs locally, macro ring updates from cache. Sync on reconnect.
- Manual entry → full macro form (calories, protein, carbs, fat) as fallback. Partially filled macros stored as `null` (not 0). Macro ring shows dashed segments for entries with incomplete data.
- Duplicate entry → macro ring overflow (>100%) serves as implicit indicator. No explicit warning in v1. Undo toast helps revert accidental duplicates.
- AI suggestion fails (no match) → manual entry fallback. Partial macro fill still logs successfully — never force full completion.

### Flow 3 — Generate a new training plan (Alex, Sunday evening, planning the week)

1. Alex taps the **Generate Plan** tab.
2. The Vibe Drawer slides up with a single text area and a glowing Ice Blue send icon.
3. He types: "I want to do push/pull/legs 3 days a week, 45 minutes each, focus on progressive overload."
4. He taps send. Skeleton cards appear for 8 seconds: "Analyzing your history... Building your plan..." A **Cancel** button is visible in the drawer header. A hard client-side timeout of 20s is active.
5. **Climax:** The plan appears — 3 day split (Push A, Pull A, Legs A) with exercises, sets, rep ranges, and notes on progression. Each day is a card. He can swipe left/right between days or swipe back to previously generated versions (last 5 stored in session).
6. He reviews: "Looks good." Taps **Confirm**.
7. A toast: "Plan saved. Check Workout tab for your first session."
8. The app switches to the Workout tab, now populated with tomorrow's Push A session.

**Edge cases:**
- No training history → plan generates without progression data. "We'll learn your weights as you log."
- Regeneration → produces a different split/schedule using a randomness seed. User can cycle through options; last 5 versions accessible via swipe-back.
- Plan too long/short → v1 trusts the user's stated duration preference.
- Generation timeout (20s) → transitions to AI generation failed state: "Generation is taking longer than expected. Try again."
- User switches tabs during generation → generation continues in background. On return to Generate Plan, show result if complete, skeleton if still in progress.
- User swipe-dismisses Vibe Drawer during generation → generation cancelled.

### Flow 4 — Check progress trends (Alex, one month later, curious if he's getting stronger)

1. Alex taps the **Stats** tab.
2. Default view: **Volume trend** (total weight moved per week) — line chart, 30-day window.
3. He sees an upward slope. Electric Lime line on dark background.
4. He taps the period picker: switches to 90-day view. The slope is clear and sustained.
5. He scrolls down to **PR Highlights**: "Bench Press — 185 lbs × 5 (new PR)" in Coral Red. PRs are calculated **post-session** — when a workout completes, each set is compared against historical data for the same exercise (normalized by name). If a PR is detected, it appears in Stats and optionally shows a subtle in-session indicator on the set completion animation.
6. **Climax:** Alex sees his squat volume has doubled since starting. The data speaks — no celebration UI, just the numbers and a Coral Red PR marker.
7. He switches metric selector to **Weight** and sees his bodyweight trend flat, recomposition visible in the macro ring.
8. He closes the app, satisfied.

**Edge cases:**
- No data → "Log your first workout to see progress." No placeholder charts.
- Insufficient data (1–2 workouts) → "More data needed. Log at least 3 sessions to show trends."
- Flat/decreasing trend → shown honestly. Context note for declining trends: "Volume down 12% this month — this is normal with deload weeks, schedule changes, or fatigue." Still factual, no gamification.
- Exercise name variance — PR detection normalizes exercise names (e.g., "Bench Press (Dumbbell)" matches "Bench Press Dumbbell") using a canonical name mapping.

_Last updated: 2026-06-08_