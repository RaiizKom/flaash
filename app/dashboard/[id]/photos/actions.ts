"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function verifyOwner(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!event) redirect("/login");

  return supabase;
}

export async function deletePhoto(photoId: string, eventId: string) {
  const supabase = await verifyOwner(eventId);

  await supabase
    .from("photos")
    .update({ is_deleted: true })
    .eq("id", photoId)
    .eq("event_id", eventId);

  revalidatePath(`/dashboard/${eventId}/photos`);
}

export async function restorePhoto(photoId: string, eventId: string) {
  const supabase = await verifyOwner(eventId);

  await supabase
    .from("photos")
    .update({ is_deleted: false })
    .eq("id", photoId)
    .eq("event_id", eventId);

  revalidatePath(`/dashboard/${eventId}/photos`);
}
