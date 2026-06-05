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

  const ev = event as Event;

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
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const eventUrl = `${appUrl}/e/${ev.slug}`;

  const statusColors = STATUS_COLORS[ev.status] ?? STATUS_COLORS.draft;

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
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {[
          { n: photoCount ?? 0, label: "photos" },
          { n: guestCount ?? 0, label: "invités" },
          { n: ev.photos_per_guest, label: "max / invité" },
        ].map(({ n, label }) => (
          <div
            key={label}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
              {n}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {label}
            </div>
          </div>
        ))}
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
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(250,247,242,0.7)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🖨 Imprimer le QR code
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
                ? new Date(ev.reveal_at).toLocaleString("fr-CH")
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
