export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event, type Photo } from "@/types";
import { deletePhoto, restorePhoto } from "./actions";

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

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", id)
    .order("taken_at", { ascending: false });

  const allPhotos = (photos ?? []) as Photo[];
  const activePhotos = allPhotos.filter((p) => !p.is_deleted);
  const deletedPhotos = allPhotos.filter((p) => p.is_deleted);

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

      {/* Active photos grid */}
      {activePhotos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {activePhotos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                background: "var(--surface-2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url || photo.storage_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <form
                action={deletePhoto.bind(null, photo.id, id)}
                style={{ position: "absolute", top: 4, right: 4 }}
              >
                <button
                  type="submit"
                  title="Supprimer"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Deleted photos */}
      {deletedPhotos.length > 0 && (
        <>
          <p className="f-eyebrow" style={{ marginBottom: 12 }}>SUPPRIMÉES</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              opacity: 0.5,
            }}
          >
            {deletedPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  background: "var(--surface-2)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <form
                  action={restorePhoto.bind(null, photo.id, id)}
                  style={{ position: "absolute", bottom: 4, right: 4 }}
                >
                  <button
                    type="submit"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "3px 8px",
                      cursor: "pointer",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Restaurer
                  </button>
                </form>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
