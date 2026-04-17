"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { contests, contestEntries, wallets, pointLedger } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { participationRatelimit } from "@/lib/redis";
import { headers } from "next/headers";
import { z } from "zod";

const enterContestSchema = z.object({
  contestId: z.string().min(1),
  submissionData: z.record(z.string(), z.unknown()).optional(),
});

type Result =
  | { success: true; entryId: string; pointsEarned: number }
  | { success: false; error: string };

const POINTS_PER_ENTRY = 10;

export async function enterContestAction(input: z.infer<typeof enterContestSchema>): Promise<Result> {
  const session = await requireAuth();
  const userId = session.user.id;

  // ─── Rate limit ───────────────────────────────────────────────────────────
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await participationRatelimit.limit(`participate:${userId}:${ip}`);
  if (!allowed) return { success: false, error: "Demasiados intentos. Espera un momento." };

  const parsed = enterContestSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  const { contestId, submissionData } = parsed.data;

  // ─── Cargar concurso y campaña ────────────────────────────────────────────
  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, contestId),
    with: { campaign: true },
  });

  if (!contest) return { success: false, error: "Concurso no encontrado." };
  if (contest.campaign.status !== "active") return { success: false, error: "Esta campaña no está activa." };

  const now = new Date();
  if (contest.campaign.endsAt && contest.campaign.endsAt < now) {
    return { success: false, error: "Esta campaña ya terminó." };
  }

  // ─── Verificar intentos máximos ───────────────────────────────────────────
  if (contest.maxAttempts) {
    const existing = await db.query.contestEntries.findMany({
      where: and(
        eq(contestEntries.contestId, contestId),
        eq(contestEntries.userId, userId)
      ),
    });
    if (existing.length >= contest.maxAttempts) {
      return { success: false, error: `Máximo ${contest.maxAttempts} intento(s) por concurso.` };
    }
  }

  // ─── Crear entrada ────────────────────────────────────────────────────────
  let entryId = "";

  await db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(contestEntries)
      .values({
        contestId,
        userId,
        submissionData: submissionData ?? {},
        score: 0,
        status: "submitted",
      })
      .returning({ id: contestEntries.id });

    entryId = entry.id;

    // Puntos por participar
    await tx.insert(pointLedger).values({
      userId,
      type: "contest_entry",
      amount: POINTS_PER_ENTRY,
      direction: "credit",
      reason: `Participación en: ${contest.campaign.title}`,
      referenceType: "contest_entry",
      referenceId: entry.id,
    });

    // Actualizar wallet
    const wallet = await tx.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
    if (wallet) {
      await tx.update(wallets).set({
        pointsBalance: wallet.pointsBalance + POINTS_PER_ENTRY,
        lifetimePointsEarned: wallet.lifetimePointsEarned + POINTS_PER_ENTRY,
        updatedAt: new Date(),
      }).where(eq(wallets.userId, userId));
    }
  });

  return { success: true, entryId, pointsEarned: POINTS_PER_ENTRY };
}
