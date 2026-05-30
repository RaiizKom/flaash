import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  console.log("[upload] POST received");

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide." }, { status: 400 });
  }

  const token = formData.get("token") as string | null;
  const file = formData.get("file") as File | null;
  console.log("[upload] token present:", !!token, "| file present:", !!file, "| file size:", file?.size);

  if (!token || !file) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select(
      "id, event_id, photos_taken, is_blocked, events(id, status, photos_per_guest)"
    )
    .eq("token", token)
    .single();

  console.log("[upload] guest lookup:", guest ? `id=${guest.id} taken=${guest.photos_taken}` : "NOT FOUND", guestError?.message ?? "");

  if (!guest) {
    return NextResponse.json({ error: "Invité introuvable." }, { status: 404 });
  }

  // Supabase infers the FK join as an array type; cast via unknown
  const event = guest.events as unknown as {
    id: string;
    status: string;
    photos_per_guest: number;
  } | null;

  console.log("[upload] event status:", event?.status, "| quota:", guest.photos_taken, "/", event?.photos_per_guest);

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
  console.log("[upload] compressing with sharp...");
  const raw = Buffer.from(await file.arrayBuffer());

  let fullBuffer: Buffer, thumbBuffer: Buffer;
  try {
    [fullBuffer, thumbBuffer] = await Promise.all([
      sharp(raw)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true })
        .toBuffer(),
      sharp(raw)
        .rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 72 })
        .toBuffer(),
    ]);
    console.log("[upload] sharp OK — full:", fullBuffer.length, "bytes | thumb:", thumbBuffer.length, "bytes");
  } catch (err) {
    console.error("[upload] sharp FAILED:", err);
    return NextResponse.json({ error: "Erreur de compression." }, { status: 500 });
  }

  const photoId = crypto.randomUUID();
  const fullKey = `events/${guest.event_id}/photos/${photoId}.jpg`;
  const thumbKey = `events/${guest.event_id}/thumbs/${photoId}.jpg`;

  console.log("[upload] uploading to R2...");
  console.log("[upload] R2 key prefix:", process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.slice(0, 4));
  console.log("[upload] R2 secret set:", !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY);
  console.log("[upload] R2 endpoint:", process.env.CLOUDFLARE_R2_ENDPOINT);
  console.log("[upload] R2 bucket:", process.env.CLOUDFLARE_R2_BUCKET);
  console.log("[upload] R2 public URL:", process.env.CLOUDFLARE_R2_PUBLIC_URL);

  let storageUrl: string, thumbnailUrl: string;
  try {
    [storageUrl, thumbnailUrl] = await Promise.all([
      uploadBuffer(fullKey, fullBuffer, "image/jpeg"),
      uploadBuffer(thumbKey, thumbBuffer, "image/jpeg"),
    ]);
    console.log("[upload] R2 upload OK — storageUrl:", storageUrl);
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

  console.log("[upload] insert:", insertError ? `FAILED — ${insertError.message}` : "OK");

  if (insertError) {
    return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
  }

  await supabase
    .from("guests")
    .update({ photos_taken: guest.photos_taken + 1 })
    .eq("id", guest.id);

  console.log("[upload] done — photoId:", photoId);

  return NextResponse.json({
    photoId,
    thumbnailUrl,
    remainingShots: event.photos_per_guest - guest.photos_taken - 1,
  });
}
