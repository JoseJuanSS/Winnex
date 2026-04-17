import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  throw new Error("QSTASH_TOKEN is not set");
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// ─── Job types ────────────────────────────────────────────────────────────────

export type JobType =
  | "close_campaign"
  | "select_winners"
  | "send_winner_emails"
  | "recalculate_leaderboard"
  | "expire_points"
  | "send_streak_reminder";

// ─── Queue helpers ────────────────────────────────────────────────────────────

export async function scheduleJob(
  type: JobType,
  payload: Record<string, unknown>,
  delaySeconds?: number
) {
  return qstash.publishJSON({
    url: `${APP_URL}/api/jobs/${type}`,
    body: payload,
    delay: delaySeconds,
  });
}

/** Schedule campaign close at a specific time */
export async function scheduleCampaignClose(
  campaignId: string,
  closeAt: Date
) {
  const delaySeconds = Math.floor((closeAt.getTime() - Date.now()) / 1000);
  if (delaySeconds <= 0) return;

  return scheduleJob("close_campaign", { campaignId }, delaySeconds);
}

/** Schedule draw winner selection */
export async function scheduleDrawSelection(
  drawId: string,
  drawAt: Date
) {
  const delaySeconds = Math.floor((drawAt.getTime() - Date.now()) / 1000);
  if (delaySeconds <= 0) return;

  return scheduleJob("select_winners", { drawId }, delaySeconds);
}
