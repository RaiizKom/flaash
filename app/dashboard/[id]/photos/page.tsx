export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { type Event, type Photo } from "@/types";
import { deletePhoto } from "./actions";

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
    .select("id, title, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!event) notFound();
  const ev = event as Pick<Event, "id" | "title" | "status">;

  const { data: photos } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at, source, is_deleted")
    .eq("event_id", id)
    .eq("is_deleted", false)
    .order("taken_at", { ascending: false });

  const photoList = (photos ?? []) as Photo[];

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
      <div style={{ marginBottom: 24 }}>
        <p className="f-eyebrow" style={{ marginBottom: 6 }}>
          Modération
        </p>
        <h1 className="f-h2" style={{ marginBottom: 0 }}>
          {photoList.length} photo{photoList.length !== 1 ? "s" : ""}
        </h1>
      </div>

      {/* Empty state */}
      {photoList.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 12,
            paddingBottom: 60,
          }}
        >
          <p style={{ fontSize: 40 }}>📷</p>
          <p className="f-script" style={{ color: "var(--flaash-amber)", fontSize: 22 }}>
            aucune photo encore —
          </p>
          <p style={{ fontSize: 14, color: "var(--fg-3)", maxWidth: 260 }}>
            Les photos apparaîtront ici dès qu&apos;un invité en prendra.
          </p>
        </div>
      )}

      {/* Photo grid */}
      {photoList.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          {photoList.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                aspectRatio: "1",
              }}
            >
              <Image
                src={photo.thumbnail_url}
                alt="Photo invité"
                fill
                sizes="(max-width: 640px) 140px, 200px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
              {/* Delete button */}
              <form
                action={async () => {
                  "use server";
                  await deletePhoto(photo.id, id);
                }}
                style={{ position: "absolute", top: 6, right: 6 }}
              >
                <button
                  type="submit"
                  aria-label="Supprimer"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
