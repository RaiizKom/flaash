import Link from "next/link";
import { register } from "../actions";

interface Props {
  searchParams: { error?: string; success?: string };
}

export default async function RegisterPage({ searchParams }: Props) {
  const { error, success } = searchParams;

  if (success === "check-email") {
    return (
      <div
        className="flex flex-col flex-1 items-center justify-center px-6"
        style={{ background: "var(--flaash-forest)" }}
      >
        <div
          style={{
            background: "var(--flaash-cream)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 28px",
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          <p className="f-eyebrow" style={{ marginBottom: 12 }}>
            Vérification
          </p>
          <h1 className="f-h2" style={{ marginBottom: 12 }}>
            Vérifiez votre e-mail
          </h1>
          <p style={{ color: "var(--fg-2)", fontSize: 15, lineHeight: 1.5 }}>
            Un lien de confirmation vous a été envoyé. Cliquez dessus pour
            activer votre compte.
          </p>
          <p className="f-script" style={{ color: "var(--flaash-forest)", marginTop: 20 }}>
            merci d'avoir rejoint Flaash.
          </p>
          <div style={{ marginTop: 28 }}>
            <Link href="/login" className="btn-pill btn-ink">
              RETOUR À LA CONNEXION
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--flaash-forest)" }}>
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div className="flex flex-col flex-1 px-6 pb-10" style={{ paddingTop: 56 }}>
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div
            className="f-display"
            style={{ color: "var(--flaash-cream)", fontSize: "clamp(48px,14vw,72px)" }}
          >
            Fl<em>aa</em>sh
          </div>
          <p
            className="f-script"
            style={{ color: "var(--flaash-forest-soft)", marginTop: 8 }}
          >
            vos souvenirs se développent…
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--flaash-cream)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 24px 28px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div>
            <p className="f-eyebrow" style={{ marginBottom: 6 }}>
              Organisateur
            </p>
            <h1 className="f-h2">Créer un compte</h1>
          </div>

          {error && (
            <div
              style={{
                background: "var(--flaash-error-soft)",
                border: "1px solid var(--flaash-error)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 14px",
                fontSize: 14,
                color: "var(--flaash-error)",
                fontWeight: 500,
              }}
            >
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={register} className="flex flex-col gap-5">
            <div className="f-input-wrap">
              <label className="f-label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.com"
                className="f-input-box"
              />
            </div>

            <div className="f-input-wrap">
              <label className="f-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="8 caractères minimum"
                className="f-input-box"
              />
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
                Au moins 8 caractères.
              </span>
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-pill btn-forest">
                CRÉER MON COMPTE
              </button>
            </div>
          </form>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 20,
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--fg-3)" }}>
              Déjà un compte ?{" "}
            </span>
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--flaash-amber-deep)",
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
