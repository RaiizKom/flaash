import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, status")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }
  if (event.status !== "revealed") {
    return NextResponse.json({ error: "Les souvenirs ne sont pas encore révélés." }, { status: 403 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id, storage_url, taken_at")
    .eq("event_id", event.id)
    .eq("is_deleted", false)
    .order("taken_at", { ascending: true });

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: "Aucune photo." }, { status: 404 });
  }

  const zip = new JSZip();

  await Promise.all(
    photos.map(async (photo, i) => {
      try {
        const res = await fetch(photo.storage_url);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        const ext = photo.storage_url.split(".").pop()?.split("?")[0] ?? "jpg";
        zip.file(`photo-${String(i + 1).padStart(3, "0")}.${ext}`, buf);
      } catch {
        // Photo inaccessible — on l'ignore
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 3 } });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-photos.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
