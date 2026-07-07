# Lot 4.9 — Final Branch Audit Before Merge

## 1. Executive Summary

- Verdict : **merge ready with notes** pour la landing.
- La branche respecte le périmètre annoncé : système de marque, audit landing et harmonisation du bas de landing.
- Les changements de code sont limités à `app/page.tsx` et `app/globals.css`.
- Aucun changement détecté dans `public/images/`, `components/`, `lib/`, routes API, auth, dashboard, pages invité, Supabase, Stripe, upload ou logique pricing.
- `npm run quality` passe : lint, typecheck et build réussis.
- Warning non bloquant : le build local n'a pas optimisé une feuille Google Fonts non téléchargée.
- La landing est cohérente avec la DA "Analog Social Premium" et le récit reveal.
- Les pages internes restent visuellement dans l'ancienne DA, surtout `/register` et `/login`.
- Cette rupture ne bloque pas le merge landing en l'absence de bug fonctionnel.
- Prochaine priorité recommandée : alignement visuel des pages auth.

## 2. Branch Scope

- Branche actuelle : `feat/image-upgrade-round-2`
- Branche cible : `refactor/flaash-analog-social-premium`
- Commits inclus :
  - `c9ba757 feat: harmonize landing conversion sections`
  - `5fa170f docs: add landing audit against Flaash brand system`
  - `98d0d56 docs: add Flaash brand and visual system`
- Fichiers créés dans la branche avant cet audit :
  - `design-references/FLAASH_BRAND_VOICE.md`
  - `design-references/FLAASH_CAMPAIGN_RULES.md`
  - `design-references/FLAASH_PROMPT_SYSTEM.md`
  - `design-references/FLAASH_VISUAL_SYSTEM.md`
  - `design-references/LANDING_AUDIT_3_9.md`
- Fichier créé par le Lot 4.9 :
  - `design-references/FINAL_BRANCH_AUDIT_4_9.md`
- Fichiers modifiés dans la branche :
  - `app/page.tsx`
  - `app/globals.css`
- Périmètre réel confirmé :
  - système de marque ;
  - audit landing ;
  - harmonisation du bas de landing ;
  - pricing / FAQ / CTA final / footer ;
  - cohérence du terme reveal sur la landing.
- Hors scope explicite confirmé :
  - `/register`
  - `/login`
  - `/forgot-password`
  - `/reset-password`
  - `/dashboard`
  - `/dashboard/[id]`
  - `/dashboard/[id]/guests`
  - `/dashboard/[id]/photos`
  - `/dashboard/[id]/settings`
  - `/dashboard/new`
  - `/e/[slug]`
  - `/e/[slug]/gallery`
  - `/print/[slug]`

Contrôle de périmètre : `git diff --name-status refactor/flaash-analog-social-premium..HEAD` ne liste que `app/page.tsx`, `app/globals.css` et les documents ajoutés ci-dessus. `git diff --name-only` ciblé sur `public/images`, `components`, `lib`, `app/api`, `app/(auth)`, `app/dashboard`, `app/e` et `app/print` ne retourne aucun fichier.

## 3. Quality Checks

Résultat de `npm run quality` :

```text
> npm run lint && npm run typecheck && npm run build
> eslint . --max-warnings=0
> tsc --noEmit
> next build
✓ Compiled successfully
✓ Generating static pages (19/19)
```

Warning éventuel non bloquant :

```text
⚠ Failed to download the stylesheet for https://fonts.googleapis.com/... Skipped optimizing this font.
```

Interprétation : build réussi. Le warning est local/réseau et ne bloque pas le merge de la branche.

Résultat de `git status --short` avant création de ce fichier :

```text

```

Résultat attendu après création de ce fichier d'audit :

```text
?? design-references/FINAL_BRANCH_AUDIT_4_9.md
```

Résultat de `git diff --stat refactor/flaash-analog-social-premium..HEAD` :

```text
 app/globals.css                            | 397 ++++++++++++++++-
 app/page.tsx                               | 506 +++++-----------------
 design-references/FLAASH_BRAND_VOICE.md    | 421 ++++++++++++++++++
 design-references/FLAASH_CAMPAIGN_RULES.md | 468 ++++++++++++++++++++
 design-references/FLAASH_PROMPT_SYSTEM.md  | 656 +++++++++++++++++++++++++++++
 design-references/FLAASH_VISUAL_SYSTEM.md  | 432 +++++++++++++++++++
 design-references/LANDING_AUDIT_3_9.md     | 496 ++++++++++++++++++++++
 7 files changed, 2972 insertions(+), 404 deletions(-)
```

## 4. Section-by-Section Verdict

| Section | Statut | Commentaire | Risque restant | Recommandation |
|---|---|---|---|---|
| Navigation | Validé | Navigation simple, liens conservés vers `#comment-ca-marche`, `/login`, `/register`. CTA nav encore "Commencer", mais acceptable. | Libellé moins fort que "Créer un événement". | Surveiller en Lot 5 auth ; pas bloquant. |
| Hero | Validé | Phrase-monde validée, image hero conservée, CTA clair vers `/register`. | Aucun bug identifié ; vérifier crop mobile manuellement. | Garder stable avant merge. |
| Bande de réassurance | Validé | Les preuves sont rapides : zéro app, QR, photos cachées, galerie privée, export. | Ton encore fonctionnel mais utile. | Ne pas retoucher avant merge. |
| Comment ça marche | Validé | "Trois gestes. Puis on revient à la soirée." installe bien le rituel. QR traité comme objet social. | Aucun risque bloquant. | Vérifier le scroll ancre et l'image sur mobile. |
| Pendant la soirée | Validé | La section protège la présence et garde le téléphone secondaire. | Conversion indirecte, mais c'est son rôle narratif. | Garder en l'état. |
| Reveal | Validé | Fond Ink, "Le moment du reveal" et "Puis la soirée revient." cohérents avec le système marque. | Commentaire JSX contient encore "révélation", sans impact UI. | Surveiller la cohérence lexicale dans les futurs lots. |
| Événements | Validé | "Corporate" a été remplacé par "Équipe" ; le multi-usage reste premium accessible. | Liste encore brute. | Accepté pour merge ; enrichir seulement si Lot landing futur. |
| Pricing | Validé | Plus de badge recommandé, plus de hiérarchie premium artificielle, plans présentés comme formats d'événement. | Pricing encore assez fonctionnel et sombre. | Accepté ; surveiller lisibilité mobile. |
| FAQ | À surveiller | Ton plus humain, accordéon simple, réponses courtes. | Format FAQ reste classique. | Vérifier interaction tactile et focus. |
| CTA final | Validé | "Faites revenir la soirée." recentre Flaash sur le retour de l'événement. | Fond sombre potentiellement lourd en fin de page. | Accepté ; vérifier équilibre visuel desktop/mobile. |
| Footer | À surveiller | "Vivre maintenant. Revoir ensemble." remplace "Capture l'instant." | Footer très sombre, peut accentuer la rupture vers auth. | Non bloquant ; à surveiller après alignement auth. |

## 5. Pricing Verification

- Prix inchangés : `PLANS` reste la source, avec Essential 59 CHF, Classic 99 CHF, Premium 149 CHF.
- Plans inchangés : les labels affichés viennent toujours de `PLANS` via `plan.label`.
- Limites inchangées : 50, 120 et 250 invités restent les limites publiques affichées.
- Routes inchangées : tous les CTA pricing pointent toujours vers `/register`.
- Logique pricing inchangée : `lib/utils/pricing.ts`, `getPlanForGuests`, `getPlan`, Stripe Checkout et routes API ne sont pas modifiés.
- Pas de badge "Recommandé" : supprimé de la landing.
- Pas de hiérarchie premium artificielle : les trois cartes partagent le même traitement.
- Plans compris comme formats d'événement : "Format intime", "Format intermédiaire", "Grand format", "Choisir ce format".
- Features communes ou quasi communes : même rituel, QR, photos cachées, galerie privée, export ZIP.
- CTA cohérents : "Choisir ce format" sur chaque carte, sans FOMO.
- Clarté mobile : CSS prévu en une colonne sous 900 px et cartes séparées sous 640 px ; à vérifier manuellement.
- Pas de retour à un style SaaS : la checklist à coches et le badge recommandé ont disparu.
- Pas de FOMO artificielle : aucun label urgent, populaire, limité ou recommandé.

Termes anciens absents de `app/page.tsx` et `app/globals.css` côté landing visible :

- "Recommandé"
- "Support prioritaire"
- "Personnalisation avancée"
- "Corporate"
- "Capture l'instant"
- "Prêt à capturer"

Note : `lib/utils/pricing.ts` conserve des descriptions historiques non modifiées et non utilisées par cette landing pour certaines cartes. Ce fichier est hors scope et ne doit pas être modifié dans cette branche.

## 6. Brand System Verification

- Couleurs : paper / ink / shutter red sont le système principal de la landing.
- Forest green : présent en accent de confiance, non dominant sur la landing refondue.
- Amber : secondaire, surtout dots, reveal label et héritage ponctuel ; il ne porte plus les CTA principaux de conversion.
- Shutter red : utilisé comme signal d'action pour les CTA et numéros de rituel.
- Boutons : `flaash-btn-primary` shutter red remplace les anciens CTA amber dans pricing et CTA final.
- Ton : plus direct, moins SaaS, centré sur soirée, souvenirs, QR, reveal et retour collectif.
- Images : les quatre assets validés restent utilisés et jouent chacun un rôle narratif.
- QR : traité comme point d'entrée social dans "Comment ça marche".
- Téléphone : secondaire dans les images, jamais héros de la landing.
- Reveal : moment de marque central, pas seulement état fonctionnel.
- Absence de SaaS froid : pricing et FAQ restent fonctionnels mais ne dominent plus le récit.
- Absence de luxe froid : pas de code prestige, exclusivité ou mariage luxe dominant.
- Cohérence globale : la marque donne davantage l'impression de savoir exactement ce qu'elle fait, surtout grâce à la phrase-monde, au reveal et au pricing sans hiérarchie artificielle.

## 7. Copy Verification

Phrases validées dans la landing :

- "La soirée se vit maintenant. Les souvenirs se découvrent plus tard."
- "Trois gestes. Puis on revient à la soirée."
- "Pendant la soirée, personne ne doit gérer l'album."
- "Puis la soirée revient."
- "Chaque événement a ses regards. Flaash les réunit."
- "Un prix simple par événement."
- "Choisissez selon la taille de votre événement."
- "Même rituel Flaash, format adapté."
- "Faites revenir la soirée."
- "Vivre maintenant. Revoir ensemble."

Phrases supprimées ou remplacées :

- "Corporate" remplacé par "Équipe".
- "Support prioritaire" supprimé des features landing.
- "Personnalisation avancée" supprimé des features landing.
- "Recommandé" supprimé.
- "Prêt à capturer l'instant ?" remplacé par "Faites revenir la soirée."
- "Capture l'instant." remplacé par "Vivre maintenant. Revoir ensemble."

Incohérences restantes :

- Le terme visible "reveal" est désormais cohérent dans les zones clés, mais un commentaire JSX garde "révélation" sans impact utilisateur.
- La FAQ utilise encore une forme classique et pourrait devenir plus distinctive dans un lot futur.
- Le pricing reste volontairement clair et fonctionnel ; il ne doit pas être surpoétisé au risque de perdre la compréhension.

Recommandations :

- Conserver "reveal" comme terme rituel visible.
- Éviter de réintroduire "révélation" dans les labels de landing.
- Garder les CTA orientés action : créer, choisir, voir, lancer.
- Ne pas ajouter de phrases plus poétiques avant d'avoir aligné les pages auth.

## 8. Image Verification

- Aucune image modifiée dans le diff de branche.
- `public/images/landing/README.md` liste les quatre assets attendus et présents.
- Assets présents localement :
  - `hero-event-memory.webp`
  - `scan-qr-table.webp`
  - `capture-party-moment.webp`
  - `reveal-phone-group.webp`
- Rôle de chaque image :
  - `hero-event-memory.webp` : soirée vécue, présence et énergie sociale.
  - `scan-qr-table.webp` : entrée par QR, QR card comme objet social.
  - `capture-party-moment.webp` : geste naturel de capture, téléphone secondaire.
  - `reveal-phone-group.webp` : retour collectif des souvenirs, reveal émotionnel.
- Image V2 : reste un backlog potentiel, pas une condition de merge.
- Aucun remplacement nécessaire avant merge.
- Aucun bug d'asset réel identifié par inspection de fichiers et build.

Note de vérification locale : aucun test navigateur n'a été lancé pour charger visuellement les images. Si une image ne charge pas manuellement, distinguer :

- bug de code : chemin `src` invalide ou rendu `next/image` cassé ;
- cache / serveur local : `.next`, cache navigateur, dev server ;
- asset réel : fichier absent, corrompu ou mauvais format.

## 9. Internal Pages Out Of Scope

| Page | Rupture visuelle éventuelle | Impact sur merge | Prochain lot recommandé |
|---|---|---|---|
| `/register` | Oui. Encore ancienne DA : fond forest, stripe amber, `f-script`, CTA capitales `btn-forest`. | Ne bloque pas, mais vient directement après les CTA landing. | Lot 5 prioritaire auth. |
| `/login` | Oui. Ancienne DA Ink/amber, wording script, CTA en capitales. | Ne bloque pas, sauf bug non observé. | Lot 5 prioritaire auth. |
| `/forgot-password` | Oui. Même famille visuelle que login, moins critique car flux secondaire. | Ne bloque pas. | Lot 5 auth avec forgot/reset. |
| `/reset-password` | Oui. Même ancienne grammaire forest/amber/script. | Ne bloque pas. | Lot 5 auth avec forgot/reset. |
| `/dashboard` | Oui partiellement. Interface fonctionnelle avec Playfair/script, emojis et anciens boutons. | Ne bloque pas la landing. | Lot 7 ou lot dashboard dédié. |
| `/e/[slug]` | Oui partiellement. Expérience invitée encore dans l'ancienne DA, mais parcours critique préservé. | Ne bloque pas ce merge si aucun bug. | Lot 6 guest/event pages. |
| `/e/[slug]/gallery` | Oui partiellement. Fond Ink cohérent avec reveal, mais script/amber et galerie restent ancienne grammaire. | Ne bloque pas. | Lot 6 guest/gallery alignment. |
| `/print/[slug]` | Oui partiellement. Carte QR fonctionnelle et stable, mais DA pas encore alignée à la nouvelle landing. | Ne bloque pas, surtout après correction PNG déjà validée. | Lot 7 dashboard / print card alignment. |

Conclusion hors scope : les pages internes ne doivent pas bloquer le merge de la landing. Elles doivent en revanche devenir le prochain chantier prioritaire, car `/register` et `/login` sont le prolongement immédiat des CTA.

## 10. Visual / Responsive Manual Checklist

- [ ] Desktop 1440×1100 : hero équilibré, pas de ligne orpheline critique.
- [ ] Mobile 375×812 : aucun scroll horizontal, CTA lisibles.
- [ ] Image hero chargée.
- [ ] Image scan chargée.
- [ ] Image capture chargée.
- [ ] Image reveal chargée.
- [ ] Pricing lisible en une colonne mobile.
- [ ] FAQ fonctionne au toucher et au clavier.
- [ ] CTA `/register` fonctionne depuis nav, hero, pricing et CTA final.
- [ ] Lien `/login` fonctionne depuis la nav.
- [ ] Footer propre et liens `/privacy`, `/mentions-legales`, mailto visibles.

## 11. Remaining Risks

Risques acceptés pour merge :

- Pricing encore assez fonctionnel.
- Bas de page très sombre, à surveiller dans la perception globale.
- FAQ encore classique.
- Images V2 toujours en backlog.
- Rupture visuelle avec `/register` et `/login`.
- Pages invité et dashboard pas encore alignées.
- Cohérence du terme reveal à surveiller dans les prochains lots.
- Risque de surdesign si la landing continue à être retouchée au lieu de passer aux pages post-CTA.

Risques non bloquants observés :

- Warning Google Fonts pendant `next build` local.
- Pas de vérification navigateur/screenshot effectuée dans ce lot d'audit.

## 12. Final Recommendation

Recommandation : **merge maintenant** dans `refactor/flaash-analog-social-premium`.

Raison : la branche est merge-ready pour la landing, respecte le périmètre réel, ne touche pas à la logique métier, ne modifie pas les images, ne modifie pas `PLANS`, ne touche pas à Stripe/Supabase/R2/upload et passe `npm run quality`.

Aucun micro-fix bloquant requis avant merge.

Prochains lots recommandés :

- Lot 5 : Auth pages visual alignment (`/register`, `/login`, `/forgot-password`, `/reset-password`)
- Lot 6 : Guest/event pages alignment (`/e/[slug]`, gallery)
- Lot 7 : Dashboard / print card alignment
