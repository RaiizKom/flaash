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
    <div className="dashboard-settings-page">
      <div className="dashboard-settings-shell">
        <Link href={`/dashboard/${id}`} className="dashboard-settings-back">
          ← Retour à l&apos;événement
        </Link>

        <header className="dashboard-settings-hero">
          <div>
            <p className="dashboard-section-label">Cadre de la soirée</p>
            <h1>Ajuster l&apos;expérience</h1>
          </div>
          <p>
            Définissez comment vos invités capturent, reviennent et découvrent les souvenirs.
          </p>
          <span>{ev.title}</span>
        </header>

        <SettingsForm event={ev} maxPhotosTaken={maxPhotosTaken} />
      </div>
    </div>
  );
}
