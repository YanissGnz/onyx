# Stitch Design Prompt — ONYX

## App Overview
ONYX is a premium, unified workout and nutrition orchestrator — one PWA where planning, logging, tracking, and analytics live together. Built for people who train with purpose and eat real food.

## Brand Vibe
- **Stealth wealth** — minimal, premium, no bloat
- Dark theme throughout (near-black backgrounds)
- No gamification, no bright colors, no unnecessary animations
- Respects the user's attention — functional first, beautiful second

## Screens to Design

### 1. Onboarding (4-5 steps, mobile-first)
- Step 1: Sign up — email/password or Google/Apple buttons
- Step 2: Body metrics — weight, goal (cut/maintain/bulk), caloric target, protein target
- Step 3: Training preferences — equipment list (checkboxes), training split, session duration, days per week
- Step 4: Nutrition preferences — ingredients to include/exclude, cuisine style
- Step 5: Confirmation — "Generating your first week…" loading state → Dashboard

### 2. Main Dashboard
- Today's workout card at top (status: pending/in progress/completed, with "Start" CTA)
- Today's macros vs target (compact bar)
- Quick action buttons: Log Workout, Log Meal, Plan Week
- Minimal — nothing else competes for attention

### 3. Workout Session View
- Exercise list with: name, target sets/reps/rest, weight input per set
- Rest timer between sets (countdown)
- Session summary on completion (volume, duration, exercises)

### 4. Meal Logging
- Meal database search
- Simple meal entry (name + macros)
- Composite meal / recipe builder (ingredient list with grams and macros, running total)
- Daily macro bar (calories, protein, carbs, fat — color-coded adherence)

### 5. Stats / Progress Dashboard
- Weight trend chart (with 7-day moving average)
- Lift progression charts (volume + estimated 1RM over time, per exercise)
- Weekly macro adherence grid (7-day view)
- Session frequency summary

### 6. Weekly Planner
- 7-day calendar showing workout plan + meal plan per day
- "Generate with AI" button
- Each day expandable to see exercises or meals
- Edit/regenerate per-day options

### 7. Settings / Profile
- Edit all onboarding fields
- Exercise template management (list, create, edit, delete)
- Personal Meal Database management

## Design Constraints
- **Color palette:** Dark backgrounds (#0D0D0D primary, #1A1A1A surfaces, #2A2A2A elevated). White (#FFFFFF) and light gray (#B0B0B0) for text. Single muted accent color for CTAs (you choose — something premium, not bright).
- **Typography:** Clean, modern sans-serif. High readability at small sizes on mobile.
- **Layout:** Mobile-first (single column, bottom nav). Desktop can use wider layouts.
- **Touch targets:** Minimum 44×44px on mobile.
- **No:** badges, streaks, confetti, bright gradients, or any gamification elements.
- **Navigation:** Bottom tab bar on mobile: Dashboard, Workouts, Nutrition, Stats, Settings.

## Tone
The interface should feel like a premium tool — think Notion's dark mode or a high-end watch face. Every element has a reason to exist. If it doesn't help the user train or eat better, leave it out.

## Output Format
Generate a complete set of screens in your preferred format (Figma, PNG mockups, or code). The goal is to have a visual reference for the accent color, spacing system, typography scale, and component styles that can guide frontend implementation.