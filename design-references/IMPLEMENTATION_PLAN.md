# Plan d'implémentation — refonte visuelle Flaash

Ce plan transforme la direction « Flaash — Analog Social Premium » en lots isolés et vérifiables. Il n'autorise aucune modification produit avant validation explicite du lot concerné.

## Règles globales

- Préserver création d'événement, sélection automatique du plan, Stripe Checkout, webhook, plan Test, scan QR, capture mobile, upload, modération, reveal, ZIP et page `/print/[slug]`.
- Ne modifier ni prix, limites de plans, règles Stripe, schéma Supabase, RLS, stockage R2, routes, contrats API ou variables d'environnement.
- Ne pas ajouter de dépendance de production sans justification et confirmation préalables.
- Ne pas refactoriser un fichier hors du besoin du lot.
- Identifier les fichiers concernés et formuler les risques avant chaque modification.
- Après chaque lot de code, exécuter `npm run quality`.
- Toute régression fonctionnelle bloque le passage au lot suivant.
- Les nouveaux visuels doivent avoir été validés selon `IMAGE_SHOTLIST.md`.

## Matrice de contrôle commune

### Mobile

- Largeurs minimales : 320 px et 375 px.
- iPhone Safari : safe areas, barre d'adresse dynamique, zoom, caméra et sélecteur d'images.
- Android Chrome : navigation, caméra, upload et retours arrière.
- Aucun scroll horizontal.
- Corps de texte de 16 px minimum dans les formulaires.
- Cibles tactiles de 44 × 44 px minimum.
- CTA principal visible sans masquer le contenu ou la barre système.
- Images recadrées sans couper les visages ou l'action.

### Desktop

- Contrôles à 1024, 1280 et 1440 px.
- Largeur de lecture maîtrisée et sections non excessivement étirées.
- États hover et focus visibles.
- Navigation clavier complète.
- Images nettes, sans upscaling visible ni layout shift.

### Accessibilité et performance

- Contraste AA pour le texte courant.
- Zoom navigateur autorisé.
- Hiérarchie de titres cohérente.
- `alt` adapté au rôle de chaque image.
- `prefers-reduced-motion` respecté.
- Dimensions ou ratio réservés pour les images.
- Images responsives et formats web optimisés.

## Lot 0 — Validation des actifs

### Fichiers concernés

- `design-references/DA_VALIDATED.md`
- `design-references/IMAGE_SHOTLIST.md`
- Futurs actifs proposés, conservés dans `design-references/` tant qu'ils ne sont pas validés.

### Autorisé

- Sélectionner, générer, comparer et documenter les images.
- Vérifier les ratios desktop et mobile.
- Valider la cohérence du corpus.

### Interdit

- Copier un actif dans `public/`.
- Modifier un fichier produit.
- Adapter le code à une image non validée.

### Vérifications

- Revue humaine selon la grille de `IMAGE_SHOTLIST.md`.
- Vérification des droits et de la provenance avant utilisation.
- Aucun `npm run quality` requis tant qu'aucun fichier produit n'est modifié.

### Point de passage

Le lot est clos lorsque chaque emplacement de la landing dispose d'un actif approuvé et d'un recadrage mobile identifié.

## Lot 1 — Tokens et typographie

### Fichiers envisagés

- `app/globals.css`
- `app/layout.tsx`
- Éventuellement les fichiers de police locaux ou leur configuration existante, sans nouvelle dépendance.

### Autorisé

- Ajouter les tokens shutter red et les rôles sémantiques validés.
- Mettre en place Archivo et la hiérarchie typographique.
- Ajouter les états focus, pressé et reduced-motion nécessaires.
- Préserver temporairement les anciens tokens utilisés par les écrans non migrés.

### Interdit

- Modifier la structure de la landing.
- Supprimer brutalement un token encore utilisé.
- Modifier les composants métier, données ou routes.
- Ajouter une dépendance de production sans accord.

### Vérifications

- `npm run quality`
- Recherche des usages des tokens modifiés.
- Contrôle visuel des pages auth, dashboard, invité, galerie et print pour détecter les effets globaux.

### Points de contrôle

- Mobile : absence de reflow typographique critique à 320 et 375 px.
- Desktop : chargement des polices sans saut de mise en page perceptible.

## Lot 2 — Navigation, hero et réassurance

### Fichiers envisagés

- `app/page.tsx`
- `app/globals.css`
- Actifs validés ajoutés sous `public/` dans un sous-dossier dédié.

### Autorisé

- Recomposer uniquement la navigation, le hero et la bande de réassurance.
- Introduire le hero photographique et le CTA shutter red.
- Ajouter des styles strictement nécessaires à ces sections.

### Interdit

- Modifier les tarifs ou les plans.
- Refaire les sections suivantes dans le même lot.
- Changer les destinations des liens ou le comportement d'authentification.
- Ajouter des animations complexes ou une bibliothèque de motion.

### Vérifications

- `npm run quality`
- Test manuel des liens connexion et création de compte.
- Vérification des images above-the-fold, du CLS et du temps d'affichage.

### Points de contrôle

- Mobile : CTA et proposition de valeur compris sans scroll excessif ; crop du hero à 320/375 px.
- Desktop : équilibre texte/photo à 1024/1440 px ; aucune ligne de titre orpheline.

## Lot 3 — Narration centrale de la landing

### Fichiers envisagés

- `app/page.tsx`
- `app/globals.css`
- Actifs validés sous `public/`.

### Autorisé

- Refaire « comment ça marche » en trois temps.
- Ajouter les sections capture, attente, reveal et mosaïque d'événements.
- Introduire les variations de cartes et de formats photographiques validées.

### Interdit

- Modifier les parcours invités réels.
- Inventer des fonctionnalités, témoignages, chiffres ou partenaires.
- Modifier les prix ou la logique de sélection d'un plan.
- Copier la structure exacte des références Lapoint.

### Vérifications

- `npm run quality`
- Lecture de la page sans images pour vérifier que le contenu reste compréhensible.
- Contrôle des `alt`, du lazy-loading et des dimensions d'images.

### Points de contrôle

- Mobile : ordre narratif clair, mosaïques sans débordement, texte non superposé aux visages.
- Desktop : rythme varié sans espaces morts ni cartes uniformes.

## Lot 4 — Tarifs, FAQ, CTA final et footer

### Fichiers envisagés

- `app/page.tsx`
- `app/globals.css`

### Autorisé

- Restyler la présentation des tarifs sans changer les données.
- Harmoniser FAQ, CTA final et footer.
- Améliorer hiérarchie, espacement et états interactifs.

### Interdit

- Modifier `PLANS`, prix, capacités, avantages contractuels ou règles Stripe.
- Changer le contenu légal sans validation spécifique.
- Modifier Checkout ou les routes de paiement.

### Vérifications

- `npm run quality`
- Comparaison explicite des prix et limites avant/après.
- Test de tous les CTA et liens du footer.

### Points de contrôle

- Mobile : cartes tarifaires lisibles sans tableau horizontal ; FAQ manipulable au toucher.
- Desktop : comparaison des offres immédiate ; aucune offre artificiellement masquée.

## Lot 5 — Expérience invité et capture

### Fichiers envisagés

- `app/e/[slug]/page.tsx`
- `app/e/[slug]/GuestCamera.tsx`
- `app/globals.css`, seulement si un token partagé manque.

### Autorisé

- Adapter la hiérarchie visuelle et les couleurs.
- Introduire le déclencheur shutter red.
- Harmoniser cartes, compteurs et états de progression.
- Préserver les messages privacy existants.

### Interdit

- Modifier join, caméra, sélection d'image, upload, quotas ou suppression.
- Modifier les appels API, Supabase, stockage ou gestion de session invité.
- Changer la signification d'un état fonctionnel.

### Vérifications

- `npm run quality`
- Test manuel : scan QR, identification invité, prise de photo, sélection photothèque, upload, limite atteinte, erreur et suppression.
- Test avec connexion lente et refus d'autorisation caméra.

### Points de contrôle

- iPhone Safari et Android Chrome réels si possible.
- CTA capture accessible d'une main et hors des safe areas.
- Aucun effet visuel ne masque progression, erreur ou limite restante.

## Lot 6 — Reveal et galerie

### Fichiers envisagés

- `app/e/[slug]/gallery/page.tsx`
- `app/e/[slug]/gallery/GalleryClient.tsx`
- Parties reveal présentes dans `app/e/[slug]/page.tsx` ou `GuestCamera.tsx`, uniquement si nécessaire.

### Autorisé

- Harmoniser la scène de reveal et la galerie sombre.
- Revoir rythme, typographie, overlays et présentation des miniatures.
- Ajouter des transitions légères et accessibles.

### Interdit

- Modifier la logique de date ou de reveal manuel.
- Modifier le chargement, l'ordre, la modération ou la suppression des photos.
- Ajouter une navigation gestuelle sans alternative visible.

### Vérifications

- `npm run quality`
- Test galerie vide, 1 photo, plusieurs photos et volume important.
- Test ouverture, précédent, suivant, fermeture et suppression autorisée.

### Points de contrôle

- Mobile : lightbox compatible avec safe areas et navigation tactile.
- Desktop : navigation clavier, focus visible et taille d'image contenue dans le viewport.

## Lot 7 — Carte QR et export

### Fichiers envisagés

- `app/print/[slug]/PrintCard.tsx`
- `app/print/[slug]/page.tsx`, seulement si la présentation l'exige.
- `app/print/layout.tsx`, seulement pour les ressources visuelles nécessaires.

### Autorisé

- Adapter typographie, couleur et composition périphérique.
- Harmoniser l'aperçu écran et le PNG exporté.
- Conserver une large zone calme autour du QR.

### Interdit

- Modifier l'URL encodée ou le niveau de correction sans justification technique.
- Réduire la scannabilité pour un effet visuel.
- Ajouter une image de fond derrière le QR.
- Réintroduire un bug d'export Safari.

### Vérifications

- `npm run quality`
- Export PNG sur Safari et Chrome.
- Scan du PNG depuis plusieurs téléphones.
- Impression A6 réelle ou à l'échelle, puis scan à plusieurs distances.

### Points de contrôle

- Écran mobile : aperçu et téléchargement utilisables sans débordement.
- Desktop/impression : typographie nette, QR non déformé et marges suffisantes.

## Lot 8 — Auth et dashboard

### Fichiers envisagés

- `app/(auth)/**`
- `app/dashboard/**`
- `app/globals.css`, uniquement pour les composants partagés validés.

### Autorisé

- Harmonisation légère des tokens, boutons, cartes et typographie.
- Correction des incohérences visuelles créées par les lots précédents.

### Interdit

- Repenser les parcours ou la navigation.
- Modifier auth, actions serveur, permissions, données ou logique de dashboard.
- Étendre le lot à une refonte fonctionnelle.

### Vérifications

- `npm run quality`
- Test login, inscription, mot de passe oublié et reset.
- Test création d'événement, dashboard, paramètres, invités, photos et téléchargement ZIP.
- Test du plan Test et du parcours Stripe dans un environnement adapté.

### Points de contrôle

- Mobile : formulaires sans zoom automatique, erreurs proches des champs, clavier adapté.
- Desktop : largeur de formulaire, navigation et densité du dashboard cohérentes.

## Validation finale transverse

- Exécuter `npm run quality` sur l'état complet.
- Parcourir tous les parcours critiques listés dans `AGENTS.md`.
- Vérifier qu'aucune valeur tarifaire, règle de plan ou logique métier n'a changé.
- Comparer les pages avant/après aux références de `design-references/flaash-current/`.
- Vérifier la cohérence avec `DA_VALIDATED.md` et la qualité des images avec `IMAGE_SHOTLIST.md`.
- Documenter les écarts acceptés et les validations manuelles restantes avant déploiement.
