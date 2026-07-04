import Link from "next/link";
import Image from "next/image";
import { PLANS } from "@/lib/utils/pricing";

const PUBLIC_PLANS = PLANS.filter((p) => p.id !== "test");
const MIN_PRICE = Math.min(...PUBLIC_PLANS.map((p) => p.price));

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Scannez",
    body: "Un QR code posé sur la table, prêt à être partagé.",
  },
  {
    n: "02",
    title: "Capturez",
    body: "Les invités prennent les moments vrais, sans app à installer.",
  },
  {
    n: "03",
    title: "Découvrez ensemble",
    body: "Les photos restent cachées jusqu'au moment choisi.",
  },
];

const EVENT_TYPES: { label: string; featured: boolean }[] = [
  { label: "Mariage", featured: true },
  { label: "Anniversaire", featured: false },
  { label: "Soirée privée", featured: false },
  { label: "Équipe", featured: false },
  { label: "Baby shower", featured: false },
  { label: "Retraite", featured: false },
];

const PLAN_FEATURES: Record<string, string[]> = {
  essential: [
    "Jusqu'à 50 invités",
    "Même rituel Flaash",
    "QR code prêt à partager",
    "Photos cachées jusqu'au reveal",
    "Galerie privée",
    "Export des souvenirs inclus",
  ],
  classic: [
    "Jusqu'à 120 invités",
    "Même rituel Flaash",
    "QR code prêt à partager",
    "Photos cachées jusqu'au reveal",
    "Galerie privée",
    "Export des souvenirs inclus",
  ],
  premium: [
    "Jusqu'à 250 invités",
    "Même rituel Flaash",
    "QR code prêt à partager",
    "Photos cachées jusqu'au reveal",
    "Galerie privée",
    "Export des souvenirs inclus",
  ],
};

const FAQ = [
  {
    q: "Les invités doivent-ils installer une app ?",
    a: "Non. Ils scannent le QR code et prennent leurs photos depuis leur navigateur. Rien à installer, aucun compte à créer.",
  },
  {
    q: "C'est quoi, le reveal ?",
    a: "Le reveal, c'est le moment où les photos deviennent visibles. Vous choisissez l'heure, ou vous l'ouvrez manuellement quand la soirée peut revenir.",
  },
  {
    q: "Combien d'invités peuvent participer ?",
    a: "De 50 à 250 invités selon le format choisi. Pour une soirée plus grande, écrivez-nous à hello@flaash.ch.",
  },
  {
    q: "Est-ce que je récupère toutes les photos ?",
    a: "Oui. Téléchargement complet des souvenirs après l'événement, prêts à conserver.",
  },
  {
    q: "Que se passe-t-il si un invité envoie une photo inappropriée ?",
    a: "Vous gardez la main. Un souvenir peut être mis de côté et un invité mis à l'écart si nécessaire.",
  },
  {
    q: "Le paiement est-il unique ?",
    a: "Oui. Vous payez une seule fois par événement. Aucun abonnement, aucun frais récurrent.",
  },
];

const PLAN_NOTES: Record<string, string> = {
  essential: "Format intime, jusqu'à 50 invités.",
  classic: "Format intermédiaire, jusqu'à 120 invités.",
  premium: "Grand format, jusqu'à 250 invités.",
};

export default function LandingPage() {
  return (
    <div style={{ background: "var(--flaash-cream)", overflowX: "hidden" }}>

      {/* ── Nav ── */}
      <nav className="landing-nav" aria-label="Navigation principale">
        <div className="landing-nav-inner">
          <span className="landing-wordmark">Flaash</span>
          <div className="landing-nav-actions">
            <Link href="#comment-ca-marche" className="landing-nav-link landing-nav-how">
              Comment ça marche
            </Link>
            <Link href="/login" className="landing-nav-link">
              Connexion
            </Link>
            <Link
              href="/register"
              className="flaash-btn flaash-btn-primary landing-nav-cta"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="flaash-label landing-fadein">
              L&apos;appareil photo jetable collectif
            </p>

            <h1 className="landing-hero-title landing-fadein">
              La soirée se vit maintenant. Les souvenirs se découvrent plus tard.
            </h1>

            <p className="landing-hero-subtitle landing-fadein">
              Flaash transforme vos invités en photographes d&apos;un soir. Ils scannent un QR code, capturent les moments vrais, puis découvrent la galerie au moment choisi.
            </p>

            <div className="landing-hero-actions landing-fadein">
              <Link href="/register" className="flaash-btn flaash-btn-primary">
                Créer un événement
              </Link>
              <Link href="#comment-ca-marche" className="flaash-btn flaash-btn-ghost">
                Voir comment ça marche
              </Link>
            </div>
          </div>

          <div className="landing-hero-media flaash-photo-grain">
            <Image
              src="/images/landing/hero-event-memory.webp"
              alt="Des invités partagent un moment chaleureux autour d'une table pendant une soirée."
              fill
              priority
              quality={84}
              sizes="(max-width: 900px) calc(100vw - 40px), 42vw"
              className="landing-hero-photo"
            />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="landing-trust" aria-label="Les garanties Flaash">
        <ul className="landing-trust-list">
          {[
            "Zéro app à installer",
            "QR code prêt à partager",
            "Photos cachées jusqu'au reveal",
            "Galerie privée",
            "Export des souvenirs",
          ].map((item) => (
            <li key={item} className="landing-trust-item">
              <span className="landing-trust-dot" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="landing-ritual flaash-section">
        <div className="landing-section-inner">
          <div className="landing-section-heading">
            <p className="flaash-label">Comment ça marche</p>
            <h2>Trois gestes. Puis on revient à la soirée.</h2>
          </div>

          <div className="landing-ritual-layout">
            <ol className="landing-ritual-steps">
              {HOW_IT_WORKS.map(({ n, title, body }) => (
                <li key={n} className="landing-ritual-step">
                  <span className="landing-ritual-number">{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="landing-scan-media flaash-photo-grain">
              <Image
                src="/images/landing/scan-qr-table.webp"
                alt="Une carte QR Flaash posée sur une table de soirée pendant qu'un invité la scanne."
                fill
                quality={84}
                sizes="(max-width: 900px) calc(100vw - 40px), 44vw"
                className="landing-scan-photo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pendant la soirée ── */}
      <section className="landing-presence flaash-section">
        <div className="landing-section-inner landing-story-layout">
          <div className="landing-capture-media flaash-photo-grain">
            <Image
              src="/images/landing/capture-party-moment.webp"
              alt="Des invités vivent un moment spontané pendant qu'une personne capture naturellement la scène avec son téléphone."
              fill
              quality={84}
              sizes="(max-width: 900px) calc(100vw - 40px), 40vw"
              className="landing-capture-photo"
            />
          </div>

          <div className="landing-story-copy">
            <p className="flaash-label">Pendant la soirée</p>
            <h2>Pendant la soirée, personne ne doit gérer l&apos;album.</h2>
            <p>
              Les invités capturent ce qu&apos;ils voient : les rires, les détails, les angles imparfaits, les moments qu&apos;un photographe ne peut pas toujours saisir.
            </p>
            <strong>Une photo. Puis on revient à la soirée.</strong>
          </div>
        </div>
      </section>

      {/* ── Le moment de la révélation ── */}
      <section className="landing-reveal flaash-section flaash-section-ink">
        <div className="landing-section-inner landing-reveal-layout">
          <div className="landing-reveal-copy">
            <p className="flaash-label">Le moment du reveal</p>
            <h2>Puis la soirée revient.</h2>
            <p>
              Au moment choisi, la galerie s&apos;ouvre. Les souvenirs apparaissent à travers les yeux de ceux qui étaient vraiment là.
            </p>
            <blockquote>Un même moment, redécouvert à travers tous les regards.</blockquote>
          </div>

          <div className="landing-reveal-media flaash-photo-grain">
            <Image
              src="/images/landing/reveal-phone-group.webp"
              alt="Un groupe d'invités redécouvre ensemble les photos d'une soirée sur un téléphone."
              fill
              quality={84}
              sizes="(max-width: 900px) calc(100vw - 40px), 44vw"
              className="landing-reveal-photo"
            />
          </div>
        </div>
      </section>

      {/* ── Pour quels événements ── */}
      <section className="landing-events-transition flaash-section">
        <div className="landing-section-inner">
          <div className="landing-section-heading landing-events-heading">
            <p className="flaash-label">Pour toutes les façons de se retrouver</p>
            <h2>Chaque événement a ses regards. Flaash les réunit.</h2>
          </div>

          <div className="landing-event-types">
            {EVENT_TYPES.map(({ label }) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <p className="landing-events-contact">
            Plus de 250 invités ? Contactez-nous à{" "}
            <a href="mailto:hello@flaash.ch">hello@flaash.ch</a>
          </p>
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section id="tarifs" className="landing-pricing flaash-section-ink">
        <div className="landing-section-inner">
          <div className="landing-pricing-heading">
            <p className="flaash-label">Tarifs</p>
            <h2>Un prix simple par événement.</h2>
            <p>
              Choisissez selon la taille de votre événement. Même rituel Flaash,
              format adapté. Aucun abonnement.
            </p>
          </div>

          <div className="landing-pricing-grid">
          {PUBLIC_PLANS.map((plan) => {
            const planFeatures = PLAN_FEATURES[plan.id] ?? [];
            return (
              <div
                key={plan.id}
                className="landing-pricing-card"
              >
                <p className="landing-pricing-plan">{plan.label}</p>
                <p className="landing-pricing-note">{PLAN_NOTES[plan.id]}</p>

                <div className="landing-pricing-price">
                  {plan.price}
                  <span>CHF</span>
                </div>

                <p className="landing-pricing-period">par événement</p>

                <ul className="landing-pricing-features">
                  {planFeatures.map((f) => (
                    <li key={f}>
                      <span aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="flaash-btn flaash-btn-primary landing-pricing-cta"
                >
                  Choisir ce format
                </Link>
              </div>
            );
          })}
          </div>

          <p className="landing-pricing-proof">
            Dès CHF {MIN_PRICE}.– par événement. Paiement unique, export inclus,
            aucun abonnement. Plus de 250 invités ?{" "}
            <a href="mailto:hello@flaash.ch">Contactez-nous</a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-faq-section flaash-section">
        <div className="landing-section-inner landing-faq-layout">
          <div className="landing-faq-heading">
            <p className="flaash-label">Questions fréquentes</p>
            <h2>Simple à lancer. Clair pour vos invités.</h2>
            <p>
              Les détails pratiques restent discrets. Le rituel, lui, reste
              facile à comprendre.
            </p>
          </div>

          <div className="landing-faq">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="landing-faq-item">
              <summary>
                {q}
                <span className="faq-chevron" aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section className="landing-final-cta flaash-section-ink">
        <div className="landing-section-inner landing-final-cta-inner">
          <p className="flaash-label">Le reveal commence ici</p>
          <h2>Faites revenir la soirée.</h2>
          <p>
            Créez l&apos;événement, partagez le QR, laissez les souvenirs attendre
            le bon moment. Dès CHF {MIN_PRICE}.–
          </p>
        <Link
          href="/register"
          className="flaash-btn flaash-btn-primary"
        >
          Créer un événement
        </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-section-inner landing-footer-inner">
          <div>
            <span className="landing-footer-wordmark">Flaash</span>
            <p>© 2026 Flaash — Vivre maintenant. Revoir ensemble.</p>
          </div>
          <nav aria-label="Liens légaux">
            <Link href="/privacy">
            Confidentialité
            </Link>
            <Link href="/mentions-legales">
            Mentions légales
            </Link>
            <a href="mailto:hello@flaash.ch">
            Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
