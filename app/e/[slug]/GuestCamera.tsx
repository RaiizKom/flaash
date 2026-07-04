"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type Event } from "@/types";

interface GuestSession {
  token: string;
  guestId: string;
  photosTaken: number;
  firstName: string;
}

type Phase = "loading" | "join" | "camera" | "quota-full" | "blocked" | "revealed";

interface Toast {
  msg: string;
  ok: boolean;
}

interface UploadedPhoto {
  id: string;
  thumbnailUrl: string;
}

interface MyPhotoResponse {
  photos?: UploadedPhoto[];
}

const MAX_UPLOAD_BYTES = 25_000_000;
const CLIENT_IMAGE_MAX_DIMENSION = 2048;
const CLIENT_JPEG_QUALITY = 0.82;

function PrivacyNote() {
  return (
    <p className="guest-privacy">
      Tes photos restent liées à cet événement. Tu peux demander leur suppression à
      l&apos;organisateur ou à Flaash.{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noreferrer"
      >
        Confidentialité
      </Link>
    </p>
  );
}

function GalleryStatusNote({
  status,
  revealAt,
  variant = "light",
}: {
  status: Event["status"];
  revealAt: string | null;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const statusText =
    status === "revealed"
      ? "Galerie disponible"
      : isFutureReveal(revealAt)
        ? `Galerie révélée le ${formatRevealAt(revealAt)}`
        : "Galerie révélée au bon moment";

  return (
    <p className={`guest-status-pill${isDark ? " guest-status-pill-dark" : ""}`}>
      {statusText}
    </p>
  );
}

function HiddenPhotoGrid({
  photoCount,
  revealAt,
  variant = "light",
}: {
  photoCount: number;
  revealAt: string | null;
  variant?: "light" | "dark";
}) {
  if (photoCount <= 0) return null;

  const isDark = variant === "dark";
  const visibleCount = Math.min(photoCount, 12);
  const extraCount = photoCount - visibleCount;

  return (
    <div
      className={`guest-hidden-film${isDark ? " guest-hidden-film-dark" : ""}`}
    >
      <p
        className="guest-label"
        style={isDark ? { color: "rgb(250 247 242 / 0.62)" } : undefined}
      >
        Pellicule commune
      </p>
      <p
        style={{
          color: isDark ? "rgba(250,247,242,0.72)" : "var(--fg-3)",
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.45,
          margin: "0 0 12px",
        }}
      >
        Les photos sont cachées jusqu&apos;au reveal.
        {revealAt ? ` Reveal prévu le ${formatRevealAt(revealAt)}.` : ""}
      </p>
      <div
        aria-hidden="true"
        className="guest-hidden-film-grid"
      >
        {Array.from({ length: visibleCount }).map((_, index) => (
          <div
            key={index}
            className="guest-hidden-frame"
          />
        ))}
      </div>
      {extraCount > 0 && (
        <p
          style={{
            color: isDark ? "rgba(250,247,242,0.56)" : "var(--fg-3)",
            fontSize: 12,
            fontWeight: 700,
            marginTop: 10,
          }}
        >
          + {extraCount} autre{extraCount > 1 ? "s" : ""} souvenir{extraCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

async function compressImageForUpload(file: File): Promise<File> {
  const image = await loadImage(file);
  const scale = Math.min(1, CLIENT_IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", CLIENT_JPEG_QUALITY);
  });
  if (!blob) throw new Error("Compression impossible.");

  const compressedName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${compressedName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    image.src = url;
  });
}

export default function GuestCamera({ event, photoCount = 0 }: { event: Event; photoCount?: number }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<GuestSession | null>(null);
  const [firstName, setFirstName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [lastThumb, setLastThumb] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [collectivePhotoCount, setCollectivePhotoCount] = useState(photoCount);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null); // thumbnailUrl
  const fileRef = useRef<HTMLInputElement>(null);
  const storageKey = `flaash_guest_${event.slug}`;

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
    setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    setCollectivePhotoCount((count) => Math.max(count, photoCount));
  }, [photoCount]);

  // Restore session from localStorage on mount + fetch existing photos
  useEffect(() => {
    let mounted = true;
    async function restore() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const s = JSON.parse(raw) as GuestSession;
          if (mounted) {
            setSession(s);
            setPhase(s.photosTaken >= event.photos_per_guest ? "quota-full" : "camera");
          }
          const res = await fetch("/api/guests/my-photos", {
            headers: { Authorization: `Bearer ${s.token}` },
          });
          if (mounted && res.ok) {
            const data = (await res.json()) as MyPhotoResponse;
            setUploadedPhotos(data.photos ?? []);
          }
          return;
        }
      } catch {
        // corrupted — fall through to join
      }
      if (mounted) setPhase("join");
    }
    restore();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, event.photos_per_guest, event.id]);

  // Realtime: watch for event status → "revealed"
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`event-status-${event.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${event.id}` },
        (payload) => {
          if ((payload.new as { status: string }).status === "revealed") {
            setPhase("revealed");
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [event.id]);

  useEffect(() => {
    const revealAt = event.reveal_at;
    if (!isFutureReveal(revealAt) || event.status !== "active") return;

    const delay = new Date(revealAt).getTime() - Date.now();
    const timeout = window.setTimeout(() => {
      setPhase("revealed");
    }, Math.min(delay, 2_147_483_647));

    return () => window.clearTimeout(timeout);
  }, [event.reveal_at, event.status]);

  // ── Join ──────────────────────────────────────────────────────────────────

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || isJoining) return;
    setIsJoining(true);
    setJoinError("");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: event.slug, firstName: firstName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error ?? "Erreur inconnue.");
        return;
      }
      const sess: GuestSession = {
        token: data.token,
        guestId: data.guestId,
        photosTaken: data.photosTaken,
        firstName: firstName.trim(),
      };
      localStorage.setItem(storageKey, JSON.stringify(sess));
      setSession(sess);
      setPhase("camera");
    } catch {
      setJoinError("Erreur réseau. Réessaie.");
    } finally {
      setIsJoining(false);
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session || isUploading) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      showToast("Choisis une image valide.", false);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      showToast("Image trop lourde. Choisis une photo de moins de 25 MB.", false);
      return;
    }

    setIsUploading(true);
    const previewUrl = URL.createObjectURL(file);

    try {
      let uploadFile = file;
      try {
        uploadFile = await compressImageForUpload(file);
      } catch {
        uploadFile = file;
      }

      if (uploadFile.size > MAX_UPLOAD_BYTES) {
        showToast("Image trop lourde. Choisis une photo de moins de 25 MB.", false);
        return;
      }

      const fd = new FormData();
      fd.append("token", session.token);
      fd.append("file", uploadFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      let res: Response;
      try {
        res = await fetch("/api/upload", { method: "POST", body: fd, signal: controller.signal });
      } catch (err) {
        const isTimeout = err instanceof Error && err.name === "AbortError";
        showToast(isTimeout ? "Délai dépassé. Réessaie." : "Erreur réseau. Réessaie.", false);
        return;
      } finally {
        clearTimeout(timeoutId);
      }
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setPhase("quota-full");
          return;
        }
        if (res.status === 403) {
          setPhase("blocked");
          return;
        }
        showToast(data.error ?? "La photo n'a pas pu être envoyée.", false);
        return;
      }

      const newPhotosTaken = session.photosTaken + 1;
      const updated: GuestSession = { ...session, photosTaken: newPhotosTaken };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSession(updated);
      setLastThumb(previewUrl);
      // Track uploaded photo for carousel
      setUploadedPhotos((prev) => [...prev, { id: data.photoId, thumbnailUrl: data.thumbnailUrl }]);
      setCollectivePhotoCount((count) => count + 1);
      showToast("Photo enregistrée !");

      if (data.remainingShots === 0) {
        setTimeout(() => setPhase("quota-full"), 1400);
      }
    } finally {
      setIsUploading(false);
    }
  }

  // ── Delete own photo ─────────────────────────────────────────────────────

  async function handleDeletePhoto(photoId: string) {
    const token = session?.token;
    if (!token) return;
    const res = await fetch(`/api/photos/${photoId}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) {
      setUploadedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
    setDeleteConfirm(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="guest-page-center">
        <div style={{ ...spinner, borderTopColor: "var(--primary-action)" }} />
      </div>
    );
  }

  if (phase === "join") {
    return (
      <main className="guest-page">
        {event.cover_url && (
          <div style={{ marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.cover_url}
              alt=""
              className="guest-cover"
            />
          </div>
        )}

        <section className="guest-card guest-card-pad" style={{ marginTop: event.cover_url ? 0 : "auto" }}>
          <span className="guest-wordmark">Flaash</span>
          <p className="guest-label" style={{ marginTop: 26 }}>
            Vous êtes invité.
          </p>
          <h1 className="guest-title">
            {event.title}
          </h1>
          <p className="guest-copy">
            Ajoutez vos photos de la soirée. Les souvenirs se découvriront au
            bon moment.
          </p>
          <div style={{ marginTop: 14 }}>
            <GalleryStatusNote status={event.status} revealAt={event.reveal_at} />
          </div>
        </section>

        <form onSubmit={handleJoin} className="guest-form" style={{ marginTop: 26 }}>
          <div className="f-input-wrap">
            <label
              htmlFor="firstName"
              className="guest-label"
            >
              Comment tu t&apos;appelles ?
            </label>
            <input
              id="firstName"
              className={`f-input${joinError ? " error" : ""}`}
              placeholder="Ton prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              autoFocus
              maxLength={40}
            />
            {joinError && (
              <p style={{ fontSize: 13, color: "var(--flaash-error)", marginTop: 4 }}>
                {joinError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="flaash-btn flaash-btn-primary"
            disabled={!firstName.trim() || isJoining}
          >
            {isJoining ? "Préparation…" : "Participer à l'album"}
          </button>

          <PrivacyNote />
        </form>
      </main>
    );
  }

  if (phase === "blocked") {
    return (
      <div className="guest-page-center">
        <p className="guest-label">Accès bloqué</p>
        <h1 className="guest-title">Participation impossible</h1>
        <p className="guest-copy">
          Tu n&apos;as pas accès à cet événement.
        </p>
      </div>
    );
  }

  if (phase === "quota-full") {
    const taken = session?.photosTaken ?? event.photos_per_guest;
    return (
      <div className="guest-page-center guest-page-ink">
        <p className="guest-label">Merci, {session?.firstName ?? "invité"}</p>
        <h1 className="guest-title">
          Pellicule terminée
        </h1>
        <p className="guest-copy" style={{ maxWidth: 300, marginBottom: 20 }}>
          {taken} / {event.photos_per_guest} photos capturées. Toutes les poses ont été utilisées.
        </p>
        <GalleryStatusNote status={event.status} revealAt={event.reveal_at} variant="dark" />
        {event.status === "active" && (
          <HiddenPhotoGrid photoCount={collectivePhotoCount} revealAt={event.reveal_at} variant="dark" />
        )}

        {lastThumb && (
          <div
            className="polaroid"
            style={{ marginTop: 36, width: 140, transform: "rotate(-2deg)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastThumb}
              alt="Dernière photo"
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
      </div>
    );
  }

  if (phase === "revealed") {
    return (
      <div className="guest-page-center guest-page-ink">
          <p className="guest-label">Reveal</p>
          <h1 className="guest-title">
            La soirée revient.
          </h1>
          <p className="guest-copy" style={{ marginBottom: 34 }}>
            {event.title}
          </p>
          <Link
            href={`/e/${event.slug}/gallery`}
            className="flaash-btn flaash-btn-primary"
            style={{ width: "min(100%, 280px)" }}
          >
            Voir la galerie
          </Link>
      </div>
    );
  }

  // ── Camera phase ──────────────────────────────────────────────────────────

  const taken = session?.photosTaken ?? 0;
  const total = event.photos_per_guest;
  const remaining = total - taken;
  const pct = (taken / total) * 100;

  return (
    <main className="guest-page">
      {/* Event hub header */}
      <div style={{ marginBottom: 14 }}>
        {event.cover_url && (
          <div style={{ marginBottom: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.cover_url}
              alt=""
              className="guest-cover"
            />
          </div>
        )}
        <p className="guest-label">
          Vous êtes invité.
        </p>
        <h1 className="guest-title">
          {event.title}
        </h1>
        {session?.firstName && (
          <p className="guest-copy" style={{ marginBottom: 12 }}>
            Connecté en tant que {session.firstName}
          </p>
        )}
        <div>
          <GalleryStatusNote status={event.status} revealAt={event.reveal_at} />
        </div>
      </div>

      {/* Quota card */}
      <div
        className="guest-card guest-progress-card"
      >
        <div className="guest-progress-row">
          <div style={{ minWidth: 0 }}>
            <p className="guest-label">
              Pellicule
            </p>
            <p className="guest-progress-value">
              {taken} / {total} photos
            </p>
            <p className="guest-progress-meta">
              {remaining === 0
                ? "Toutes les poses ont été utilisées"
                : `${remaining} pose${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
            </p>
          </div>

          <p className="guest-progress-badge">
            {remaining === 0 ? "Terminée" : "En cours"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="guest-progress-track">
          <div
            className="guest-progress-fill"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? "var(--text-muted)" : undefined,
            }}
          />
        </div>
      </div>

      {/* Camera button area */}
      <div className="guest-capture-stage">
        <div style={{ textAlign: "center" }}>
          <p className="guest-label">
            Appareil photo
          </p>
          <p className="guest-copy" style={{ margin: 0 }}>
            Prends une photo, puis reviens à la soirée.
          </p>
        </div>

        {/* Last photo preview */}
        {lastThumb && (
          <div
            className="polaroid"
            style={{
              width: 100,
              transform: "rotate(-3deg)",
              animation: "pop 0.35s var(--ease-spring)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastThumb}
              alt="Dernière photo"
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Shutter button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          aria-label="Prendre une photo"
          className="guest-shutter"
        >
          {isUploading ? (
            <div style={{ ...spinner, borderTopColor: "var(--flaash-cream)" }} />
          ) : (
            <CameraIcon />
          )}
        </button>

        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {isUploading ? "Envoi en cours…" : "Prendre une photo"}
        </p>
        {event.allow_library_upload && (
          <p className="guest-copy" style={{ margin: 0, maxWidth: 260, fontSize: 12, textAlign: "center" }}>
            Tu peux aussi ajouter une photo depuis ta photothèque.
          </p>
        )}

      </div>

      {/* ── Carrousel photos prises ─────────────────────────────────────── */}
      {uploadedPhotos.length > 0 && (
        <div className="guest-card guest-uploaded-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
            <p className="guest-label" style={{ margin: 0 }}>
              Mes souvenirs
            </p>
            <span style={{ color: "var(--fg-3)", fontSize: 12, fontWeight: 700 }}>
              {uploadedPhotos.length}
            </span>
          </div>
          <div className="guest-photo-strip">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="guest-photo-thumb"
              >
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(photo.thumbnailUrl)}
                  className="guest-thumb-button"
                  aria-label="Agrandir"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(photo.id)}
                  className="guest-delete-dot"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {event.status === "active" && (
        <HiddenPhotoGrid photoCount={collectivePhotoCount} revealAt={event.reveal_at} />
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        {...(event.allow_library_upload ? {} : { capture: "environment" as const })}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div style={{ marginTop: uploadedPhotos.length > 0 ? 22 : 0 }}>
        <PrivacyNote />
      </div>

      {/* Lightbox plein écran pour les miniatures */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxPhoto(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,8,5,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            aria-label="Fermer"
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(250,247,242,0.1)", border: "none",
              borderRadius: "50%", width: 40, height: 40,
              color: "var(--flaash-cream)", fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxPhoto}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw", maxHeight: "88dvh",
              objectFit: "contain", borderRadius: 6,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="guest-modal-backdrop"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="guest-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="guest-label">Supprimer</p>
            <h2 style={{ color: "var(--foreground)", fontSize: 22, marginBottom: 8 }}>
              Supprimer cette photo ?
            </h2>
            <p className="guest-copy" style={{ fontSize: 14, marginBottom: 24 }}>
              Cette photo sera supprimée, mais elle comptera toujours dans ta pellicule.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border)", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Annuler
              </button>
              <button onClick={() => handleDeletePhoto(deleteConfirm)} style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "none", background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="f-toast"
          data-hidden={String(!toastVisible)}
          style={
            toast.ok
              ? {}
              : { background: "var(--flaash-error)" }
          }
        >
          <span style={{ fontSize: 16 }}>{toast.ok ? "✓" : "✗"}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.6) rotate(-3deg); opacity: 0; }
          70%  { transform: scale(1.08) rotate(-3deg); }
          100% { transform: scale(1) rotate(-3deg); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--primary-action-text)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function isFutureReveal(revealAt: string | null): revealAt is string {
  return !!revealAt && new Date(revealAt).getTime() > Date.now();
}

function formatRevealAt(revealAt: string) {
  return new Date(revealAt).toLocaleString("fr-CH", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

const spinner: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "3px solid rgba(255,255,255,0.25)",
  borderTop: "3px solid var(--flaash-cream)",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
