export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Event } from "@/types";
import SettingsForm from "./SettingsForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventSettingsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!event) notFound();

  const { data: guests } = await supabase
    .from("guests")
    .select("photos_taken")
    .eq("event_id", id)
    .order("photos_taken", { ascending: false })
    .limit(1);

  const maxPhotosTaken = guests?.[0]?.photos_taken ?? 0;
  const ev = event as Event;

  return (
    <div className="flex flex-col flex-1 px-5" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <Link
        href={`/dashboard/${id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--fg-3)",
          textDecoration: "none",
          marginBottom: 24,
          letterSpacing: "0.06em",
        }}
      >
        ← Retour au dashboard
      </Link>

      <div style={{ marginBottom: 24 }}>
        <p className="f-eyebrow" style={{ marginBottom: 6 }}>PARAMÈTRES</p>
        <h1 className="f-h1" style={{ marginBottom: 8 }}>
          {ev.title}
        </h1>
        <p style={{ color: "var(--fg-3)", fontSize: 14, lineHeight: 1.45, margin: 0 }}>
          Modifie les réglages principaux sans changer le lien invité ni le QR code.
        </p>
      </div>

      <SettingsForm event={ev} maxPhotosTaken={maxPhotosTaken} />
    </div>
  );
}
