"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deletePhoto(photoId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify the event belongs to this user before soft-deleting
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!event) return;

  await supabase
    .from("photos")
    .update({ is_deleted: true })
    .eq("id", photoId)
    .eq("event_id", eventId);

  revalidatePath(`/dashboard/${eventId}/photos`);
}
