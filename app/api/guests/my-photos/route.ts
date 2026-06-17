import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function readBearerToken(req: NextRequest) {
  const authorization = req.headers.get("Authorization")?.trim();
  if (!authorization) return null;

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim() || null;
  }

  return authorization;
}

export async function GET(req: NextRequest) {
  const token = readBearerToken(req);

  if (!token) {
    return NextResponse.json({ error: "Token manquant." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id, event_id, is_blocked")
    .eq("token", token)
    .single();

  if (guestError || !guest) {
    return NextResponse.json({ error: "Session invitée invalide." }, { status: 401 });
  }

  if (guest.is_blocked) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("id, thumbnail_url")
    .eq("event_id", guest.event_id)
    .eq("guest_id", guest.id)
    .eq("is_deleted", false)
    .order("taken_at", { ascending: true });

  if (photosError) {
    return NextResponse.json({ error: "Impossible de charger les photos." }, { status: 500 });
  }

  return NextResponse.json({
    photos: (photos ?? []).map((photo) => ({
      id: photo.id,
      thumbnailUrl: photo.thumbnail_url,
    })),
  });
}
