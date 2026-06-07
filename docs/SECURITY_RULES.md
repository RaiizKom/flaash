# Security rules — Flaash

## Secrets
Ne jamais afficher, copier, committer ou logger :
- clés Supabase service role
- clés Stripe live ou test
- webhook secrets Stripe
- clés Cloudflare R2
- clés Resend
- tokens Vercel
- variables `.env.local`, `.env.production`, `.env`

## Variables d’environnement
- Utiliser `.env.example` pour documenter les noms attendus sans valeur sensible.
- Ne jamais inventer une variable si le code ne l’utilise pas.
- Si une variable manque, lister le nom, le fichier qui l’utilise et le comportement attendu.

## Paiements Stripe
- Ne pas modifier les montants ou plans sans validation explicite.
- Ne pas changer les webhooks sans expliquer l’impact.
- Toujours vérifier les chemins de succès, annulation et reprise de paiement.

## Supabase
- Ne pas désactiver RLS.
- Ne pas contourner les règles d’accès.
- Ne pas utiliser service role côté client.
- Toute migration doit être expliquée et réversible autant que possible.

## Cloudflare R2
- Ne pas rendre public un bucket sans validation.
- Ne pas changer la structure de clé/chemin des fichiers sans migration planifiée.
- Vérifier la suppression des objets lors de la suppression d’événement.
