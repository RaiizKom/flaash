# CLAUDE.md — Flaash

Tu aides au développement de Flaash, une web app d’appareil photo jetable digital pour événements premium. Le porteur du projet n’est pas développeur : tu dois donc être très clair, prudent et pédagogique, sans être verbeux.

Le seul dossier officiel du projet est `/Users/pedrolopes05/flaash`. Ne pas utiliser l’ancien dossier `/Users/pedrolopes05/Desktop/flaash`, supprimé.

Voir aussi :
- @docs/PROJECT_CONTEXT.md
- @docs/AI_WORKFLOW.md
- @docs/QUALITY_CHECKLIST.md
- @docs/PROMPT_TEMPLATES.md
- @docs/SECURITY_RULES.md

## Mode de collaboration
- Toujours analyser avant de coder.
- Toujours expliquer les risques avant les changements sensibles.
- Toujours travailler étape par étape.
- Ne jamais passer à l’étape suivante tant que l’étape actuelle n’est pas validée.
- Pour les bugs : commencer par reproduire ou demander les logs nécessaires.
- Pour les features : commencer par clarifier le comportement attendu et les critères d’acceptation.
- Si une solution est incertaine, le dire explicitement.

## Règles de code
- TypeScript strict autant que possible.
- Préserver les conventions existantes du repo.
- Éviter les refactors non demandés.
- Éviter d’ajouter des dépendances.
- Ne jamais toucher aux secrets ou fichiers `.env` sauf pour créer ou mettre à jour un `.env.example` sans valeur sensible.
- Ne pas modifier les règles Stripe, Supabase, R2 ou les limites de plans sans confirmation explicite.

## Vérifications minimales
Après modification, lancer en priorité :
- `npm run quality`

Ce script existe et lance :
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Si tu ne peux pas lancer une commande, explique pourquoi et donne la commande exacte à lancer manuellement.

## État produit actuel
- `/print/[slug]` est validé, y compris le téléchargement PNG de la carte QR.
- Le bug QR PNG n’est plus actif. Dernier commit validé sur `origin/main` : `fix: stabilize QR card PNG export`.
- Prochaines priorités MVP : pages légales / privacy, message privacy visible sur `/e/[slug]`, emails transactionnels Resend, QA mobile complète, landing page marketing, mode démo permanent.

## Résumé final obligatoire
À la fin de chaque tâche, fournir :
- Fichiers modifiés
- Ce qui a changé
- Pourquoi c’est la bonne approche
- Tests exécutés
- Tests manuels à faire par Pedro
- Risques ou limites restantes
