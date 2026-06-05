"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  status: string;
}

export default function PaymentBanner({ status }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const isSuccess    = searchParams.get("payment") === "success";

  const [attempts,  setAttempts]  = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isSuccess || dismissed) return;

    if (status === "active") {
      // Event is active — auto-dismiss after 5s
      const t = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(t);
    }

    // Event still draft — webhook hasn't fired yet
    if (attempts >= 3) return; // give up after 3 retries

    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      router.refresh();
    }, 3000);

    return () => clearTimeout(t);
  }, [isSuccess, status, attempts, dismissed, router]);

  if (!isSuccess || dismissed) return null;

  if (status === "active") {
    return (
      <div
        style={{
          background: "var(--flaash-forest-soft)",
          border: "1px solid var(--flaash-forest)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--flaash-forest)",
        }}
      >
        ✓ Paiement reçu — votre événement est actif !
      </div>
    );
  }

  if (attempts >= 3) {
    return (
      <div
        style={{
          background: "var(--flaash-amber-soft)",
          border: "1px solid var(--flaash-amber-deep)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 20,
          fontSize: 13,
          color: "var(--flaash-amber-deep)",
        }}
      >
        Si votre événement n&apos;est pas encore actif dans quelques minutes, contactez-nous.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--flaash-amber-soft)",
        border: "1px solid var(--flaash-amber-deep)",
        borderRadius: "var(--radius-sm)",
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: 14,
        fontWeight: 600,
        color: "var(--flaash-amber-deep)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid var(--flaash-amber-deep)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Paiement reçu — activation en cours…
    </div>
  );
}
