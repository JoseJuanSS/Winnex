import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Winnex <no-reply@winnex.app>";

// ─── Email helpers ────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  token: string,
  displayName?: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  return resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Verifica tu cuenta en Winnex",
    html: `
      <h2>Hola${displayName ? ` ${displayName}` : ""}!</h2>
      <p>Confirma tu email haciendo clic en el enlace:</p>
      <a href="${url}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Verificar cuenta
      </a>
      <p style="color:#666;font-size:12px;margin-top:16px;">El enlace expira en 24 horas.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  return resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Restablecer contraseña — Winnex",
    html: `
      <h2>Restablece tu contraseña</h2>
      <p>Haz clic en el enlace para crear una nueva contraseña:</p>
      <a href="${url}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Restablecer contraseña
      </a>
      <p style="color:#666;font-size:12px;margin-top:16px;">El enlace expira en 1 hora. Si no lo solicitaste, ignora este email.</p>
    `,
  });
}

export async function sendWinnerNotificationEmail(
  to: string,
  displayName: string,
  campaignTitle: string,
  prizeTitle: string
) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `¡Ganaste! 🎉 ${prizeTitle} — Winnex`,
    html: `
      <h2>¡Felicitaciones ${displayName}!</h2>
      <p>Ganaste <strong>${prizeTitle}</strong> en la campaña <strong>${campaignTitle}</strong>.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/prizes" style="background:#22c55e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Reclamar premio
      </a>
    `,
  });
}

export async function sendParticipationConfirmationEmail(
  to: string,
  displayName: string,
  campaignTitle: string
) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Participación confirmada — ${campaignTitle}`,
    html: `
      <h2>¡Estás participando!</h2>
      <p>Hola ${displayName}, tu participación en <strong>${campaignTitle}</strong> fue registrada exitosamente.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/campaigns" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Ver campañas
      </a>
    `,
  });
}
