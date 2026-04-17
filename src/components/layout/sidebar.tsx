"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", emoji: "🏠" },
  { href: "/campaigns", label: "Campañas", emoji: "🏆" },
  { href: "/wallet", label: "Mi Wallet", emoji: "💰" },
  { href: "/profile", label: "Mi Perfil", emoji: "👤" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-100 bg-white py-6 px-3">
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, emoji }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <span className="text-lg">🚪</span>
        Cerrar sesión
      </button>
    </aside>
  );
}
