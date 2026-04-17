import Link from "next/link";
import Image from "next/image";
import type { CampaignListItem } from "@/modules/campaigns/queries/get-campaigns";

interface Props {
  campaign: CampaignListItem;
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  contest:   { label: "Concurso", color: "bg-blue-100 text-blue-700" },
  draw:      { label: "Sorteo",   color: "bg-purple-100 text-purple-700" },
  promotion: { label: "Promo",    color: "bg-green-100 text-green-700" },
};

function formatTimeLeft(endsAt: Date | null): string {
  if (!endsAt) return "Sin límite";
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Finalizado";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h restantes` : `${hours}h restantes`;
}

export function CampaignCard({ campaign }: Props) {
  const badge = TYPE_BADGE[campaign.campaignType] ?? TYPE_BADGE.contest;
  const topPrize = campaign.prizes[0];
  const timeLabel = formatTimeLeft(campaign.endsAt);
  const isEnded = campaign.endsAt ? new Date(campaign.endsAt) < new Date() : false;

  return (
    <Link href={`/campaigns/${campaign.slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 overflow-hidden">
        {/* Image */}
        <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              className="object-cover opacity-80"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <span className="text-5xl opacity-60">🏆</span>
          )}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
            {campaign.title}
          </h3>

          {topPrize && (
            <p className="text-sm text-gray-500 truncate">🎁 {topPrize.title}</p>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-medium ${isEnded ? "text-red-500" : "text-orange-600"}`}>
              {isEnded ? "⛔ Finalizado" : `⏱ ${timeLabel}`}
            </span>
            <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
              Ver más →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
