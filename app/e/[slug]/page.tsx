export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { type Event, EVENT_TYPE_LABELS } from "@/types";
import GuestCamera from "./GuestCamera";

interface Props {
  params: { slug: string };
}

export default async function EventGuestPage({ params }: Props) {
  const { slug } = params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, slug, status, photos_per_guest, allow_library_upload, max_guests, event_type, reveal_at, cover_url"
    )
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  let effectiveEvent = event;
  if (isTimedRevealDue(event.status, event.reveal_at)) {
    const { data: revealedEvent } = await supabase
      .from("events")
      .update({ status: "revealed" })
      .eq("id", event.id)
      .eq("status", "active")
      .select(
        "id, title, slug, status, photos_per_guest, allow_library_upload, max_guests, event_type, reveal_at, cover_url"
      )
      .single();

    effectiveEvent = revealedEvent ?? { ...event, status: "revealed" };
  }

  if (effectiveEvent.status === "draft") {
    return (
      <div className="flaash-shell" style={shellCenter}>
        <p className="f-script" style={{ color: "var(--flaash-amber)", marginBottom: 12 }}>
          bientôt —
        </p>
        <h1 className="f-h2" style={{ textAlign: "center" }}>
          {effectiveEvent.title}
        </h1>
        <p style={{ color: "var(--fg-3)", marginTop: 16, fontSize: 14, textAlign: "center" }}>
          Cet événement n&apos;est pas encore ouvert.
        </p>
      </div>
    );
  }

  if (effectiveEvent.status === "closed") {
    return (
      <div className="flaash-shell" style={shellCenter}>
        <p className="f-script" style={{ color: "var(--fg-3)", marginBottom: 12 }}>
          terminé —
        </p>
        <h1 className="f-h2" style={{ textAlign: "center" }}>
          {effectiveEvent.title}
        </h1>
        <p style={{ color: "var(--fg-3)", marginTop: 16, fontSize: 14, textAlign: "center" }}>
          Cet événement est maintenant fermé.
        </p>
      </div>
    );
  }

  if (effectiveEvent.status === "revealed") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--flaash-ink)",
        }}
      >
        {/* Amber top stripe */}
        <div style={{ height: 6, background: "var(--flaash-amber)", flexShrink: 0 }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 28px",
            textAlign: "center",
          }}
        >
          {effectiveEvent.cover_url && (
            <div style={{ width: "100%", maxWidth: 360, marginBottom: 28 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveEvent.cover_url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "16 / 10",
                  objectFit: "cover",
                  borderRadius: "var(--radius-xl)",
                  display: "block",
                  boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
                }}
              />
            </div>
          )}

          {/* Script subtitle */}
          <p
            className="f-script"
            style={{
              color: "var(--flaash-amber)",
              fontSize: 28,
              marginBottom: 16,
              lineHeight: 1,
            }}
          >
            vos souvenirs sont développés.
          </p>

          {/* Playfair title */}
          <h1
            className="f-display"
            style={{
              color: "var(--flaash-cream)",
              fontSize: "clamp(28px, 8vw, 48px)",
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            La galerie est disponible&nbsp;!
          </h1>

          {/* Event name */}
          <p
            style={{
              color: "rgba(250,247,242,0.45)",
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 40,
            }}
          >
            {effectiveEvent.title}
          </p>

          {/* CTA */}
          <Link
            href={`/e/${slug}/gallery`}
            className="btn-pill btn-ink"
            style={{
              background: "var(--flaash-cream)",
              color: "var(--flaash-ink)",
              maxWidth: 280,
              fontSize: 14,
            }}
          >
            VOIR LA GALERIE →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flaash-shell">
      <GuestCamera event={effectiveEvent as Event} />
    </div>
  );
}

function isTimedRevealDue(status: string, revealAt: string | null) {
  return status === "active" && !!revealAt && new Date(revealAt).getTime() <= Date.now();
}

const shellCenter: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
  minHeight: "100dvh",
};
