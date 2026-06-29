import Link from "next/link";
import { login } from "../actions";
import PasswordField from "../PasswordField";

interface Props {
  searchParams: { error?: string; next?: string; success?: string };
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, next, success } = searchParams;

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section className="auth-brand" aria-label="Flaash">
          <Link href="/" className="auth-back-link">
            ← Retour à l'accueil
          </Link>
          <span className="auth-wordmark">Flaash</span>
          <h2>Retrouvez vos événements.</h2>
          <p>
            Revenez à votre espace pour préparer vos QR codes, suivre vos
            galeries et déclencher vos moments de reveal au bon moment.
          </p>
          <ul className="auth-ritual-list">
            <li>Événements organisés</li>
            <li>Galeries et souvenirs</li>
            <li>Reveal manuel ou programmé</li>
          </ul>
        </section>

        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-card-header">
            <p className="flaash-label">Organisateur</p>
            <h1 id="login-title">Revenir à votre espace Flaash</h1>
            <p>
              Retrouvez vos événements, vos galeries et vos moments de reveal.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              {decodeURIComponent(error)}
            </div>
          )}

          {success === "password-updated" && (
            <div className="auth-message auth-message-success">
              Votre mot de passe a été mis à jour. Vous pouvez vous connecter.
            </div>
          )}

          <form action={login} className="auth-form">
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

            <PasswordField
              id="password"
              name="password"
              label="Mot de passe"
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <Link
              href="/forgot-password"
              className="auth-secondary-link"
            >
              Mot de passe oublié ?
            </Link>

            <button type="submit" className="flaash-btn flaash-btn-primary auth-submit">
              Se connecter
            </button>
          </form>

          <div className="auth-card-footer">
            Pas encore de compte ?{" "}
            <Link href="/register" className="auth-link">
              Créer un compte
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
