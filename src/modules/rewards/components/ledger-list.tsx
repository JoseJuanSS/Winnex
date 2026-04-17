import type { LedgerEntry } from "@/modules/rewards/queries/get-wallet";

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  daily_login:       { label: "Login diario",        emoji: "☀️" },
  streak_bonus:      { label: "Bonus de racha",       emoji: "🔥" },
  contest_entry:     { label: "Entrada a concurso",   emoji: "🏆" },
  contest_win:       { label: "Premio de concurso",   emoji: "🥇" },
  referral_bonus:    { label: "Bono de referido",     emoji: "👥" },
  purchase_bonus:    { label: "Bono de compra",       emoji: "🛒" },
  subscription_bonus:{ label: "Bono suscripción",     emoji: "💎" },
  redemption:        { label: "Canje de puntos",      emoji: "🎁" },
  admin_adjustment:  { label: "Ajuste admin",         emoji: "⚙️" },
  expiry:            { label: "Expiración",           emoji: "⏰" },
};

interface Props {
  entries: LedgerEntry[];
}

export function LedgerList({ entries }: Props) {
  if (!entries.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-4xl mb-2">💤</p>
        <p className="text-sm">Sin movimientos aún. ¡Reclama tus puntos diarios!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-50">
      {entries.map((entry) => {
        const meta = TYPE_LABELS[entry.type] ?? { label: entry.type, emoji: "•" };
        const isCredit = entry.direction === "credit";

        return (
          <li key={entry.id} className="flex items-center justify-between py-3 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">{meta.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{meta.label}</p>
                {entry.reason && (
                  <p className="text-xs text-gray-400 truncate">{entry.reason}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(entry.createdAt).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <span
              className={[
                "text-sm font-bold shrink-0",
                isCredit ? "text-green-600" : "text-red-500",
              ].join(" ")}
            >
              {isCredit ? "+" : "-"}{entry.amount.toLocaleString()} pts
            </span>
          </li>
        );
      })}
    </ul>
  );
}
