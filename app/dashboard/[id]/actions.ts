"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function revealNow(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .update({ status: "revealed", reveal_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .select("slug")
    .single();

  revalidatePath(`/dashboard/${eventId}`);
  if (event?.slug) {
    revalidatePath(`/e/${event.slug}`);
    revalidatePath(`/e/${event.slug}/gallery`);
  }
}

export async function activateWithoutPayment(eventId: string) {
  if (process.env.NODE_ENV !== "development") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("events")
    .update({ status: "active" })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath(`/dashboard/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", user.id);

  redirect("/dashboard");
}

export async function activateEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch reveal_at to decide final status:
  // reveal_at === null → immediate mode → go straight to "revealed"
  const { data: ev } = await supabase
    .from("events")
    .select("reveal_at, slug")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  const isImmediate = ev?.reveal_at === null;
  const newStatus   = isImmediate ? "revealed" : "active";
  const now         = new Date().toISOString();

  await supabase
    .from("events")
    .update(isImmediate
      ? { status: "revealed", reveal_at: now }
      : { status: "active" })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath(`/dashboard/${eventId}`);
  if (ev?.slug) {
    revalidatePath(`/e/${ev.slug}`);
    revalidatePath(`/e/${ev.slug}/gallery`);
  }
}
