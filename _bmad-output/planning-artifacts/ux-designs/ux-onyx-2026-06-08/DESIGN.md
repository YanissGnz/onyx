---
name: ONYX
description: Unified workout and nutrition orchestrator for casual gym-goers. Premium dark HUD aesthetic, no gamification, no noise.
status: final
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#68000b'
  tertiary-container: '#ffdad7'
  on-tertiary-container: '#c41e27'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930014'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  obsidian-surface: '#121212'
  glass-border: rgba(255, 255, 255, 0.08)
  neon-glow-lime: rgba(204, 255, 0, 0.15)
  neon-glow-cyan: rgba(0, 240, 255, 0.15)
typography:
  display-stats:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  stat-label:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 448px
  edge-margin: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
components:
  bottom-nav:
    style: glassmorphism
    height: 64px
    backdrop-blur: md
  primary-button:
    fill: primary-container
    text: on-primary
    rounded: lg
    height: 48px
  glass-button:
    fill: transparent
    border: glass-border
    text: on-surface
    rounded: lg
  exercise-card:
    surface: surface-container-low
    active-border: primary-fixed-dim
    active-glow: neon-glow-lime
    rounded: md
  input-field:
    style: bottom-border
    border-color: glass-border
    focus-border: secondary-container
    rounded: none
  progress-bar:
    track: outline-variant
    fill: primary-fixed-dim
    rounded-cap: full
  vibe-drawer:
    style: glassmorphism
    backdrop-blur: heavy
    rounded-top: xl
  fullscreen-workout:
    background: '#0A0A0A'
    timer-display: display-stats
    accent: primary-fixed-dim
    glow: neon-glow-lime
---

# DESIGN.md — ONYX

## Brand & Style

ONYX is built for the person who trains because it makes them feel strong, not because an app told them to keep a streak. It's a **technical, high-performance, cyber-urban** aesthetic — an immersive HUD for your body. The brand personality is intense, intelligent, and uncompromisingly modern. No gamification, no badges, no leaderboards. Just you, your data, and the next rep.

The visual style blends **Glassmorphism** with **Futuristic Minimalism**. Deep obsidian surfaces with high-frequency neon accents create a focused, heads-up environment that minimizes cognitive load while maximizing flow.

**Key Stylistic Pillars:**
- **Immersive Dark Mode** — Total reliance on dark surfaces to reduce eye strain in low-light gym environments.
- **Translucent Depth** — Backdrop blurs and micro-borders to create hierarchy without traditional shadows.
- **Kinetic Energy** — Subtle neon glows and high-contrast interactions that mirror the intensity of training.
- **Noification-Free Training** — Fullscreen workout mode eliminates all distractions.

## Colors

The palette is rooted in an ultra-dark foundation to establish the ONYX identity. Color is used sparingly but with high impact to denote action, AI intelligence, and physical intensity.

- **Primary (Electric Lime — `#c3f400`):** Reserved for "Energy" and "Action." Primary CTA buttons, progress indicators, active workout states. This is the color of *go*.
- **Secondary (Ice Blue — `#00eefc`):** Used for "AI & Technology." Identifies AI-generated insights, automated meal planning, data-driven suggestions, and focused input states.
- **Tertiary (Coral Red — `#ffdad7` family):** Denotes "Intensity & Goals." Personal Records (PRs), high-heart-rate zones, critical alerts, destructive actions.
- **Neutral (Obsidian — `#0A0A0A` to `#353534`):** The structural base. Deepest layers use `#0A0A0A`, elevated surfaces step up through the container token ladder.

**Glassmorphism Implementation:**
Surfaces use background blur (`backdrop-blur-md`) with semi-transparent fill (`rgba(18, 18, 18, 0.8)`) and a 1px `glass-border` to simulate physical layers of dark glass.

**Color application by surface:**
- **Workout page / fullscreen mode** — Electric Lime accents on start button, timer, active set indicators.
- **Nutrition page** — Ice Blue accents on AI meal suggestions, macro goals, input field focus.
- **Stats page** — Electric Lime progress bars, Coral Red for PR highlights.
- **Generate Plan** — Ice Blue for AI-generated plan cards.
- **Profile/Settings** — Neutral tones; accent only on key actions.

**Avoid:** Saturated backgrounds, gradients on cards (keep surface consistent), using neon accents for decorative purposes — each accent must signal something specific.

## Typography

The typography strategy emphasizes technical precision and legibility under duress — reading your next exercise while catching your breath.

- **Geist (Headlines):** Used for primary navigation, exercise names, timer display, section titles. Geometric, technical construction feels engineered. Tight tracking (-0.02em to -0.04em) for aggressive, compact impact.
- **Inter (Body):** Used for all functional reading — exercise instructions, meal descriptions, stats labels. High legibility for quick scanning between sets.
- **JetBrains Mono (Data/Labels):** Used for numerical data, macros, timestamps, weight values. Monospaced nature reinforces the "technical tool" aesthetic and ensures numbers align in stat grids and tables.

**Mobile Scaling:**
- `display-stats` scales down to `36px` on mobile to avoid wrapping.
- Dynamic type respected; content must remain legible at system font settings.

## Layout & Spacing

**Mobile-First Fixed Grid.** The layout is constrained to a maximum width of `448px` (max-w-md), centered with a subtle outer glow on desktop. This maintains the immersive app-like feel on all devices.

**Layout Model:**
- **Margins:** Consistent `1.25rem` (20px) edge margins left and right.
- **Vertical Rhythm:** 8px base grid. Components stack using the spacing token ladder (stack-sm/md/lg).
- **Typography scale:** `1rem` = `16px` base.

**Surface Architecture:**
- **5 tab surfaces:** Workout | Nutrition | Stats | Profile/Settings | Generate Plan — accessible via glassmorphism bottom nav bar.
- **Fullscreen overlay:** Workout mode pushes to full bleed (`#0A0A0A`) — no nav, no tabs, no chrome except the timer, exercise list, and controls.
- **Safe Areas:** Bottom nav and fullscreen workout must account for device home indicators.

**Adaptability:**
- **Mobile:** Full bleed to device.
- **Tablet/Desktop:** Centered 448px pillar; user's focus stays concentrated.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Optical Blurs** — no traditional drop shadows.

1. **Floor (Level 0):** Pure Obsidian `#0A0A0A`. Used for main background and fullscreen workout mode.
2. **Surface (Level 1):** Elevated cards and containers at `#121212` with 1px `glass-border`.
3. **Interactive (Level 2):** Floating elements like the BottomNav and VibeDrawer use Glassmorphism with `backdrop-blur-md` and lighter fill.
4. **Luminescence:** Critical status elements (active timer, PR achieved) use a **Neon Glow** — low-spread, low-opacity outer glow in the accent color, making the element appear to emit light.

## Shapes

The shape language balances geometric rigidity with ergonomic softness.

- **Containers:** Standard cards and input containers use `rounded/sm` (0.25rem) to `rounded/md` (0.75rem) — clean, modern, not overly organic.
- **Interactive Elements:** Primary buttons and high-priority chips use `rounded/lg` (1rem) or `rounded/full` (pill-shape) to distinguish them from passive containers.
- **Accents:** Progress bars and separators have rounded caps to soften high-contrast neon fills.
- **Fullscreen workout mode:** Minimal rounding — the mode is utilitarian and immersive.

## Components

**Bottom Navigation:**
- Glassmorphism bar, `64px` height, `backdrop-blur-md`.
- 5 icons (Lucide React, 2px stroke). Active tab uses Electric Lime accent; inactive tabs use `on-surface-variant` (`#c4c9ac`).
- Safe area inset for home indicator.

**Primary Button (Electric Lime):**
- Solid `#c3f400` fill with `#283500` text for max contrast.
- `rounded/lg`, `48px` height.
- Reserved for primary actions: *Start Workout*, *Generate Plan*, *Save*, *Start Timer*.

**Glass Button (Secondary):**
- Transparent fill, 1px `glass-border`, white text.
- `rounded/lg`.
- Used for secondary actions: *Edit Exercise*, *View Details*, *Cancel*.

**Exercise Card:**
- Dark surface (`#1c1b1b`), subtle gradient to `#201f1f`.
- Default: neutral border. Active state: 2px Electric Lime left border with neon glow.
- Shows exercise name (Geist), sets/reps/weight (JetBrains Mono), status indicator.

**Input Fields:**
- Minimalist. No background fill — only a bottom-border that transitions from `glass-border` to Ice Blue (`#00eefc`) on focus.
- Used for: meal entry, weight logging, search, text input.

**Progress Bars:**
- Dark charcoal track (`#444933`), Electric Lime or Ice Blue fill.
- Rounded caps.
- High-intensity goals: subtle animated pulse effect on fill.

**Fullscreen Workout Mode:**
- Background: `#0A0A0A` (Level 0). No nav, no status icons.
- Timer: `display-stats` typography (Geist, 48px, tight tracking). Electric Lime glow on active timer. Scales down dynamically at max accessibility font size to fit 448px container.
- Exercise list: stacked cards, current exercise highlighted with left neon border + bold exercise name (color not sole identifier).
- Controls: *Skip*, *Complete Set*, *Rest Timer* buttons. Glass style. All buttons ≥ 44pt (iOS) / ≥ 48dp (Android).
- Rest timer overlay: countdown with circular progress ring in Electric Lime + numeric countdown in center (JetBrains Mono) — color never sole identifier.
- Exit button: top-left corner, glass style, ≥ 44pt × 44pt minimum tap target. Uses Lucide "arrow-left" icon.
- Pause button: icon next to timer, ≥ 44pt tap target.
- Set completion: checkmark icon + accent color (not color alone). Animates on `prefers-reduced-motion: no-preference` only.
- Completed exercises: dimmer opacity, checkmark icon visible. Incomplete exercises at full opacity with "skip" indicator.
- Rest timer: numeric countdown (JetBrains Mono, `display-stats` scale). Vibrate on completion. Circular ring is decorative — the countdown text is the accessible source of truth.
- Summary screen: total time, volume, exercises done, "Start Another" button alongside "Done."
- PR detection: post-session, compared against historical data by normalized exercise name. In-session subtle indicator on set animation if PR criteria met.

**Vibe Drawer (AI Plan Input):**
- Bottom-anchored drawer with heavy backdrop blur.
- Floats above the surface. Natural language input is the sole focus.
- Ice Blue accent on send/submit icon.

**Icons:**
- **Lucide React** icons with consistent `2px` stroke.
- White or `on-surface-variant` by default; Electric Lime or Ice Blue when active or signifying a specific AI action.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use Electric Lime for action/energy — *Start Workout*, active timer, progress fill | Use accent colors for decoration or empty states |
| Use Ice Blue for AI features — generated plans, meal suggestions, data insights | Gamify with badges, streaks, leaderboards, or achievements |
| Use Coral Red sparingly for PRs, intensity zones, destructive confirmations | Saturate the UI with red — it should *mean* something |
| Keep fullscreen workout completely chrome-free | Show notifications, badges, or nav during active workout |
| Maintain 20px safety margins on all content surfaces | Let content bleed to the edge outside of fullscreen mode |
| Use glassmorphism for floating elements (nav, drawer) only | Apply backdrop blur to every surface — it loses impact |
| Honor platform system fonts for dynamic type | Lock font sizes below minimum readability |
| Show realistic data in stats (weight, reps, volume, macros) | Show "level," "XP," or gamified progress metrics |
| Keep the Vibe Drawer focused on one thing: natural language input | Stack multiple inputs, filters, or chrome in the drawer |

_Last updated: 2026-06-08_