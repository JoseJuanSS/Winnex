import type { Metadata } from "next";
import { getActiveCampaigns } from "@/modules/campaigns/queries/get-campaigns";
import { CampaignCard } from "@/modules/campaigns/components/campaign-card";

export const metadata: Metadata = { title: "Campañas — Winnex" };
export const revalidate = 60; // ISR: revalidar cada minuto

export default async function CampaignsPage() {
  const campaigns = await getActiveCampaigns();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Campañas activas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Participa y gana premios. Siempre hay una entrada gratuita disponible.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🎯</p>
          <p className="font-medium text-gray-600">Próximamente nuevas campañas</p>
          <p className="text-sm mt-1">Vuelve pronto, ¡están en camino!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
