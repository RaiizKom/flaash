import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide." }, { status: 400 });
  }

  const token = formData.get("token") as string | null;
  const file = formData.get("file") as File | null;

  if (!token || !file) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: guest } = await supabase
    .from("guests")
    .select(
      "id, event_id, photos_taken, is_blocked, events(id, status, photos_per_guest)"
    )
    .eq("token", token)
    .single();

  if (!guest) {
    return NextResponse.json({ error: "Invité introuvable." }, { status: 404 });
  }

  // Supabase returns the FK relation as a single object
  const event = guest.events as {
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

  const [fullBuffer, thumbBuffer] = await Promise.all([
    sharp(raw)
      .rotate() // honour EXIF orientation
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer(),
    sharp(raw)
      .rotate()
      .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toBuffer(),
  ]);

  const photoId = crypto.randomUUID();
  const fullKey = `events/${guest.event_id}/photos/${photoId}.jpg`;
  const thumbKey = `events/${guest.event_id}/thumbs/${photoId}.jpg`;

  const [storageUrl, thumbnailUrl] = await Promise.all([
    uploadBuffer(fullKey, fullBuffer, "image/jpeg"),
    uploadBuffer(thumbKey, thumbBuffer, "image/jpeg"),
  ]);

  const { error: insertError } = await supabase.from("photos").insert({
    id: photoId,
    event_id: guest.event_id,
    guest_id: guest.id,
    storage_url: storageUrl,
    thumbnail_url: thumbnailUrl,
    source: "camera",
  });

  if (insertError) {
    return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
  }

  // Increment counter after successful insert
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
