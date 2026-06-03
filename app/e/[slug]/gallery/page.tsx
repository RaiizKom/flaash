export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
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
    .select("id, title, status")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  if (event.status !== "revealed" && event.status !== "active") {
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
          La galerie n&apos;est pas encore disponible.
        </p>
      </div>
    );
  }

  const { data: rows } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at, guest_id, guests(first_name)")
    .eq("event_id", event.id)
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
            {event.title}
          </h1>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 13, marginTop: 8 }}>
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <GalleryClient
          eventId={event.id}
          eventSlug={slug}
          eventTitle={event.title}
          photos={photos}
        />
      </div>
    </div>
  );
}
