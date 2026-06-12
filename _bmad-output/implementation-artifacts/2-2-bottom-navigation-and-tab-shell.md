---
baseline_commit: NO_VCS
---

# Story 2.2: Bottom Navigation and Tab Shell

Status: done

## Story

As a user,
I want a glassmorphism bottom navigation bar with 5 tabs and smooth tab transition animation,
so that I can switch between Workout, Nutrition, Stats, Generate Plan, and Profile surfaces with ease.

## Acceptance Criteria

### AC-1: BottomNav Component — Structure and Styling

- Given the app is rendering on a mobile viewport
- When I view the bottom of the screen
- Then a glassmorphism bottom navigation bar is visible
- And it has exactly `64px` height
- And it has `backdrop-blur-md` (12px blur) with semi-transparent fill `rgba(18, 18, 18, 0.8)`
- And it has a 1px `glass-border` (`rgba(255, 255, 255, 0.08)`) on top
- And it is positioned at the bottom with `position: fixed; bottom: 0; left: 0; right: 0`
- And it respects safe area inset: `padding-bottom: env(safe-area-inset-bottom)` for device home indicators
- And the component is located at `src/components/features/shared/BottomNav.tsx`

### AC-2: Five Tabs with Lucide React Icons

- Given the BottomNav is rendered
- When I inspect the tabs
- Then there are exactly 5 tabs with Lucide React icons (2px stroke):
  1. **Workout** — `Dumbbell` icon
  2. **Nutrition** — `Apple` icon
  3. **Stats** — `BarChart3` icon
  4. **Generate Plan** — `Sparkles` icon
  5. **Profile** — `User` icon
- And each tab has a label below the icon (small, JetBrains Mono, 10-11px)
- And the layout is flex row with equal width for each tab (`flex-1`)
- And the tabs are centered horizontally within the bar

### AC-3: Active Tab State — Electric Lime Accent

- Given I am on a specific tab (e.g., Workout)
- When I view the bottom nav
- Then the active tab's icon is highlighted with Electric Lime (`#c3f400` / `--onyx-primary-container`)
- And the active tab's label is also Electric Lime
- And inactive tabs use `--onyx-on-surface-variant` (`#c4c9ac`) color
- And the active tab has a subtle Electric Lime glow effect (`neon-glow-lime`)

### AC-4: Navigation — Tab Switching

- Given I am on any tab
- When I tap a different tab
- Then the app navigates to that tab's surface
- And the new tab becomes active (Electric Lime)
- And previous tab returns to inactive state (on-surface-variant)

### AC-5: Tab Transition Animation — Slide Indicator

- Given I am on any tab and I tap a different tab
- When the navigation occurs
- Then a smooth sliding indicator animates from the active tab position to the new tab position
- And the indicator is a small Electric Lime (`#c3f400`) dot or underline (~6px height, ~24px width)
- And the animation uses a spring or ease-out transition of `200ms`
- And the indicator snaps to the center of the new tab's icon area
- And the animation is performed via `framer-motion` (`motion.div`)
- And the animation respects `prefers-reduced-motion` (disabled when user prefers reduced motion)

### AC-6: Re-tap Tab — Scroll to Top

- Given I am on any tab (e.g., Workout)
- When I re-tap the same tab
- Then the surface scrolls to top
- And no navigation occurs (no route change)

### AC-7: Desktop Viewport — Bottom Nav Still Visible

- Given I am on a desktop viewport
- When I view the app
- Then the bottom nav is still visible and functional (same behavior as mobile)
- And it remains centered with the same 64px height

### AC-8: Tab Shell Layout — Dashboard Layout Update

- Given the dashboard layout is updated
- When I inspect `src/app/(dashboard)/layout.tsx`
- Then it:
  - Imports and renders the `BottomNav` component at the bottom
  - Wraps the main content area with proper padding-bottom to avoid content being hidden behind the nav (`padding-bottom: calc(64px + env(safe-area-inset-bottom))`)
  - Removes the old header with log-out button (moved to Profile tab)
  - Preserves the auth guard (redirect to /login if unauthenticated)

### AC-9: Accessibility

- Each tab button has a descriptive `aria-label` (e.g., "Go to Workout tab")
- Each tab button has `aria-current="page"` when active
- All touch targets are ≥44pt (iOS) / ≥48dp (Android) — each tab has minimum 44px height
- Focus indicators are visible (Electric Lime outline on focus)
- The navigation is keyboard accessible (tab through, enter to activate)

### AC-10: Build Integrity

- Given the bottom nav and tab shell are implemented
- When I run `npm run build`
- Then the build succeeds with no errors

## Tasks / Subtasks

- [x] Task 1: Create `src/components/features/shared/BottomNav.tsx` — Bottom navigation component
  - [x] Import Lucide React icons: `Dumbbell`, `Apple`, `BarChart3`, `Sparkles`, `User`
  - [x] Import `framer-motion` for tab indicator animation
  - [x] Define tab config array with path, label, icon component
  - [x] Use `usePathname` from `next/navigation` to detect active tab
  - [x] Implement glassmorphism styling (backdrop-blur-md, semi-transparent fill, glass-border)
  - [x] Apply Electric Lime accent for active tab
  - [x] Apply on-surface-variant for inactive tabs
  - [x] Add safe-area-inset-bottom padding
  - [x] Add aria-label and aria-current for accessibility
  - [x] Make icons 2px stroke, labels in JetBrains Mono ~10-11px
  - [x] Ensure touch targets ≥44px
  - [x] Implement sliding indicator animation between tab transitions
  - [x] Add prefers-reduced-motion guard for the animation

- [x] Task 2: Update `src/app/(dashboard)/layout.tsx` — Replace header with BottomNav
  - [x] Remove the old `<header>` with ONYX logo and log-out button
  - [x] Import and render `BottomNav` at the bottom
  - [x] Add `padding-bottom` to `<main>` to avoid content hidden behind nav
  - [x] Preserve auth guard (redirect to /login if unauthenticated)
  - [x] Keep `onyx-container` wrapper around children

- [x] Task 3: Move log-out functionality to Profile tab
  - [x] The log-out button was in the old header — it needs to move to the Profile screen
  - [x] Update `src/app/(dashboard)/profile/page.tsx` to include a log-out option
  - [x] Use server action pattern (same as previous log-out)

- [x] Task 4: Verify build integrity
  - [x] Run `npm run build`
  - [x] Verify no TypeScript, CSS, or import errors
  - [x] Verify dev server loads without issues

### Review Follow-ups (AI)

- [ ] [Review][Patch] Fix any accessibility issues found during review
- [ ] [Review][Patch] Verify touch targets meet 44pt minimum on all tabs
- [ ] [Review][Defer] Consider adding active tab indicator dot — deferred, not in ACs

## Dev Notes

### Project Context

This is the **second story of Epic 2: Core Shell**. Story 2.1 established the design token system and dark theme shell. Now we build the core navigation infrastructure that all subsequent features depend on.

**The BottomNav replaces the current header in the dashboard layout.** The old header (ONYX logo + log-out) is removed from the layout and the log-out functionality moves to the Profile screen.

### Tab Transition Animation Details

**Indicator Design:**
- Small Electric Lime dot or underline
- Height: ~6px, Width: ~24px (or proportional to icon width)
- Position: centered horizontally under the active tab's icon
- Color: `#c3f400` / `--onyx-primary-container`

**Animation Specs:**
- Type: Spring or ease-out transition
- Duration: `200ms`
- Property animated: `x` (horizontal position)
- Easing: `easeOut` or spring with `stiffness: 500, damping: 30`

**Implementation Pattern:**
```tsx
// Sliding indicator using framer-motion
<motion.div
  className="h-[6px] w-[24px] bg-primary-container rounded-full"
  animate={{ x: activeTabIndex * tabWidth }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

**Reduced Motion:**
```tsx
// Check prefers-reduced-motion
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
// Skip animation when true
transition={prefersReducedMotion ? false : { type: "spring", stiffness: 500, damping: 30 }}
```

**Tab Width Calculation:**
```tsx
// Use ref to measure each tab's width for precise indicator positioning
const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
const [tabWidths, setTabWidths] = useState<number[]>([0, 0, 0, 0, 0]);

useEffect(() => {
  const widths = tabRefs.current.map(ref => ref?.getBoundingClientRect().width || 0);
  setTabWidths(widths);
}, [pathname]);

// Indicator x position: center of active tab
const indicatorX = tabRefs.current[activeIndex]?
  .getBoundingClientRect().left - containerRef.current?.getBoundingClientRect().left - tabWidths[activeIndex] / 2 || 0;
```

### ONYX Design System — Critical Rules

1. **Do NOT invent custom colors.** All values come from `STITCH_DESIGN_SYSTEM.md` and `DESIGN.md`:
   - **Electric Lime (active accent):** `#c3f400` / `--onyx-primary-container`
   - **On-surface-variant (inactive):** `#c4c9ac` / `--onyx-on-surface-variant`
   - **Glass fill:** `rgba(18, 18, 18, 0.8)` with `backdrop-blur-md`
   - **Glass border:** `rgba(255, 255, 255, 0.08)`
   - **Neon glow lime:** `rgba(204, 255, 0, 0.15)`

2. **Bottom nav dimensions:**
   - Height: exactly `64px`
   - Safe area inset: `padding-bottom: env(safe-area-inset-bottom)`
   - Fixed position at bottom

3. **Icons:** Lucide React, 2px stroke width

4. **Typography for labels:** JetBrains Mono, ~10-11px, uppercase or title case

5. **No drop shadows.** Depth comes from tonal layering + backdrop blur only.

### Architecture Compliance

- `src/components/features/shared/BottomNav.tsx` — **Create** — New bottom navigation component
- `src/app/(dashboard)/layout.tsx` — **Modify** — Replace header with BottomNav, add padding-bottom to main
- `src/app/(dashboard)/profile/page.tsx` — **Modify** — Add log-out button (moved from header)
- All existing auth guard functionality must be preserved

### File Structure Requirements

| File | Action | Notes |
|------|--------|-------|
| `src/components/features/shared/BottomNav.tsx` | **Create** | Bottom navigation with 5 tabs + tab transition animation |
| `src/app/(dashboard)/layout.tsx` | **Overwrite** | Replace header with BottomNav, add safe-area padding |
| `src/app/(dashboard)/profile/page.tsx` | **Modify** | Add log-out option to profile screen |

### Library & Framework Requirements

| Dependency | Version | Purpose | Action |
|-----------|---------|---------|--------|
| `lucide-react` | Already installed | Lucide icons (Dumbbell, Apple, BarChart3, Sparkles, User) | Already in package.json |
| `framer-motion` | ^12.40.0 | Tab transition animation (sliding indicator) | Already in package.json |
| `next` | 16 | App Router, `usePathname`, `useSelectedLayoutSegment` | Already in package.json |
| `next-themes` | ^0.4.6 | Theme provider | Already in package.json |

**No new npm packages are needed.** All dependencies are already installed.

### Critical: What Must Be Preserved

- **Auth flow must continue working.** The auth guard (redirect to /login) stays in the dashboard layout.
- **All existing routes must continue to work.** Workout, Nutrition, Stats, Plan, Profile paths.
- **The `onyx-container` utility must be preserved.** Content still constrained to 448px max-width.
- **Log-out functionality must be preserved.** Moved from header to Profile screen.
- **The ThemeProvider must continue working.** No changes to theme infrastructure.

### Previous Story Intelligence

**From Story 2.1 (Design Token System & Dark Theme Shell):**
- Design tokens are defined in `src/styles/tokens.css` as `--onyx-*` CSS custom properties
- Tailwind v4 theme mapping is in `src/app/globals.css` via `@theme inline`
- Typography classes: `.onyx-display-stats`, `.onyx-headline-lg`, `.onyx-headline-md`, `.onyx-body-lg`, `.onyx-body-md`, `.onyx-label-caps`, `.onyx-stat-label`
- Glassmorphism utilities: `.glass-surface`, `.glass-card`, `.neon-glow-lime`, `.neon-glow-cyan`
- Layout utility: `.onyx-container` (max-w-448px, centered, 1.25rem edge margin)
- ThemeProvider in `src/components/providers/ThemeProvider.tsx` forced to dark
- Root layout loads Geist, Inter, JetBrains Mono fonts
- Dashboard layout currently has a header with ONYX logo + log-out button (to be replaced)

**Key patterns to follow:**
- Server components for data fetching via Supabase SSR
- Client components for interactive UI (BottomNav is a client component)
- CSS custom properties for all design tokens
- Tailwind arbitrary values for specific design token references

### UI Component Style Requirements

**BottomNav (from STITCH_DESIGN_SYSTEM.md / UX-DR4):**
- Glassmorphism bar, 64px height, backdrop-blur-md
- 5 icons (Lucide React, 2px stroke): Workout(Dumbbell), Nutrition(Apple), Stats(BarChart3), Generate Plan(Sparkles), Profile(User)
- Active tab: Electric Lime (#c3f400) accent with neon glow
- Inactive tabs: on-surface-variant (#c4c9ac)
- Labels below icons in JetBrains Mono, ~10-11px
- Safe area inset for home indicator
- Fixed position at bottom

**Tab buttons:**
- Each tab is a `<Link>` or `<button>` with equal width (`flex-1`)
- Icon centered above label
- Minimum 44px touch target height (64px total height satisfies this)
- Active state: Electric Lime icon + Electric Lime label + subtle neon glow
- Inactive state: on-surface-variant icon + on-surface-variant label

### Tab Animation Testing Requirements

- **Visual verification:** Sliding indicator animates smoothly between tabs on transition
- **Animation specs:** 200ms spring/ease-out, Electric Lime color, centered under icon
- **Reduced motion:** Animation disabled when `prefers-reduced-motion: reduce` is set
- **Performance:** No jank or frame drops during animation on mobile devices
- **Snap behavior:** Indicator snaps precisely to tab center positions

### Testing Requirements

- **Visual verification:** Bottom nav renders at bottom with glassmorphism effect
- **Active state verification:** Current tab shows Electric Lime accent with glow
- **Tab animation verification:** Sliding indicator animates smoothly between tabs
- **Navigation verification:** Tapping tabs navigates correctly to each route
- **Re-tap verification:** Re-tapping active tab scrolls content to top
- **Safe area verification:** Content not hidden behind nav on devices with home indicator
- **Desktop verification:** Bottom nav still visible and functional on desktop
- **Accessibility verification:** All tabs have aria-label, aria-current, focus indicators, keyboard navigation
- **Touch target verification:** All tab buttons ≥44px height
- **Build verification:** `npm run build` succeeds
- **Auth guard verification:** Unauthenticated users still redirected to /login
- **Log-out verification:** Log-out button in Profile screen works correctly

### Navigation Route Map

| Tab | Path | Icon (Lucide) | Label |
|-----|------|---------------|-------|
| Workout | `/workout` | `Dumbbell` | WORKOUT |
| Nutrition | `/nutrition` | `Apple` | NUTRITION |
| Stats | `/stats` | `BarChart3` | STATS |
| Generate Plan | `/plan` | `Sparkles` | PLAN |
| Profile | `/profile` | `User` | PROFILE |

### Implementation Notes

**BottomNav should be a Client Component:**
```tsx
"use client";
```
Because it uses `usePathname` from `next/navigation` (cannot be used in server components).

**Use `useSelectedLayoutSegment` or `usePathname`:**
- `usePathname` gives the full current path
- Compare against tab paths to determine active state
- Alternatively, use `useSelectedLayoutSegments` for more precise matching

**Tab component pattern:**
```tsx
<Link
  href={tab.path}
  className={isActive ? "text-primary-container ..." : "text-on-surface-variant ..."}
  aria-label={tab.label}
  aria-current={isActive ? "page" : undefined}
>
  {tab.icon}
  <span>{tab.label}</span>
</Link>
```

**Dashboard layout structure after changes:**
```tsx
<div className="flex min-h-screen flex-col">
  <main className="flex-1 onyx-container pb-[calc(64px+env(safe-area-inset-bottom))]">
    {children}
  </main>
  <BottomNav />
</div>
```

### Story Completion Status

- Status: ready-for-dev
- Ultimate context engine analysis completed — comprehensive developer guide created

---

## File List

| File | Action |
|------|--------|
| `src/components/features/shared/BottomNav.tsx` | **Create** — Bottom navigation with 5 tabs, glassmorphism, Electric Lime active state, tab transition animation |
| `src/app/(dashboard)/layout.tsx` | **Modify** — Replace header with BottomNav, add safe-area padding to main |
| `src/app/(dashboard)/profile/page.tsx` | **Modify** — Add log-out option to profile screen |

## Change Log

- 2026-06-11: Created story for bottom navigation and tab shell implementation
- 2026-06-11: Added tab transition animation requirement (sliding indicator with framer-motion)
- 2026-06-11: Implemented bottom navigation with sliding tab indicator, updated dashboard layout, moved log-out to Profile

## Dev Agent Record

### Implementation Plan

**Approach:** Create a client-side BottomNav component using `usePathname` for active state detection. Replace the current dashboard header with the BottomNav component. Move log-out to Profile screen. Add sliding indicator animation using framer-motion for smooth tab transitions.

**Key Technical Decisions:**
- BottomNav is a `"use client"` component because it uses `usePathname`
- Use Lucide React icons directly (already installed)
- Active tab detection via pathname comparison against tab config array
- Glassmorphism via Tailwind arbitrary values: `backdrop-blur-md bg-[rgba(18,18,18,0.8)] border-t border-glass-border`
- Safe area inset via CSS `env(safe-area-inset-bottom)`
- Electric Lime active state via `text-[#c3f400]` + `neon-glow-lime` box-shadow
- Fixed position at bottom with `fixed bottom-0 left-0 right-0`
- Sliding indicator via framer-motion `motion.div` with spring animation
- Reduced motion support via `prefers-reduced-motion` media query

**Tab Config Pattern:**
```tsx
const tabs = [
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/nutrition", icon: Apple, label: "Nutrition" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/plan", icon: Sparkles, label: "Plan" },
  { path: "/profile", icon: User, label: "Profile" },
];
```

**Sliding Indicator Pattern:**
```tsx
// Use layout measurements for precise positioning
const containerRef = useRef<HTMLDivElement>(null);
const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
const [indicatorX, setIndicatorX] = useState(0);

useEffect(() => {
  const activeTab = tabRefs.current[activeIndex];
  const container = containerRef.current;
  if (activeTab && container) {
    const tabLeft = activeTab.getBoundingClientRect().left;
    const containerLeft = container.getBoundingClientRect().left;
    const tabWidth = activeTab.getBoundingClientRect().width;
    setIndicatorX(tabLeft - containerLeft + tabWidth / 2 - 12); // 12 = half indicator width
  }
}, [activeIndex]);

// In JSX:
<div ref={containerRef} className="relative">
  <motion.div
    className="absolute bottom-0 h-[6px] w-[24px] bg-primary-container rounded-full"
    animate={{ x: indicatorX }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  />
  {tabs.map((tab, i) => (
    <Link key={tab.path} ref={el => tabRefs.current[i] = el} ...>
      ...
    </Link>
  ))}
</div>
```

### Completion Notes

**Implementation Summary:**

1. **BottomNav component** (`src/components/features/shared/BottomNav.tsx`):
   - Created client component with glassmorphism styling (backdrop-blur-md, semi-transparent fill, glass border)
   - 5 tabs with Lucide React icons: Dumbbell, Apple, BarChart3, Sparkles, User
   - Electric Lime (#c3f400) active state with neon glow drop-shadow
   - Sliding indicator animation using framer-motion motion.div with spring animation (stiffness: 500, damping: 30)
   - Indicator positioned using getBoundingClientRect() for precise centering under active tab
   - prefers-reduced-motion guard disables animation for users who prefer reduced motion
   - Safe area inset padding for device home indicators
   - aria-label and aria-current for accessibility
   - 44px minimum touch target height
   - Keyboard accessible with visible focus indicators

2. **Dashboard layout** (`src/app/(dashboard)/layout.tsx`):
   - Removed old header with ONYX logo and log-out button
   - Added BottomNav component at bottom
   - Added padding-bottom to main to avoid content hidden behind nav
   - Preserved auth guard (redirect to /login if unauthenticated)
   - Preserved onyx-container wrapper

3. **Profile page** (`src/app/(dashboard)/profile/page.tsx`):
   - Added log-out button with LogOut icon from Lucide
   - Uses server action pattern for authentication

4. **Build verification**: `npm run build` completed successfully with no errors
