# Edge Case Hunter — ONYX UX Validation

> **Lens:** Walk every branching path, boundary condition, and state transition.
> **Source:** `EXPERIENCE.md`
> **Date:** 2026-06-08

---

## 1. State Table Check

The document defines **13 named states** across the State Patterns table (rows 88–102). Each is evaluated below for documented transitions.

| # | State | Surface | Transitions Documented | Rating |
|---|-------|---------|----------------------|--------|
| 1 | Cold open (no plan) | Workout | → Generate Plan (CTA) | → Start empty session | ✅ COVERED |
| 2 | Cold open (no meals) | Nutrition | → Quick-log CTA | → AI suggest | ✅ COVERED |
| 3 | Cold open (no data) | Stats | → "Log your first workout" | ✅ COVERED |
| 4 | Active workout | Fullscreen | → Paused (interruption) | → Complete (last set done) | ⚠️ PARTIAL |
| 5 | Workout paused | Fullscreen | → Resume | → End Workout | ✅ COVERED |
| 6 | Workout complete | Fullscreen | → Done → Workout tab | ✅ COVERED |
| 7 | AI generating plan | Generate Plan | → Complete | → Failed | ⚠️ PARTIAL |
| 8 | AI generation complete | Generate Plan | → Confirm → Workout/Nutrition | → Regenerate | ⚠️ PARTIAL |
| 9 | AI generation failed | Generate Plan | → Retry → AI generating | ✅ COVERED |
| 10 | Offline (all surfaces) | All | → Online re-sync (implied) | ⚠️ PARTIAL |
| 11 | Offline — fullscreen workout | Fullscreen | → Sync on completion when connected | ✅ COVERED |
| 12 | Empty search | Nutrition, Workout | — (terminal state per doc) | ⚠️ PARTIAL |
| 13 | Error — save failed | Any surface | → Retry on affected input | ⚠️ PARTIAL |

**Discrepancy:** The document header references "14 defined states" but the table contains 13 unique rows. Offline and Offline—fullscreen are counted separately (row 10 and 11), yielding 13. Possible miscount in the document or a 14th state was intended but omitted.

### Missing Transitions

| Missing Transition | Impact | Recommendation |
|---|---|---|
| **Active workout → Paused (user-initiated)** | Only interruption-triggered pause is documented. No explicit "Pause Workout" button/gesture in fullscreen overlay. | Add a user-initiated pause control (e.g., long-press timer, or pause icon next to timer). Document the gesture/button. |
| **AI generating → Timeout** | No max wait duration is specified. "~5-15s" is an estimated range, not a timeout. | Define a hard timeout (e.g., 20s) after which generation transitions to the AI generation failed state. |
| **AI generation complete → User navigates away (no confirm)** | If user generates a plan, then switches tabs without confirming/rejecting, state is undefined. | Document whether generation state is preserved across tab switches, or if leaving discards the unconfirmed plan. |
| **Workout complete → Start another workout (same session)** | After "Workout complete — Great work." → Done returns to Workout tab. Can user immediately start another session? | Document if a "Start Another" button is available on the completion screen, or if the user must return and re-enter. |
| **Offline → Online transition behavior** | Offline state shows a cloud-off icon. What happens when connectivity returns? Is there a sync toast? Does the indicator change? | Document the online-reconnection UX: automatic sync trigger, indicator transition, and any feedback to user. |
| **Empty search → Back to populated results** | Empty search is a terminal display state. No documented way to clear the search and return to the previous populated view. | Document behavior: tapping outside or clearing the input field restores previous results / the base surface. |
| **Error — save failed → Recovery UX** | Retry button appears on affected input. What if retry also fails? Exponential backoff? | Document retry limits, indefinite retry state, or escalation (e.g., "Contact support if this persists"). |

**Summary:** 7 of the 13 states have ⚠️ PARTIAL transition coverage. The core workout/nutrition flows have good coverage, but offline↔online transitions and AI generation boundary handling are under-specified.

---

## 2. Key Flow 1 — Workout

### 2.1 No plan → generate vs. empty session. What happens after empty session ends?

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- "No workout plan yet." + Generate Plan CTA
- "Start empty session" glass button

**What is missing:**
- After an empty session ends (user manually ends it), what state does the app transition to? Is there a summary screen? Are any logged sets/exercises saved even without a plan? Does the session data appear in Stats?
- If nothing is logged during an empty session, does the "Workout complete" screen still appear? With what content?
- Can the user add exercises on-the-fly during an empty session, or is it a blank canvas with only "Complete Set" / "Skip Exercise" controls?

**Recommendation:**
Document the empty session completion flow explicitly. Define whether empty sessions produce any data in Stats (even if just "Free-form session - 15 min"), and whether the completion summary shows zeros or a different message like "Free session logged."

---

### 2.2 Mid-workout interruption (app backgrounded) → timer pauses. What if backgrounded for 30+ minutes?

**Verdict:** ❌ MISSING

**What is documented:**
- "Mid-workout interruption (call, leaves app) → timer pauses, state preserved on return."

**What is missing:**
- What happens when the app is backgrounded for 30+ minutes? Does the session auto-end after a configured inactivity threshold?
- On return after long absence, does the app show a prompt like "Still working out?" or resume immediately? A paused 30-min workout with cold equipment in a gym context is an unrealistic state.
- Does the rest timer continue counting down while backgrounded? (The doc says "timer pauses" but does not clarify if that is the workout timer only, or includes the rest timer.)
- What about screen lock vs. app switch vs. phone call — are these treated identically?

**Recommendation:**
Define a "stale session" threshold (e.g., 15 min of inactivity). On return after exceeding the threshold, prompt: "It looks like you stepped away — End workout or Resume?" This prevents accidental 2-hour long "active workouts" in the timeline.

---

### 2.3 Offline mid-workout → all data logs locally. What if storage is full?

**Verdict:** ❌ MISSING

**What is documented:**
- "Offline mid-workout → all data logs locally, syncs later."
- "Offline — fullscreen workout" state: "Works fully offline. Timer, sets, rest — all local. Sync on completion when connected."

**What is missing:**
- If IndexedDB storage quota is exceeded (common on older devices with small storage), the "Error — save failed" state says "Data safe on device" — but if storage is full, data is demonstrably NOT safe.
- No documented behavior for storage-full scenarios during a workout: Does the session abort? Do sets before the storage failure get preserved?
- No user-facing indicator of storage pressure before it becomes critical.

**Recommendation:**
Add a storage pressure detection mechanism (IndexedDB `navigator.storage.estimate()`). When usage exceeds 90% of quota, show a persistent warning on the Workout and Nutrition tabs. If storage is critically full during a workout, save session metadata and prompt user to free space, with a path to export/clear old data.

---

### 2.4 User completes all but one exercise and ends workout early

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- "End Workout" glass button exists in the Workout paused state.
- "Set Completion" component: "Checkmark animation on set completion."

**What is missing:**
- No documented behavior for partial completion. Does ending early save the completed sets/exercises? Are partially completed exercises shown as incomplete?
- Is there a confirmation dialog? "You have completed 5 of 6 exercises. End workout anyway?"
- What appears in the completion summary for a partial workout? Does it show "5/6 exercises completed"?
- After an early end, does the Workout tab show the workout as "Completed (partial)" or just "Completed"?

**Recommendation:**
Document the partial completion path:
1. Confirmation dialog on early end: "You have completed X of Y exercises. Save progress and end?"
2. Completion summary shows partial state: "5/6 exercises done — Bench Press skipped"
3. Workout tab shows partial completion state (e.g., dimmed or with a note)
4. Stats account for partial sessions (only completed sets count toward volume)

---

## 3. Key Flow 2 — Nutrition

### 3.1 AI suggestion fails (no match) → manual entry fallback. What if manual entry partially fills?

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- "AI suggestions as user types. Tap suggestion → auto-fill macros. Manual entry falls back to macro input fields."
- Edge case: "Manual entry → full macro form (calories, protein, carbs, fat) as fallback."

**What is missing:**
- If the user fills only calories but omits protein/carbs/fat, does the meal log still save with partial data? With what visual indication?
- Are partially filled macros stored as zero, or as "unknown" with a different visual treatment in the macro ring?
- If calories are entered but macros are not, does the macro ring show an incomplete segment?

**Recommendation:**
Define partial entry treatment: macros not provided are stored as `null` (not 0). The macro ring shows a dashed/unknown segment for entries with incomplete macros. "Log Meal" should still function with partial data — never force completion.

---

### 3.2 Duplicate entry — stated as no warning. Should there be a subtle indicator?

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- Edge case: "Duplicate entry → no warning in v1 (user responsibility)."

**What is missing:**
- No consideration of whether the macro ring visually overflows past 100% when macros double-count from a duplicate entry. If the user daily target is 2000 cal and two duplicate entries of 1200 cal each show 2400 cal (120%), does the ring cap at 100% or extend past it? If it extends, that is itself a visual indicator of duplication.

**Recommendation:**
Even without explicit duplicate warnings, the macro ring should cap display at 100% (or 110% with overflow visual). Exceeding 100% naturally signals over-logging without an explicit "duplicate" warning. Document the cap behavior.

---

### 3.3 User logs a meal twice by accident and macros double-count

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- "The macro ring updates smoothly — protein needle moves, calories increment."
- No duplicate detection.

**What is missing:**
- If macros exceed daily targets due to double-counting, does the macro ring display overflow (e.g., 200% of target)? What does >100% look like?
- No documented undo mechanism for accidental duplicate entries. Is there an "undo" toast after logging?

**Recommendation:**
Document overflow display on the macro ring for >100% (e.g., color shifts to warning amber, ring continues past the starting point with a dashed overflow line). Add a 3-second undo toast after each meal log: "Logged. ✗ Undo."

---

## 4. Key Flow 3 — Generate Plan

### 4.1 AI generation timeout — is there a max wait? What does user see?

**Verdict:** ❌ MISSING

**What is documented:**
- "Skeleton cards (3, pulsing). Generating your plan... Ice Blue accent indicator. ~5-15s."
- Edge case: "No training history → plan generates without progression data."

**What is missing:**
- No hard timeout documented. If generation takes >15s (e.g., server congestion), what happens? At what point does it transition to AI generation failed?
- Does the user see a progress indicator that gets "stuck"? Is there a cancel button during generation?
- What happens if the API call hangs indefinitely? Is there a client-side timeout?

**Recommendation:**
Define a client-side timeout of 20 seconds. After 20s, transition to AI generation failed state with a message: "Generation is taking longer than expected. Try again." Show a visible cancel/stop button during generation (in case user changes their mind mid-wait).

---

### 4.2 Regeneration produces same/similar plan — does user get infinite cycling?

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- "Regenerate produces a different split/schedule. User can cycle through options."
- Edge case: "No training history → plan generates without progression data."

**What is missing:**
- No guarantee of diversity between regenerations. If the AI model deterministically produces the same split (e.g., always returns Push/Pull/Legs for "3 days a week"), the user could cycle through identical or near-identical plans indefinitely.
- No documented number of previous generations shown in the Plan Preview history. Can the user go back to a previous version?

**Recommendation:**
Add a "seed" or randomness parameter to the generation request that ensures each regeneration differs at minimum by exercise ordering, rep scheme variation, or day labeling. Store the last 3–5 generated plans in session state so the user can swipe back to a previously rejected plan.

---

### 4.3 User generates plan, leaves page, comes back — is generation state preserved?

**Verdict:** ❌ MISSING

**What is documented:**
- The Vibe Drawer is a bottom sheet overlay; tab bar remains dimmed behind it.
- Flow 3 assumes the user stays on the Generate Plan tab through generation.

**What is missing:**
- What if the user taps send, then immediately navigates to a different tab (swipe-dismisses the drawer, or taps another tab)? Is generation aborted or does it continue in the background?
- What if the user returns to the Generate Plan tab after generation completes — is the result still there? Does the plan preview persist?
- What if generation is still in progress and the user returns — is the skeleton state restored?

**Recommendation:**
Document generation as a background process that completes regardless of tab switch. On return to Generate Plan tab, show the completed plan preview if generation finished, or the skeleton state if still in progress. If the user dismisses the Vibe Drawer (swipe down) during generation, cancel generation.

---

## 5. Key Flow 4 — Stats

### 5.1 Exactly 2 workouts logged — "More data needed" at 3. What about exactly 2?

**Verdict:** ✅ COVERED (implicitly)

**What is documented:**
- "Insufficient data (1 workout) → More data needed. Log at least 3 sessions to show trends."

**Analysis:**
The threshold is documented as 3 sessions minimum. With exactly 2 workouts logged, the user is between "no data" and "enough data." Technically 2 data points can form a trend line, but the design intentionally requires 3+ to avoid misleading trend visualization. At exactly 2, the behavior logically falls under "Insufficient data" — same as 1.

**Clarity recommendation:**
While the intent is clear, explicitly state: "1–2 workouts → More data needed. Log at least 3 sessions." rather than implying the threshold only applies to exactly 1 workout.

---

### 5.2 New PR set mid-session vs. retrospectively

**Verdict:** ❌ MISSING

**What is documented:**
- "PR Highlights: Bench Press — 185 lbs × 5 (new PR) in Coral Red."
- PR detection exists in the Stats surface.

**What is missing:**
- No documentation of when PR detection/calculation occurs. Is it:
  - (a) Real-time during the fullscreen workout (set is completed, PR detected immediately)?
  - (b) Post-session, when the workout completes and data is persisted?
  - (c) Batch calculation when Stats tab is visited (comparing against historical data)?
- If real-time, does the user get any in-session feedback (e.g., a subtle "New PR" badge on the set completion checkmark)?
- If retrospective, what if the user opens Stats mid-session (e.g., after PR set but before workout ends)?
- Does PR detection require the same exercise name? What about variations ("Bench Press (Dumbbell)" vs. "Bench Press")?

**Recommendation:**
Document the PR detection timing explicitly. Recommended approach: post-session calculation on workout completion, with a subtle in-session indicator if the set meets PR criteria. Define exercise normalization rules for name matching.

---

### 5.3 Negative/declining trend shown honestly — is there ANY emotional consideration?

**Verdict:** ✅ COVERED (by design intent)

**What is documented:**
- "Flat/decreasing trend → shown honestly. No coaching, no encouragement text."
- Voice and Tone: "This is a tool, not a cheerleader."

**Analysis:**
The design deliberately avoids emotional cushioning for negative trends. This is an intentional choice aligned with the product identity. However, there is an open question about whether this creates a retention risk for casual gym-goers who may find a flat red line demotivating with zero context.

**Recommendation (optional — design philosophy call):**
Consider adding a context note for declining trends that normalizes variability: "Volume down 12% this month — this is normal with deload weeks, schedule changes, or fatigue." Still factual, no gamification, but provides useful context that prevents misinterpretation.

---

## 6. Cross-Surface Edge Cases

### 6.1 Fullscreen workout + phone call interruption

**Verdict:** ⚠️ PARTIAL

**What is documented:**
- Edge case in Flow 1: "Mid-workout interruption (call, leaves app) → timer pauses, state preserved on return."

**What is missing:**
- When the user returns from a phone call, the app is in the Workout paused state. But what if the rest timer was active when the call came in? Does the rest timer also pause, or does it continue in the background?
- If the call is answered via the device call screen (not leaving the app on Android with PIP), does the overlay remain visible?
- On iOS, phone calls are fullscreen — does the app resume from paused automatically, or does the user need to tap Resume?

**Recommendation:**
Document that all timers (workout timer + rest timer) pause on interruption. On return, show the paused state regardless of the interruption type. The user must manually tap "Resume" to continue. This prevents accidental timer resumption if the user is still on the phone.

---

### 6.2 User generates a nutrition plan but has not logged any foods yet

**Verdict:** ❌ MISSING

**What is documented:**
- Generate Plan tab supports both workout and meal plan generation.
- Cold open (no meals) on Nutrition tab shows "No meals logged today."

**What is missing:**
- No documented flow for what a nutrition plan preview looks like when the user has no logged food history. Does the AI generate generic meal plans without preference data?
- Does the nutrition plan auto-populate meals on the Nutrition tab, or does the user need to log meals manually?
- What does "plan generated" mean for nutrition — is it a day-by-day meal schedule, or a macro target recommendation?

**Recommendation:**
Document the nutrition plan output structure. Define cold-start behavior: if no history exists, the AI prompts for goal/restrictions before generating (e.g., "Any dietary preferences or restrictions?" collected in the Vibe Drawer). Generated meals should appear as suggested entries on the Nutrition tab that the user can one-tap to log.

---

### 6.3 Device storage critically low for offline cache

**Verdict:** ❌ MISSING

**What is documented:**
- Offline state: "Writes save to IndexedDB. Subtle indicator: cloud-off icon in bottom nav dimly lit. No alert banner."
- Error — save failed: "Save failed. Data safe on device. Retry button."

**What is missing:**
- No handling of `QuotaExceededError` from IndexedDB. When storage is critically low (`navigator.storage.estimate().usage > 95% of quota`), writes will silently fail.
- The offline indicator (cloud-off icon) gives no indication of storage pressure. The user could believe data is being saved locally when it is actually failing silently.
- No documented mechanism to clear old offline data (expired plans, old workout logs) to free space.
- No warning before storage becomes critically full.

**Recommendation:**
- Before each IndexedDB write, check `navigator.storage.estimate()`. If usage > 90%, trigger a "Storage almost full — consider exporting old data" toast.
- On `QuotaExceededError`, immediately switch the offline indicator to a "storage full" variant (e.g., cloud-off with exclamation) and show an alert: "Device storage full — workouts may not save. Export or delete old data in Settings."
- Document an automatic cache eviction policy: old completed workouts beyond 90 days are eligible for eviction when storage pressure is high.

---

## 7. Summary of Findings

| Severity | Count | Key Themes |
|----------|-------|------------|
| ✅ COVERED | 7 | Core flows, cold opens, common paths |
| ⚠️ PARTIAL | 12 | Partial completion, overflow behavior, offline→online |
| ❌ MISSING | 6 | Timeout handling, storage pressure, PR timing, nutrition cold start, stale sessions, tab-switch during generation |

### Top 5 Critical Gaps (by user impact)

1. **Storage full during offline workout** — data loss risk with no user-facing indicator.
2. **No generation timeout** — user could hang indefinitely on skeleton cards with no cancel/fallback.
3. **Stale session after long interruption** — returning to a 30-min-old paused workout is confusing.
4. **No PR timing definition** — unclear whether the user gets in-session feedback on PR achievements.
5. **Tab-switch during AI generation** — undefined state for generation that continues/aborts in the background.

### Recommended Next Actions

1. Add a **State Diagram** (Mermaid or table) explicitly mapping all 13+ states and their transitions, including the missing ones identified above.
2. Add a **Cross-Cutting Concerns** section to EXPERIENCE.md covering storage pressure, timeouts, and background process behavior.
3. Document the **partial completion UX** for workouts (early end flow).
4. Define the **macro ring overflow behavior** (>100% of daily target).
5. Document the **nutrition plan cold-start** generation flow when no food history exists.
