export const dynamic = 'force-dynamic';

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/types";
import QRCodeCard from "./QRCodeCard";
import { revealNow, activateEvent, resumePayment, deleteDraftAndNew } from "./actions";
import { blockGuest, unblockGuest } from "./photos/actions";
import DeleteButton from "./DeleteButton";
import { Suspense } from "react";
import PaymentBanner from "./PaymentBanner";
import { getPlan } from "@/lib/utils/pricing";

interface Props {
  params: { id: string };
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft:    { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
  active:   { bg: "var(--flaash-amber-soft)", fg: "var(--flaash-amber-deep)" },
  revealed: { bg: "var(--flaash-forest-soft)", fg: "var(--flaash-forest)" },
  closed:   { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
};

interface GuestRow {
  id: string;
  first_name: string;
  is_blocked: boolean;
  joined_at: string;
  photos_taken: number;
}

interface GuestPhotoRow {
  guest_id: string | null;
  taken_at: string;
}

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

  const [
    { count: photoCount },
    { count: guestCount },
    { data: guestRows },
    { data: guestPhotoRows },
  ] = await Promise.all([
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
    supabase
      .from("guests")
      .select("id, first_name, is_blocked, joined_at, photos_taken")
      .eq("event_id", id)
      .order("joined_at", { ascending: false }),
    supabase
      .from("photos")
      .select("guest_id, taken_at")
      .eq("event_id", id),
  ]);

  const guestPhotoStats = new Map<string, { photoCount: number; lastActivity: string | null }>();
  ((guestPhotoRows ?? []) as GuestPhotoRow[]).forEach((photo) => {
    if (!photo.guest_id) return;

    const current = guestPhotoStats.get(photo.guest_id) ?? {
      photoCount: 0,
      lastActivity: null,
    };

    current.photoCount += 1;
    if (!current.lastActivity || new Date(photo.taken_at).getTime() > new Date(current.lastActivity).getTime()) {
      current.lastActivity = photo.taken_at;
    }

    guestPhotoStats.set(photo.guest_id, current);
  });

  const guests = ((guestRows ?? []) as GuestRow[]).map((guest) => ({
    ...guest,
    photoCount: guestPhotoStats.get(guest.id)?.photoCount ?? 0,
    lastActivity: guestPhotoStats.get(guest.id)?.lastActivity ?? null,
  }));

  // BUG 4 fix — use NEXT_PUBLIC_APP_URL for the full guest link
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.ch";
  const eventUrl = `${appUrl}/e/${ev.slug}`;

  const statusColors = STATUS_COLORS[ev.status] ?? STATUS_COLORS.draft;
  const photoTotal = photoCount ?? 0;
  const activeGuestTotal = guestCount ?? 0;
  const blockedGuestTotal = guests.filter((guest) => guest.is_blocked).length;
  const guestSlotsLeft = Math.max(0, ev.max_guests - activeGuestTotal);
  const photoCapacity = Math.max(0, ev.max_guests * ev.photos_per_guest);
  const photoProgress = photoCapacity > 0 ? Math.min(100, Math.round((photoTotal / photoCapacity) * 100)) : 0;
  const guestProgress = ev.max_guests > 0 ? Math.min(100, Math.round((activeGuestTotal / ev.max_guests) * 100)) : 0;
  const canManageLiveEvent = ev.status === "active" || ev.status === "revealed";
  const statCards = [
    {
      label: "Photos reçues",
      value: `${photoTotal}`,
      detail:
        photoTotal > 0
          ? `${photoProgress}% de la capacité utilisée`
          : canManageLiveEvent
            ? "En attente des premières photos"
            : "Disponible après activation",
      action: photoTotal > 0 ? "Modérer les photos" : "Voir la modération",
      href: canManageLiveEvent ? `/dashboard/${ev.id}/photos` : null,
      progress: photoProgress,
      tone: "forest",
    },
    {
      label: "Invités actifs",
      value: `${activeGuestTotal} / ${ev.max_guests}`,
      detail:
        guestSlotsLeft === 0
          ? "Capacité invités atteinte"
          : `${guestSlotsLeft} place${guestSlotsLeft > 1 ? "s" : ""} disponible${guestSlotsLeft > 1 ? "s" : ""}${
              blockedGuestTotal > 0
                ? ` · ${blockedGuestTotal} bloqué${blockedGuestTotal > 1 ? "s" : ""}`
                : ""
            }`,
      action: "Voir les invités",
      href: "#guests",
      progress: guestProgress,
      tone: "amber",
    },
    {
      label: "Photos max / invité",
      value: `${ev.photos_per_guest}`,
      detail: "Limite de poses par invité",
      action: "Défini pour cet événement",
      href: null,
      progress: 100,
      tone: "ink",
    },
  ];

  return (
    <div className="flex flex-col flex-1 px-5" style={{ paddingTop: 28, paddingBottom: 80 }}>
      {/* Payment success banner — Suspense required because PaymentBanner uses useSearchParams() */}
      <Suspense fallback={null}>
        <PaymentBanner status={ev.status} />
      </Suspense>

      {/* Back */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--fg-3)",
          textDecoration: "none",
          marginBottom: 24,
          letterSpacing: "0.06em",
        }}
      >
        ← Mes événements
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <p className="f-eyebrow">{EVENT_TYPE_LABELS[ev.event_type]}</p>
          <span
            className="status-badge"
            style={{ background: statusColors.bg, color: statusColors.fg }}
          >
            {STATUS_LABELS[ev.status]}
          </span>
          {ev.plan_id && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 100,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--fg-3)",
              }}
            >
              {getPlan(ev.plan_id)?.label ?? ev.plan_id}
            </span>
          )}
        </div>
        <h1 className="f-h1" style={{ marginBottom: 0 }}>
          {ev.title}
        </h1>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "15px 14px",
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1, color: "var(--flaash-ink)" }}>
                  {card.value}
                </div>
              </div>
              <span
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background:
                    card.tone === "forest"
                      ? "var(--flaash-forest)"
                      : card.tone === "amber"
                        ? "var(--flaash-amber)"
                        : "var(--flaash-ink)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
            </div>
            <p style={{ color: "var(--fg-3)", fontSize: 12, lineHeight: 1.4, fontWeight: 600, minHeight: 34, marginBottom: 12 }}>
              {card.detail}
            </p>
            <div
              aria-hidden="true"
              style={{
                height: 5,
                borderRadius: 999,
                background: "var(--flaash-cream-line)",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${card.progress}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    card.tone === "forest"
                      ? "var(--flaash-forest)"
                      : card.tone === "amber"
                        ? "var(--flaash-amber)"
                        : "var(--flaash-ink)",
                }}
              />
            </div>
            {card.href ? (
              <Link
                href={card.href}
                target={card.href.startsWith("/print/") ? "_blank" : undefined}
                rel={card.href.startsWith("/print/") ? "noopener noreferrer" : undefined}
                style={{
                  color: "var(--flaash-amber-deep)",
                  display: "inline-flex",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                {card.action} →
              </Link>
            ) : (
              <span style={{ color: "var(--fg-3)", fontSize: 12, fontWeight: 700 }}>
                {card.action}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Guests */}
      <div id="guests" className="f-card" style={{ padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <p className="f-eyebrow">Invités</p>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600 }}>
            {guests.length} total
          </span>
        </div>

        {guests.length === 0 ? (
          <p style={{ color: "var(--fg-3)", fontSize: 14 }}>
            Aucun invité pour l&apos;instant.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {guests.map((guest) => {
              const joinedAt = new Date(guest.joined_at).toLocaleDateString("fr-CH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const lastActivity = guest.lastActivity
                ? new Date(guest.lastActivity).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={guest.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {guest.first_name}
                        </p>
                        <span
                          style={{
                            flexShrink: 0,
                            borderRadius: "var(--radius-pill)",
                            padding: "3px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            background: guest.is_blocked ? "var(--flaash-error-soft)" : "var(--flaash-forest-soft)",
                            color: guest.is_blocked ? "var(--flaash-error)" : "var(--flaash-forest)",
                          }}
                        >
                          {guest.is_blocked ? "Bloqué" : "Actif"}
                        </span>
                      </div>
                      <p style={{ color: "var(--fg-3)", fontSize: 12, lineHeight: 1.5 }}>
                        {guest.photoCount} photo{guest.photoCount !== 1 ? "s" : ""} · arrivé le {joinedAt}
                        {lastActivity ? ` · dernière activité ${lastActivity}` : ""}
                      </p>
                    </div>

                    <form action={(guest.is_blocked ? unblockGuest : blockGuest).bind(null, ev.id, guest.id)}>
                      <button
                        type="submit"
                        style={{
                          borderRadius: "var(--radius-pill)",
                          border: guest.is_blocked
                            ? "1.5px solid var(--border)"
                            : "1.5px solid rgba(220,38,38,0.28)",
                          background: guest.is_blocked ? "var(--surface-2)" : "rgba(220,38,38,0.08)",
                          color: guest.is_blocked ? "var(--fg-2)" : "var(--flaash-error)",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          padding: "8px 11px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {guest.is_blocked ? "Débloquer" : "Bloquer"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Draft warning: pay to activate */}
      {ev.status === "draft" && (
        <div
          style={{
            background: "var(--flaash-amber-soft)",
            borderRadius: "var(--radius-md)",
            padding: "18px 20px",
            marginBottom: 24,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--flaash-amber-deep)", marginBottom: 8 }}>
            En attente de paiement
          </p>
          <p style={{ fontSize: 14, color: "var(--flaash-ink-soft)", marginBottom: 14 }}>
            Procédez au paiement pour générer le QR code et accueillir vos invités.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Reprendre le paiement */}
            <form action={resumePayment.bind(null, ev.id)}>
              <button type="submit" className="btn-pill btn-amber" style={{ fontSize: 14 }}>
                Reprendre le paiement →
              </button>
            </form>
            {/* Modifier = delete draft + /dashboard/new */}
            <form action={deleteDraftAndNew.bind(null, ev.id)}>
              <button type="submit" style={{ background: "none", border: "none", fontSize: 13, color: "var(--fg-3)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                ← Modifier l&apos;événement
              </button>
            </form>
            {/* Dev bypass */}
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

      {/* Active / Revealed: show QR card */}
      {(ev.status === "active" || ev.status === "revealed") && (
        <div
          style={{
            background: "var(--flaash-forest)",
            borderRadius: "var(--radius-xl)",
            padding: "28px 20px",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <p className="f-script" style={{ color: "var(--flaash-amber)", marginBottom: 16, textAlign: "center" }}>
            {ev.status === "active"
              ? "tendez le code aux invités —"
              : "la galerie est révélée."}
          </p>

          <QRCodeCard url={eventUrl} title={ev.title} slug={ev.slug} />

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Link
              href={`/dashboard/${ev.id}/photos`}
              className="btn-pill btn-forest"
              style={{
                background: "rgba(250,247,242,0.15)",
                color: "var(--flaash-cream)",
                border: "1.5px solid rgba(250,247,242,0.3)",
                fontSize: 13,
              }}
            >
              MODÉRER LES PHOTOS
            </Link>
            <Link
              href={`/print/${ev.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid rgba(250,247,242,0.3)",
                background: "rgba(250,247,242,0.1)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--flaash-cream)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 6,
                textAlign: "center",
              }}
            >
              <span>Carte QR à imprimer →</span>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0, color: "rgba(250,247,242,0.52)" }}>
                Générez une carte prête à partager avec vos invités.
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Details card */}
      <div className="f-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Détails</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["Invités maximum", `${ev.max_guests}`],
            ["Photos par invité", `${ev.photos_per_guest}`],
            ["Upload photothèque", ev.allow_library_upload ? "Oui" : "Non"],
            [
              "Révélation",
              ev.reveal_at
                ? `Prévue le ${new Date(ev.reveal_at).toLocaleString("fr-CH")}`
                : "Manuelle",
            ],
            // BUG 4 fix — use eventUrl (built from NEXT_PUBLIC_APP_URL)
            ["Lien invité", eventUrl],
            ["Prix payé", `CHF ${ev.price_chf}`],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                paddingBottom: 10,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--fg-3)" }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reveal now button (active events) */}
      {ev.status === "active" && (
        <form
          action={async () => {
            "use server";
            await revealNow(id);
          }}
          style={{ marginBottom: 12 }}
        >
          <button type="submit" className="btn-pill btn-forest">
            RÉVÉLER MAINTENANT
          </button>
        </form>
      )}

      {/* Tolerance notice: guests exceeded plan limit */}
      {ev.plan_id && ev.max_guests > (getPlan(ev.plan_id)?.maxGuests ?? Infinity) && (
        <div style={{ background: "var(--flaash-forest-soft)", border: "1px solid var(--flaash-forest)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "var(--flaash-forest)" }}>
          Votre événement a accueilli plus d&apos;invités que prévu — nous avons accordé cette tolérance gratuitement.
        </div>
      )}

      {/* Download ZIP — available once there are photos */}
      {(ev.status === "active" || ev.status === "revealed") && (photoCount ?? 0) > 0 && (
        <a
          href={`/api/download/${ev.slug}`}
          download
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            borderRadius: "var(--radius-pill)",
            border: "1.5px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--fg-2)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          ⬇ TÉLÉCHARGER TOUTES LES PHOTOS ({photoCount})
        </a>
      )}
      {/* Delete event */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <DeleteButton eventId={ev.id} />
      </div>
    </div>
  );
}
