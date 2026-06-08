import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Flaash",
  description:
    "Informations sur la collecte, l'utilisation et la conservation des données dans Flaash.",
};

const sections = [
  {
    title: "Responsable du traitement",
    body: [
      "Le responsable du traitement est Pedro Lopes, Suisse.",
      "Pour toute question liée aux données personnelles ou à la suppression d'un contenu, vous pouvez écrire à hello@flaash.ch.",
    ],
  },
  {
    title: "Données collectées",
    body: [
      "Flaash collecte les informations nécessaires à la création et à la gestion d'un événement, notamment les informations de l'organisateur, les informations de l'événement, les photos envoyées par les invités, ainsi que le nom ou pseudo invité lorsque l'interface le demande.",
      "Le service traite aussi les données techniques nécessaires à son fonctionnement, à sa sécurité et à sa maintenance.",
      "Les paiements sont traités via Stripe. Flaash ne stocke pas les données de carte bancaire.",
    ],
  },
  {
    title: "Finalités",
    body: [
      "Les données sont utilisées pour créer et gérer les événements, permettre l'envoi, la modération, la révélation et le téléchargement des photos, gérer les paiements, assurer la sécurité du service et répondre aux demandes de support ou de suppression.",
    ],
  },
  {
    title: "Accès aux photos",
    body: [
      "Les photos peuvent être consultées par l'organisateur de l'événement et par les personnes ayant accès à la galerie après révélation.",
      "Flaash peut accéder aux contenus uniquement lorsque cela est nécessaire pour le support, la sécurité ou la maintenance du service.",
    ],
  },
  {
    title: "Conservation",
    body: [
      "Les photos et données associées sont conservées jusqu'à 90 jours après la révélation de la galerie ou après l'événement.",
      "Une suppression anticipée complète peut être demandée par l'organisateur.",
    ],
  },
  {
    title: "Suppression et droits",
    body: [
      "Les demandes peuvent être envoyées à hello@flaash.ch.",
      "L'organisateur peut demander la suppression complète d'un événement et des photos associées.",
      "Un invité peut demander la suppression d'une photo via l'organisateur ou en contactant directement Flaash.",
    ],
  },
  {
    title: "Hébergement et prestataires",
    body: [
      "Flaash s'appuie notamment sur Vercel pour l'hébergement, Supabase pour la base de données et l'authentification, Cloudflare R2 pour le stockage, Stripe pour les paiements et Resend pour les emails transactionnels prévus.",
    ],
  },
  {
    title: "Sécurité",
    body: [
      "Flaash met en place des mesures raisonnables pour protéger les données, limiter les accès et maintenir le bon fonctionnement du service.",
      "Aucun service en ligne ne peut toutefois garantir une sécurité absolue.",
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
      <Link href="/privacy" className="btn-text" style={{ padding: 0, color: "var(--fg-3)" }}>
        Confidentialité
      </Link>
      <Link href="/mentions-legales" className="btn-text" style={{ padding: 0 }}>
        Mentions légales
      </Link>
    </nav>
  );
}

export default function PrivacyPage() {
  return (
    <main className="flaash-shell" style={{ background: "var(--flaash-cream)", minHeight: "100dvh" }}>
      <section style={{ padding: "44px 28px 28px" }}>
        <LegalNav />
        <p className="f-eyebrow" style={{ marginTop: 28 }}>Confidentialité</p>
        <h1 className="f-h1" style={{ margin: "10px 0 18px" }}>
          Politique de confidentialité
        </h1>
        <p style={{ color: "var(--fg-2)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Cette page explique simplement comment Flaash traite les données liées aux événements,
          aux invités et aux photos. Ces informations pourront évoluer avec le service.
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
          </article>
        ))}

        <article style={{ borderTop: "1px solid var(--flaash-cream-line)", paddingTop: 22 }}>
          <h2 className="f-h3" style={{ margin: "0 0 10px" }}>Contact</h2>
          <p style={{ color: "var(--fg-2)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Pour toute demande :{" "}
            <a href="mailto:hello@flaash.ch" style={{ color: "var(--flaash-amber-deep)", fontWeight: 700 }}>
              hello@flaash.ch
            </a>
          </p>
        </article>

        <LegalNav />
      </section>
    </main>
  );
}
