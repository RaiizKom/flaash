import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — Flaash",
  description: "Informations légales relatives au site et au service Flaash.",
};

const sections = [
  {
    title: "Éditeur et responsable",
    body: [
      "Le site Flaash est édité par Pedro Lopes, Suisse.",
      "Contact : hello@flaash.ch.",
      "Site principal : https://flaash.ch.",
    ],
  },
  {
    title: "Nature du service",
    body: [
      "Flaash est une web app d'appareil photo jetable digital pour événements.",
      "Les invités scannent un QR code, prennent des photos depuis leur navigateur mobile et les photos sont centralisées dans une galerie commune révélée à un moment choisi par l'organisateur.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "La marque Flaash, l'interface, les textes, les logos et les éléments visuels du service sont protégés et ne peuvent pas être réutilisés sans autorisation.",
      "Les photos envoyées dans un événement appartiennent aux personnes ou organisateurs concernés selon le contexte et les accords applicables à l'événement.",
    ],
  },
  {
    title: "Responsabilité",
    body: [
      "Flaash fournit le service avec soin et cherche à offrir une expérience fiable, simple et premium.",
      "L'organisateur reste responsable de l'usage de son événement, du partage du QR code, de l'information des invités et de l'accès donné à la galerie.",
      "Flaash ne peut pas garantir une disponibilité sans interruption ni l'absence totale d'erreurs techniques.",
    ],
  },
  {
    title: "Données et confidentialité",
    body: [
      "Les informations relatives aux données personnelles, aux photos et aux demandes de suppression sont détaillées dans la politique de confidentialité.",
    ],
  },
  {
    title: "Droit applicable",
    body: [
      "Ces mentions légales sont soumises au droit suisse.",
      "Ces informations pourront évoluer afin de refléter les améliorations du service ou les exigences applicables.",
    ],
  },
];

function LegalNav() {
  return (
    <nav
      aria-label="Navigation légale"
      style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}
    >
      <Link href="/" className="btn-text" style={{ padding: 0 }}>
        Retour à l&apos;accueil
      </Link>
      <Link href="/privacy" className="btn-text" style={{ padding: 0 }}>
        Confidentialité
      </Link>
      <Link href="/mentions-legales" className="btn-text" style={{ padding: 0, color: "var(--fg-3)" }}>
        Mentions légales
      </Link>
    </nav>
  );
}

export default function LegalNoticePage() {
  return (
    <main className="flaash-shell" style={{ background: "var(--flaash-cream)", minHeight: "100dvh" }}>
      <section style={{ padding: "44px 28px 28px" }}>
        <LegalNav />
        <p className="f-eyebrow" style={{ marginTop: 28 }}>Informations légales</p>
        <h1 className="f-h1" style={{ margin: "10px 0 18px" }}>
          Mentions légales
        </h1>
        <p style={{ color: "var(--fg-2)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Les informations ci-dessous présentent l'éditeur du site, la nature du service
          et les principales conditions d'utilisation de Flaash.
        </p>
      </section>

      <section style={{ padding: "8px 28px 44px", display: "flex", flexDirection: "column", gap: 24 }}>
        {sections.map((section) => (
          <article
            key={section.title}
            style={{
              borderTop: "1px solid var(--flaash-cream-line)",
              paddingTop: 22,
            }}
          >
            <h2 className="f-h3" style={{ margin: "0 0 10px" }}>
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  color: "var(--fg-2)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: "0 0 10px",
                }}
              >
                {paragraph}
              </p>
            ))}
            {section.title === "Données et confidentialité" ? (
              <Link
                href="/privacy"
                className="btn-text"
                style={{ color: "var(--flaash-amber-deep)", paddingLeft: 0 }}
              >
                Lire la politique de confidentialité
              </Link>
            ) : null}
          </article>
        ))}

        <LegalNav />
      </section>
    </main>
  );
}
