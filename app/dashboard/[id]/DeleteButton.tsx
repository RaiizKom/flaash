"use client";

import { useState } from "react";
import { deleteEvent } from "./actions";

export default function DeleteButton({ eventId }: { eventId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    await deleteEvent(eventId); // redirects on success
    setIsPending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="dashboard-delete-button"
      >
        Supprimer l&apos;événement
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(10,8,5,0.82)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => !isPending && setShowModal(false)}
        >
          <div
            style={{
              background: "var(--flaash-cream)",
              borderRadius: "var(--radius-xl)",
              padding: "28px 24px",
              maxWidth: 320,
              width: "100%",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Supprimer cet événement ?
            </p>
            <p style={{ color: "var(--fg-3)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Cette action est irréversible. Toutes les photos seront définitivement supprimées.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border)", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-pill)", border: "none", background: "#dc2626", color: "white", cursor: isPending ? "default" : "pointer", fontWeight: 700, fontSize: 13, opacity: isPending ? 0.6 : 1 }}
              >
                {isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
