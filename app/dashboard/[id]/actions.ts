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

  await supabase
    .from("events")
    .update({ status: "revealed", reveal_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath(`/dashboard/${eventId}`);
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

  await supabase
    .from("events")
    .update({ status: "active" })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath(`/dashboard/${eventId}`);
}
