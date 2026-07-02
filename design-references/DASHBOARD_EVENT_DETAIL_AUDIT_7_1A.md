# Lot 7.1A — Dashboard Event Detail Visual Audit

## 1. Executive Summary

Verdict : **pas encore au niveau de la DA Flaash**.

La refonte actuelle améliore nettement l'ancienne page : le grand bloc forest dominant a disparu, les tokens paper/ink sont mieux utilisés, les actions sont plus lisibles et le QR reste scannable. Mais l'ensemble reste trop proche d'une pile de cartes administratives dans un shell mobile. Sur desktop, la page ne devient pas un vrai espace organisateur premium : elle reste étroite, verticale, séquentielle et peu maîtrisée dans sa composition.

Le problème principal n'est pas la couleur ou le style de chaque carte prise séparément. C'est la structure globale : tout a presque le même poids, les actions sont dispersées, le QR n'est pas encore mis en scène comme l'objet social central, et la page ne donne pas assez vite le sentiment "mon événement est prêt à être partagé".

Recommandation stratégique : **refaire la structure visuelle**, sans rollback complet et sans toucher à la logique.

## 2. What Works

- Les requêtes, liens et actions fonctionnelles restent lisibles dans le code.
- Le QR est visible, sur fond clair, avec une taille correcte et une bonne priorité de scannabilité.
- Le wording "Lien invité", "Partager le lien", "Carte QR à imprimer", "Modérer les photos" va dans la bonne direction.
- Le forest green n'est plus un grand aplat dominant.
- Le shutter red est utilisé sur "Partager le lien", ce qui correspond bien à une action de lancement.
- Les stats sont plus sobres que l'ancienne version.
- La suppression événement est plus discrète que les actions principales.
- Le bloc CSS dédié dashboard prépare une correction plus structurée.
- Le mobile reste probablement utilisable parce que l'ordre vertical est simple.

## 3. What Does Not Work

- La page ressemble encore à une succession de cards, pas à un espace organisateur pensé.
- Sur desktop, le layout n'exploite pas l'espace : le shell reste centré et étroit, ce qui donne une impression de page mobile agrandie.
- La composition n'a pas de moment fort assez net. Header, stats, QR, cover, détails et export se suivent avec un rythme trop uniforme.
- La hiérarchie organisateur est faible : l'utilisateur ne comprend pas instantanément quelle action faire maintenant.
- Les actions importantes sont trop dispersées : "Modifier les paramètres" dans le header, "Partager le lien" dans la QR card, "Modérer les photos" sous le QR, "Révéler maintenant" plus bas, export encore plus bas.
- Le QR est central dans l'ordre de page, mais pas assez central dans la composition. Il reste une carte dans une carte.
- Le bloc "Carte QR à imprimer" est traité comme une action secondaire banale alors qu'il matérialise l'objet social Flaash.
- Les stats arrivent avant le QR alors que l'objectif organisateur prioritaire devrait être de partager l'événement.
- La cover photo est isolée après le QR, sans rôle clair dans la préparation de l'événement.
- Les détails restent proches d'une table admin, même si le style est plus doux.
- L'ensemble est propre mais trop plat : peu de contraste spatial, peu de respiration éditoriale, peu de tension paper/ink/reveal.

## 4. DA Mismatch

La DA Flaash demande de rendre visible un rituel : créer, poser ou partager le QR, laisser les invités capturer, attendre, révéler, exporter. La page actuelle montre ces fonctions, mais elle ne les orchestre pas.

### Paper / cream

Le paper est bien présent, mais il devient un fond uniforme et une succession de surfaces chaudes. Résultat : la page est douce, mais manque de relief. Le paper devrait servir de base respirante, pas devenir une grille de cartes beige.

### Ink / noir chaud

Ink est utilisé pour les textes et quelques boutons. Il pourrait mieux structurer la page : une colonne latérale, un bandeau de statut, ou un module reveal/export plus affirmé. Aujourd'hui, le contraste ink ne crée pas assez de hiérarchie.

### Shutter red

Le shutter red est correctement réservé à "Partager le lien". Mais l'action rouge est enfouie dans la QR card. Elle devrait porter le lancement de l'événement : partager le lien, préparer le QR ou envoyer les invités vers le scan. Elle doit rester rare, mais plus visible.

### Forest green

Forest est redevenu un accent, ce qui est positif. Attention toutefois aux badges et petites touches vertes : elles peuvent vite recréer une grammaire "status dashboard" si elles ne sont pas reliées à la confiance ou à la disponibilité.

### Amber

Amber reste utile pour l'état draft/paiement, mais ne doit pas redevenir un signal d'action. Sur la page actuelle, il reste limité. C'est acceptable.

### Impression globale

La page n'est plus ancienne DA, mais elle n'est pas encore assez Flaash. Elle est trop beige, trop plate, trop fonctionnelle et encore trop SaaS dans sa structure : stats, cards, détails, boutons empilés.

## 5. Layout Recommendation

Il faut passer à une composition desktop en deux colonnes, tout en conservant un ordre mobile simple.

Desktop:

- Conteneur plus large que le shell mobile, par exemple une largeur produit autour de 1040-1180 px.
- Header pleine largeur en haut :
  - retour dashboard discret ;
  - type événement, statut, plan ;
  - titre événement fort ;
  - phrase d'état courte ;
  - action paramètres en lien secondaire.
- Colonne gauche, plus large :
  - bloc QR hero comme objet principal ;
  - lien invité visible ;
  - "Partager le lien" en CTA principal ;
  - "Carte QR à imprimer" comme module intégré, pas simple bouton ;
  - actions immédiates liées au lancement.
- Colonne droite, plus compacte :
  - stats essentielles ;
  - statut reveal ;
  - accès modération ;
  - export ZIP si disponible.
- Sous la grille principale :
  - cover photo comme module éditorial ;
  - détails événement en liste apaisée ;
  - zone dangereuse très basse et discrète.

Mobile:

- Garder un ordre vertical.
- Ordre recommandé :
  - retour ;
  - titre/statut ;
  - QR + partager ;
  - carte QR à imprimer ;
  - stats ;
  - modération / reveal / export ;
  - cover ;
  - détails ;
  - suppression.
- Boutons pleine largeur, zones tactiles 48-56 px.
- QR conservé à une taille scannable, sans décor qui empiète.
- Aucun scroll horizontal ; long URL en `overflow-wrap`.

Cette structure ferait passer la page d'une pile d'éléments à un vrai poste de pilotage organisateur : préparer, partager, suivre, révéler, conserver.

## 6. QR Block Recommendation

Le QR doit devenir le centre de lancement de l'événement.

Recommandation :

- Créer un bloc QR plus large sur desktop, avec la QR card à gauche ou au centre et le texte/action à côté.
- Traiter la QR card comme une carte physique posée dans l'interface : fond blanc pur, marge généreuse, ombre légère, bord chaud, QR très net.
- Garder le QR sobre : aucun grain, aucun overlay, aucun contraste faible autour du code.
- Afficher le lien invité sous forme lisible, avec le domaine et le slug, mais sans prendre plus de place que le QR.
- Mettre "Partager le lien" immédiatement après le QR ou dans la même zone de décision, en shutter red.
- Donner plus de poids à "Carte QR à imprimer" :
  - mini-module "Carte QR à imprimer" avec une courte preuve ;
  - lien `/print/[slug]` conservé ;
  - traitement comme prolongement physique du QR, pas comme bouton secondaire générique.
- Garder "Modérer les photos" proche du suivi événement, pas nécessairement sous le QR.

Le bloc doit faire sentir : "votre événement est prêt à entrer dans la soirée".

## 7. Actions Hierarchy Recommendation

### Primary

- Partager le lien
- Carte QR à imprimer
- Révéler maintenant, uniquement quand l'événement est actif et que le contexte le rend prioritaire

### Secondary

- Modérer les photos
- Modifier les paramètres
- Télécharger toutes les photos
- Voir les photos
- Voir les invités

### Utility

- Lien invité affiché/copliable ou partageable
- Stats photos/invités/poses
- Cover upload/remplacement
- Détails événement
- Tolérance plan si présente

### Destructive

- Supprimer la photo de couverture
- Supprimer l'événement

Les actions doivent être regroupées par intention :

- Lancer / partager : QR, partager, imprimer.
- Suivre / gérer : stats, modération, paramètres.
- Révéler / conserver : révéler, télécharger.
- Danger : suppression, séparée visuellement et basse dans la page.

Aujourd'hui, ces familles sont mélangées dans l'ordre vertical, ce qui affaiblit la maîtrise organisateur.

## 8. Copy Recommendations

### À garder

- "Lien invité"
- "Partager le lien"
- "Carte QR à imprimer"
- "Modérer les photos"
- "La galerie est révélée."
- "Télécharger toutes les photos"

### À améliorer

- "Le QR est prêt à circuler."
  - Correct, mais un peu abstrait.
  - Alternatives :
    - "Votre QR est prêt."
    - "Le point d'entrée de la soirée."
    - "Vos invités peuvent scanner."
- "Posez la carte à l'entrée ou partagez le lien."
  - Bonne direction, mais peut être plus nette.
  - Alternative :
    - "Posez la carte à l'entrée. Partagez le lien si besoin. Les invités scannent, capturent, puis reviennent à la soirée."
- "Révéler maintenant."
  - Bon CTA si l'action est rare et clairement contextualisée.
  - Alternative possible :
    - "Révéler la galerie"
- "Télécharger toutes les photos."
  - Fonctionnel et clair.
  - Alternative plus marque :
    - "Télécharger les souvenirs"
  - Mais garder "toutes les photos" peut être préférable pour éviter l'ambiguïté.

### À éviter

- Trop de labels uppercase sur les petits modules. Ils renforcent l'impression dashboard.
- Les formulations qui expliquent l'interface au lieu du rituel.
- Les mots trop techniques : upload, ZIP, photothèque, sauf dans les détails où ils servent la précision.
- Les phrases longues sous les boutons. La page doit être rassurante, pas explicative partout.

## 9. Implementation Plan

Plan de correction en petits pas, sans toucher à la logique :

1. Créer une grille responsive dédiée à `/dashboard/[id]`.
   - Desktop : header pleine largeur + deux colonnes.
   - Mobile : ordre vertical inchangé mais mieux hiérarchisé.

2. Recomposer le haut de page.
   - Garder titre, statut, type et plan.
   - Rendre le titre plus éditorial et moins "card title".
   - Déplacer "Modifier les paramètres" en action secondaire.

3. Refondre le bloc QR.
   - QR en objet central.
   - CTA "Partager le lien" plus visible.
   - "Carte QR à imprimer" intégrée comme extension de l'objet QR.
   - Conserver exactement `QRCodeCard`, `eventUrl`, `slug`, `title` et le lien `/print/${ev.slug}`.

4. Regrouper les actions organisateur.
   - Lancement : partager, imprimer.
   - Gestion : modération, paramètres.
   - Reveal/export : révéler, télécharger.
   - Danger : suppression.

5. Repositionner les stats.
   - Les stats doivent soutenir le pilotage, pas précéder le lancement.
   - Sur desktop, les placer dans la colonne droite.
   - Sur mobile, les placer après le QR.

6. Réintégrer la cover.
   - La rendre moins isolée.
   - La traiter comme aperçu de l'expérience invitée, pas comme simple upload card.
   - Ne pas toucher aux handlers POST/DELETE.

7. Simplifier les détails.
   - Garder les informations existantes.
   - Réduire l'effet table admin.
   - Conserver le lien invité complet.

8. Revalider responsive.
   - Mobile 375 px et 390 px.
   - Desktop 1280 px et 1440 px.
   - QR scannable.
   - Aucun scroll horizontal.

9. Lancer `npm run quality`.
   - Vérifier lint, typecheck, build.
   - Puis validation navigateur manuelle.

## 10. Functional Guardrails

Ne pas modifier :

- `createClient`
- requêtes Supabase events/photos/guests
- mise à jour automatique du statut revealed
- `eventUrl`
- fallback `NEXT_PUBLIC_APP_URL`
- `QRCodeSVG`
- valeur QR `value={url}`
- taille QR sans raison de scannabilité
- `handleShare`
- `navigator.share`
- fallback clipboard/prompt
- lien `/dashboard/${ev.id}/photos`
- lien `/dashboard/${ev.id}/guests`
- lien `/dashboard/${ev.id}/settings`
- lien `/print/${ev.slug}`
- lien `/api/download/${ev.slug}`
- `CoverUploadCard` API POST `/api/events/${eventId}/cover`
- `CoverUploadCard` API DELETE `/api/events/${eventId}/cover`
- validation type/poids de cover
- `revealNow`
- `activateEvent`
- `resumePayment`
- `deleteDraftAndNew`
- `deleteEvent`
- `DeleteButton` confirmation
- routes API
- `actions.ts`
- `lib/`
- Supabase/RLS
- Stripe
- R2
- upload
- auth
- pages invité
- pages landing
- pages auth
- pricing, plans et limites

Ne pas supprimer :

- page print QR `/print/[slug]`
- bouton dev bypass en développement
- `.btn-amber`
- états draft/active/revealed/closed
- messages d'erreur cover
- download ZIP conditionnel

## 11. Final Recommendation

Recommandation : **refaire la structure visuelle**, pas garder en l'état.

La page actuelle est une bonne base technique et un premier nettoyage visuel, mais elle n'est pas encore au niveau de la DA Flaash. Un micro-fix couleur ou spacing ne suffira pas : le problème est la composition. Il faut passer à un layout organisateur plus large, plus hiérarchisé, avec un bloc QR vraiment central et des actions regroupées par intention.

Rollback partiel non recommandé : les améliorations paper/ink, les libellés plus justes et la réduction du forest dominant doivent être conservés. La correction doit réutiliser ce travail, mais remplacer la pile mobile par une vraie architecture desktop/mobile.
