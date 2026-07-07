export const dynamic = 'force-dynamic';

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/types";
import QRCodeCard from "./QRCodeCard";
import { revealNow, activateEvent, resumePayment, deleteDraftAndNew } from "./actions";
import DeleteButton from "./DeleteButton";
import { Suspense } from "react";
import PaymentBanner from "./PaymentBanner";
import { getPlan } from "@/lib/utils/pricing";
import CoverUploadCard from "./CoverUploadCard";

interface Props {
  params: { id: string };
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft:    { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
  active:   { bg: "var(--flaash-amber-soft)", fg: "var(--flaash-amber-deep)" },
  revealed: { bg: "var(--flaash-forest-soft)", fg: "var(--flaash-forest)" },
  closed:   { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!event) notFound();

  let ev = event as Event;
  if (ev.status === "active" && ev.reveal_at && new Date(ev.reveal_at).getTime() <= Date.now()) {
    const { data: revealedEvent } = await supabase
      .from("events")
      .update({ status: "revealed" })
      .eq("id", id)
      .eq("owner_id", user.id)
      .eq("status", "active")
      .select("*")
      .single();

    ev = (revealedEvent as Event | null) ?? { ...ev, status: "revealed" };
  }

  const [{ count: photoCount }, { count: guestCount }] = await Promise.all([
    supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("is_deleted", false),
    supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("is_blocked", false),
  ]);

  // BUG 4 fix — use NEXT_PUBLIC_APP_URL for the full guest link
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.ch";
  const eventUrl = `${appUrl}/e/${ev.slug}`;

  const statusColors = STATUS_COLORS[ev.status] ?? STATUS_COLORS.draft;
  const photoTotal = photoCount ?? 0;
  const activeGuestTotal = guestCount ?? 0;
  const isLive = ev.status === "active" || ev.status === "revealed";

  return (
    <div className="dashboard-event-detail">
      {/* Payment success banner — Suspense required because PaymentBanner uses useSearchParams() */}
      <Suspense fallback={null}>
        <PaymentBanner status={ev.status} />
      </Suspense>

      <div className="dashboard-event-inner">
        {/* Back */}
        <Link href="/dashboard" className="dashboard-event-back">
          ← Mes événements
        </Link>

        {/* ── LAUNCH HERO ── */}
        <header className={`dashboard-event-hero${isLive ? " dashboard-event-hero-live" : ""}`}>
          <div className="dashboard-event-hero-copy">
            <div className="dashboard-event-kicker">
              <p className="dashboard-event-type">{EVENT_TYPE_LABELS[ev.event_type]}</p>
              <span
                className="status-badge"
                style={{ background: statusColors.bg, color: statusColors.fg }}
              >
                {STATUS_LABELS[ev.status]}
              </span>
              {ev.plan_id && (
                <span className="dashboard-plan-badge">
                  {getPlan(ev.plan_id)?.label ?? ev.plan_id}
                </span>
              )}
            </div>
            <h1 className="dashboard-event-title">{ev.title}</h1>
            {ev.status === "active" && (
              <p className="dashboard-event-worldphrase">
                Votre événement est prêt à circuler.
              </p>
            )}
            {ev.status === "revealed" && (
              <p className="dashboard-event-worldphrase">
                La galerie est ouverte. Les souvenirs peuvent revenir.
              </p>
            )}
          </div>
          <Link href={`/dashboard/${ev.id}/settings`} className="dashboard-hero-settings-link">
            Paramètres →
          </Link>
        </header>

        {/* ── DRAFT: Payment notice ── */}
        {ev.status === "draft" && (
          <div className="dashboard-event-notice dashboard-event-notice-amber">
            <p className="dashboard-event-notice-title">En attente de paiement</p>
            <p className="dashboard-event-notice-text">
              Procédez au paiement pour générer le QR code et accueillir vos invités.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <form action={resumePayment.bind(null, ev.id)}>
                <button type="submit" className="btn-pill btn-amber" style={{ fontSize: 14 }}>
                  Reprendre le paiement →
                </button>
              </form>
              <form action={deleteDraftAndNew.bind(null, ev.id)}>
                <button type="submit" style={{ background: "none", border: "none", fontSize: 13, color: "var(--fg-3)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                  ← Modifier l&apos;événement
                </button>
              </form>
              {process.env.NODE_ENV === "development" && (
                <form action={activateEvent.bind(null, ev.id)}>
                  <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: "var(--flaash-amber-deep)", background: "none", border: "1.5px dashed var(--flaash-amber-deep)", borderRadius: "var(--radius-pill)", padding: "8px 16px", cursor: "pointer", letterSpacing: "0.06em" }}>
                    ⚡ ACTIVER SANS PAIEMENT (dev)
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE: Next Action band ── */}
        {ev.status === "active" && (
          <div className="dashboard-next-action">
            <span className="dashboard-next-action-dot" aria-hidden="true" />
            <div>
              <p className="dashboard-next-action-label">Prochaine étape</p>
              <p className="dashboard-next-action-copy">
                Faites circuler le QR. Les invités capturent, puis reviennent à la soirée.
              </p>
            </div>
          </div>
        )}

        {/* ── REVEALED: Guidance band ── */}
        {ev.status === "revealed" && (
          <div className="dashboard-next-action dashboard-next-action-ok">
            <span className="dashboard-next-action-dot" aria-hidden="true" />
            <div>
              <p className="dashboard-next-action-label">Galerie ouverte</p>
              <p className="dashboard-next-action-copy">
                Les souvenirs peuvent revenir. Partagez la galerie ou téléchargez toutes les photos.
              </p>
            </div>
          </div>
        )}

        {/* ── MAIN LAUNCH GRID ── */}
        {isLive && (
          <div className="dashboard-launch-grid">

            {/* QR Launch Column */}
            <div className="dashboard-qr-column">
              <div className="dashboard-qr-module">
                <QRCodeCard url={eventUrl} title={ev.title} slug={ev.slug} />
                <Link
                  href={`/print/${ev.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dashboard-print-card"
                >
                  <span>Carte QR à imprimer →</span>
                  <span>Prête à poser à l&apos;entrée ou sur une table.</span>
                </Link>
              </div>
            </div>

            {/* Command Panel */}
            <aside className="dashboard-command-panel" aria-label="Pilotage organisateur">

              {/* Live Status */}
              <section className="dashboard-live-status">
                <p className="dashboard-section-label">En ce moment</p>
                <div className="dashboard-status-row">
                  <div className="dashboard-status-item">
                    <span className="dashboard-status-num">{photoTotal}</span>
                    <span className="dashboard-status-meta">
                      {photoTotal === 1 ? "souvenir capturé" : "souvenirs capturés"}
                    </span>
                    <Link href={`/dashboard/${ev.id}/photos`} className="dashboard-stat-link">
                      Voir →
                    </Link>
                  </div>
                  <div className="dashboard-status-item">
                    <span className="dashboard-status-num">
                      {activeGuestTotal}<span className="dashboard-status-max">/{ev.max_guests}</span>
                    </span>
                    <span className="dashboard-status-meta">
                      {activeGuestTotal === 1 ? "invité" : "invités"}
                    </span>
                    <Link href={`/dashboard/${ev.id}/guests`} className="dashboard-stat-link">
                      Voir →
                    </Link>
                  </div>
                  <div className="dashboard-status-item">
                    <span className="dashboard-status-num">{ev.photos_per_guest}</span>
                    <span className="dashboard-status-meta">poses par invité</span>
                  </div>
                </div>
              </section>

              {/* Organiser Tools */}
              <section className="dashboard-tools-panel">
                <p className="dashboard-section-label">À gérer</p>
                <div className="dashboard-action-stack">
                  <Link
                    href={`/dashboard/${ev.id}/photos`}
                    className="dashboard-action-button dashboard-action-button-ink"
                  >
                    Modérer les photos
                  </Link>
                  <Link
                    href={`/dashboard/${ev.id}/settings`}
                    className="dashboard-action-button dashboard-action-button-paper"
                  >
                    Modifier les paramètres
                  </Link>
                </div>
              </section>

              {/* Tolerance notice */}
              {ev.plan_id && ev.max_guests > (getPlan(ev.plan_id)?.maxGuests ?? Infinity) && (
                <div style={{ background: "var(--flaash-forest-soft)", border: "1px solid var(--flaash-forest)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--flaash-forest)" }}>
                  Votre événement a accueilli plus d&apos;invités que prévu — nous avons accordé cette tolérance gratuitement.
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ── REVEAL MOMENT (full-width ink section) ── */}
        {isLive && (
          <section className="dashboard-reveal-section">
            <div className="dashboard-reveal-inner">
              <div className="dashboard-reveal-content">
                <p className="dashboard-reveal-eyebrow">Faire revenir la soirée</p>
                <p className="dashboard-reveal-headline">
                  {ev.status === "revealed" ? "La galerie est ouverte." : "Les photos attendent."}
                </p>
                <p className="dashboard-reveal-body">
                  {ev.status === "revealed"
                    ? "Les souvenirs peuvent revenir. Partagez la galerie avec vos invités."
                    : "Quand tout est prêt, ouvrez la galerie — la soirée revient."}
                </p>
              </div>
              <div className="dashboard-reveal-actions">
                {ev.status === "active" && (
                  <form
                    action={async () => {
                      "use server";
                      await revealNow(id);
                    }}
                    className="dashboard-reveal-form"
                  >
                    <button type="submit" className="dashboard-reveal-cta">
                      Révéler la galerie
                    </button>
                  </form>
                )}
                {photoTotal > 0 && (
                  <a
                    href={`/api/download/${ev.slug}`}
                    download
                    className={`dashboard-reveal-download${ev.status === "revealed" ? " dashboard-reveal-download-primary" : ""}`}
                  >
                    Télécharger les souvenirs ({photoTotal} photos)
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── SECONDARY: Cover + Details ── */}
        <div className="dashboard-secondary-grid">
          <CoverUploadCard eventId={ev.id} initialCoverUrl={ev.cover_url} />

          <div className="dashboard-details-card">
            <div className="dashboard-details-header">
              <p className="dashboard-section-label">Détails</p>
              <Link href={`/dashboard/${ev.id}/settings`} className="dashboard-details-link">
                Paramètres →
              </Link>
            </div>
            <div className="dashboard-details-list">
              {[
                ["Invités maximum", `${ev.max_guests}`],
                ["Poses par invité", `${ev.photos_per_guest}`],
                ["Photos depuis la galerie", ev.allow_library_upload ? "Oui" : "Non"],
                [
                  "Révélation",
                  ev.reveal_at
                    ? `Prévue le ${new Date(ev.reveal_at).toLocaleString("fr-CH")}`
                    : "Manuelle",
                ],
                // BUG 4 fix — use eventUrl (built from NEXT_PUBLIC_APP_URL)
                ["Lien invité", eventUrl],
                ["Tarif", `CHF ${ev.price_chf}`],
              ].map(([k, v]) => (
                <div key={k} className="dashboard-details-row">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DELETE ZONE ── */}
        <div className="dashboard-delete-zone">
          <DeleteButton eventId={ev.id} />
        </div>
      </div>
    </div>
  );
}
