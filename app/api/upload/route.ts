import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_UPLOAD_BYTES = 25_000_000;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide." }, { status: 400 });
  }

  const token = formData.get("token") as string | null;
  const file = formData.get("file");

  if (!token || !(file instanceof File)) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choisis une image valide." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde. Choisis une photo de moins de 25 MB." },
      { status: 413 }
    );
  }

  const supabase = createAdminClient();

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select(
      "id, event_id, photos_taken, is_blocked, events(id, status, photos_per_guest)"
    )
    .eq("token", token)
    .single();

  if (!guest) {
    return NextResponse.json({ error: "Invité introuvable." }, { status: 404 });
  }

  // Supabase infers the FK join as an array type; cast via unknown
  const event = guest.events as unknown as {
    id: string;
    status: string;
    photos_per_guest: number;
  } | null;

  if (guest.is_blocked) {
    return NextResponse.json({ error: "Accès bloqué." }, { status: 403 });
  }
  if (event?.status !== "active") {
    return NextResponse.json({ error: "Événement non actif." }, { status: 403 });
  }
  if (!event || guest.photos_taken >= event.photos_per_guest) {
    return NextResponse.json({ error: "Quota atteint." }, { status: 429 });
  }

  // Compress with Sharp
  const raw = Buffer.from(await file.arrayBuffer());

  let fullBuffer: Buffer, thumbBuffer: Buffer;
  try {
    [fullBuffer, thumbBuffer] = await Promise.all([
      sharp(raw)
        .rotate()
        .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer(),
      sharp(raw)
        .rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 72 })
        .toBuffer(),
    ]);
  } catch (err) {
    console.error("[upload] sharp FAILED:", err);
    return NextResponse.json({ error: "Erreur de compression." }, { status: 500 });
  }

  const photoId = crypto.randomUUID();
  const fullKey = `events/${guest.event_id}/photos/${photoId}.jpg`;
  const thumbKey = `events/${guest.event_id}/thumbs/${photoId}.jpg`;

  let storageUrl: string, thumbnailUrl: string;
  try {
    [storageUrl, thumbnailUrl] = await Promise.all([
      uploadBuffer(fullKey, fullBuffer, "image/jpeg"),
      uploadBuffer(thumbKey, thumbBuffer, "image/jpeg"),
    ]);
  } catch (err) {
    console.error("[upload] R2 upload FAILED:", err);
    return NextResponse.json({ error: "Erreur de stockage." }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("photos").insert({
    id: photoId,
    event_id: guest.event_id,
    guest_id: guest.id,
    storage_url: storageUrl,
    thumbnail_url: thumbnailUrl,
    source: "camera",
  });

  if (insertError) {
    console.error("[upload] insert FAILED:", insertError.message);
    return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
  }

  await supabase
    .from("guests")
    .update({ photos_taken: guest.photos_taken + 1 })
    .eq("id", guest.id);

  return NextResponse.json({
    photoId,
    thumbnailUrl,
    remainingShots: event.photos_per_guest - guest.photos_taken - 1,
  });
}
