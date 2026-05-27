import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug: string | undefined = body?.slug;
  const firstName: string | undefined = body?.firstName;

  if (!slug || !firstName?.trim()) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, status, max_guests, photos_per_guest, allow_library_upload, title")
    .eq("slug", slug)
    .single();

  if (!event || event.status !== "active") {
    return NextResponse.json(
      { error: "Événement introuvable ou non actif." },
      { status: 404 }
    );
  }

  const { count } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("is_blocked", false);

  if ((count ?? 0) >= event.max_guests) {
    return NextResponse.json({ error: "L'événement est complet." }, { status: 409 });
  }

  const { data: guest, error } = await supabase
    .from("guests")
    .insert({ event_id: event.id, first_name: firstName.trim() })
    .select("id, token, photos_taken")
    .single();

  if (error || !guest) {
    return NextResponse.json({ error: "Erreur lors de l'inscription." }, { status: 500 });
  }

  return NextResponse.json({
    token: guest.token,
    guestId: guest.id,
    photosTaken: guest.photos_taken,
    photosPerGuest: event.photos_per_guest,
    allowLibraryUpload: event.allow_library_upload,
    eventTitle: event.title,
  });
}
