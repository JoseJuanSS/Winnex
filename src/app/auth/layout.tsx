import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-5 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-indigo-600">
            Winnex
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Winnex. Todos los derechos reservados.
      </footer>
    </div>
  );
}
