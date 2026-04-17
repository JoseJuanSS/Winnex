"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enterContestAction } from "@/modules/campaigns/actions/enter-contest";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface Props {
  contestId: string;
  alreadyEntered: boolean;
  maxAttempts: number | null;
  currentAttempts: number;
}

export function EnterContestButton({ contestId, alreadyEntered, maxAttempts, currentAttempts }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const attemptsLeft = maxAttempts ? maxAttempts - currentAttempts : null;
  const canEnter = !alreadyEntered && (attemptsLeft === null || attemptsLeft > 0);

  async function handleEnter() {
    setLoading(true);
    setFeedback(null);
    const result = await enterContestAction({ contestId });
    setLoading(false);

    if (!result.success) {
      setFeedback({ type: "error", msg: result.error });
      return;
    }

    setFeedback({
      type: "success",
      msg: `¡Participación registrada! +${result.pointsEarned} pts ganados 🎉`,
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {feedback && <Alert variant={feedback.type} message={feedback.msg} />}

      <Button
        onClick={handleEnter}
        loading={loading}
        disabled={!canEnter}
        fullWidth
        size="lg"
      >
        {alreadyEntered ? "✅ Ya participaste" : "🚀 Participar ahora"}
      </Button>

      {maxAttempts && (
        <p className="text-xs text-center text-gray-400">
          {currentAttempts}/{maxAttempts} intentos usados
        </p>
      )}
    </div>
  );
}
