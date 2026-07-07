"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTransition } from "react";
import { blockGuest, deletePhoto, restorePhoto, unblockGuest } from "./actions";

export interface PhotoItem {
  id: string;
  storage_url: string;
  thumbnail_url: string;
  taken_at: string;
  is_deleted: boolean;
  guestId: string | null;
  guestName: string | null;
  guestBlocked: boolean;
}

interface Props {
  eventId: string;
  activePhotos: PhotoItem[];
  deletedPhotos: PhotoItem[];
}

export default function PhotoGrid({ eventId, activePhotos, deletedPhotos }: Props) {
  const [idx, setIdx] = useState<number | null>(null);
  const [pendingGuestId, setPendingGuestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const touchX = useRef(0);
  const total = activePhotos.length;
  const current = idx !== null ? activePhotos[idx] : null;

  const close = useCallback(() => setIdx(null), []);
  const prev  = useCallback(() => setIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const next  = useCallback(() => setIdx(i => (i !== null && i < total - 1 ? i + 1 : i)), [total]);

  // Keyboard: Esc / ← / →
  useEffect(() => {
    if (idx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, close, prev, next]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = idx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [idx]);

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-CH", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function handleGuestBlockToggle(photo: PhotoItem) {
    if (!photo.guestId || pendingGuestId) return;

    const confirmed = window.confirm(
      photo.guestBlocked
        ? "Débloquer cet invité ? Il pourra à nouveau envoyer des photos si l'événement l'autorise."
        : "Bloquer cet invité ? Il ne pourra plus envoyer de nouvelles photos avec cette session. Les photos déjà envoyées resteront visibles."
    );

    if (!confirmed) return;

    setPendingGuestId(photo.guestId);
    startTransition(async () => {
      try {
        if (photo.guestBlocked) {
          await unblockGuest(eventId, photo.guestId!);
        } else {
          await blockGuest(eventId, photo.guestId!);
        }
      } finally {
        setPendingGuestId(null);
      }
    });
  }

  return (
    <>
      {/* ── Active grid ─────────────────────────────────────────────────────── */}
      {activePhotos.length > 0 && (
        <section className="dashboard-photos-curation" aria-label="Souvenirs visibles">
          <div className="dashboard-photos-section-head">
            <div>
              <p className="dashboard-section-label">Galerie</p>
              <h2>Souvenirs visibles</h2>
            </div>
            <p>{activePhotos.length} prêts pour la galerie</p>
          </div>
          <div className="dashboard-photos-grid">
            {activePhotos.map((photo, index) => (
              <article
                key={photo.id}
                className="dashboard-photo-card"
              >
                <button
                  type="button"
                  onClick={() => setIdx(index)}
                  className="dashboard-photo-open"
                  aria-label="Agrandir la photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnail_url || photo.storage_url}
                    alt=""
                    className="dashboard-photo-image"
                  />
                </button>

                <div className="dashboard-photo-meta" aria-hidden="true">
                  <span>{photo.guestName ?? "Invité"}</span>
                  <span>{fmtDate(photo.taken_at)}</span>
                </div>

                <form
                  action={deletePhoto.bind(null, photo.id, eventId)}
                  className="dashboard-photo-delete-form"
                >
                  <button
                    type="submit"
                    title="Mettre de côté"
                    className="dashboard-photo-delete-button"
                    aria-label="Mettre cette photo de côté"
                  >
                    ×
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Deleted grid ────────────────────────────────────────────────────── */}
      {deletedPhotos.length > 0 && (
        <section className="dashboard-photos-set-aside" aria-label="Souvenirs mis de côté">
          <div className="dashboard-photos-section-head">
            <div>
              <p className="dashboard-section-label">Mis de côté</p>
              <h2>Souvenirs mis de côté</h2>
            </div>
            <p>{deletedPhotos.length} à restaurer si besoin</p>
          </div>
          <div className="dashboard-photos-grid dashboard-photos-grid-muted">
            {deletedPhotos.map((photo) => (
              <article
                key={photo.id}
                className="dashboard-photo-card dashboard-photo-card-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  className="dashboard-photo-image"
                />
                <div className="dashboard-photo-meta" aria-hidden="true">
                  <span>{photo.guestName ?? "Invité"}</span>
                  <span>{fmtDate(photo.taken_at)}</span>
                </div>
                <form
                  action={restorePhoto.bind(null, photo.id, eventId)}
                  className="dashboard-photo-restore-form"
                >
                  <button
                    type="submit"
                    className="dashboard-photo-restore-button"
                  >
                    Restaurer
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────────── */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10, 8, 5, 0.96)",
            display: "flex", flexDirection: "column",
          }}
          onClick={close}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(delta) > 48) { delta < 0 ? next() : prev(); }
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: "rgba(250,247,242,0.35)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>
              {(idx ?? 0) + 1} / {total}
            </span>
            <button
              onClick={close}
              style={{
                background: "rgba(250,247,242,0.08)", border: "none",
                borderRadius: "50%", width: 40, height: 40,
                color: "var(--flaash-cream)", fontSize: 20,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Photo + navigation arrows */}
          <div
            style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", position: "relative", overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            <button
              onClick={prev}
              disabled={(idx ?? 0) === 0}
              style={{
                position: "absolute", left: 12, zIndex: 1,
                background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.15)",
                borderRadius: "50%", width: 44, height: 44,
                color: "var(--flaash-cream)", fontSize: 24,
                cursor: (idx ?? 0) === 0 ? "default" : "pointer",
                opacity: (idx ?? 0) === 0 ? 0.2 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.15s",
              }}
              aria-label="Photo précédente"
            >
              ‹
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.storage_url}
              alt=""
              style={{
                maxWidth: "min(88vw, 820px)",
                maxHeight: "calc(100dvh - 148px)",
                objectFit: "contain",
                borderRadius: 6,
                display: "block",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            />

            {/* Next */}
            <button
              onClick={next}
              disabled={(idx ?? 0) === total - 1}
              style={{
                position: "absolute", right: 12, zIndex: 1,
                background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.15)",
                borderRadius: "50%", width: 44, height: 44,
                color: "var(--flaash-cream)", fontSize: 24,
                cursor: (idx ?? 0) === total - 1 ? "default" : "pointer",
                opacity: (idx ?? 0) === total - 1 ? 0.2 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.15s",
              }}
              aria-label="Photo suivante"
            >
              ›
            </button>
          </div>

          {/* Bottom bar: guest name + date */}
          <div
            style={{ padding: "16px 24px 24px", flexShrink: 0, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            {current.guestName && (
              <p
                className="f-eyebrow"
                style={{ color: "var(--flaash-amber)", marginBottom: 4 }}
              >
                {current.guestName}
              </p>
            )}
            {current.guestBlocked && (
              <p
                style={{
                  color: "#fca5a5",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Invité bloqué
              </p>
            )}
            <p style={{ color: "rgba(250,247,242,0.4)", fontSize: 12 }}>
              {fmtDate(current.taken_at)}
            </p>
            {current.guestId && (
              <button
                type="button"
                onClick={() => handleGuestBlockToggle(current)}
                disabled={isPending && pendingGuestId === current.guestId}
                style={{
                  marginTop: 14,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: current.guestBlocked
                    ? "1px solid rgba(250,247,242,0.22)"
                    : "1px solid rgba(248,113,113,0.36)",
                  background: current.guestBlocked
                    ? "rgba(250,247,242,0.08)"
                    : "rgba(127,29,29,0.42)",
                  color: "var(--flaash-cream)",
                  cursor: isPending && pendingGuestId === current.guestId ? "default" : "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  opacity: isPending && pendingGuestId === current.guestId ? 0.65 : 1,
                  textTransform: "uppercase",
                }}
              >
                {isPending && pendingGuestId === current.guestId
                  ? "Mise à jour..."
                  : current.guestBlocked
                    ? "Débloquer cet invité"
                    : "Bloquer cet invité"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
