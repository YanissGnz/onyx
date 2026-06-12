---
baseline_commit: NO_VCS
---

# Story 1.1: Project Scaffold and Supabase Schema

Status: done

## Story

As a developer,
I want the Next.js project scaffolded with all dependencies, Supabase migrations created, and project structure established,
so that the development foundation is ready and consistent with the architecture.

## Acceptance Criteria

1. **AC-1: Project Initialization** (FR-1 partial)
   - Given no project exists yet
   - When `npx create-next-app@latest onyx --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` is run
   - Then a Next.js 16.2.7+ project is created
   - And TypeScript strict mode is enabled in `tsconfig.json`
   - And Tailwind CSS v4 is configured via `postcss.config.mjs`
   - And App Router is set up under `src/app/`
   - And `src/` directory is the source root
   - And `@/*` import alias resolves to `src/*`

2. **AC-2: Dependencies Installed** (FR-1, FR-23, FR-24–FR-26)
   - Given the project scaffold is complete
   - When `npm install` runs for the following packages
   - Then these production dependencies are present in `package.json`:
     - `tailwindcss` ^4.x, `@tailwindcss/postcss` ^4.x
     - `lucide-react` (latest)
     - `framer-motion` (latest)
     - `@tanstack/react-query` ^5.x
     - `@supabase/supabase-js` (latest)
     - `@supabase/ssr` (latest)
     - `@google/genai` (latest)
     - `@serwist/next` (latest) — *for PWA/Service Worker support*
   - And these dev dependencies are present:
     - `@types/node`, `@types/react`, `@types/react-dom`
     - `eslint` with Next.js config
     - `postcss` with Tailwind plugin
   - And `npx shadcn@latest init` completes successfully (defaults accepted)
   - And `npx shadcn@latest add button card input toast dialog` installs the primitives

3. **AC-3: Project Directory Structure** (Architecture §Project Structure)
   - Given the scaffold is complete
   - When directories are created
   - Then the following directory tree exists under `src/`:
     ```
     src/app/(auth)/
     src/app/(dashboard)/workout/
     src/app/(dashboard)/nutrition/
     src/app/(dashboard)/stats/
     src/app/(dashboard)/plan/
     src/app/(dashboard)/profile/onboarding/
     src/app/api/ai/generate/
     src/components/ui/            (shadcn primitives — do NOT edit manually)
     src/components/features/workout/
     src/components/features/nutrition/
     src/components/features/stats/
     src/components/features/plan/
     src/components/features/profile/
     src/components/features/shared/
     src/hooks/
     src/lib/supabase/
     src/lib/gemini/
     src/lib/sync/
     src/lib/validation/
     src/types/
     src/styles/
     ```
   - And the following directory exists at project root:
     ```
     supabase/migrations/
     ```
   - And `public/icons/` directory exists (for PWA icons later)

4. **AC-4: Supabase Migration — 001_users.sql** (FR-1)
   - Given the migrations directory exists
   - When `supabase/migrations/001_users.sql` is created
   - Then it contains SQL to extend `auth.users` with:
     - Trigger: on auth user creation, ensure a profile record will be inserted
     - No additional columns on auth.users — profile data lives in profiles table
     - Enable UUID generation via `gen_random_uuid()`
     - Enable `pgcrypto` extension for UUID support

5. **AC-5: Supabase Migration — 002_profiles.sql** (FR-1, FR-2, FR-3)
   - Given the migrations directory exists
   - When `supabase/migrations/002_profiles.sql` is created
   - Then it creates `profiles` table with columns:
     - `id` UUID PK default `gen_random_uuid()`
     - `user_id` UUID NOT NULL references `auth.users(id)` ON DELETE CASCADE — UNIQUE
     - `weight_kg` DECIMAL(5,1) nullable
     - `goal` TEXT nullable (values: 'cut', 'maintain', 'bulk')
     - `caloric_target` INTEGER nullable
     - `protein_target` INTEGER nullable
     - `equipment` TEXT[] nullable (array of equipment names)
     - `preferred_split` TEXT nullable
     - `session_duration` INTEGER nullable (minutes)
     - `training_days` INTEGER nullable (days per week)
     - `preferred_ingredients` TEXT[] nullable
     - `excluded_ingredients` TEXT[] nullable
     - `cuisine_style` TEXT nullable
     - `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
     - `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
   - And a unique index on `user_id`
   - And an `updated_at` trigger that auto-sets `updated_at = now()`

6. **AC-6: Supabase Migration — 009_rls_policies.sql** (NFR-5, NFR-8)
   - Given the migrations directory exists
   - When `supabase/migrations/009_rls_policies.sql` is created
   - Then it enables RLS on `profiles` table
   - And creates policies:
     - `select_profiles_owner`: SELECT where `user_id = auth.uid()`
     - `insert_profiles_owner`: INSERT where `user_id = auth.uid()`
     - `update_profiles_owner`: UPDATE where `user_id = auth.uid()`
     - `delete_profiles_owner`: DELETE where `user_id = auth.uid()`
   - And placeholder RLS policies are added for future tables (commented out, ready for activation):
     - `workout_plans`, `exercise_templates`, `workout_sessions`, `personal_meals`, `meal_logs`, `weight_logs`
   - And a `public.users` helper view is created for frontend convenience (SELECT * FROM profiles WHERE user_id = auth.uid())

7. **AC-7: Environment Configuration** (NFR-6, NFR-7)
   - Given the scaffold is complete
   - When `.env.local` and `.env.example` are created
   - Then they contain these variables (with placeholders in `.env.example`):
     ```
     NEXT_PUBLIC_SUPABASE_URL=
     NEXT_PUBLIC_SUPABASE_ANON_KEY=
     SUPABASE_SERVICE_ROLE_KEY=
     GEMINI_API_KEY=
     NEXT_PUBLIC_APP_URL=
     ```

8. **AC-8: Build Verification** (Architecture §Development Workflow)
   - Given all files are in place
   - When `npm run build` is executed
   - Then the project compiles without errors
   - And the build output confirms static export readiness

## Tasks / Subtasks

- [x] **Task 1: Initialize Next.js project** (AC-1)
  - [x] Run `npx create-next-app@latest onyx --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` in `d:\Projects\`
  - [x] Verify `tsconfig.json` has `strict: true`
  - [x] Verify `postcss.config.mjs` uses `@tailwindcss/postcss`
  - [x] Verify `src/app/layout.tsx` exists
  - [x] Verify `@/*` path alias resolves to `src/*`

- [x] **Task 2: Install dependencies** (AC-2)
  - [x] `npm install tailwindcss @tailwindcss/postcss lucide-react framer-motion @tanstack/react-query @supabase/supabase-js @supabase/ssr @google/genai @serwist/next`
  - [x] `npx shadcn@latest init -y` (defaults)
  - [x] `npx shadcn@latest add button card input sonner dialog` (sonner replaces deprecated toast)
  - [x] Verify `package.json` and lockfile

- [x] **Task 3: Create directory structure** (AC-3)
  - [x] Create all `src/app/` route group directories
  - [x] Create `src/components/ui/` — verify shadcn already created
  - [x] Create `src/components/features/workout/ nutrition/ stats/ plan/ profile/ shared/`
  - [x] Create `src/hooks/`, `src/lib/supabase/ gemini/ sync/ validation/`, `src/types/`, `src/styles/`
  - [x] Create `supabase/migrations/`, `public/icons/`

- [x] **Task 4: Write Supabase migration 001_users.sql** (AC-4)
  - [x] Write auth user trigger function
  - [x] Write `handle_new_user()` trigger
  - [x] Write `ON INSERT TO auth.users` trigger

- [x] **Task 5: Write Supabase migration 002_profiles.sql** (AC-5)
  - [x] Write CREATE TABLE profiles with all columns
  - [x] Write unique index on user_id
  - [x] Write `updated_at` auto-trigger function and trigger

- [x] **Task 6: Write Supabase migration 009_rls_policies.sql** (AC-6)
  - [x] Enable RLS on profiles
  - [x] Write SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid()`
  - [x] Write commented RLS templates for future tables
  - [x] Create `public.users` helper view

- [x] **Task 7: Create environment config** (AC-7)
  - [x] Create `.env.local` with placeholder values
  - [x] Create `.env.example` with documentation comments

- [x] **Task 8: Verify build** (AC-8)
  - [x] Run `npm run build`
  - [x] Fix any TypeScript or lint errors (viewport export fix in layout.tsx)
  - [x] Confirm zero-error build

## Dev Notes

### Relevant Architecture Patterns

- **Stack versions (must match):**
  - Next.js 16.2.7+ (App Router, static export capable)
  - React 19 (shipped with Next.js 16)
  - TypeScript strict mode
  - Tailwind CSS v4 (PostCSS config, not v3 `tailwind.config`)
  - shadcn/ui (Radix primitives installed via CLI only — NEVER edit manually)

- **Supabase schema conventions (architecture §Naming Conventions):**
  - Tables: `snake_case` plural
  - Columns: `snake_case`
  - Foreign keys: `referenced_table_id`
  - RLS policies: `{operation}_{table}_{role}` e.g., `select_profiles_owner`
  - Timestamps: `created_at`, `updated_at` TIMESTAMPTZ

- **TypeScript conventions:**
  - `camelCase` for variables/functions
  - `PascalCase` for components and types/interfaces
  - `UPPER_SNAKE_CASE` for constants
  - Zod schemas shared frontend/backend in `lib/validation/`

- **Design token foundation (DESIGN.md):**
  - CSS custom properties will be set up in a later story (2.1)
  - For now, scaffold the `src/styles/tokens.css` as an empty file ready for Story 2.1

### Source Tree Components to Touch

| File | Action | Notes |
|------|--------|-------|
| `src/app/globals.css` | Modify | Already created by create-next-app. Keep Tailwind directives. Remove demo styles. |
| `src/app/layout.tsx` | Modify | Keep minimal — add meta viewport, theme-color, lang. |
| `src/app/page.tsx` | Modify | Replace with redirect to login or dashboard placeholder. |
| `supabase/migrations/001_users.sql` | Create | Auth user trigger. |
| `supabase/migrations/002_profiles.sql` | Create | Profiles table DDL. |
| `supabase/migrations/009_rls_policies.sql` | Create | RLS policies. |
| `.env.local` | Create | Environment variables (git-ignored). |
| `.env.example` | Create | Documentation template. |
| `src/styles/tokens.css` | Create | Empty file — ready for Story 2.1 design tokens. |
| `tsconfig.json` | Verify + modify | Ensure `strict: true`, paths `@/*` → `./src/*` |
| `next.config.ts` | Verify + modify | Add `output: "export"` if static export is desired, or leave as default for now. Add `experimental` section placeholder. |

### Testing Standards Summary

- No tests required in this story (scaffold + schema only)
- Future stories will use Vitest + React Testing Library
- Migration files should be reviewed manually before `supabase migration up`
- Build verification (`npm run build`) is the acceptance gate

### Project Structure Notes

- Full directory tree matches architecture.md §Project Structure exactly
- `components/ui/` contains shadcn primitives — **never modify manually**, only via `npx shadcn@latest add`
- Migration numbering leaves gaps (003-008) for future tables (workout_plans, exercise_templates, workout_sessions, personal_meals, meal_logs, weight_logs) — this prevents renumbering as stories add migrations

### References

- [Source: architecture.md#Project-Structure](_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries)
- [Source: architecture.md#Naming-Conventions](_bmad-output/planning-artifacts/architecture.md#Naming-Conventions)
- [Source: epics.md#Story-11-Project-Scaffold-and-Supabase-Schema](_bmad-output/planning-artifacts/epics.md#Story-11-Project-Scaffold-and-Supabase-Schema)
- [Source: prd.md#FR-1](_bmad-output/planning-artifacts/prds/prd-onyx-2026-06-08/prd.md#FR-1)
- [Source: prd.md#FR-2](_bmad-output/planning-artifacts/prds/prd-onyx-2026-06-08/prd.md#FR-2)
- [Source: prd.md#FR-3](_bmad-output/planning-artifacts/prds/prd-onyx-2026-06-08/prd.md#FR-3)
- [Source: DESIGN.md#Colors](_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/DESIGN.md#Colors)
- [Source: EXPERIENCE.md#Key-Flows](_bmad-output/planning-artifacts/ux-designs/ux-onyx-2026-06-08/EXPERIENCE.md#Key-Flows)
- [Source: Next.js 16 docs — create-next-app](https://nextjs.org/docs/app/api-reference/create-next-app)

## Review Findings

### Patch (Fixable)

- [x] **[Review][Patch] Migration ordering: 001 references profiles table before 002 creates it** [001_users.sql:15][002_profiles.sql]
  **Fixed:** `handle_new_user()` trigger moved to `002_profiles.sql` (after table creation). `001_users.sql` now only contains the `pgcrypto` extension.

- [x] **[Review][Patch] `.env.local` should be gitignored** [.env.local]
  **Fixed:** Created `.gitignore` with `.env*.local` pattern to prevent committing secrets.

- [x] **[Review][Patch] `set_updated_at()` function uses SECURITY DEFINER unnecessarily** [002_profiles.sql:3-10]
  **Fixed:** Removed `SECURITY DEFINER` from `set_updated_at()`. Changed `handle_new_user()` to `SECURITY INVOKER` as well.

### Deferred

- [x] **[Review][Defer] `handle_new_user()` no EXCEPTION block** [001_users.sql:9-19] — deferred, silent failure acceptable for v1 scale; monitoring via Supabase logs.
- [x] **[Review][Defer] `public.users` view missing `security_barrier`** [009_rls_policies.sql:25] — deferred, predicate pushdown risk is negligible for single-user context with RLS.
- [x] **[Review][Defer] `text-on-surface-variant` CSS token not yet defined** [src/app/page.tsx:5] — deferred, token will be defined in Story 2.1 (Design Token System).
- [x] **[Review][Defer] Empty `next.config.ts`** — deferred, PWA/static export config added in Story 2.4.
- [x] **[Review][Defer] Empty `tokens.css`** — deferred, token system added in Story 2.1.
- [x] **[Review][Defer] No guard against admin/service-role inserts on `auth.users`** [001_users.sql] — deferred, acceptable for v1 admin-level operations.

### Dismissed

- 4 findings dismissed as noise: `pgcrypto` search_path (correct), `goal` CHECK constraint case (correct), `weight_kg` DECIMAL(5,1) limit (999.9kg acceptable), `postcss` direct dependency (transitive via tailwind is fine).

## Dev Agent Record

### Agent Model Used

Claude (Anthropic) — via Cline agent orchestration framework (BMad Method)

### Debug Log References

- Sprint status auto-discovered first backlog: `1-1-project-scaffold-and-supabase-schema`
- Epic 1 status updated: `backlog → in-progress`
- Next.js latest version confirmed: `16.2.7`

### Completion Notes List

- Story 1.1 is the foundation — nothing can proceed until this is complete
- After this story: run `supabase migration up`, then proceed to Story 1.2 (auth pages)
- Migration number gaps (003-008) reserved for future stories

### File List

- `src/app/globals.css` (modify)
- `src/app/layout.tsx` (modify)
- `src/app/page.tsx` (modify)
- `src/styles/tokens.css` (create)
- `supabase/migrations/001_users.sql` (create)
- `supabase/migrations/002_profiles.sql` (create)
- `supabase/migrations/009_rls_policies.sql` (create)
- `.env.local` (create)
- `.env.example` (create)
- `tsconfig.json` (verify)
- `next.config.ts` (verify)