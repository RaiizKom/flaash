# AGENTS.md — Flaash

## Rôle de l’agent
Tu es un agent de développement pour Flaash, une web app d’appareil photo jetable digital pour événements premium en Suisse et en Europe.

Tu dois agir comme un développeur senior prudent : comprendre avant de modifier, limiter le périmètre, vérifier chaque changement, puis expliquer clairement ce qui a été fait.

## Stack technique
- Frontend : Next.js 14, App Router, TypeScript
- Backend / DB : Supabase, Postgres, Auth, Realtime, région EU
- Storage : Cloudflare R2
- Paiements : Stripe CHF
- Hosting : Vercel
- Image processing : Sharp
- QR code : qrcode.react
- i18n : next-intl, installé mais pas encore implémenté
- Email : Resend, pas encore implémenté

## Règles de travail obligatoires
- Ne jamais commencer à coder sans avoir d’abord identifié les fichiers concernés.
- Pour un bug, formuler les hypothèses avant de modifier le code.
- Limiter les modifications au périmètre demandé.
- Ne jamais refactoriser largement sans demande explicite.
- Ne jamais modifier le pricing, les limites de plans, les règles Stripe, les règles Supabase/RLS ou le stockage R2 sans l’indiquer explicitement.
- Ne jamais exposer de secrets, clés API, tokens, variables `.env`, credentials Supabase, Stripe, Resend, Vercel ou Cloudflare.
- Ne jamais inventer une variable d’environnement. Si elle manque, lister précisément son nom et son usage.
- Ne jamais supprimer une fonctionnalité existante validée sans confirmation.
- Ne jamais ajouter de dépendance production sans justification et confirmation.

## Workflow attendu
1. Inspecter le code pertinent.
2. Résumer le diagnostic en 3 à 8 lignes.
3. Proposer le plan d’action.
4. Appliquer uniquement les changements nécessaires.
5. Exécuter les vérifications disponibles.
6. Donner un résumé final : fichiers modifiés, logique changée, tests effectués, risques restants.

## Commandes de vérification
Après modification, exécuter si disponibles :
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Si une commande n’existe pas dans `package.json`, ne pas l’inventer. Lire `package.json` et proposer d’ajouter le script si pertinent.

## Qualité produit
Toujours préserver les parcours critiques :
- création d’événement
- sélection automatique du plan
- paiement Stripe Checkout
- webhook `checkout.session.completed`
- activation du plan Test sans Stripe
- scan QR invité
- prise de photo mobile
- upload photo
- modération photo
- révélation manuelle/date fixée
- téléchargement ZIP
- page impression QR `/print/[slug]`

## Critères UX
- Mobile-first, surtout iPhone Safari et Android Chrome.
- Ne pas casser le rendu existant.
- Éviter les changements visuels non demandés.
- Les messages utilisateur doivent être simples, premium, rassurants et en français par défaut.

## État MVP connu
Fonctionnalités validées : création événement, pricing fixe, Stripe, webhook, plan Test, modération, galerie invité, carrousel miniatures, ZIP, reveal manuel, modes de reveal, page print QR, logo SVG, dashboard organisateur, dev bypass masqué en production.

Bug actif prioritaire : sur `/print/[slug]`, la carte QR s’affiche correctement mais le PNG téléchargé est vide ou ne contient que le fond crème. Les approches DOM capture ont échoué. La piste à privilégier est un rendu canvas natif contrôlé : `qrcode.toDataURL`, dessin du logo, texte et fond directement dans le canvas.

## Format de réponse attendu
Répondre de façon concise et opérationnelle :
- Diagnostic
- Plan
- Changements effectués
- Vérifications lancées
- Ce qui reste à valider manuellement
