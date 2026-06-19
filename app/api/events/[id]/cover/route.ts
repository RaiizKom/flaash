import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteObject, uploadBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_COVER_BYTES = 25_000_000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("id, owner_id, slug")
    .eq("id", id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }

  if (event.owner_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Photo manquante." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choisis une image valide." }, { status: 400 });
  }

  if (file.size > MAX_COVER_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde. Choisis une photo de moins de 25 MB." },
      { status: 413 }
    );
  }

  let coverBuffer: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    coverBuffer = await sharp(raw)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
  } catch (err) {
    console.error("[cover] processing failed:", err);
    return NextResponse.json({ error: "Erreur de traitement de l'image." }, { status: 500 });
  }

  let coverUrl: string;
  try {
    coverUrl = await uploadBuffer(`events/${id}/cover.jpg`, coverBuffer, "image/jpeg");
  } catch (err) {
    console.error("[cover] upload failed:", err);
    return NextResponse.json({ error: "Erreur de stockage." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("events")
    .update({ cover_url: coverUrl })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (updateError) {
    console.error("[cover] update failed:", updateError.message);
    return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
  }

  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/e/${event.slug}`);

  return NextResponse.json({ cover_url: coverUrl });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("id, owner_id, slug")
    .eq("id", id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }

  if (event.owner_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  try {
    await deleteObject(`events/${id}/cover.jpg`);
  } catch (err) {
    console.error("[cover] delete object failed:", err);
  }

  const { error: updateError } = await admin
    .from("events")
    .update({ cover_url: null })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (updateError) {
    console.error("[cover] delete update failed:", updateError.message);
    return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
  }

  revalidatePath(`/dashboard/${id}`);
  revalidatePath(`/e/${event.slug}`);

  return NextResponse.json({ cover_url: null });
}
