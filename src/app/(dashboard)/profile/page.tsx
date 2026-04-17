import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { userProfiles, userStreaks, userLevels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWalletByUserId } from "@/modules/rewards/queries/get-wallet";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";

export const metadata: Metadata = { title: "Mi Perfil — Winnex" };

export default async function ProfilePage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [profile, wallet, streak, level] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
    getWalletByUserId(userId),
    db.query.userStreaks.findFirst({ where: eq(userStreaks.userId, userId) }),
    db.query.userLevels.findFirst({ where: eq(userLevels.userId, userId) }),
  ]);

  const xp = level?.xp ?? 0;
  const lvl = level?.level ?? 1;
  const xpToNext = lvl * 500;
  const xpProgress = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">

      {/* Avatar + info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-black uppercase shrink-0">
            {session.user.name?.charAt(0) ?? "W"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-gray-900 truncate">{session.user.name}</h1>
            <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
            <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full capitalize">
              {session.user.role}
            </span>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Nivel {lvl}</span>
            <span>{xp}/{xpToNext} XP</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Puntos", value: (wallet?.pointsBalance ?? 0).toLocaleString(), emoji: "⭐" },
          { label: "Racha", value: `${streak?.currentStreak ?? 0}d`, emoji: "🔥" },
          { label: "Ganados", value: (wallet?.lifetimePointsEarned ?? 0).toLocaleString(), emoji: "📈" },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xl">{emoji}</p>
            <p className="text-lg font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral code */}
      {profile?.referralCode && (
        <Card>
          <h2 className="text-sm font-bold text-gray-900 mb-2">🔗 Tu código de referido</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-lg font-black text-indigo-700 tracking-widest text-center">
              {profile.referralCode}
            </code>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Comparte este código. Ambos ganan puntos al activarse.
          </p>
        </Card>
      )}

      {/* Sign out */}
      <Card padding="sm">
        <SignOutButton />
      </Card>

    </div>
  );
}
