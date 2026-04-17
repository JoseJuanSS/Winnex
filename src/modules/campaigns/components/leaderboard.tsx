import type { getContestLeaderboard } from "@/modules/campaigns/queries/get-campaigns";

type LeaderboardEntry = Awaited<ReturnType<typeof getContestLeaderboard>>[number];

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ entries, currentUserId }: Props) {
  if (!entries.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🏁</p>
        <p className="text-sm">¡Sé el primero en participar!</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry, i) => {
        const isCurrentUser = entry.userId === currentUserId;
        const medal = MEDALS[i] ?? `${i + 1}`;

        return (
          <li
            key={entry.id}
            className={[
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              isCurrentUser ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50",
            ].join(" ")}
          >
            <span className="text-lg w-8 text-center shrink-0">{medal}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${isCurrentUser ? "text-indigo-700" : "text-gray-900"}`}>
                {entry.user?.displayName ?? entry.user?.username ?? "Anónimo"}
                {isCurrentUser && <span className="ml-1 text-xs font-normal text-indigo-500">(tú)</span>}
              </p>
            </div>
            <span className="text-sm font-bold text-gray-700 shrink-0">
              {(entry.score ?? 0).toLocaleString()} pts
            </span>
          </li>
        );
      })}
    </ol>
  );
}
