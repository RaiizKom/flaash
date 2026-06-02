export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

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
        }}
      >
        <p className="f-script" style={{ color: "var(--flaash-amber)", fontSize: 28, marginBottom: 12 }}>
          bientôt —
        </p>
        <p style={{ color: "var(--fg-3)", fontSize: 14 }}>
          La galerie n&apos;est pas encore disponible.
        </p>
      </div>
    );
  }

  const { data: rawPhotos } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at")
    .eq("event_id", event.id)
    .eq("is_deleted", false)
    .order("taken_at", { ascending: true });

  const photos = rawPhotos ?? [];

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

        {photos.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <p style={{ fontSize: 40 }}>📷</p>
            <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 14, marginTop: 12 }}>
              Aucune photo pour l&apos;instant.
            </p>
          </div>
        )}

        {photos.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 6,
            }}
          >
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.storage_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", aspectRatio: "1", borderRadius: 4, overflow: "hidden" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
