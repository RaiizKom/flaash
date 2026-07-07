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
  const blockedGuests = guests.filter((guest) => guest.is_blocked).length;
  const activeGuests = guests.length - blockedGuests;
  const capturedSouvenirs = guests.reduce((total, guest) => total + guest.photoCount, 0);

  return (
    <div className="dashboard-guests-page">
      <div className="dashboard-guests-shell">
        <Link href={`/dashboard/${id}`} className="dashboard-guests-back">
          ← Retour à l&apos;événement
        </Link>

        <header className="dashboard-guests-hero">
          <div>
            <p className="dashboard-section-label">Participation</p>
            <h1>Voir qui participe</h1>
            <p className="dashboard-guests-hero-copy">
              Suivez les invités qui capturent la soirée et gardez le contrôle si nécessaire.
            </p>
          </div>
          <aside className="dashboard-guests-context">
            <span>La soirée vit ici</span>
            <p>
              Quand vos invités scannent le QR, leurs regards commencent à nourrir la galerie.
            </p>
            {blockedGuests > 0 && (
              <strong>
                {blockedGuests} invité{blockedGuests > 1 ? "s" : ""} à l&apos;écart.
              </strong>
            )}
          </aside>
          <span className="dashboard-guests-event-title">{ev.title}</span>
        </header>

        <section className="dashboard-guests-stats" aria-label="Résumé de participation">
          <div>
            <span>{guests.length}</span>
            <p>invités</p>
          </div>
          <div>
            <span>{activeGuests}</span>
            <p>actifs</p>
          </div>
          <div>
            <span>{capturedSouvenirs}</span>
            <p>souvenirs capturés</p>
          </div>
          <div>
            <span>{blockedGuests}</span>
            <p>bloqués</p>
          </div>
        </section>

        <main className="dashboard-guests-layout">
          <section className="dashboard-guests-list" aria-labelledby="guests-list-title">
            <div className="dashboard-guests-section-head">
              <div>
                <p className="dashboard-section-label">Invités de la soirée</p>
                <h2 id="guests-list-title">Invités et captures</h2>
              </div>
              <p>
                Suivez qui a rejoint la soirée, qui capture, et qui reste à l&apos;écart si besoin.
              </p>
            </div>

            {guests.length === 0 ? (
              <div className="dashboard-guests-empty">
                <p className="dashboard-section-label">En attente</p>
                <h2>Les invités apparaîtront ici dès qu&apos;ils rejoindront la soirée.</h2>
                <p>
                  Quand ils scanneront le QR, leurs premiers regards commenceront à vivre ici.
                </p>
              </div>
            ) : (
              <div className="dashboard-guests-cards">
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
                    <article
                      key={guest.id}
                      className={`dashboard-guest-card${guest.is_blocked ? " dashboard-guest-card-blocked" : ""}`}
                    >
                      <div className="dashboard-guest-main">
                        <div className="dashboard-guest-avatar" aria-hidden="true">
                          {guest.first_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="dashboard-guest-copy">
                          <div className="dashboard-guest-title-row">
                            <h3>{guest.first_name}</h3>
                            <span className={`dashboard-guest-status${guest.is_blocked ? " dashboard-guest-status-blocked" : ""}`}>
                              {guest.is_blocked ? "Bloqué" : "Actif"}
                            </span>
                          </div>
                          <p>
                            {guest.photoCount} souvenir{guest.photoCount !== 1 ? "s" : ""} capturé{guest.photoCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <dl className="dashboard-guest-meta">
                        <div>
                          <dt>Arrivé</dt>
                          <dd>{joinedAt ?? "Non renseigné"}</dd>
                        </div>
                        <div>
                          <dt>Dernière capture</dt>
                          <dd>{lastActivity ?? "Pas encore"}</dd>
                        </div>
                      </dl>

                      <form action={(guest.is_blocked ? unblockGuest : blockGuest).bind(null, ev.id, guest.id)}>
                        <button
                          type="submit"
                          className={`dashboard-guest-action${guest.is_blocked ? " dashboard-guest-action-restore" : ""}`}
                        >
                          {guest.is_blocked ? "Débloquer" : "Bloquer"}
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
