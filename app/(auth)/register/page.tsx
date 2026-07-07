import Link from "next/link";
import { register } from "../actions";
import PasswordField from "../PasswordField";

interface Props {
  searchParams: { error?: string; success?: string };
}

export default async function RegisterPage({ searchParams }: Props) {
  const { error, success } = searchParams;

  if (success === "account-created") {
    return (
      <main className="auth-page">
        <div className="auth-frame">
          <section className="auth-brand" aria-label="Flaash">
            <Link href="/" className="auth-back-link">
              ← Retour à l'accueil
            </Link>
            <span className="auth-wordmark">Flaash</span>
            <h2>Votre espace est prêt.</h2>
            <p>
              Vous pouvez préparer votre événement, partager le QR code et
              choisir le moment du reveal.
            </p>
          </section>

          <section className="auth-card" aria-labelledby="account-created-title">
            <div className="auth-card-header">
              <p className="flaash-label">Compte créé</p>
              <h1 id="account-created-title">Votre compte est prêt</h1>
              <p>
                Votre compte a été créé. Vous pouvez maintenant vous connecter
                à votre espace organisateur.
              </p>
            </div>

            <Link href="/login" className="flaash-btn flaash-btn-primary auth-submit">
              Se connecter
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section className="auth-brand" aria-label="Flaash">
          <Link href="/" className="auth-back-link">
            ← Retour à l'accueil
          </Link>
          <span className="auth-wordmark">Flaash</span>
          <h2>La soirée se prépare ici.</h2>
          <p>
            Préparez le QR code, invitez vos proches, puis laissez la soirée se
            vivre. Les souvenirs attendront le bon moment.
          </p>
          <ul className="auth-ritual-list">
            <li>QR code prêt à partager</li>
            <li>Photos cachées jusqu'au reveal</li>
            <li>Galerie privée pour vos invités</li>
          </ul>
        </section>

        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-card-header">
            <p className="flaash-label">Organisateur</p>
            <h1 id="register-title">Créer votre événement Flaash</h1>
            <p>
              Créez votre compte pour préparer l'événement et accéder à votre
              espace organisateur.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={register} className="auth-form">
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

            <div>
              <PasswordField
                id="password"
                name="password"
                label="Mot de passe"
                autoComplete="new-password"
                minLength={8}
                placeholder="8 caractères minimum"
              />
              <span className="auth-hint">
                Au moins 8 caractères.
              </span>
            </div>

            <button type="submit" className="flaash-btn flaash-btn-primary auth-submit">
              Créer mon compte
            </button>
          </form>

          <div className="auth-card-footer">
            Déjà un compte ?{" "}
            <Link href="/login" className="auth-link">
              Se connecter
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
