import Link from "next/link";
import Image from "next/image";
import { PLANS } from "@/lib/utils/pricing";

const PUBLIC_PLANS = PLANS.filter((p) => p.id !== "test");
const MIN_PRICE = Math.min(...PUBLIC_PLANS.map((p) => p.price));

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Créez l'événement",
    body: "Choisissez le type, le nombre d'invités et le mode de révélation. Moins de 3 minutes.",
  },
  {
    n: "02",
    title: "Partagez le QR code",
    body: "Imprimez ou affichez le code sur place. Vos invités scannent — aucune installation.",
  },
  {
    n: "03",
    title: "Capturez l'instant",
    body: "Chaque invité prend ses photos depuis son navigateur, en quelques secondes.",
  },
  {
    n: "04",
    title: "La galerie se révèle",
    body: "À l'heure choisie, tous les souvenirs apparaissent ensemble, d'un seul coup.",
  },
];

const EVENT_TYPES: { label: string; featured: boolean }[] = [
  { label: "Mariage", featured: true },
  { label: "Anniversaire", featured: false },
  { label: "Soirée privée", featured: false },
  { label: "Corporate", featured: false },
  { label: "Baby shower", featured: false },
  { label: "Retraite", featured: false },
];

const FEATURES = [
  "Galerie photo privée et sécurisée",
  "QR code unique par événement",
  "Reveal différé — à l'heure que vous choisissez",
  "Export ZIP complet pour l'organisateur",
  "Aucune application à installer pour vos invités",
  "Photo de couverture personnalisée",
  "Accessible depuis tous les navigateurs mobiles",
  "Modération photo depuis votre tableau de bord",
];

const PLAN_FEATURES: Record<string, string[]> = {
  essential: [
    "Jusqu'à 50 invités",
    "Export ZIP inclus",
    "QR code prêt à imprimer",
  ],
  classic: [
    "Jusqu'à 120 invités",
    "Export ZIP inclus",
    "Support prioritaire",
    "Photo de couverture",
  ],
  premium: [
    "Jusqu'à 250 invités",
    "Export ZIP inclus",
    "Support prioritaire",
    "Photo de couverture",
    "Personnalisation avancée",
  ],
};

const FAQ = [
  {
    q: "Mes invités ont-ils besoin d'une application ?",
    a: "Non. Ils scannent simplement le QR code avec leur téléphone et accèdent directement à l'appareil photo depuis leur navigateur. Zéro installation, zéro compte à créer.",
  },
  {
    q: "Comment fonctionne le reveal ?",
    a: "Vous choisissez une heure de révélation lors de la création de l'événement, ou vous déclenchez la révélation manuellement depuis votre tableau de bord. Avant ce moment, les photos restent invisibles pour tous.",
  },
  {
    q: "Combien d'invités peuvent participer simultanément ?",
    a: "De 50 à 250 invités selon le plan choisi. Pour de très grands événements, contactez-nous à hello@flaash.ch.",
  },
  {
    q: "Puis-je télécharger toutes les photos ?",
    a: "Oui. Un export ZIP complet est disponible depuis votre tableau de bord. Vous récupérez toutes les photos en haute qualité, organisées par invité.",
  },
  {
    q: "Que se passe-t-il si un invité envoie une photo inappropriée ?",
    a: "Vous disposez d'un outil de modération depuis votre tableau de bord : vous pouvez supprimer une photo ou bloquer un invité en quelques secondes.",
  },
  {
    q: "Le paiement est-il unique ?",
    a: "Oui. Vous payez une seule fois par événement. Aucun abonnement, aucun frais récurrent, aucune surprise.",
  },
];

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
      <section
        id="comment-ca-marche"
        style={{
          background: "var(--flaash-cream)",
          padding: "clamp(56px, 12vw, 96px) clamp(24px, 6vw, 64px)",
        }}
      >
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Comment ça marche</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 7vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: "var(--flaash-ink)",
            margin: "0 0 52px",
            maxWidth: 460,
          }}
        >
          Quatre étapes.<br />Des souvenirs pour toujours.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(28px, 6vw, 48px)",
            maxWidth: 880,
          }}
        >
          {HOW_IT_WORKS.map(({ n, title, body }) => (
            <div key={n}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(52px, 13vw, 72px)",
                  lineHeight: 1,
                  color: "var(--flaash-amber)",
                  marginBottom: 18,
                  letterSpacing: "-0.04em",
                }}
              >
                {n}
              </span>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  margin: "0 0 8px",
                  color: "var(--flaash-ink)",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--fg-2)",
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pour quels événements ── */}
      <section
        style={{
          background: "var(--flaash-cream-deep)",
          padding: "clamp(48px, 10vw, 80px) clamp(24px, 6vw, 64px)",
        }}
      >
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Conçu pour</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 6vw, 40px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: "var(--flaash-ink)",
            margin: "0 0 32px",
            maxWidth: 380,
          }}
        >
          Tout événement qui mérite d&apos;être capturé.
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {EVENT_TYPES.map(({ label, featured }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                borderRadius: "var(--radius-pill)",
                fontSize: 14,
                fontWeight: 700,
                background: featured ? "var(--flaash-amber)" : "var(--flaash-cream)",
                color: featured ? "var(--flaash-ink)" : "var(--fg-2)",
                border: `1.5px solid ${featured ? "var(--flaash-amber)" : "var(--flaash-cream-line)"}`,
                letterSpacing: "0.01em",
              }}
            >
              {featured && (
                <span style={{ fontSize: 10, lineHeight: 1 }}>★</span>
              )}
              {label}
            </span>
          ))}
        </div>

        <p
          style={{
            marginTop: 32,
            fontSize: 13,
            color: "var(--fg-3)",
            fontWeight: 500,
            lineHeight: 1.6,
            maxWidth: 340,
          }}
        >
          Plus de 250 invités ? Contactez-nous à{" "}
          <a
            href="mailto:hello@flaash.ch"
            style={{
              color: "var(--flaash-amber-deep)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            hello@flaash.ch
          </a>
        </p>
      </section>

      {/* ── Pourquoi Flaash ── */}
      <section
        style={{
          background: "var(--flaash-cream)",
          padding: "clamp(48px, 10vw, 80px) clamp(24px, 6vw, 64px)",
        }}
      >
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Pourquoi Flaash</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 6vw, 40px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: "var(--flaash-ink)",
            margin: "0 0 36px",
            maxWidth: 380,
          }}
        >
          Simple pour vos invités.<br />Puissant pour vous.
        </h2>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 520,
          }}
        >
          {FEATURES.map((f) => (
            <li
              key={f}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--flaash-forest)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "var(--flaash-cream)",
                  fontWeight: 900,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--flaash-ink)",
                  lineHeight: 1.55,
                }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Tarifs ── */}
      <section
        id="tarifs"
        style={{
          background: "var(--flaash-ink)",
          padding: "clamp(56px, 12vw, 96px) clamp(24px, 6vw, 64px)",
        }}
      >
        <p
          className="f-eyebrow"
          style={{ color: "rgba(250,247,242,0.4)", marginBottom: 14 }}
        >
          Tarifs
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 7vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: "var(--flaash-cream)",
            margin: "0 0 14px",
          }}
        >
          Un prix unique<br />par événement.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(250,247,242,0.45)",
            margin: "0 0 48px",
            maxWidth: 360,
            lineHeight: 1.55,
          }}
        >
          Dès CHF {MIN_PRICE}.– par événement. Pas d&apos;abonnement. Pas de frais cachés.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
            maxWidth: 860,
          }}
        >
          {PUBLIC_PLANS.map((plan) => {
            const isRecommended = plan.id === "classic";
            const planFeatures = PLAN_FEATURES[plan.id] ?? [];
            return (
              <div
                key={plan.id}
                className="landing-pricing-card"
                style={{
                  background: isRecommended
                    ? "var(--flaash-amber)"
                    : "rgba(250,247,242,0.05)",
                  border: isRecommended
                    ? "none"
                    : "1px solid rgba(250,247,242,0.10)",
                  borderRadius: "var(--radius-xl)",
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {isRecommended && (
                  <span
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      background: "var(--flaash-ink)",
                      color: "var(--flaash-amber)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-pill)",
                    }}
                  >
                    Recommandé
                  </span>
                )}

                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: isRecommended
                      ? "rgba(26,26,26,0.55)"
                      : "rgba(250,247,242,0.45)",
                    margin: "0 0 20px",
                  }}
                >
                  {plan.label}
                </p>

                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "clamp(44px, 11vw, 56px)",
                    lineHeight: 1,
                    letterSpacing: "-0.035em",
                    color: isRecommended ? "var(--flaash-ink)" : "var(--flaash-cream)",
                    margin: "0 0 4px",
                  }}
                >
                  {plan.price}
                  <span
                    style={{
                      fontSize: "38%",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      verticalAlign: "middle",
                      marginLeft: 4,
                    }}
                  >
                    CHF
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: isRecommended
                      ? "rgba(26,26,26,0.50)"
                      : "rgba(250,247,242,0.35)",
                    fontWeight: 500,
                    margin: "0 0 28px",
                  }}
                >
                  par événement
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  {planFeatures.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isRecommended
                          ? "var(--flaash-ink)"
                          : "rgba(250,247,242,0.65)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: isRecommended
                            ? "var(--flaash-ink)"
                            : "var(--flaash-forest)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          color: isRecommended
                            ? "var(--flaash-amber)"
                            : "var(--flaash-cream)",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="btn-pill"
                  style={{
                    background: isRecommended
                      ? "var(--flaash-ink)"
                      : "rgba(250,247,242,0.08)",
                    color: isRecommended
                      ? "var(--flaash-amber)"
                      : "rgba(250,247,242,0.75)",
                    border: isRecommended
                      ? "none"
                      : "1px solid rgba(250,247,242,0.15)",
                    fontSize: 12,
                    textDecoration: "none",
                    textAlign: "center",
                    padding: "14px 20px",
                  }}
                >
                  CHOISIR {plan.label.toUpperCase()}
                </Link>
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 28,
            fontSize: 13,
            color: "rgba(250,247,242,0.30)",
            fontWeight: 500,
          }}
        >
          Plus de 250 invités ?{" "}
          <a
            href="mailto:hello@flaash.ch"
            style={{
              color: "rgba(250,247,242,0.45)",
              textDecoration: "underline",
            }}
          >
            Contactez-nous
          </a>
        </p>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{
          background: "var(--flaash-cream-deep)",
          padding: "clamp(56px, 12vw, 96px) clamp(24px, 6vw, 64px)",
        }}
      >
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Questions fréquentes</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 6vw, 40px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: "var(--flaash-ink)",
            margin: "0 0 40px",
            maxWidth: 380,
          }}
        >
          Des questions ?<br />On a les réponses.
        </h2>

        <div
          className="landing-faq"
          style={{
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {FAQ.map(({ q, a }) => (
            <details key={q} style={{ borderTop: "1px solid var(--flaash-cream-line)" }}>
              <summary
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 0",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--flaash-ink)",
                }}
              >
                {q}
                <span
                  className="faq-chevron"
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    fontSize: 22,
                    color: "var(--flaash-amber)",
                    fontWeight: 300,
                    lineHeight: 1,
                    fontFamily: "var(--font-body)",
                  }}
                />
              </summary>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--fg-2)",
                  lineHeight: 1.7,
                  paddingBottom: 20,
                  margin: 0,
                }}
              >
                {a}
              </p>
            </details>
          ))}
          <div style={{ borderTop: "1px solid var(--flaash-cream-line)" }} />
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section
        style={{
          background: "var(--flaash-forest)",
          padding: "clamp(60px, 14vw, 112px) clamp(24px, 6vw, 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <p
          className="f-script"
          style={{
            color: "var(--flaash-amber)",
            fontSize: "clamp(24px, 6vw, 34px)",
            marginBottom: 16,
          }}
        >
          vos souvenirs se développent…
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(32px, 9vw, 60px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: "var(--flaash-cream)",
            margin: "0 0 20px",
            maxWidth: 520,
          }}
        >
          Prêt à capturer l&apos;instant ?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(250,247,242,0.50)",
            margin: "0 0 36px",
            maxWidth: 360,
            lineHeight: 1.55,
          }}
        >
          Créez votre événement en moins de 3 minutes. Dès CHF {MIN_PRICE}.–
        </p>
        <Link
          href="/register"
          className="btn-pill btn-amber"
          style={{ fontSize: 14, padding: "16px 32px", width: "auto" }}
        >
          CRÉER UN ÉVÉNEMENT →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "var(--flaash-forest-deep)",
          padding: "32px clamp(24px, 6vw, 64px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 20,
            color: "var(--flaash-cream)",
            letterSpacing: "-0.02em",
          }}
        >
          Flaash
        </span>
        <p style={{ fontSize: 12, color: "rgba(201,216,206,0.45)", margin: 0 }}>
          © 2026 Flaash — Capture l&apos;instant.
        </p>
        <nav
          aria-label="Liens légaux"
          style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
        >
          <Link
            href="/privacy"
            style={{
              color: "rgba(201,216,206,0.45)",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Confidentialité
          </Link>
          <Link
            href="/mentions-legales"
            style={{
              color: "rgba(201,216,206,0.45)",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Mentions légales
          </Link>
          <a
            href="mailto:hello@flaash.ch"
            style={{
              color: "rgba(201,216,206,0.45)",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Contact
          </a>
        </nav>
      </footer>
    </div>
  );
}
