import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import PrintCard from "./PrintCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PrintPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.app";
  const appUrl = rawUrl.replace(/^NEXT_PUBLIC_APP_URL=/, "").replace(/\/$/, "");
  const eventUrl = `${appUrl}/e/${event.slug}`;

  return <PrintCard title={event.title} eventUrl={eventUrl} />;
}
