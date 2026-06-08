# Quality checklist — Flaash

## Avant de coder
- Le problème est formulé clairement.
- Les fichiers concernés sont identifiés.
- Les critères d’acceptation sont écrits.
- Les risques sont connus : Stripe, Supabase, R2, mobile Safari, sécurité, données.

## Pendant le codage
- Ne modifier que le périmètre demandé.
- Ne pas changer le design sans demande.
- Ne pas ajouter de dépendance sans validation.
- Ne pas supprimer de code validé sans justification.
- Ne pas désactiver une vérification pour faire passer le build.

## Après le codage
Lancer en priorité :
- `npm run quality`

Ce script existe et lance :
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Tester manuellement selon la tâche :
- Desktop Chrome
- iPhone Safari
- Android Chrome si disponible
- Vercel preview si pertinent

## Pour une feature MVP
Valider :
- le happy path
- un cas d’erreur
- un cas mobile
- l’absence de régression sur le dashboard organisateur
- l’absence de régression sur la page invité

## Pour un bug
Le bug est résolu seulement si :
- il est compris
- le correctif est minimal
- le problème initial ne se reproduit plus
- aucun parcours adjacent n’est cassé
- les vérifications passent ou les échecs sont expliqués

## État validé
- Le projet officiel est `/Users/pedrolopes05/flaash`.
- `/print/[slug]` est validé, y compris le téléchargement PNG de la carte QR.
- Le bug QR PNG ne doit plus être traité comme un bug actif.
