"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { getPlan } from "@/lib/utils/pricing";
import { deleteEventObjects } from "@/lib/r2";

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

  // Clean up R2 objects (best effort)
  try { await deleteEventObjects(eventId); } catch (err) {
    console.error("[deleteEvent] R2 cleanup failed:", err);
  }

  await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", user.id);

  redirect("/dashboard");
}

export async function deleteDraftAndNew(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Only allow deleting drafts
  await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .eq("status", "draft");

  redirect("/dashboard/new");
}

export async function resumePayment(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ev } = await supabase
    .from("events")
    .select("id, title, plan_id, status")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!ev || ev.status !== "draft") redirect(`/dashboard/${eventId}`);

  const plan = getPlan(ev.plan_id ?? "classic");
  if (!plan || plan.price === 0) redirect(`/dashboard/${eventId}`);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.ch";
  const appUrl = rawUrl.replace(/^NEXT_PUBLIC_APP_URL=/, "").replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "chf",
        unit_amount: plan.price * 100,
        product_data: { name: `Flaash ${plan.label} — ${ev.title}` },
      },
      quantity: 1,
    }],
    success_url: `${appUrl}/dashboard/${eventId}?payment=success`,
    cancel_url:  `${appUrl}/dashboard/${eventId}?payment=cancelled`,
    allow_promotion_codes: true,
    metadata:    { event_id: eventId },
  });

  redirect(session.url!);
}

export async function activateEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ev } = await supabase
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  await supabase
    .from("events")
    .update({ status: "active" })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  revalidatePath(`/dashboard/${eventId}`);
  if (ev?.slug) revalidatePath(`/e/${ev.slug}`);
}
