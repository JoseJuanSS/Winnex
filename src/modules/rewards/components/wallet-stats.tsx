import type { WalletData } from "@/modules/rewards/queries/get-wallet";

interface Props {
  wallet: WalletData | undefined;
}

export function WalletStats({ wallet }: Props) {
  const balance = wallet?.pointsBalance ?? 0;
  const lifetime = wallet?.lifetimePointsEarned ?? 0;
  const spent = wallet?.lifetimePointsSpent ?? 0;

  const stats = [
    { label: "Balance actual", value: balance.toLocaleString(), emoji: "⭐", highlight: true },
    { label: "Total ganado", value: lifetime.toLocaleString(), emoji: "📈" },
    { label: "Total gastado", value: spent.toLocaleString(), emoji: "🛍️" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, emoji, highlight }) => (
        <div
          key={label}
          className={[
            "rounded-2xl p-4 flex flex-col gap-1 text-center",
            highlight
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-100 text-gray-700",
          ].join(" ")}
        >
          <span className="text-xl">{emoji}</span>
          <span className={`text-xl font-black ${highlight ? "text-white" : "text-gray-900"}`}>
            {value}
          </span>
          <span className={`text-xs ${highlight ? "text-indigo-200" : "text-gray-400"}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
