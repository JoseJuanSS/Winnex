import { eq, and, desc, gte, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, contestEntries, drawEntries } from "@/lib/db/schema";

// ─── Listado de campañas activas ──────────────────────────────────────────────

export async function getActiveCampaigns() {
  const now = new Date();

  return db.query.campaigns.findMany({
    where: and(
      eq(campaigns.status, "active"),
      eq(campaigns.visibility, "public"),
      or(isNull(campaigns.endsAt), gte(campaigns.endsAt, now))
    ),
    with: {
      prizes: { limit: 1 },
      contest: true,
      draw: true,
    },
    orderBy: [desc(campaigns.createdAt)],
    limit: 20,
  });
}

// ─── Detalle de campaña por slug ──────────────────────────────────────────────

export async function getCampaignBySlug(slug: string) {
  return db.query.campaigns.findFirst({
    where: eq(campaigns.slug, slug),
    with: {
      prizes: true,
      contest: true,
      draw: true,
      winners: {
        with: { user: true },
        limit: 5,
      },
    },
  });
}

// ─── Participaciones del usuario en una campaña ───────────────────────────────

export async function getUserContestEntry(contestId: string, userId: string) {
  return db.query.contestEntries.findFirst({
    where: and(
      eq(contestEntries.contestId, contestId),
      eq(contestEntries.userId, userId)
    ),
  });
}

export async function getUserDrawEntries(drawId: string, userId: string) {
  return db.query.drawEntries.findMany({
    where: and(
      eq(drawEntries.drawId, drawId),
      eq(drawEntries.userId, userId)
    ),
  });
}

// ─── Leaderboard de concurso ──────────────────────────────────────────────────

export async function getContestLeaderboard(contestId: string, limit = 10) {
  return db.query.contestEntries.findMany({
    where: and(
      eq(contestEntries.contestId, contestId),
      eq(contestEntries.status, "submitted")
    ),
    with: { user: true },
    orderBy: [desc(contestEntries.score)],
    limit,
  });
}

export type CampaignWithRelations = Awaited<ReturnType<typeof getCampaignBySlug>>;
export type CampaignListItem = Awaited<ReturnType<typeof getActiveCampaigns>>[number];
