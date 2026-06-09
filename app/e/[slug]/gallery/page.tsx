export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import GalleryClient, { type GalleryPhoto } from "./GalleryClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, status, reveal_at")
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
      .select("id, title, status, reveal_at")
      .single();

    effectiveEvent = revealedEvent ?? { ...event, status: "revealed" };
  }

  if (effectiveEvent.status !== "revealed") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
          background: "var(--flaash-ink)",
        }}
      >
        <div style={{ height: 6, background: "var(--flaash-amber)", position: "absolute", top: 0, left: 0, right: 0 }} />
        <p className="f-script" style={{ color: "var(--flaash-amber)", fontSize: 28, marginBottom: 12 }}>
          bientôt —
        </p>
        <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 14 }}>
          {effectiveEvent.status === "active" && effectiveEvent.reveal_at
            ? `La galerie sera révélée le ${formatRevealAt(effectiveEvent.reveal_at)}.`
            : "La galerie n'est pas encore disponible."}
        </p>
      </div>
    );
  }

  const { data: rows } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at, guest_id, guests(first_name)")
    .eq("event_id", effectiveEvent.id)
    .eq("is_deleted", false)
    .order("taken_at", { ascending: true });

  const photos: GalleryPhoto[] = (rows ?? []).map((p: {
    id: string;
    storage_url: string;
    thumbnail_url: string;
    taken_at: string;
    guest_id: string;
    guests: { first_name: string } | { first_name: string }[] | null;
  }) => ({
    id:            p.id,
    storage_url:   p.storage_url,
    thumbnail_url: p.thumbnail_url,
    taken_at:      p.taken_at,
    guest_id:      p.guest_id,
    guestName:     p.guests
      ? (Array.isArray(p.guests) ? p.guests[0]?.first_name : p.guests.first_name) ?? null
      : null,
  }));

  return (
    <div style={{ minHeight: "100dvh", background: "var(--flaash-ink)" }}>
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div style={{ padding: "32px 20px 80px" }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <p className="f-script" style={{ color: "var(--flaash-amber)", fontSize: 28, marginBottom: 8 }}>
            la galerie —
          </p>
          <h1 className="f-h2" style={{ color: "var(--flaash-cream)", marginBottom: 0 }}>
            {effectiveEvent.title}
          </h1>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 13, marginTop: 8 }}>
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <GalleryClient
          eventId={effectiveEvent.id}
          eventSlug={slug}
          eventTitle={effectiveEvent.title}
          photos={photos}
        />

        <nav
          aria-label="Liens légaux"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            marginTop: 44,
            fontSize: 12,
          }}
        >
          <Link
            href="/privacy"
            style={{
              color: "rgba(250,247,242,0.45)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Confidentialité
          </Link>
          <Link
            href="/mentions-legales"
            style={{
              color: "rgba(250,247,242,0.45)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Mentions légales
          </Link>
        </nav>
      </div>
    </div>
  );
}

function isTimedRevealDue(status: string, revealAt: string | null) {
  return status === "active" && !!revealAt && new Date(revealAt).getTime() <= Date.now();
}

function formatRevealAt(revealAt: string) {
  return new Date(revealAt).toLocaleString("fr-CH", {
    dateStyle: "long",
    timeStyle: "short",
  });
}
