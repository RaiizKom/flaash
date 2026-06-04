export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event } from "@/types";
import PhotoGrid, { type PhotoItem } from "./PhotoGrid";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PhotosPage({ params }: Props) {
  const { id } = await params;
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

  const { data: rows } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at, is_deleted, guests(first_name)")
    .eq("event_id", id)
    .order("taken_at", { ascending: false });

  const allPhotos: PhotoItem[] = (rows ?? []).map((p: {
    id: string;
    storage_url: string;
    thumbnail_url: string;
    taken_at: string;
    is_deleted: boolean;
    guests: { first_name: string } | { first_name: string }[] | null;
  }) => ({
    id:            p.id,
    storage_url:   p.storage_url,
    thumbnail_url: p.thumbnail_url,
    taken_at:      p.taken_at,
    is_deleted:    p.is_deleted,
    guestName:     p.guests
      ? (Array.isArray(p.guests) ? p.guests[0]?.first_name : p.guests.first_name) ?? null
      : null,
  }));

  const activePhotos  = allPhotos.filter((p) => !p.is_deleted);
  const deletedPhotos = allPhotos.filter((p) =>  p.is_deleted);

  return (
    <div className="flex flex-col flex-1 px-5" style={{ paddingTop: 28, paddingBottom: 80 }}>
      {/* Back */}
      <Link
        href={`/dashboard/${id}`}
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
        ← {ev.title}
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="f-eyebrow" style={{ marginBottom: 6 }}>MODÉRATION</p>
        <h1 className="f-h1">
          {activePhotos.length} photo{activePhotos.length !== 1 ? "s" : ""}
        </h1>
        {deletedPhotos.length > 0 && (
          <p style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>
            {deletedPhotos.length} supprimée{deletedPhotos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Download ZIP */}
      {activePhotos.length > 0 && (
        <a
          href={`/api/download/${ev.slug}`}
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            marginBottom: 24,
            borderRadius: "var(--radius-pill)",
            border: "1.5px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--fg-2)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          ⬇ TÉLÉCHARGER TOUTES LES PHOTOS ({activePhotos.length})
        </a>
      )}

      {/* Empty state */}
      {allPhotos.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ fontSize: 40 }}>📷</p>
          <p className="f-script" style={{ color: "var(--flaash-amber)", marginTop: 8, fontSize: 22 }}>
            aucune photo encore —
          </p>
          <p style={{ color: "var(--fg-3)", fontSize: 14, marginTop: 8, maxWidth: 260, margin: "8px auto 0" }}>
            Les photos apparaîtront ici dès qu&apos;un invité en prendra.
          </p>
        </div>
      )}

      <PhotoGrid
        eventId={id}
        activePhotos={activePhotos}
        deletedPhotos={deletedPhotos}
      />
    </div>
  );
}
