import Link from "next/link";
import { requestPasswordReset } from "../actions";

interface Props {
  searchParams: { error?: string; success?: string };
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error, success } = searchParams;

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--flaash-ink)" }}>
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div className="flex flex-col flex-1 px-6 pb-10" style={{ paddingTop: 56 }}>
        <div style={{ marginBottom: 48 }}>
          <div
            className="f-display"
            style={{ color: "var(--flaash-cream)", fontSize: "clamp(48px,14vw,72px)" }}
          >
            Fl<em>aa</em>sh
          </div>
          <p className="f-script" style={{ color: "var(--flaash-amber)", marginTop: 8 }}>
            on retrouve l'accès.
          </p>
        </div>

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
              Sécurité
            </p>
            <h1 className="f-h2">Mot de passe oublié</h1>
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

          {success === "reset-sent" && (
            <div
              style={{
                background: "rgba(45,92,74,0.1)",
                border: "1px solid rgba(45,92,74,0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 14px",
                fontSize: 14,
                color: "var(--flaash-forest)",
                fontWeight: 500,
              }}
            >
              Si un compte existe pour cette adresse, un lien de réinitialisation
              vient d'être envoyé.
            </div>
          )}

          <form action={requestPasswordReset} className="flex flex-col gap-5">
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

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-pill btn-ink">
                RECEVOIR LE LIEN
              </button>
            </div>
          </form>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, textAlign: "center" }}>
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--flaash-amber-deep)",
                textDecoration: "none",
              }}
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
