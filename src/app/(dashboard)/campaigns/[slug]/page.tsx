import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
  getCampaignBySlug,
  getUserContestEntry,
  getUserDrawEntries,
  getContestLeaderboard,
} from "@/modules/campaigns/queries/get-campaigns";
import { EnterContestButton } from "@/modules/campaigns/components/enter-contest-button";
import { Leaderboard } from "@/modules/campaigns/components/leaderboard";
import { Card } from "@/components/ui/card";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "Campaña no encontrada" };
  return { title: `${campaign.title} — Winnex`, description: campaign.description ?? undefined };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const [campaign, session] = await Promise.all([
    getCampaignBySlug(slug),
    auth(),
  ]);

  if (!campaign) notFound();

  const userId = session?.user?.id;

  const isContest = campaign.campaignType === "contest" && campaign.contest;
  const isDraw = campaign.campaignType === "draw" && campaign.draw;

  // Datos de participación del usuario actual
  const [userEntry, , leaderboard] = await Promise.all([
    isContest && userId
      ? getUserContestEntry(campaign.contest!.id, userId)
      : Promise.resolve(null),
    isDraw && userId
      ? getUserDrawEntries(campaign.draw!.id, userId)
      : Promise.resolve([]),
    isContest && campaign.contest?.leaderboardEnabled
      ? getContestLeaderboard(campaign.contest!.id, 10)
      : Promise.resolve([]),
  ]);

  const serverNow = new Date();
  const isEnded = campaign.endsAt ? campaign.endsAt < serverNow : false;
  const timeLeft = campaign.endsAt
    ? Math.max(0, new Date(campaign.endsAt).getTime() - serverNow.getTime())
    : null;
  const daysLeft = timeLeft ? Math.floor(timeLeft / 86400000) : null;
  const hoursLeft = timeLeft ? Math.floor((timeLeft % 86400000) / 3600000) : null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 flex flex-col gap-3 min-h-[160px] relative">
        {campaign.imageUrl && (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover opacity-20"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        )}
        <div className="relative">
          <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full capitalize">
            {campaign.campaignType}
          </span>
          <h1 className="text-2xl font-black mt-2 leading-snug">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-white/80 mt-1">{campaign.description}</p>
          )}
          {timeLeft !== null && !isEnded && (
            <p className="text-sm text-white/90 mt-2 font-medium">
              ⏱ {daysLeft}d {hoursLeft}h restantes
            </p>
          )}
          {isEnded && (
            <p className="text-sm text-red-300 font-semibold mt-2">⛔ Campaña finalizada</p>
          )}
        </div>
      </div>

      {/* Premios */}
      {campaign.prizes.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-3">🎁 Premios</h2>
          <ul className="flex flex-col gap-2">
            {campaign.prizes.map((prize) => (
              <li key={prize.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">🏅</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{prize.title}</p>
                  {prize.description && (
                    <p className="text-xs text-gray-500">{prize.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Cómo participar + CTA */}
      {!isEnded && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-3">🚀 Cómo participar</h2>

          {isContest && (
            <ol className="text-sm text-gray-600 flex flex-col gap-2 mb-4 list-decimal list-inside">
              <li>Crea tu cuenta o inicia sesión.</li>
              <li>Haz clic en &ldquo;Participar ahora&rdquo;.</li>
              <li>Completa el reto o responde la trivia.</li>
              <li>Los mejores puntajes ganan el premio.</li>
            </ol>
          )}

          {isDraw && (
            <ol className="text-sm text-gray-600 flex flex-col gap-2 mb-4 list-decimal list-inside">
              <li>Crea tu cuenta o inicia sesión.</li>
              <li>Obtén tu entrada gratuita con un clic.</li>
              <li>Más entradas = más probabilidad de ganar.</li>
              <li>El ganador se anuncia al terminar el sorteo.</li>
            </ol>
          )}

          {userId && isContest && campaign.contest && (
            <EnterContestButton
              contestId={campaign.contest.id}
              alreadyEntered={!!userEntry}
              maxAttempts={campaign.contest.maxAttempts}
              currentAttempts={userEntry ? 1 : 0}
            />
          )}

          {!userId && (
            <a
              href="/auth/register"
              className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Regístrate gratis para participar
            </a>
          )}
        </Card>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-3">📊 Clasificación</h2>
          <Leaderboard entries={leaderboard} currentUserId={userId} />
        </Card>
      )}

      {/* Ganadores */}
      {campaign.winners.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-3">🏆 Ganadores</h2>
          <ul className="flex flex-col gap-2">
            {campaign.winners.map((w) => (
              <li key={w.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                  {w.user?.displayName?.charAt(0) ?? "?"}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {w.user?.displayName ?? w.user?.username ?? "Ganador"}
                </span>
                <span className="ml-auto text-xs text-green-600 font-medium capitalize">
                  {w.claimStatus}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
