# Project context — Flaash

## Concept
Flaash est une web app d’appareil photo jetable digital pour événements premium, principalement mariages, anniversaires et événements privés.

Les invités scannent un QR code, prennent des photos depuis leur navigateur mobile, et toutes les photos sont centralisées dans une galerie commune révélée à un moment choisi par l’organisateur.

## Marché cible
- Suisse et Europe
- Segment premium
- Clients : mariages, anniversaires, événements privés, agences événementielles

## Stack technique
- Next.js 14, App Router, TypeScript
- Supabase : Postgres, Auth, Realtime, région EU
- Cloudflare R2 pour le stockage
- Stripe Checkout en CHF
- Vercel pour le hosting
- Sharp pour le traitement d’images
- qrcode.react pour les QR codes
- next-intl installé mais pas encore implémenté
- Resend prévu mais pas encore implémenté

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
- Logo SVG Flaash dans `/public/`
- Badge `plan_id` dashboard organisateur
- Bouton dev bypass masqué en production

## Bug actif prioritaire
La page `/print/[slug]` affiche correctement la carte QR, mais le PNG téléchargé est vide ou ne contient que le fond crème.

Tentatives échouées :
- `html-to-image` avec `backgroundColor`
- SVGs inlinés comme composants React
- `ssr: false` avec dynamic import
- `document.getElementById` au lieu de ref
- Fonts chargées dans layout isolé

Approche recommandée : rendu canvas natif contrôlé avec génération QR en data URL, chargement du logo SVG, dessin manuel du fond, du QR, du logo et des textes.
