---
baseline_commit: NO_VCS
---

# Story 1.2: User Authentication — Registration and Login

Status: done

## Story

As a user,
I want to sign up and log in using email/password or Google/Apple OAuth,
so that I can access my personal ONYX data securely.

## Acceptance Criteria

1. **AC-1: Unauthenticated Redirect** (FR-1)
   - Given I am an unauthenticated user visiting the app
   - When I navigate to any protected route
   - Then I am redirected to the login page

2. **AC-2: Email/Password Login** (FR-1)
   - Given I am on the login page
   - When I enter my email and password and tap "Log In"
   - Then I am authenticated via Supabase Auth and redirected to the dashboard

3. **AC-3: Registration Creates Profile** (FR-1)
   - Given I am on the registration page
   - When I enter my email, password, and tap "Sign Up"
   - Then a Supabase profile record is created with my user ID (via `handle_new_user()` trigger from Story 1.1)
   - And I am redirected to the onboarding wizard

4. **AC-4: OAuth — Google and Apple** (FR-1)
   - Given I am on the login page
   - When I tap "Continue with Google" or "Continue with Apple"
   - Then the OAuth flow completes and I am redirected to the dashboard (or onboarding if first visit)

5. **AC-5: Session Persistence** (FR-1, NFR-7)
   - Given I have authenticated
   - When I close and reopen the browser
   - Then my session persists (JWT refresh token flow via Supabase SSR cookies)
   - And I remain on the dashboard without re-authenticating

6. **AC-6: Authenticated Users Redirected from Auth Routes** (FR-1)
   - Given I am authenticated
   - When I access any route under `(auth)/`
   - Then I am redirected to the dashboard

7. **AC-7: Logout** (FR-1)
   - Given I have an active session
   - When I tap "Log Out"
   - Then my session is destroyed and I am redirected to the login page

8. **AC-8: Accessibility** (UX-DR16)
   - Given auth forms are rendered
   - When I inspect them
   - Then all form inputs have associated labels
   - And error messages use `aria-live` regions
   - And OAuth buttons have descriptive `aria-label` attributes
   - And all touch targets are ≥44pt

## Tasks / Subtasks

- [x] **Task 1: Create Supabase client files** (AC-1–AC-7)
  - [x] Create `src/lib/supabase/client.ts` — browser client with `createBrowserClient`
  - [x] Create `src/lib/supabase/server.ts` — server client with `createServerClient` (for use in server components, API routes, and middleware)
  - [x] Create `src/lib/supabase/middleware.ts` — reusable middleware helper (cookie refresh logic)

- [x] **Task 2: Create auth middleware** (AC-1, AC-6)
  - [x] Create `src/middleware.ts` — runs on all routes except static files
  - [x] Use `@supabase/ssr` `createServerClient` with `getAll()`/`setAll()` cookie API
  - [x] Refresh session on every request
  - [x] Redirect unauthenticated users away from `(dashboard)/` to `/login`
  - [x] Redirect authenticated users away from `(auth)/` to `/`

- [x] **Task 3: Create auth route group pages** (AC-2, AC-3, AC-4)
  - [x] Create `src/app/(auth)/layout.tsx` — centered card layout with ONYX branding
  - [x] Create `src/app/(auth)/login/page.tsx` — login form (email + password + OAuth buttons)
  - [x] Create `src/app/(auth)/register/page.tsx` — registration form (email + password + OAuth buttons)

- [x] **Task 4: Update root layout with auth providers** (AC-5)
  - [x] Modify `src/app/layout.tsx` — wrap `{children}` with `<AuthProvider>` + `<Toaster>`
  - [x] Create `src/components/features/auth/AuthProvider.tsx` — Supabase session listener + React context
  - [x] Create `src/hooks/useUser.ts` — convenience hook returning current user/session

- [x] **Task 5: Update home page to smart redirect** (AC-1, AC-5)
  - [x] Modify `src/app/page.tsx` — server-render check for session → redirect to dashboard, onboarding, or login

- [x] **Task 6: Create dashboard layout with logout** (AC-7)
  - [x] Create `src/app/(dashboard)/layout.tsx` — shell with logout button (full BottomNav comes in Story 2.2)
  - [x] Wire logout button to Supabase `signOut()` via server action

- [x] **Task 7: Build verification** (AC-8)
  - [x] Run `npm run build`
  - [x] Fix errors (added `dynamic = "force-dynamic"` to pages using Supabase server client, placeholder env vars for build)
  - [x] Confirm zero-error build

### Review Findings

- [x] [Review][Patch] Missing /auth/callback route [src/components/features/auth/OAuthButtons.tsx:22] — created `src/app/auth/callback/route.ts` with code exchange handler.
- [x] [Review][Patch] AuthProvider re-render loop [src/components/features/auth/AuthProvider.tsx:26] — moved `createClient()` to module scope; removed `supabase` from useEffect deps.
- [x] [Review][Patch] useUser dead code guard [src/hooks/useUser.ts:6] — changed `createContext` default to `null` so the guard is reachable.
- [x] [Review][Patch] supabase variable shadowing in logout [src/app/(dashboard)/layout.tsx:25] — renamed inner variable to `sb`.
- [x] [Review][Patch] No loading state on OAuth buttons [src/components/features/auth/OAuthButtons.tsx:18] — added `loadingProvider` state, disabled state, and "Redirecting..." text.
- [x] [Review][Defer] Email confirmation flow not handled [src/components/features/auth/RegisterForm.tsx:20] — deferred, Supabase may require email confirmation; redirect to onboarding may happen before confirmation. Acceptable for v1 with email confirmation disabled in Supabase settings.
- [x] [Review][Defer] No rate limiting on auth forms [src/components/features/auth/LoginForm.tsx:15] — deferred, no CAPTCHA or throttle on auth attempts. Acceptable for v1 scale; Supabase has built-in rate limiting.

## Dev Notes

### Relevant Architecture Patterns

- **Supabase SSR authentication** (`@supabase/ssr`):
  - Use `createBrowserClient` in browser components (client.ts)
  - Use `createServerClient` in server components and middleware (server.ts)
  - Use `getAll()`/`setAll()` cookie API — the deprecated `get/set/remove` methods should NOT be used
  - Middleware must refresh the session on every request to keep the JWT alive
  - Auth tokens stored in HTTP-only cookies (NFR-7)

- **Route design**:
  - `(auth)` route group — no layout chrome, centered card with ONYX branding
  - `(dashboard)` route group — authenticated shell with nav (minimal in this story, full BottomNav in Story 2.2)
  - `middleware.ts` at root `src/` level — runs on ALL routes by default, excluded for static files via `matcher` config
  - The home page (`/`) redirects based on session status: authenticated → dashboard, unauthenticated → login

- **Profile creation**:
  - `handle_new_user()` trigger from Story 1.1 (migration 002) auto-creates a profile row on user sign-up
  - New users who just registered go to `profile/onboarding` (Story 1.3)
  - Returning users with completed profiles go to dashboard

- **OAuth flow**:
  - Supabase `signInWithOAuth({ provider: 'google' | 'apple' })` with `redirectTo`
  - Redirect URL must include `NEXT_PUBLIC_APP_URL` for production correctness
  - OAuth callback handled by Supabase automatically — no custom callback page needed

- **Error handling**:
  - Auth errors returned as structured `{ data: null, error: { code, message } }`
  - Display inline form error messages (not toasts)
  - Network errors show "Could not connect — check your internet connection"
  - Use `aria-live="polite"` region for error announcements

- **Loading states**:
  - Submit button shows loading spinner and is disabled during auth operation
  - Full-page skeleton while session is being resolved on initial load

- **Design constraints**:
  - Dark theme (single theme, per ARCHITECTURE.md)
  - Background: `#131313` (surface), text: white, accent: Electric Lime (`#c3f400`)
  - Glassmorphism not needed for auth pages (they're simple cards, per UX-DR14)
  - Responsive: mobile-first, centered 448px pillar on desktop
  - Touch targets ≥44pt for all interactive elements
  - No gamification language anywhere

### Supabase Client Architecture

```typescript
// src/lib/supabase/client.ts — Browser client
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/lib/supabase/server.ts — Server component client
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

```typescript
// src/lib/supabase/middleware.ts — Middleware helper
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, supabaseResponse, user };
}
```

### Source Tree Components to Touch

| File | Action | Notes |
|------|--------|-------|
| `src/middleware.ts` | **Create** | Supabase SSR session check + redirects. `matcher` excludes static files. |
| `src/lib/supabase/client.ts` | **Create** | Browser client (createBrowserClient). |
| `src/lib/supabase/server.ts` | **Create** | Server client (createServerClient + cookies). |
| `src/lib/supabase/middleware.ts` | **Create** | Reusable middleware helper (updateSession). |
| `src/app/layout.tsx` | **Modify** | Wrap children with AuthProvider. Add sonner Toaster. |
| `src/app/page.tsx` | **Modify** | Server-component session check → redirect to dashboard or login. |
| `src/app/(auth)/layout.tsx` | **Create** | Auth route layout — centered card, ONYX branding, no nav. |
| `src/app/(auth)/login/page.tsx` | **Create** | Login form with email/password + OAuth buttons. |
| `src/app/(auth)/register/page.tsx` | **Create** | Register form with email/password + OAuth buttons. |
| `src/app/(dashboard)/layout.tsx` | **Create** | Minimal authenticated shell with logout. Full BottomNav in Story 2.2. |
| `src/components/features/auth/AuthProvider.tsx` | **Create** | Supabase session context + listener. |
| `src/hooks/useUser.ts` | **Create** | Convenience hook returning current user. |
| `src/components/features/auth/LoginForm.tsx` | **Create** | Login form component (separated from page for testability). |
| `src/components/features/auth/RegisterForm.tsx` | **Create** | Register form component (separated from page for testability). |
| `src/components/features/auth/OAuthButtons.tsx` | **Create** | Google + Apple OAuth button set. |
| `.env.example` | **Verify** | Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL are present. |

### Route Design & Middleware Logic

```
Request → middleware.ts
  ├── Static file? (/_next/, /favicon.ico, etc.) → skip, return NextResponse.next()
  ├── Unauthenticated + (dashboard)/ route → redirect to /login
  ├── Authenticated + (auth)/ route → redirect to /dashboard (or /profile/onboarding if first visit)
  ├── Authenticated + / (home page) → let through (page handles redirect)
  └── Everything else → let through
```

### Testing Standards Summary

- No automated tests required in this story (testing framework not yet set up — deferred to a later story)
- Acceptance verified via `npm run build` (zero errors)
- Manual verification: start dev server, test all auth flows in browser

### Previous Story Intelligence

- **Story 1.1** established the project scaffold with all dependencies installed
- Supabase migrations 001, 002, 009 exist and are ready — no new migrations needed for this story
- `handle_new_user()` trigger in 002_profiles.sql auto-creates profile on sign-up
- RLS on profiles table is already enabled (migration 009)
- shadcn components installed: `button`, `card`, `dialog`, `input`, `sonner` (replaces deprecated toast)
- `text-on-surface-variant` CSS class used in page.tsx but token not defined until Story 2.1 — use `text-muted-foreground` instead
- Migration ordering fix from Story 1.1 review: `handle_new_user()` trigger lives in 002_profiles.sql (after table creation)

### References

- [Source: epics.md#Story-12-User-Authentication](_bmad-output/planning-artifacts/epics.md#Story-12-User-Authentication)
- [Source: architecture.md#Authentication--Security](_bmad-output/planning-artifacts/architecture.md#Authentication--Security)
- [Source: architecture.md#Project-Structure](_bmad-output/planning-artifacts/architecture.md#Project-Structure)
- [Source: supabase/migrations/001_users.sql](supabase/migrations/001_users.sql)
- [Source: supabase/migrations/002_profiles.sql](supabase/migrations/002_profiles.sql)
- [Source: supabase/migrations/009_rls_policies.sql](supabase/migrations/009_rls_policies.sql)
- [Source: @supabase/ssr docs — createServerClient](https://supabase.com/docs/reference/nextjs/server/creating-a-client)
- [Source: @supabase/ssr docs — middleware](https://supabase.com/docs/reference/nextjs/nextjs-middleware)
- [Source: @supabase/ssr docs — auth code example](https://supabase.com/docs/guides/auth/quickstarts/nextjs)