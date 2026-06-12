# Investigation: Google & Apple OAuth Login Not Working

**Investigator:** Amelia (Senior Software Engineer)
**Date:** 2026-06-09
**Status:** Concluded (Root cause confirmed)

---

## Hand-off Brief

Google and Apple OAuth login flows fail because neither provider is enabled in the Supabase project's Authentication settings. The frontend code (`src/components/features/auth/OAuthButtons.tsx`) correctly calls `supabase.auth.signInWithOAuth()`, and the callback route (`src/app/auth/callback/route.ts`) correctly handles the code exchange — but Supabase rejects the `/authorize` request with `400: Unsupported provider: provider is not enabled` because the OAuth apps were never configured in the Supabase dashboard.

---

## Case Info

- **Slug:** google-apple-oauth-not-working
- **Case File:** `investigations/google-apple-oauth-not-working-investigation.md`
- **Evidence Level:** Confirmed

---

## Problem Statement

When a user clicks "Continue with Google" or "Continue with Apple" on the login/register pages, the OAuth flow redirects to Supabase Auth, which responds with a **400 Unsupported provider** error. The user is redirected back to `/login?error=auth_callback_error`. Email/password login works correctly.

---

## Investigation Log

### Confirmed Findings

| # | Finding | Evidence | Grade |
|---|---------|----------|-------|
| 1 | Supabase returns `400: Unsupported provider: provider is not enabled` for OAuth `/authorize` requests | Supabase Auth logs at multiple timestamps (10:22:27, 10:22:38, 10:49:36, 10:55:38 UTC) — `"error":"provider is not enabled"` on path `/authorize` with referer `http://localhost:3000/auth/callback` | **Confirmed** |
| 2 | Email/password login works correctly | Auth log at 10:55:52 UTC shows `"login_method":"password"`, `"provider":"email"`, `"status":200` | **Confirmed** |
| 3 | Frontend OAuthButtons code is correct | `src/components/features/auth/OAuthButtons.tsx:22-27` — calls `supabase.auth.signInWithOAuth()` with correct provider and `redirectTo` pointing to `/auth/callback` | **Confirmed** |
| 4 | Auth callback route is correct | `src/app/auth/callback/route.ts:10-27` — properly exchanges code for session using `createServerClient` and redirects to `{next}` or `/` | **Confirmed** |
| 5 | Supabase URL/anon key env vars are required | `.env.example:6-7` — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set for the Supabase client to connect | **Confirmed** |
| 6 | No `.env.local` file present in project root | Not found during file scan | **Confirmed** |
| 7 | `NEXT_PUBLIC_APP_URL=http://localhost:3000` is configured | `.env.example:14` | **Confirmed** |
| 8 | Supabase project exists and is healthy | Project `ypakngaaaupkhdhynxrv` (ONYX) in region `eu-central-1`, status `ACTIVE_HEALTHY` | **Confirmed** |

### Deduced Conclusions

| # | Conclusion | Chain of Evidence | Grade |
|---|-----------|-------------------|-------|
| 1 | Google and Apple OAuth provider apps have never been configured in the Supabase dashboard | No other error type was returned; the `provider is not enabled` error is the exact error Supabase returns when a provider app lacks client ID / secret configuration. The project was created 2026-06-08 (~1 day ago) and likely hasn't had OAuth apps set up. | **Deduced** |

### Hypothesized Paths (Refuted)

| # | Hypothesis | Status | Resolution |
|---|-----------|--------|------------|
| 1 | The callback route mishandles the OAuth response | **Refuted** | Auth logs show the error occurs at `/authorize` before the callback is ever reached. The referer is `/auth/callback` only because Supabase redirects back there after the error. |
| 2 | Environment variables for Supabase are missing or wrong | **Refuted** | Email/password auth works (confirmed login at 10:55:52), which uses the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If those were wrong, email auth would also fail. |
| 3 | The Supabase server middleware client is misconfigured | **Refuted** | The auth callback route (`route.ts`) only handles code exchange — it never touches the authorize step. The error is server-side at Supabase. |
| 4 | The browser client is misconfigured | **Refuted** | `src/lib/supabase/client.ts` uses standard `createBrowserClient`. The OAuth flow passes through the Supabase SDK correctly before Supabase rejects it server-side. |

---

## Source Code Trace

### Error origin
- **Service:** Supabase Auth (`/authorize` endpoint)
- **Trigger:** `GET /authorize` from `supabase.auth.signInWithOAuth()` in `OAuthButtons.tsx:22`
- **Response:** HTTP 400 — `"provider is not enabled"`

### Relevant files

| File | Line(s) | Role |
|------|---------|------|
| `src/components/features/auth/OAuthButtons.tsx` | 20-27 | Initiates OAuth flow via `supabase.auth.signInWithOAuth()` |
| `src/app/auth/callback/route.ts` | 10-37 | Handles OAuth callback: exchanges code for session via `exchangeCodeForSession()`, forwards cookies, redirects |
| `src/lib/supabase/client.ts` | 3-7 | Creates browser Supabase client with `createBrowserClient` |
| `src/lib/supabase/middleware.ts` | 10-30 | Creates server client for middleware using cookie-based auth |
| `src/middleware.ts` | 8-27 | Edge middleware: protects routes, redirects unauthenticated users |
| `.env.example` | 6-8 | Documents required Supabase env vars |

---

## Reproduction Plan

1. Navigate to `http://localhost:3000/login`
2. Click **"Continue with Google"** or **"Continue with Apple"**
3. Expected: Redirect to Google/Apple OAuth consent screen
4. Actual: Redirect to `http://localhost:3000/login?error=auth_callback_error`
5. Browser DevTools → Network tab shows a `400` response from `https://ypakngaaaupkhdhynxrv.supabase.co/auth/v1/authorize` with error `"provider is not enabled"`

---

## Final Conclusion

**Confidence: High** — Root cause is confirmed by direct Supabase Auth logs.

**Root Cause:** Google and Apple OAuth providers are **not enabled** in the Supabase project's Authentication settings. The Supabase project (`ypakngaaaupkhdhynxrv`) was created on 2026-06-08 and no OAuth app credentials (Client ID, Client Secret, etc.) have been configured for either Google or Apple in the Supabase Dashboard at:

`https://supabase.com/dashboard/project/ypakngaaaupkhdhynxrv/auth/providers`

**Fix Directions:**

### To resolve (Supabase Dashboard):

1. Go to **Supabase Dashboard → Authentication → Providers**
2. **Google:** Click the Google provider → Toggle "Enabled" → Enter your Google OAuth Client ID and Client Secret (obtained from Google Cloud Console) → Save
3. **Apple:** Click the Apple provider → Toggle "Enabled" → Enter your Apple Service ID, Team ID, Key ID, and Private Key (obtained from Apple Developer Portal) → Save
4. Also configure the **Authorized Redirect URLs** in Google Cloud Console / Apple Developer Portal to include: `https://ypakngaaaupkhdhynxrv.supabase.co/auth/v1/callback`

### To verify after configuration:

1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google/Apple"
3. Should redirect to the provider's OAuth consent screen
4. After consent, redirects back to `http://localhost:3000/auth/callback` which exchanges the code and sets the session
5. User is redirected to `/` (dashboard) — authenticated

---

## Next Steps

- **Recommended action:** Configure Google and Apple OAuth providers in the Supabase Dashboard. This is a configuration task, not a code fix — `bmad-quick-dev` can't address it directly.
- To set up Google OAuth: Create a project in [Google Cloud Console](https://console.cloud.google.com), enable the Google+ API, create OAuth credentials, and paste the Client ID + Secret into Supabase.
- To set up Apple OAuth: Register your app in [Apple Developer Portal](https://developer.apple.com), generate a private key, and paste the Service ID, Team ID, Key ID, and Private Key into Supabase.