# Consistency Review — ONYX UX Design

**Lens:** DESIGN.md vs EXPERIENCE.md alignment, token resolution, component name mapping, tone consistency
**Date:** 2026-06-08

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Token cross-references resolve | ✅ PASS | `{DESIGN.md.colors.primary-fixed-dim}` → `#abd600`, `{DESIGN.md.components.progress-bar}` → 4-key entry, `{DESIGN.md.colors.on-surface}` + `{DESIGN.md.colors.surface}` → both resolve. |
| 2 | Component name alignment | ⚠️ WARN | 8 of 11 EXPERIENCE.md components have DESIGN.md.Components entries. Missing visual specs for: Meal Log Entry, Macro Ring, Stats Card, Plan Preview, Rest Timer, Set Completion. These are primarily behavioral but should be flagged. |
| 3 | Surface/IA alignment | ✅ PASS | All 5 IA surfaces (Workout, Nutrition, Stats, Generate Plan, Profile/Settings) are named in DESIGN.md's "Color application by surface" section. |
| 4 | Microcopy tone consistency | ✅ PASS | DESIGN.md Do's and Don'ts align with EXPERIENCE.md Voice and Tone. Both enforce: no gamification, minimal feedback, accent-only color usage. |
| 5 | State/component contradictions | ✅ PASS | Cold open state says "Start empty session" glass button — Start Workout button rule says "Disabled if no exercises" which is consistent (only the primary button is disabled; the glass button handles empty sessions). |
| 6 | Spacing/layout alignment | ✅ PASS | DESIGN.md: `container-max: 448px`. EXPERIENCE.md Foundation: "448px centered." Consistent. |
| 7 | Elevation description alignment | ✅ PASS | Both spines define 4 levels. DESIGN.md "Floor (Level 0)" = EXPERIENCE.md fullscreen background `#0A0A0A`. Both reference glassmorphism for Level 2. |
| 8 | Components vs States table overlap | ✅ PASS | All 13 states in EXPERIENCE.md map to components/behaviors described for at least one surface. No orphan states. |