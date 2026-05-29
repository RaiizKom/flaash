import Link from "next/link";
import { login } from "../actions";

interface Props {
  searchParams: { error?: string; next?: string };
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = searchParams;

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--flaash-ink)" }}>
      {/* Amber top stripe */}
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      <div
        className="flex flex-col flex-1 px-6 pb-10"
        style={{ paddingTop: 56 }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div
            className="f-display"
            style={{
              color: "var(--flaash-cream)",
              fontSize: "clamp(48px,14vw,72px)",
            }}
          >
            Fl<em>aa</em>sh
          </div>
          <p
            className="f-script"
            style={{ color: "var(--flaash-amber)", marginTop: 8 }}
          >
            on garde la lumière allumée.
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
            <h1 className="f-h2">Connexion</h1>
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

          <form action={login} className="flex flex-col gap-5">
            <input type="hidden" name="next" value={next ?? "/dashboard"} />

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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="f-input-box"
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-pill btn-ink">
                SE CONNECTER
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
              Pas encore de compte ?{" "}
            </span>
            <Link
              href="/register"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--flaash-amber-deep)",
                textDecoration: "none",
              }}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
