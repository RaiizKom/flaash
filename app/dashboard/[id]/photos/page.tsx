export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Event } from "@/types";
import PhotoGrid, { type PhotoItem } from "./PhotoGrid";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PhotosPage({ params }: Props) {
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
  const ev = event as Event;

  const { data: rows } = await supabase
    .from("photos")
    .select("id, storage_url, thumbnail_url, taken_at, is_deleted, guest_id, guests(id, first_name, is_blocked)")
    .eq("event_id", id)
    .order("taken_at", { ascending: false });

  const allPhotos: PhotoItem[] = (rows ?? []).map((p: {
    id: string;
    storage_url: string;
    thumbnail_url: string;
    taken_at: string;
    is_deleted: boolean;
    guest_id: string | null;
    guests: { id: string; first_name: string; is_blocked: boolean } | { id: string; first_name: string; is_blocked: boolean }[] | null;
  }) => {
    const guest = p.guests ? (Array.isArray(p.guests) ? p.guests[0] : p.guests) : null;

    return {
      id:            p.id,
      storage_url:   p.storage_url,
      thumbnail_url: p.thumbnail_url,
      taken_at:      p.taken_at,
      is_deleted:    p.is_deleted,
      guestId:       guest?.id ?? p.guest_id ?? null,
      guestName:     guest?.first_name ?? null,
      guestBlocked:  guest?.is_blocked ?? false,
    };
  });

  const activePhotos  = allPhotos.filter((p) => !p.is_deleted);
  const deletedPhotos = allPhotos.filter((p) =>  p.is_deleted);
  const contributorCount = new Set(
    allPhotos
      .map((p) => p.guestId)
      .filter((guestId): guestId is string => Boolean(guestId))
  ).size;
  const isRevealed = ev.status === "revealed";
  const preparationCopy = isRevealed
    ? "La galerie est ouverte. Les souvenirs peuvent être conservés."
    : "Gardez les regards qui doivent revenir dans la galerie.";

  return (
    <div className="dashboard-photos-page">
      <div className="dashboard-photos-shell">
        <Link href={`/dashboard/${id}`} className="dashboard-photos-back">
          ← Retour à l&apos;événement
        </Link>

        <header className="dashboard-photos-hero">
          <div>
            <p className="dashboard-section-label">Préparation</p>
            <h1>Préparer les souvenirs</h1>
            <p className="dashboard-photos-event-title">{ev.title}</p>
            <p className="dashboard-photos-hero-copy">{preparationCopy}</p>
          </div>
          <div className="dashboard-photos-reveal-card">
            <span>{isRevealed ? "Galerie ouverte" : "Avant le reveal"}</span>
            <p>
              {isRevealed
                ? "Les regards visibles peuvent maintenant être conservés."
                : "Les souvenirs visibles composeront le retour de la soirée."}
            </p>
          </div>
        </header>

        <section className="dashboard-photos-stats" aria-label="Résumé des souvenirs">
          <div>
            <span>{activePhotos.length}</span>
            <p>{activePhotos.length === 1 ? "souvenir visible" : "souvenirs visibles"}</p>
          </div>
          <div>
            <span>{deletedPhotos.length}</span>
            <p>{deletedPhotos.length === 1 ? "souvenir mis de côté" : "souvenirs mis de côté"}</p>
          </div>
          <div>
            <span>{contributorCount}</span>
            <p>{contributorCount === 1 ? "invité contributeur" : "invités contributeurs"}</p>
          </div>
          <div>
            <span>{isRevealed ? "Ouvert" : "En attente"}</span>
            <p>{isRevealed ? "reveal lancé" : "reveal à préparer"}</p>
          </div>
        </section>

        {allPhotos.length === 0 && (
          <section className="dashboard-photos-empty" aria-label="Aucun souvenir">
            <p className="dashboard-section-label">Galerie</p>
            <h2>Les premiers souvenirs attendent encore.</h2>
            <p>
              Quand vos invités captureront la soirée, leurs regards apparaîtront ici avant le reveal.
            </p>
          </section>
        )}

        <div className="dashboard-photos-layout">
          <main className="dashboard-photos-main" aria-label="Souvenirs de la galerie">
            <PhotoGrid
              eventId={id}
              activePhotos={activePhotos}
              deletedPhotos={deletedPhotos}
            />
          </main>

          <aside className="dashboard-photos-aside" aria-label="Préparation du reveal">
            <div className="dashboard-photos-aside-card">
              <p className="dashboard-section-label">Reveal</p>
              <h2>{isRevealed ? "Souvenirs prêts à conserver" : "Préparer le retour"}</h2>
              <p>
                {isRevealed
                  ? "La galerie est ouverte. Le téléchargement reprend les souvenirs visibles."
                  : "Gardez les regards justes, mettez le reste de côté, puis laissez la soirée revenir."}
              </p>
            </div>

            <div className="dashboard-photos-aside-card dashboard-photos-download-card">
              <p className="dashboard-section-label">À conserver</p>
              <h2>Télécharger les souvenirs</h2>
              <p>Le téléchargement regroupe les souvenirs visibles, prêts à être conservés.</p>
              {activePhotos.length > 0 && (
                <a href={`/api/download/${ev.slug}`} download className="dashboard-photos-download">
                  Télécharger les souvenirs
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
