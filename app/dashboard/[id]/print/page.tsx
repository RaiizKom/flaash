export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Event } from "@/types";
import PrintView from "./PrintView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, status, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!event) notFound();

  const ev = event as Pick<Event, "id" | "title" | "slug" | "status" | "owner_id">;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.app")
    .replace(/^NEXT_PUBLIC_APP_URL=/, "")
    .replace(/\/$/, "");
  const eventUrl = `${appUrl}/e/${ev.slug}`;

  return <PrintView title={ev.title} eventUrl={eventUrl} />;
}
