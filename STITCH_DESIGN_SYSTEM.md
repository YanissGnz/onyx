---
name: ONYX
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
---

## Brand & Style

The design system embodies a **Technical, High-Performance, and Cyber-Urban** aesthetic. It is engineered for athletes who view fitness as a precise science rather than a casual hobby. The brand personality is intense, intelligent, and uncompromisingly modern.

The visual style is a sophisticated blend of **Glassmorphism** and **Futuristic Minimalism**. By utilizing deep, obsidian-like surfaces paired with high-frequency neon accents, the UI creates a focused, "head-up display" (HUD) environment. This atmosphere minimizes cognitive load while maximizing the sense of momentum and "flow" during high-intensity training.

**Key Stylistic Pillars:**
- **Immersive Dark Mode:** Total reliance on dark surfaces to reduce eye strain and emphasize performance data.
- **Translucent Depth:** Use of backdrop blurs and micro-borders to create a sense of hierarchy without traditional drop shadows.
- **Kinetic Energy:** Subtle neon glows and high-contrast interactions that mimic the pulse of a high-performance engine.

## Colors

The palette is rooted in an ultra-dark foundation to establish the "ONYX" identity. Color is used sparingly but with high impact to denote action, AI intelligence, and physical intensity.

- **Primary (Electric Lime):** Reserved for "Energy" and "Action." This is the primary CTA color and progress indicator.
- **Secondary (Ice Blue):** Used for "AI & Technology." This identifies intelligent insights, automated meal planning, and data-driven suggestions.
- **Tertiary (Coral Red):** Denotes "Intensity & Goals." Used for PRs (Personal Records), high-heart-rate zones, and critical alerts.
- **Neutral (Obsidian):** The structural base. `#0A0A0A` is used for the deepest background layers, while `#121212` defines elevated surface containers.

**Glassmorphism Implementation:**
Surfaces should use a background blur (`backdrop-blur-md`) with a semi-transparent fill (`rgba(18, 18, 18, 0.8)`) and a thin, 1px border (`glass-border`) to simulate physical layers of dark glass.

## Typography

The typography strategy emphasizes **technical precision** and **legibility under duress**. 

- **Geist (Headlines):** Used for primary navigation and impact areas. Its geometric, technical construction feels modern and "engineered." Tracking is kept tight to feel more aggressive and compact.
- **Inter (Body):** Used for all functional reading and data input. It provides high legibility for tracking macros and exercise instructions.
- **JetBrains Mono (Data/Labels):** Employed for numerical data, timestamps, and metadata. The monospaced nature reinforces the "technical tool" aspect of the design system, ensuring numbers align perfectly in stat grids.

**Mobile Scaling:**
On mobile devices, `display-stats` should scale down to `36px` to avoid text wrapping, maintaining its tight tracking for a condensed, impactful look.

## Layout & Spacing

This is a **Mobile-First Fixed Grid** system. To maintain the immersive "app-like" feel on all devices, the layout is constrained to a maximum width of `448px` (max-w-md), centered on the screen with a subtle outer glow or shadow on desktop viewports.

**Layout Model:**
- **Margins:** A consistent `1.25rem` (20px) safety margin is applied to the left and right of the screen.
- **Vertical Rhythm:** Components stack using an 8px base grid.
- **Safe Areas:** Bottom navigation bars and input drawers must account for device home indicators, using backdrop-blur to allow content to bleed behind them elegantly.

**Adaptability:**
- **Mobile:** Full bleed to the edge of the device.
- **Tablet/Desktop:** The UI remains a centered pillar. This ensures that the user's focus remains concentrated, mimicking the focused experience of a handheld workout tracker.

## Elevation & Depth

In the absence of traditional light-source shadows, depth is conveyed through **Tonal Layering** and **Optical Blurs**.

1.  **Floor (Level 0):** Pure Obsidian (`#0A0A0A`). The deepest layer, used for the main background.
2.  **Surface (Level 1):** Elevated cards and containers (`#121212`). These should feature a 1px `glass-border`.
3.  **Interactive (Level 2):** Floating elements like the `BottomNav` or `VibeDrawer`. These use **Glassmorphism** with a `backdrop-blur-md` and a slightly lighter fill.
4.  **Luminescence:** Critical status elements (like an active timer) use a **Neon Glow**. This is achieved by a low-spread, low-opacity outer glow using the primary accent color, making the element appear to "emit" light.

## Shapes

The shape language balances **geometric rigidity** with **ergonomic softness**. 

- **Containers:** Standard cards and input fields use a `0.5rem` (8px) radius, providing a clean, modern look that isn't overly organic.
- **Interactive Elements:** Buttons and high-priority chips use a more pronounced `1rem` radius or full pill-shape to distinguish them from content containers.
- **Accents:** Progress bars and separators should have rounded caps to soften the high-contrast neon fills.

## Components

**Buttons:**
Tactile and high-contrast. The primary button uses a solid Electric Lime fill with black text for maximum visibility. Secondary buttons use the "Glass" style: transparent background, 1px white/0.08 border, and white text.

**Exercise Cards:**
Features a subtle gradient from `#121212` to a slightly lighter gray. On active states, the left border should "ignite" with a 2px Neon Lime stroke and a faint glow.

**Progress Bars:**
Background is a dark charcoal. The fill is a solid Neon Accent color. For high-intensity goals, the fill can include a subtle animated pulse effect.

**Input Fields:**
Minimalist design. No background fill—only a bottom border that transitions from `glass-border` to `secondary-color` (Cyan) when focused. 

**Vibe Drawer:**
An immersive, bottom-anchored drawer using heavy backdrop blur. It should feel like an overlay that "floats" above the dashboard, allowing the natural language input to be the sole focus.

**Icons:**
Use **Lucide React** icons with a consistent `2px` stroke. Icons should primarily be white or light gray, turning to their respective accent color (Lime or Cyan) only when active or signifying a specific AI action.