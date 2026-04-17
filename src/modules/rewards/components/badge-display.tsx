/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UserBadgeWithDetails } from "@/modules/rewards/queries/get-badges";

interface Props {
  badges: UserBadgeWithDetails[];
}

export function BadgeDisplay({ badges }: Props) {
  if (!badges.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-sm">Desbloquea insignias completando objetivos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {(badges as any).map((item: any) => (
        <div
          key={item.badgeId}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200"
        >
          <div className="text-3xl">{item.badge?.iconUrl ?? "⭐"}</div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-900">{item.badge?.name ?? "Badge"}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.earnedAt).toLocaleDateString("es-MX")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
