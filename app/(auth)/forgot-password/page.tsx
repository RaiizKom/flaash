import Link from "next/link";
import { requestPasswordReset } from "../actions";

interface Props {
  searchParams: { error?: string; success?: string };
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error, success } = searchParams;

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section className="auth-brand" aria-label="Flaash">
          <Link href="/" className="auth-back-link">
            ← Retour à l'accueil
          </Link>
          <span className="auth-wordmark">Flaash</span>
          <h2>Retrouver votre accès.</h2>
          <p>
            Un lien vous ramène à votre espace organisateur, sans changer vos
            événements ni vos galeries.
          </p>
          <ul className="auth-ritual-list">
            <li>Accès sécurisé</li>
            <li>Événements conservés</li>
            <li>Retour à votre espace</li>
          </ul>
        </section>

        <section className="auth-card" aria-labelledby="forgot-password-title">
          <div className="auth-card-header">
            <p className="flaash-label">Sécurité</p>
            <h1 id="forgot-password-title">Réinitialiser votre accès</h1>
            <p>
              Indiquez votre email, nous vous envoyons un lien pour revenir à
              votre espace.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              {decodeURIComponent(error)}
            </div>
          )}

          {success === "reset-sent" && (
            <div className="auth-message auth-message-success">
              Si un compte existe pour cette adresse, un lien de réinitialisation
              vient d'être envoyé.
            </div>
          )}

          <form action={requestPasswordReset} className="auth-form">
            <div className="f-input-wrap">
              <label className="f-label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                required
                placeholder="vous@exemple.com"
                className="f-input-box"
              />
            </div>

            <button type="submit" className="flaash-btn flaash-btn-primary auth-submit">
              Recevoir le lien
            </button>
          </form>

          <div className="auth-card-footer">
            <Link href="/login" className="auth-link">
              Retour à la connexion
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
