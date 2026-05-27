"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { type Event } from "@/types";

interface GuestSession {
  token: string;
  guestId: string;
  photosTaken: number;
  firstName: string;
}

type Phase = "loading" | "join" | "camera" | "quota-full" | "blocked";

interface Toast {
  msg: string;
  ok: boolean;
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
  const fileRef = useRef<HTMLInputElement>(null);
  const storageKey = `flaash_guest_${event.slug}`;

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw) as GuestSession;
        setSession(s);
        setPhase(s.photosTaken >= event.photos_per_guest ? "quota-full" : "camera");
        return;
      }
    } catch {
      // corrupted — fall through to join
    }
    setPhase("join");
  }, [storageKey, event.photos_per_guest]);

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

    try {
      const fd = new FormData();
      fd.append("token", session.token);
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
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
      showToast("Photo enregistrée !");

      if (data.remainingShots === 0) {
        setTimeout(() => setPhase("quota-full"), 1400);
      }
    } catch {
      showToast("Erreur réseau. Réessaie.", false);
    } finally {
      setIsUploading(false);
    }
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
        <p style={{ color: "rgba(250,247,242,0.65)", fontSize: 14, maxWidth: 280 }}>
          Tu as utilisé toutes tes photos pour cet événement.
          La galerie sera révélée bientôt.
        </p>

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

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        {...(event.allow_library_upload ? {} : { capture: "environment" as const })}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

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
