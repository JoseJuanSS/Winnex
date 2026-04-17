import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route definitions ────────────────────────────────────────────────────────

const AUTH_ONLY_ROUTES = ["/dashboard", "/profile", "/wallet"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

function matchesPrefix(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role ?? "guest";

  // ── Redirigir usuarios autenticados fuera de páginas de auth ──────────────
  if (isAuthenticated && matchesPrefix(pathname, AUTH_PAGES)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── Proteger rutas que requieren autenticación ────────────────────────────
  if (!isAuthenticated && matchesPrefix(pathname, AUTH_ONLY_ROUTES)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Proteger rutas de admin ───────────────────────────────────────────────
  if (matchesPrefix(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }
  }

  // ── Proteger rutas de API (excepto auth) ──────────────────────────────────
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|og.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
