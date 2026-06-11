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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {activePhotos.map((photo, index) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                background: "var(--surface-2)",
              }}
            >
              {/* Thumbnail — opens lightbox */}
              <button
                type="button"
                onClick={() => setIdx(index)}
                style={{
                  display: "block", width: "100%", height: "100%",
                  padding: 0, border: "none", background: "none",
                  cursor: "zoom-in",
                }}
                aria-label="Agrandir la photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </button>

              {/* Delete */}
              <form
                action={deletePhoto.bind(null, photo.id, eventId)}
                style={{ position: "absolute", top: 4, right: 4 }}
              >
                <button
                  type="submit"
                  title="Supprimer"
                  style={{
                    background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", color: "white", fontSize: 18,
                  }}
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* ── Deleted grid ────────────────────────────────────────────────────── */}
      {deletedPhotos.length > 0 && (
        <>
          <p className="f-eyebrow" style={{ marginBottom: 12 }}>SUPPRIMÉES</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              opacity: 0.5,
            }}
          >
            {deletedPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: "relative", aspectRatio: "1",
                  borderRadius: "var(--radius-sm)", overflow: "hidden",
                  background: "var(--surface-2)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <form
                  action={restorePhoto.bind(null, photo.id, eventId)}
                  style={{ position: "absolute", bottom: 4, right: 4 }}
                >
                  <button
                    type="submit"
                    style={{
                      background: "rgba(0,0,0,0.55)", border: "none",
                      borderRadius: "var(--radius-sm)", padding: "3px 8px",
                      cursor: "pointer", color: "white", fontSize: 11, fontWeight: 600,
                    }}
                  >
                    Restaurer
                  </button>
                </form>
              </div>
            ))}
          </div>
        </>
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
