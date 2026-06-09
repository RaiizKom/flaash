import Link from "next/link";
import { updatePassword } from "../actions";
import PasswordField from "../PasswordField";

interface Props {
  searchParams: { error?: string };
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { error } = searchParams;

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--flaash-forest)" }}>
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div className="flex flex-col flex-1 px-6 pb-10" style={{ paddingTop: 56 }}>
        <div style={{ marginBottom: 48 }}>
          <div
            className="f-display"
            style={{ color: "var(--flaash-cream)", fontSize: "clamp(48px,14vw,72px)" }}
          >
            Fl<em>aa</em>sh
          </div>
          <p className="f-script" style={{ color: "var(--flaash-forest-soft)", marginTop: 8 }}>
            nouvel accès, même lumière.
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
            <h1 className="f-h2">Nouveau mot de passe</h1>
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

          <form action={updatePassword} className="flex flex-col gap-5">
            <div>
              <PasswordField
                id="password"
                name="password"
                label="Nouveau mot de passe"
                autoComplete="new-password"
                minLength={8}
                placeholder="8 caractères minimum"
              />
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
                Au moins 8 caractères.
              </span>
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-pill btn-forest">
                METTRE À JOUR
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
