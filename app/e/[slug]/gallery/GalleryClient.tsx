"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface GalleryPhoto {
  id: string;
  storage_url: string;
  thumbnail_url: string;
  taken_at: string;
  guest_id: string;
  guestName: string | null;
}

interface Props {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  photos: GalleryPhoto[];
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  idx,
  onClose,
  onPrev,
  onNext,
}: {
  photos: GalleryPhoto[];
  idx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = photos[idx];
  const touchX = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-CH", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,8,5,0.97)", display: "flex", flexDirection: "column" }}
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const d = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(d) > 48) { d < 0 ? onNext() : onPrev(); }
      }}
    >
      {/* Top bar */}
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ color: "rgba(250,247,242,0.35)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>
          {idx + 1} / {photos.length}
        </span>
        <button onClick={onClose} style={{ background: "rgba(250,247,242,0.08)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "var(--flaash-cream)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Fermer">✕</button>
      </div>

      {/* Photo + arrows */}
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onPrev} disabled={idx === 0} aria-label="Précédent" style={{ position: "absolute", left: 12, zIndex: 1, background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.15)", borderRadius: "50%", width: 44, height: 44, color: "var(--flaash-cream)", fontSize: 24, cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.2 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}>‹</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={current.id} src={current.storage_url} alt="" style={{ maxWidth: "min(88vw,820px)", maxHeight: "calc(100dvh - 148px)", objectFit: "contain", borderRadius: 6, display: "block", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} />
        <button onClick={onNext} disabled={idx === photos.length - 1} aria-label="Suivant" style={{ position: "absolute", right: 12, zIndex: 1, background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.15)", borderRadius: "50%", width: 44, height: 44, color: "var(--flaash-cream)", fontSize: 24, cursor: idx === photos.length - 1 ? "default" : "pointer", opacity: idx === photos.length - 1 ? 0.2 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}>›</button>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "16px 24px 24px", flexShrink: 0, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        {current.guestName && (
          <p className="f-eyebrow" style={{ color: "var(--flaash-amber)", marginBottom: 4 }}>{current.guestName}</p>
        )}
        <p style={{ color: "rgba(250,247,242,0.4)", fontSize: 12 }}>{fmtDate(current.taken_at)}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GalleryClient({ eventId, eventSlug, eventTitle, photos: initialPhotos }: Props) {
  const router = useRouter();
  const [photos, setPhotos]         = useState(initialPhotos);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [guestId, setGuestId]       = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // photo id pending confirm

  // Read guest session from localStorage — key: flaash_guest_<slug>
  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(`flaash_guest_${eventSlug}`);
      console.log("[gallery] localStorage key:", `flaash_guest_${eventSlug}`);
      console.log("[gallery] raw session:", sessionRaw);
      if (sessionRaw) {
        const s = JSON.parse(sessionRaw) as { guestId: string };
        console.log("[gallery] guestId:", s.guestId);
        console.log("[gallery] photo guest_ids:", photos.map((p) => p.guest_id));
        setGuestId(s.guestId);
      } else {
        console.log("[gallery] no session found for slug:", eventSlug);
      }
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug]); // photos intentionally excluded — stable initial value

  // BUG 2: Realtime — watch event status changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`gallery-event-${eventId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${eventId}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          if (newStatus === "revealed") router.refresh();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId, router]);

  // Lightbox navigation
  const total = photos.length;
  const prev  = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next  = useCallback(() => setLightboxIdx((i) => (i !== null && i < total - 1 ? i + 1 : i)), [total]);
  const close = useCallback(() => setLightboxIdx(null), []);

  // BUG 4: Download all as ZIP
  async function handleDownload() {
    if (isDownloading || photos.length === 0) return;
    setIsDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      await Promise.all(
        photos.map(async (p, i) => {
          const res = await fetch(p.storage_url);
          const buf = await res.arrayBuffer();
          const ext = p.storage_url.split(".").pop()?.split("?")[0] ?? "jpg";
          zip.file(`photo-${String(i + 1).padStart(3, "0")}.${ext}`, buf);
        })
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${eventSlug}-photos.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  // FEATURE 7: Delete own photo
  async function handleDelete(photoId: string) {
    const raw = localStorage.getItem(`flaash_guest_${eventSlug}`);
    if (!raw) return;
    const { token } = JSON.parse(raw) as { token: string };

    const res = await fetch(`/api/photos/${photoId}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (lightboxIdx !== null) {
        // adjust index if deleted photo was at or before current
        setLightboxIdx((i) => {
          if (i === null) return null;
          const newTotal = photos.length - 1;
          if (newTotal === 0) return null;
          return Math.min(i, newTotal - 1);
        });
      }
    }
    setDeleteConfirm(null);
  }

  return (
    <>
      {/* Actions bar */}
      {photos.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              background: "rgba(250,247,242,0.08)",
              border: "1px solid rgba(250,247,242,0.2)",
              borderRadius: "var(--radius-pill)",
              color: "var(--flaash-cream)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "10px 18px",
              cursor: isDownloading ? "default" : "pointer",
              opacity: isDownloading ? 0.6 : 1,
            }}
          >
            {isDownloading ? "PRÉPARATION…" : "⬇ TOUT TÉLÉCHARGER"}
          </button>
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <p style={{ fontSize: 40 }}>📷</p>
          <p style={{ color: "rgba(250,247,242,0.5)", fontSize: 14, marginTop: 12 }}>
            Aucune photo pour l&apos;instant.
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 4, overflow: "hidden", background: "rgba(250,247,242,0.05)" }}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxIdx(index); }}
                style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
                aria-label="Agrandir"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail_url || photo.storage_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                />
              </button>

              {/* FEATURE 7: Delete button for own photos only */}
              {guestId && photo.guest_id === guestId && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(photo.id)}
                  title="Supprimer ma photo"
                  style={{
                    position: "absolute", bottom: 4, right: 4,
                    background: "rgba(0,0,0,0.6)", border: "none",
                    borderRadius: "50%", width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "white", fontSize: 13,
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox photos={photos} idx={lightboxIdx} onClose={close} onPrev={prev} onNext={next} />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(10,8,5,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{ background: "var(--flaash-cream)", borderRadius: "var(--radius-xl)", padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Supprimer cette photo ?</p>
            <p style={{ color: "var(--fg-3)", fontSize: 14, marginBottom: 24 }}>Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border)", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "none", background: "var(--flaash-error, #e53e3e)", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
