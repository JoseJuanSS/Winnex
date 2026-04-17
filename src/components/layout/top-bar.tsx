import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function TopBar() {
  const session = await auth();

  let points = 0;
  if (session?.user?.id) {
    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.user.id),
    });
    points = wallet?.pointsBalance ?? 0;
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="font-black text-xl text-indigo-600 tracking-tight">
          Winnex
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Points pill */}
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                <span>⭐</span>
                <span>{points.toLocaleString()}</span>
              </Link>

              {/* Avatar */}
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold uppercase"
              >
                {session.user.name?.charAt(0) ?? "U"}
              </Link>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Registro
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
