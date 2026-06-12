# Accessibility Audit — ONYX UX Design Review

**Lens:** WCAG AA compliance, screen reader support, dynamic type, motion, focus
**Date:** 2026-06-08

## Results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Color contrast — `on-surface` (#e5e2e1) on `surface` (#131313) | ✅ PASS | ~14.42:1 ratio. Far exceeds 4.5:1 AA for normal text and 3:1 for large text. |
| 2 | Color contrast — `on-primary` (#283500) on `primary-container` (#c3f400) | ✅ PASS | ~10.17:1 ratio. Passes AA for both normal and large text. |
| 3 | Color contrast — `primary` (#ffffff) on `surface` (#131313) | ✅ PASS | ~18.58:1 ratio. Excellent contrast for any text size. |
| 4 | Color contrast — `outline` (#8e9379) on `surface` (#131313) | ✅ PASS | ~5.84:1 ratio. Passes AA for normal text (4.5:1) and large text (3:1). |
| 5 | Screen reader support | ⚠️ WARN | EXPERIENCE.md Accessibility Floor states intent for VoiceOver/TalkBack labeling and timer/set-completion announcements. But no per-component ARIA spec (roles, live regions, specific labels). Timer announces every 60s — good. Missing: Vibe Drawer role, macro ring value announcements. |
| 6 | Dynamic type / font scaling | ⚠️ WARN | "Dynamic type respected" stated. `display-stats` at 48px with -0.04em tracking at max accessibility size could overflow the 448px container. No upper bound or truncation strategy documented. |
| 7 | Reduce motion | ⚠️ WARN | Timer pulse and rest timer ring covered: "Disable timer pulse animation, rest timer ring animation. Skip fade transitions." Missing: set completion checkmark animation, progress bar pulse effect, macro ring animation. |
| 8 | Tap targets | ⚠️ WARN | ≥44pt/48dp principle stated. Fullscreen exit button described as "small, glass style" — "small" is ambiguous and could fail the 44pt minimum target. Several components lack explicit dimension specs in EXPERIENCE.md. |
| 9 | Focus order | ⚠️ WARN | General rule + fullscreen path (timer → current exercise → controls → next exercise) documented. Missing: Vibe Drawer focus trap, bottom nav focus management, macro ring keyboard navigation. |
| 10 | Color not sole identifier | ⚠️ WARN | Active state on exercise card uses "border glow + bold weight" — good. Set completion uses "checkmark icon + accent color" — good. But fullscreen workout rest timer ring uses only color (Electric Lime) — no accessible alternative documented. |

## Recommendations

1. **Fullscreen exit button:** Replace "small" with explicit "≥44pt" dimension in DESIGN.md.
2. **Rest timer ring:** Add numeric percentage or bold weight alongside the color to distinguish active state.
3. **Dynamic type:** Document that `display-stats` at 48px should scale down to maintain legibility within 448px at max font size (already noted as mobile scaling to 36px — confirm this also applies at max accessibility setting).
4. **ARIA:** Add a note that each component role and live region should be specified during implementation.
5. **Reduce motion:** Extend coverage to set completion animation and progress bar pulse.