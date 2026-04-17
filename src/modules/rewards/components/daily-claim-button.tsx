"use client";

import { useState } from "react";
import { dailyClaimAction } from "@/modules/rewards/actions/daily-claim";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setLoading(true);
    setError(null);
    const res = await dailyClaimAction();
    setLoading(false);

    if (res.success) {
      setResult({ pointsEarned: res.pointsEarned, streak: res.streak, isBonus: res.isBonus });
      setTimeout(() => router.refresh(), 1000);
    } else {
      setError(res.error);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 bg-gradient-to-br from-green-50 to-indigo-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
        <span className="text-4xl">🎉</span>
        <p className="font-bold text-indigo-700 text-xl">+{result.pointsEarned} pts</p>
        {result.isBonus && (
          <p className="text-sm text-green-600 font-semibold">
            🔥 Racha de {result.streak} días — ¡+{Math.min(result.streak * 10, 100)}% bonus!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert variant="error" message={error} />}

      <Button
        onClick={handleClaim}
        loading={loading}
        disabled={!canClaim}
        size="lg"
        fullWidth
      >
        {canClaim ? "⭐ Reclamar puntos diarios" : "✅ Ya reclamaste hoy"}
      </Button>

      {streak > 0 && (
        <div className="text-center">
          <p className="text-sm font-semibold text-orange-600">
            🔥 Racha: {streak} días
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full"
              style={{ width: `${Math.min((streak / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
