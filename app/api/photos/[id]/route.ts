import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const token = req.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ error: "Token manquant." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Validate token → find guest
  const { data: guest } = await supabase
    .from("guests")
    .select("id, is_blocked")
    .eq("token", token)
    .single();

  if (!guest || guest.is_blocked) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  // Verify the photo belongs to this guest
  const { data: photo } = await supabase
    .from("photos")
    .select("id, guest_id")
    .eq("id", photoId)
    .eq("guest_id", guest.id)
    .eq("is_deleted", false)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  await supabase
    .from("photos")
    .update({ is_deleted: true })
    .eq("id", photoId);

  return NextResponse.json({ ok: true });
}
