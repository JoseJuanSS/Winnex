import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getWalletByUserId,
  getLedgerHistory,
  getStreakByUserId,
  canClaimToday,
} from "@/modules/rewards/queries/get-wallet";
import { WalletStats } from "@/modules/rewards/components/wallet-stats";
import { LedgerList } from "@/modules/rewards/components/ledger-list";
import { DailyClaimButton } from "@/modules/rewards/components/daily-claim-button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Mi Wallet — Winnex" };

export default async function WalletPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [wallet, entries, streak, claimAvailable] = await Promise.all([
    getWalletByUserId(userId),
    getLedgerHistory(userId, 30),
    getStreakByUserId(userId),
    canClaimToday(userId),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mi Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tus puntos y movimientos</p>
      </div>

      {/* Balance cards */}
      <WalletStats wallet={wallet ?? undefined} />

      {/* Daily claim */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-3">Puntos diarios</h2>
        <DailyClaimButton
          canClaim={claimAvailable}
          streak={streak?.currentStreak ?? 0}
        />
        <p className="text-xs text-gray-400 mt-3 text-center">
          Cada día que regreses acumulas racha y ganas más puntos ✨
        </p>
      </Card>

      {/* Ledger history */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-base font-bold text-gray-900">Historial</h2>
        </div>
        <div className="px-4">
          <LedgerList entries={entries} />
        </div>
      </Card>
    </div>
  );
}
