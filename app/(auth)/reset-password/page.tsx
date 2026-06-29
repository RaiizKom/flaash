import Link from "next/link";
import { updatePassword } from "../actions";
import PasswordField from "../PasswordField";

interface Props {
  searchParams: { error?: string };
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { error } = searchParams;

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section className="auth-brand" aria-label="Flaash">
          <Link href="/" className="auth-back-link">
            ← Retour à l'accueil
          </Link>
          <span className="auth-wordmark">Flaash</span>
          <h2>Sécuriser votre espace.</h2>
          <p>
            Choisissez un nouveau mot de passe avant de retrouver vos
            événements, vos galeries et vos souvenirs.
          </p>
          <ul className="auth-ritual-list">
            <li>Accès organisateur</li>
            <li>Événements conservés</li>
            <li>Galeries privées</li>
          </ul>
        </section>

        <section className="auth-card" aria-labelledby="reset-password-title">
          <div className="auth-card-header">
            <p className="flaash-label">Sécurité</p>
            <h1 id="reset-password-title">Choisir un nouveau mot de passe</h1>
            <p>
              Sécurisez votre accès avant de retrouver vos événements.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={updatePassword} className="auth-form">
            <div>
              <PasswordField
                id="password"
                name="password"
                label="Nouveau mot de passe"
                autoComplete="new-password"
                minLength={8}
                placeholder="8 caractères minimum"
              />
              <span className="auth-hint">
                Au moins 8 caractères.
              </span>
            </div>

            <button type="submit" className="flaash-btn flaash-btn-primary auth-submit">
              Mettre à jour
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
