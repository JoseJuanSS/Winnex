"use client";

import { useState } from "react";
import { dailyClaimAction } from "@/modules/rewards/actions/daily-claim";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  canClaim: boolean;
  streak: number;
}

export function DailyClaimButton({ canClaim, streak }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    pointsEarned: number;
    streak: number;
    isBonus: boolean;
  } | null>(null);

  async function handleClaim() {
    setLoading(true);
    const res = await dailyClaimAction();
    setLoading(false);
    if (res.success) {
      setResult({ pointsEarned: res.pointsEarned, streak: res.streak, isBonus: res.isBonus });
      router.refresh();
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-1 py-2 animate-in fade-in duration-300">
        <span className="text-3xl">🎉</span>
        <p className="font-bold text-indigo-700 text-lg">+{result.pointsEarned} pts</p>
        {result.isBonus && (
          <p className="text-xs text-green-600 font-medium">
            🔥 Racha de {result.streak} días — ¡bonus activo!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleClaim}
        loading={loading}
        disabled={!canClaim}
        size="lg"
        className="w-full"
      >
        {canClaim ? "⭐ Reclamar puntos diarios" : "✅ Ya reclamaste hoy"}
      </Button>
      {streak > 0 && (
        <p className="text-xs text-gray-500">
          🔥 Racha actual: <span className="font-semibold text-orange-500">{streak} días</span>
        </p>
      )}
    </div>
  );
}
