# Rubric Walker — ONYX UX Design Review

**Lens:** Canonical structure coverage, frontmatter completeness, cross-reference resolution
**Date:** 2026-06-08

## DESIGN.md

| Check | Result | Evidence |
|---|---|---|
| 8 required sections in canonical order | ✅ PASS | Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. All present in correct order. |
| Frontmatter complete | ✅ PASS | name, description, status (draft), colors (53 tokens), typography (6 tokens), rounded (6 tokens), spacing (5 tokens), components (8 entries). |
| Color tokens fully defined | ✅ PASS | Full M3 surface ladder + 4 custom tokens (obsidian-surface, glass-border, neon-glow-lime, neon-glow-cyan). No orphan body references. |
| Components frontmatter entry detailed | ✅ PASS | 8 components with structured YAML values: bottom-nav, primary-button, glass-button, exercise-card, input-field, progress-bar, vibe-drawer, fullscreen-workout. |

## EXPERIENCE.md

| Check | Result | Evidence |
|---|---|---|
| 8 required sections in canonical order | ✅ PASS | Foundation → IA → Voice & Tone → Component Patterns → State Patterns → Interaction Primitives → Accessibility Floor → Key Flows. All present. |
| Frontmatter complete | ✅ PASS | name, status (draft), sources (3 entries), updated. |
| Sources listed correctly | ✅ PASS | PRD, stitch-design-prompt, DESIGN.md cross-reference. |

## Cross-Checks

| Check | Result | Evidence |
|---|---|---|
| IA surfaces match components | ✅ PASS | All 5 IA surfaces (Workout, Nutrition, Stats, Generate Plan, Profile/Settings) map to components described in DESIGN.md. |
| Token references resolve | ✅ PASS | `{DESIGN.md.colors.primary-fixed-dim}`, `{DESIGN.md.colors.on-surface}`, `{DESIGN.md.colors.surface}`, `{DESIGN.md.components.progress-bar}` all resolve to actual frontmatter keys. |
| Design Handoff tools referenced | ⚠️ WARN | Google Stitch is configured in workflow but not referenced in either spine. Consider adding a Design Handoff section to EXPERIENCE.md for production handoff. |

## Coverage Gaps

| Check | Result | Evidence |
|---|---|---|
| All named components have behavioral specs | ⚠️ WARN | EXPERIENCE.md lists 11 components. 8 have DESIGN.md visual specs. Missing in DESIGN.md.Components: Meal Log Entry, Macro Ring, Stats Card, Plan Preview, Rest Timer, Set Completion. These are behavioral-only and may be acceptable, but should be noted. |
| Mock coverage noted | ⚠️ WARN | No `→ Composition reference` notation in EXPERIENCE.md for any surface. Per the example, surfaces should reference mock artifacts when available. |
| Journeys have edge cases | ✅ PASS | All 4 key flows include edge case sections. |