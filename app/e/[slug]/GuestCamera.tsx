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

function PrivacyNote() {
  return (
    <p
      style={{
        color: "var(--fg-3)",
        fontSize: 12,
        lineHeight: 1.55,
        margin: 0,
        textAlign: "center",
      }}
    >
      Tes photos restent liées à cet événement. Tu peux demander leur suppression à
      l&apos;organisateur ou à Flaash.{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noreferrer"
        style={{
          color: "var(--flaash-amber-deep)",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Confidentialité
      </Link>
    </p>
  );
}

function RevealScheduleNote({
  revealAt,
  variant = "light",
}: {
  revealAt: string | null;
  variant?: "light" | "dark";
}) {
  if (!isFutureReveal(revealAt)) return null;

  return (
    <p
      style={{
        color: variant === "dark" ? "rgba(250,247,242,0.58)" : "var(--fg-3)",
        fontSize: 13,
        lineHeight: 1.5,
        margin: 0,
        textAlign: "center",
      }}
    >
      La galerie sera révélée le {formatRevealAt(revealAt)}.
    </p>
  );
}

export default function GuestCamera({ event }: { event: Event }) {
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
          // Fetch this guest's existing photos via Supabase anon client
          const supabase = createClient();
          const { data: rows } = await supabase
            .from("photos")
            .select("id, thumbnail_url")
            .eq("event_id", event.id)
            .eq("guest_id", s.guestId)
            .eq("is_deleted", false)
            .order("taken_at", { ascending: true });
          if (mounted && rows) {
            setUploadedPhotos(rows.map((r) => ({ id: r.id, thumbnailUrl: r.thumbnail_url })));
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

    setIsUploading(true);
    const previewUrl = URL.createObjectURL(file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const fd = new FormData();
      fd.append("token", session.token);
      fd.append("file", file);

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
        showToast(data.error ?? "Erreur d'upload.", false);
        return;
      }

      const newPhotosTaken = session.photosTaken + 1;
      const updated: GuestSession = { ...session, photosTaken: newPhotosTaken };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSession(updated);
      setLastThumb(previewUrl);
      // Track uploaded photo for carousel
      setUploadedPhotos((prev) => [...prev, { id: data.photoId, thumbnailUrl: data.thumbnailUrl }]);
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
      const newCount = Math.max(0, (session?.photosTaken ?? 1) - 1);
      const updated: GuestSession = { ...session!, photosTaken: newCount };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSession(updated);
    }
    setDeleteConfirm(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div style={centered}>
        <div style={spinner} />
      </div>
    );
  }

  if (phase === "join") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "0 24px 40px",
        }}
      >
        {/* Hero */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 64,
            paddingBottom: 32,
          }}
        >
          <p
            className="f-script"
            style={{
              color: "var(--flaash-amber)",
              fontSize: 36,
              marginBottom: 10,
              lineHeight: 1,
            }}
          >
            flaash —
          </p>
          <h1
            className="f-h1"
            style={{ marginBottom: 6, lineHeight: 1.04 }}
          >
            {event.title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--fg-3)",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            Capture l&apos;instant, partage le souvenir.
          </p>
          <div style={{ marginTop: 14 }}>
            <RevealScheduleNote revealAt={event.reveal_at} />
          </div>
        </div>

        {/* Join form */}
        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="f-input-wrap">
            <label
              htmlFor="firstName"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg-3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
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
            className="btn-pill btn-forest"
            disabled={!firstName.trim() || isJoining}
          >
            {isJoining ? "Inscription…" : "REJOINDRE →"}
          </button>

          <PrivacyNote />
        </form>
      </div>
    );
  }

  if (phase === "blocked") {
    return (
      <div style={centered}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>🚫</p>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Accès bloqué</p>
        <p style={{ color: "var(--fg-3)", fontSize: 14, textAlign: "center" }}>
          Tu n&apos;as pas accès à cet événement.
        </p>
      </div>
    );
  }

  if (phase === "quota-full") {
    const taken = session?.photosTaken ?? event.photos_per_guest;
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
          background: "var(--flaash-forest)",
          color: "var(--flaash-cream)",
        }}
      >
        <p
          className="f-script"
          style={{ fontSize: 36, color: "var(--flaash-amber)", marginBottom: 16 }}
        >
          merci, {session?.firstName ?? "invité"} —
        </p>
        <h2
          className="f-h2"
          style={{ color: "var(--flaash-cream)", marginBottom: 12 }}
        >
          {taken} photo{taken > 1 ? "s" : ""} capturée{taken > 1 ? "s" : ""}
        </h2>
        <p style={{ color: "rgba(250,247,242,0.65)", fontSize: 14, maxWidth: 280, marginBottom: 20 }}>
          Tu as utilisé toutes tes photos pour cet événement.
        </p>
        <RevealScheduleNote revealAt={event.reveal_at} variant="dark" />

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
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "var(--flaash-ink)",
        }}
      >
        <div style={{ height: 6, background: "var(--flaash-amber)", flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 28px",
            textAlign: "center",
          }}
        >
          <p className="f-script" style={{ color: "var(--flaash-amber)", fontSize: 28, marginBottom: 16, lineHeight: 1 }}>
            vos souvenirs sont développés.
          </p>
          <h1 className="f-display" style={{ color: "var(--flaash-cream)", fontSize: "clamp(28px,8vw,48px)", marginBottom: 8, lineHeight: 1.1 }}>
            La galerie est disponible&nbsp;!
          </h1>
          <p style={{ color: "rgba(250,247,242,0.45)", fontSize: 14, fontWeight: 500, marginBottom: 40 }}>
            {event.title}
          </p>
          <Link
            href={`/e/${event.slug}/gallery`}
            style={{
              display: "inline-block",
              padding: "14px 28px",
              background: "var(--flaash-cream)",
              color: "var(--flaash-ink)",
              borderRadius: "var(--radius-pill)",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.08em",
              textDecoration: "none",
              maxWidth: 280,
              width: "100%",
              textAlign: "center",
            }}
          >
            VOIR LA GALERIE →
          </Link>
        </div>
      </div>
    );
  }

  // ── Camera phase ──────────────────────────────────────────────────────────

  const taken = session?.photosTaken ?? 0;
  const total = event.photos_per_guest;
  const remaining = total - taken;
  const pct = (taken / total) * 100;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "28px 24px 48px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <p className="f-eyebrow" style={{ marginBottom: 4 }}>
          {event.title}
        </p>
        {session?.firstName && (
          <p style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 500 }}>
            Bonjour, {session.firstName} 👋
          </p>
        )}
        <div style={{ marginTop: 10 }}>
          <RevealScheduleNote revealAt={event.reveal_at} />
        </div>
      </div>

      {/* Quota card */}
      <div
        className="f-card"
        style={{ padding: "20px 20px 16px", marginBottom: 32, marginTop: 12 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 44,
                lineHeight: 1,
                color: remaining === 0 ? "var(--fg-3)" : "var(--fg)",
              }}
            >
              {remaining}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 18,
                color: "var(--fg-3)",
              }}
            >
              / {total}
            </span>
          </div>
          <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 600 }}>
            PHOTOS RESTANTES
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "var(--flaash-cream-line)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct >= 100 ? "var(--fg-3)" : "var(--flaash-forest)",
              borderRadius: 2,
              transition: "width 0.4s var(--ease-out)",
            }}
          />
        </div>
      </div>

      {/* Camera button area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
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
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: isUploading ? "var(--fg-3)" : "var(--flaash-forest)",
            border: "none",
            cursor: isUploading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-lg)",
            transition: "transform var(--t-fast) var(--ease-out), background var(--t-fast)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "scale(0.93)")
          }
          onMouseUp={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
          onTouchStart={(e) =>
            (e.currentTarget.style.transform = "scale(0.93)")
          }
          onTouchEnd={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
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
            color: "var(--fg-3)",
          }}
        >
          {isUploading ? "Envoi en cours…" : "PRENDRE UNE PHOTO"}
        </p>

      </div>

      {/* ── Carrousel photos prises ─────────────────────────────────────── */}
      {uploadedPhotos.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 10 }}>
            Mes photos ({uploadedPhotos.length})
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{ position: "relative", flexShrink: 0, width: 80, height: 80, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--surface-2)" }}
              >
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(photo.thumbnailUrl)}
                  style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
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
                  style={{
                    position: "absolute", top: 3, right: 3,
                    background: "rgba(220,38,38,0.85)",
                    border: "none", borderRadius: "50%",
                    width: 22, height: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "white", fontSize: 12, lineHeight: 1,
                  }}
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
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
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,8,5,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{ background: "var(--flaash-cream)", borderRadius: "var(--radius-xl)", padding: "28px 24px", maxWidth: 300, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Supprimer cette photo ?</p>
            <p style={{ color: "var(--fg-3)", fontSize: 14, marginBottom: 24 }}>Cette action est irréversible.</p>
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
    </div>
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
      stroke="var(--flaash-cream)"
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

const centered: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
  textAlign: "center",
};

const spinner: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "3px solid rgba(255,255,255,0.25)",
  borderTop: "3px solid var(--flaash-cream)",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
