import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardRoute = pathname === "/" && !isAuthRoute;
  const isProtectedRoute =
    pathname.startsWith("/workout") ||
    pathname.startsWith("/nutrition") ||
    pathname.startsWith("/stats") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/profile");

  // Unauthenticated user trying to access protected routes → login
  if (!user && (isDashboardRoute || isProtectedRoute)) {
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl);
  }

  // Authenticated user trying to access auth routes → dashboard
  if (user && isAuthRoute) {
    const dashboardUrl = new URL("/", request.url);
    return Response.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons/ (PWA icons)
     * - sw.js (service worker)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js).*)",
  ],
};