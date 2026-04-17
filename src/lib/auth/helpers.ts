import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "./types";

/** Obtiene la sesión actual. Redirige a login si no está autenticado. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return session;
}

/** Obtiene la sesión actual. Redirige a home si ya está autenticado. */
export async function requireGuest() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return null;
}

/** Verifica que el usuario tenga el rol requerido. */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  const roles: UserRole[] = ["user", "moderator", "admin", "super_admin"];
  const userRoleIndex = roles.indexOf(session.user.role);
  const requiredIndex = roles.indexOf(role);

  if (userRoleIndex < requiredIndex) {
    redirect("/dashboard?error=forbidden");
  }

  return session;
}

/** Verifica si el usuario tiene al menos el rol indicado. */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  const roles: UserRole[] = ["user", "moderator", "admin", "super_admin"];
  return roles.indexOf(userRole) >= roles.indexOf(minRole);
}
