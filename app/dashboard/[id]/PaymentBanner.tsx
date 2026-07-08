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
  const isCancelled  = searchParams.get("payment") === "cancelled";

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

  if (isCancelled && status === "draft") {
    return (
      <div className="dashboard-payment-banner dashboard-payment-banner-cancelled">
        <div>
          <p className="dashboard-payment-banner-title">
            Paiement non finalisé. Votre soirée est toujours en brouillon.
          </p>
          <p className="dashboard-payment-banner-text">
            Vous pouvez reprendre le paiement quand tout est prêt.
          </p>
        </div>
      </div>
    );
  }

  if (!isSuccess || dismissed) return null;

  if (status === "active") {
    return (
      <div className="dashboard-payment-banner dashboard-payment-banner-success">
        <p className="dashboard-payment-banner-title">
          Paiement reçu. Votre événement est actif.
        </p>
      </div>
    );
  }

  if (attempts >= 3) {
    return (
      <div className="dashboard-payment-banner dashboard-payment-banner-waiting">
        <p className="dashboard-payment-banner-text">
          Si votre événement n&apos;est pas encore actif dans quelques minutes, contactez-nous.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-payment-banner dashboard-payment-banner-waiting">
      <span className="dashboard-payment-spinner" aria-hidden="true" />
      <p className="dashboard-payment-banner-title">
        Paiement reçu. Activation en cours.
      </p>
    </div>
  );
}
