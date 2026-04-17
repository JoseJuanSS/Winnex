import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { getWalletByUserId, getStreakByUserId, canClaimToday } from "@/modules/rewards/queries/get-wallet";
import { getActiveCampaigns } from "@/modules/campaigns/queries/get-campaigns";
import { CampaignCard } from "@/modules/campaigns/components/campaign-card";
import { DailyClaimButton } from "@/modules/rewards/components/daily-claim-button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard — Winnex" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const name = session.user.name ?? "Winnero";

  const [wallet, streak, claimAvailable, campaigns] = await Promise.all([
    getWalletByUserId(userId),
    getStreakByUserId(userId),
    canClaimToday(userId),
    getActiveCampaigns(),
  ]);

  const points = wallet?.pointsBalance ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Saludo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Hola, {name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {claimAvailable
              ? "Tienes puntos diarios disponibles."
              : "Sigue así, vuelve mañana por más puntos."}
          </p>
        </div>
        {currentStreak > 1 && (
          <div className="flex flex-col items-center bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2 shrink-0">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-black text-orange-600">{currentStreak}</span>
            <span className="text-xs text-orange-400">días</span>
          </div>
        )}
      </div>

      {/* ── Stats rápidas ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/wallet">
          <div className="bg-indigo-600 text-white rounded-2xl p-4 flex flex-col gap-1 hover:bg-indigo-700 transition-colors cursor-pointer">
            <span className="text-sm text-indigo-200">Mis puntos</span>
            <span className="text-3xl font-black">{points.toLocaleString()}</span>
            <span className="text-xs text-indigo-300 mt-1">⭐ Ver wallet →</span>
          </div>
        </Link>

        <Link href="/campaigns">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 hover:border-indigo-200 transition-colors cursor-pointer shadow-sm">
            <span className="text-sm text-gray-500">Campañas activas</span>
            <span className="text-3xl font-black text-gray-900">{campaigns.length}</span>
            <span className="text-xs text-indigo-600 mt-1">🏆 Ver todas →</span>
          </div>
        </Link>
      </div>

      {/* ── Daily claim ────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Puntos diarios</h2>
          {currentStreak > 0 && (
            <span className="text-xs text-orange-500 font-semibold">
              🔥 Racha: {currentStreak} días
            </span>
          )}
        </div>
        <DailyClaimButton canClaim={claimAvailable} streak={currentStreak} />
      </Card>

      {/* ── Campañas destacadas ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Campañas destacadas</h2>
          <Link href="/campaigns" className="text-sm font-medium text-indigo-600 hover:underline">
            Ver todas →
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <div className="text-center py-6 text-gray-400">
              <p className="text-4xl mb-2">🎯</p>
              <p className="text-sm font-medium text-gray-600">Próximamente nuevas campañas</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.slice(0, 4).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <Card>
        <h2 className="text-base font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: "⭐", title: "Gana puntos", desc: "Inicia sesión diario, participa en concursos y refiere amigos." },
            { emoji: "🏆", title: "Entra a concursos", desc: "Usa tus puntos para participar en sorteos y concursos con premios reales." },
            { emoji: "🎁", title: "Gana premios", desc: "Los mejores puntajes y seleccionados al azar llevan el premio a casa." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl">{emoji}</span>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
