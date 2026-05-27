"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils/slug";
import { calculatePrice } from "@/lib/utils/pricing";
import { type EventType } from "@/types";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title           = (formData.get("title") as string).trim();
  const event_type      = formData.get("event_type") as EventType;
  const max_guests      = parseInt(formData.get("max_guests") as string, 10);
  const photos_per_guest = parseInt(formData.get("photos_per_guest") as string, 10);
  const reveal_mode     = formData.get("reveal_mode") as string;
  const reveal_at_raw   = formData.get("reveal_at") as string | null;
  const allow_library   = formData.get("allow_library_upload") === "on";

  const price_chf = calculatePrice(max_guests, photos_per_guest);
  const reveal_at = reveal_mode === "immediate" ? null : reveal_at_raw || null;

  // Ensure unique slug (retry once on collision)
  let slug = generateSlug(title);
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) slug = generateSlug(title); // second attempt gives new random suffix

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      owner_id: user.id,
      title,
      event_type,
      slug,
      status: "draft",
      max_guests,
      photos_per_guest,
      reveal_at,
      allow_library_upload: allow_library,
      price_chf,
    })
    .select()
    .single();

  if (error) {
    redirect(`/dashboard/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/${event.id}`);
}
