import { Resend } from "resend";

const DEFAULT_FROM = "Flaash <hello@flaash.ch>";

export interface OrganizerEventReadyEmailInput {
  to: string | null | undefined;
  title: string;
  slug: string;
  eventId: string;
}

export type EmailSendResult =
  | { ok: true; id?: string }
  | { ok: false; skipped?: boolean; reason: string };

function getAppUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.ch";
  return rawUrl.replace(/^NEXT_PUBLIC_APP_URL=/, "").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEventReadyEmail(input: OrganizerEventReadyEmailInput) {
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard/${input.eventId}`;
  const guestUrl = `${appUrl}/e/${input.slug}`;
  const printUrl = `${appUrl}/print/${input.slug}`;
  const safeTitle = escapeHtml(input.title);

  const text = [
    "Bonjour,",
    "",
    `Votre événement "${input.title}" est prêt.`,
    "",
    `Espace organisateur : ${dashboardUrl}`,
    `Lien invité à partager : ${guestUrl}`,
    `Carte QR à imprimer : ${printUrl}`,
    "",
    "Les photos sont conservées jusqu'à 90 jours, sauf suppression anticipée demandée par l'organisateur.",
    "",
    "Besoin d'aide ? Écrivez-nous à hello@flaash.ch.",
    "",
    "Flaash",
  ].join("\n");

  const html = `
    <div style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF7F2;color:#1A1A1A;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:20px;padding:32px;border:1px solid #E6DFD2;">
        <p style="margin:0 0 18px;color:#9A8F82;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">Flaash</p>
        <h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.15;margin:0 0 18px;color:#1A1A1A;">Votre événement est prêt</h1>
        <p style="font-size:16px;line-height:1.6;margin:0 0 18px;">Bonjour,</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">Votre événement <strong>${safeTitle}</strong> est prêt.</p>
        <div style="display:grid;gap:12px;margin:0 0 24px;">
          <a href="${dashboardUrl}" style="display:block;padding:14px 18px;border-radius:999px;background:#1E3D2F;color:#FAF7F2;text-decoration:none;text-align:center;font-weight:700;">Ouvrir l'espace organisateur</a>
          <a href="${guestUrl}" style="display:block;padding:14px 18px;border-radius:999px;background:#F0EBE3;color:#1A1A1A;text-decoration:none;text-align:center;font-weight:700;">Lien invité à partager</a>
          <a href="${printUrl}" style="display:block;padding:14px 18px;border-radius:999px;background:#F0EBE3;color:#1A1A1A;text-decoration:none;text-align:center;font-weight:700;">Carte QR à imprimer</a>
        </div>
        <p style="font-size:14px;line-height:1.6;color:#6E6862;margin:0 0 18px;">Les photos sont conservées jusqu'à 90 jours, sauf suppression anticipée demandée par l'organisateur.</p>
        <p style="font-size:14px;line-height:1.6;color:#6E6862;margin:0;">Support : <a href="mailto:hello@flaash.ch" style="color:#B85F1E;font-weight:700;">hello@flaash.ch</a></p>
      </div>
    </div>
  `;

  return { html, text };
}

export async function sendOrganizerEventReadyEmail(
  input: OrganizerEventReadyEmailInput
): Promise<EmailSendResult> {
  if (!input.to) {
    console.warn("[email] Organizer event ready email skipped: missing recipient.", {
      eventId: input.eventId,
    });
    return { ok: false, skipped: true, reason: "missing_recipient" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] Organizer event ready email skipped: RESEND_API_KEY is not configured.", {
      eventId: input.eventId,
    });
    return { ok: false, skipped: true, reason: "missing_api_key" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { html, text } = buildEventReadyEmail(input);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? DEFAULT_FROM,
      to: input.to,
      subject: "Votre événement Flaash est prêt",
      html,
      text,
    });

    if (error) {
      console.error("[email] Organizer event ready email failed.", {
        eventId: input.eventId,
        reason: error.message,
      });
      return { ok: false, reason: "resend_error" };
    }

    console.log("[email] Organizer event ready email sent.", {
      eventId: input.eventId,
      emailId: data?.id,
    });
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] Organizer event ready email failed.", {
      eventId: input.eventId,
      reason: err instanceof Error ? err.message : "unknown_error",
    });
    return { ok: false, reason: "unexpected_error" };
  }
}
