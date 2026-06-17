export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event } from "@/types";
import { blockGuest, unblockGuest } from "../photos/actions";

interface Props {
  params: { id: string };
}

interface GuestRow {
  id: string;
  first_name: string;
  is_blocked: boolean;
  joined_at: string;
  photos_taken: number;
}

interface GuestPhotoRow {
  guest_id: string | null;
  taken_at: string;
  is_deleted: boolean;
}

export default async function GuestsPage({ params }: Props) {
  const { id } = params;
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
  const ev = event as Event;

  const [{ data: guestRows }, { data: guestPhotoRows }] = await Promise.all([
    supabase
      .from("guests")
      .select("id, first_name, is_blocked, joined_at, photos_taken")
      .eq("event_id", id)
      .order("joined_at", { ascending: false }),
    supabase
      .from("photos")
      .select("guest_id, taken_at, is_deleted")
      .eq("event_id", id),
  ]);

  const guestPhotoStats = new Map<string, { photoCount: number; lastActivity: string | null }>();

  ((guestPhotoRows ?? []) as GuestPhotoRow[]).forEach((photo) => {
    if (!photo.guest_id) return;

    const current = guestPhotoStats.get(photo.guest_id) ?? {
      photoCount: 0,
      lastActivity: null,
    };

    current.photoCount += 1;
    if (!current.lastActivity || new Date(photo.taken_at).getTime() > new Date(current.lastActivity).getTime()) {
      current.lastActivity = photo.taken_at;
    }

    guestPhotoStats.set(photo.guest_id, current);
  });

  const guests = ((guestRows ?? []) as GuestRow[]).map((guest) => ({
    ...guest,
    photoCount: guestPhotoStats.get(guest.id)?.photoCount ?? 0,
    lastActivity: guestPhotoStats.get(guest.id)?.lastActivity ?? null,
  }));

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
        ← {ev.title}
      </Link>

      <div style={{ marginBottom: 24 }}>
        <p className="f-eyebrow" style={{ marginBottom: 6 }}>
          Dashboard événement
        </p>
        <h1 className="f-h1" style={{ marginBottom: 4 }}>
          Invités
        </h1>
        <p style={{ color: "var(--fg-3)", fontSize: 13, fontWeight: 600 }}>
          {ev.title}
        </p>
      </div>

      <div className="f-card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <p className="f-eyebrow">Liste invités</p>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600 }}>
            {guests.length} total
          </span>
        </div>

        {guests.length === 0 ? (
          <p style={{ color: "var(--fg-3)", fontSize: 14 }}>
            Aucun invité pour l&apos;instant.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {guests.map((guest) => {
              const joinedAt = guest.joined_at
                ? new Date(guest.joined_at).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;
              const lastActivity = guest.lastActivity
                ? new Date(guest.lastActivity).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={guest.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {guest.first_name}
                      </p>
                      <span
                        style={{
                          flexShrink: 0,
                          borderRadius: "var(--radius-pill)",
                          padding: "3px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          background: guest.is_blocked ? "var(--flaash-error-soft)" : "var(--flaash-forest-soft)",
                          color: guest.is_blocked ? "var(--flaash-error)" : "var(--flaash-forest)",
                        }}
                      >
                        {guest.is_blocked ? "Bloqué" : "Actif"}
                      </span>
                    </div>
                    <p style={{ color: "var(--fg-3)", fontSize: 12, lineHeight: 1.5 }}>
                      {guest.photoCount} photo{guest.photoCount !== 1 ? "s" : ""}
                      {joinedAt ? ` · arrivé le ${joinedAt}` : ""}
                      {lastActivity ? ` · dernière activité ${lastActivity}` : ""}
                    </p>
                  </div>

                  <form action={(guest.is_blocked ? unblockGuest : blockGuest).bind(null, ev.id, guest.id)}>
                    <button
                      type="submit"
                      style={{
                        borderRadius: "var(--radius-pill)",
                        border: guest.is_blocked
                          ? "1.5px solid var(--border)"
                          : "1.5px solid rgba(220,38,38,0.28)",
                        background: guest.is_blocked ? "var(--surface-2)" : "rgba(220,38,38,0.08)",
                        color: guest.is_blocked ? "var(--fg-2)" : "var(--flaash-error)",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        padding: "7px 9px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {guest.is_blocked ? "Débloquer" : "Bloquer"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
