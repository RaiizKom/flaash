# Project context — Flaash

## Dossier officiel
Le seul dossier officiel du projet est `/Users/pedrolopes05/flaash`.

L’ancien dossier `/Users/pedrolopes05/Desktop/flaash` a été supprimé et ne doit plus être utilisé.

## Concept
Flaash est une web app d’appareil photo jetable digital pour événements premium, principalement mariages, anniversaires et événements privés.

Les invités scannent un QR code, prennent des photos depuis leur navigateur mobile, et toutes les photos sont centralisées dans une galerie commune révélée à un moment choisi par l’organisateur.

## Marché cible
- Suisse et Europe
- Segment premium
- Clients : mariages, anniversaires, événements privés, agences événementielles

## Domaine canonique
- Domaine principal officiel : `https://flaash.ch`
- Domaines redirigés vers le canonique : `flaash.app`, `www.flaash.app`, `www.flaash.ch`
- Variable publique à configurer en production Vercel : `NEXT_PUBLIC_APP_URL=https://flaash.ch`
- Email officiel : `hello@flaash.ch`

## Stack technique
- Next.js 14, App Router, TypeScript
- Supabase : Postgres, Auth, Realtime, région EU
- Cloudflare R2 pour le stockage
- Stripe Checkout en CHF
- Vercel pour le hosting
- Sharp pour le traitement d’images
- qrcode.react pour les QR codes
- next-intl installé mais pas encore implémenté
- Resend pour les emails transactionnels organisateur

## Pricing
- Test : gratuit, 3 appareils, 20 photos, 7 jours, watermark, pas ZIP
- Essential : 59 CHF, 50 invités max
- Classic : 99 CHF, 120 invités max, recommandé
- Premium : 149 CHF, 250 invités max
- Plus de 250 invités : contact mailto:hello@flaash.ch
- Tolérance +10% invités gérée silencieusement côté serveur

## Fonctionnalités implémentées et validées
- Création d’événement avec stepper 2 étapes
- Pré-sélection automatique du plan selon le nombre d’invités
- Upsell automatique si plan incompatible
- Badge recommandé dynamique
- Stripe Checkout et webhook `checkout.session.completed`
- Bandeau paiement reçu avec retry
- Plan Test actif sans Stripe
- Enforcement serveur du plan Test
- Reprise du paiement et modification sur draft bloqué
- Suppression événement avec modale et suppression R2
- Modération photo, suppression, blocage invité
- Galerie invité avec suppression
- Carrousel miniatures et lightbox sur page caméra
- Téléchargement ZIP invité, organisateur et modération
- Reveal manuel
- Modes de reveal date fixée / manuel
- Page impression QR isolée sur `/print/[slug]`
- Téléchargement PNG de la carte QR sur `/print/[slug]`, corrigé, testé en local et validé sur Vercel
- Premier email transactionnel organisateur quand l'événement est prêt : paiement Stripe réussi ou plan Test actif
- Logo SVG Flaash dans `/public/`
- Badge `plan_id` dashboard organisateur
- Bouton dev bypass masqué en production

## État de validation récent
Le bug de téléchargement PNG de la carte QR sur `/print/[slug]` n’est plus actif.

Dernier commit validé sur `origin/main` : `fix: stabilize QR card PNG export`.

`npm run quality` existe et passe. Il lance `lint`, `typecheck` et `build`.

## Prochaines priorités MVP
1. Pages légales / privacy
2. Message privacy visible sur `/e/[slug]`
3. Emails transactionnels Resend
4. QA mobile complète
5. Landing page marketing
6. Mode démo permanent
