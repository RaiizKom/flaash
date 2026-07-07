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
      <main className="guest-page-center guest-page-ink">
        <p className="guest-label">Reveal</p>
        <h1 className="guest-title">
          La galerie attend son moment.
        </h1>
        <p className="guest-copy">
          {effectiveEvent.status === "active" && effectiveEvent.reveal_at
            ? `La galerie sera révélée le ${formatRevealAt(effectiveEvent.reveal_at)}.`
            : "La galerie sera révélée au bon moment."}
        </p>
        <p className="guest-status-pill guest-status-pill-dark" style={{ marginTop: 26 }}>
          Les souvenirs se découvriront plus tard.
        </p>
      </main>
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
    <main className="guest-gallery-page">
      <div className="guest-gallery-inner">
        <header className="guest-gallery-header">
          <p className="guest-label">La soirée revient</p>
          <h1 className="guest-gallery-title">
            Les souvenirs de la soirée
          </h1>
          <p className="guest-gallery-subtitle">
            {effectiveEvent.title} ·{" "}
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>
        </header>

        <GalleryClient
          eventId={effectiveEvent.id}
          eventSlug={slug}
          eventTitle={effectiveEvent.title}
          photos={photos}
        />

        <nav
          aria-label="Liens légaux"
          className="guest-gallery-footer"
        >
          <Link
            href="/privacy"
          >
            Confidentialité
          </Link>
          <Link
            href="/mentions-legales"
          >
            Mentions légales
          </Link>
        </nav>
      </div>
    </main>
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
