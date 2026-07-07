# Image asset map — landing Flaash

Statut : spécification des assets avant génération et intégration.  
Direction : **Flaash — Analog Social Premium**.  
Référence éditoriale : [`IMAGE_SHOTLIST.md`](./IMAGE_SHOTLIST.md).

## Principe directeur

Les images ne doivent pas montrer des personnes « contentes d'utiliser une app ». Elles doivent montrer :

1. une soirée réellement en train de se vivre ;
2. une QR card désirable intégrée au monde réel ;
3. une capture naturelle qui ne détourne pas durablement l'attention ;
4. un reveal intime où l'événement revient à travers les regards des invités.

> **Flaash ne capture pas seulement l'événement. Flaash crée le moment où l'événement revient.**

L'interface, le téléphone et le QR restent des moyens. Les personnes, leur présence et leur redécouverte portent l'émotion.

## Carte synthétique

| Asset | Emplacement final | Section | Ratio principal | Usage narratif |
|---|---|---|---:|---|
| `hero-event-memory.webp` | `public/images/landing/hero-event-memory.webp` | Hero | 4:5 | La soirée en train de se vivre |
| `scan-qr-table.webp` | `public/images/landing/scan-qr-table.webp` | Parcours — scan | 3:2 | La QR card comme objet social |
| `capture-party-moment.webp` | `public/images/landing/capture-party-moment.webp` | Parcours — capture | 4:5 | La capture comme geste naturel |
| `reveal-phone-group.webp` | `public/images/landing/reveal-phone-group.webp` | Section reveal | 3:2 | Le retour émotionnel de l'événement |

## Spécifications techniques communes

- Format final : WebP, profil colorimétrique sRGB.
- Qualité indicative : 78–84, à ajuster selon le grain et les visages.
- Conserver un master haute définition hors du dépôt avant export WebP.
- Largeur ou hauteur longue minimale : 1 600 px pour les assets finaux.
- Poids cible : 220–450 Ko par image ; maximum 600 Ko après validation visuelle.
- Supprimer les métadonnées inutiles à l'export.
- Ne pas accentuer artificiellement la netteté pour compenser la compression.
- Le grain doit survivre à la compression sans devenir un bruit numérique uniforme.
- Chaque cadrage doit rester exploitable à 375 px et 1 440 px.
- Aucun asset n'est intégré avant validation humaine selon la checklist finale.

## 1. `hero-event-memory.webp`

### Rôle dans la landing

Porter la promesse émotionnelle dès le premier écran : l'événement est vécu avant d'être consommé comme contenu. L'image doit donner envie d'entrer dans la soirée, pas d'examiner le produit.

### Section d'utilisation

Hero de la landing, en remplacement futur du placeholder lifestyle abstrait du Lot 2.

### Format et ratio recommandés

- Format final : WebP.
- Ratio principal : **4:5 portrait**.
- Export recommandé : **1 600 × 2 000 px**.
- Zone sûre : l'action et les visages principaux doivent rester dans les 70 % centraux.
- Crop secondaire obligatoire : compatible avec un conteneur mobile **4:3 paysage** sans perdre l'interaction principale.

### Cadrage

- Groupe en plan moyen, photographié depuis l'intérieur de la soirée.
- Interaction principale légèrement décentrée.
- Premiers plans partiels acceptés : épaule, bras, verre ou mouvement.
- Pas de regard collectif dirigé vers l'objectif.
- Le cadre doit sembler pris par un autre invité.

### Ambiance

- Soirée privée contemporaine en Europe.
- Chaleur naturelle, flash direct doux et ombres crédibles.
- Mouvement léger, expressions non préparées et texture 35 mm.
- Tenues élégantes mais accessibles ; aucune réception ostentatoire.

### Présence du téléphone

**Très faible ou nulle.** Maximum indicatif : 5 % du cadre. S'il apparaît, il reste périphérique et son écran est invisible ou abstrait.

### Présence du QR

**Nulle.** Le hero vend la présence et l'énergie, pas le mécanisme.

### Erreurs à éviter

- Groupe aligné ou posé comme une campagne de mariage.
- Personne souriant à un téléphone ou regardant une interface.
- Mariés, robe blanche ou décor cérémoniel comme sujet dominant.
- Lumière orange uniforme, peau plastique ou netteté commerciale.
- Composition de banque d'images avec espace vide artificiel.
- Effets rétro décoratifs : rayures, date imprimée ou light leak excessif.

### Critères de validation

- L'énergie de la soirée est comprise en moins d'une seconde.
- La scène reste forte si tout téléphone est masqué.
- Le crop 4:5 et le crop mobile 4:3 préservent les visages et l'action.
- L'image pourrait représenter un anniversaire, une soirée privée ou un mariage contemporain sans être enfermée dans un seul usage.
- Elle exprime la présence avant le prestige.

### Prompt de génération

> Candid editorial documentary photograph from inside a lively private celebration in contemporary Europe, a diverse group of adult friends laughing and moving together during a real unscripted moment, photographed from another guest's point of view, medium shot with imperfect off-center framing, partial shoulders and gestures crossing the foreground, subtle direct flash mixed with warm ambient light, natural skin texture, slight motion blur, tactile 35mm film grain, elegant but accessible evening clothing, cream, ink, muted amber and forest tones, emotionally immediate, intimate and social, the feeling of living the party before seeing the photos, portrait 4:5 composition with all essential faces and action inside a central crop-safe area, suitable for a 4:3 mobile crop, no visible branding.

**Negative prompt:**

> people happily using an app, centered smartphone, readable screen, QR code, staged group portrait, luxury wedding editorial, bride-focused scene, stock-photo smiles, people looking at camera, influencer pose, corporate event, orange cinematic filter, plastic skin, malformed hands, extra fingers, fake logo, readable text, fake UI, excessive bokeh, retro date stamp, heavy light leaks, surf or travel advertising.

## 2. `scan-qr-table.webp`

### Rôle dans la landing

Montrer l'entrée dans le rituel Flaash. La QR card doit être un objet social naturel dans la soirée, pas une capture d'écran ou une démonstration technique.

### Section d'utilisation

Future étape « Scannez » du parcours narratif de la landing.

### Format et ratio recommandés

- Format final : WebP.
- Ratio principal : **3:2 paysage**.
- Export recommandé : **1 800 × 1 200 px**.
- Zone sûre : QR card et geste de scan dans le tiers central droit ou gauche, avec contexte social visible autour.
- Crop secondaire : compatible avec un ratio carré pour une carte mobile.

### Cadrage

- Plan rapproché contextuel d'une table réellement utilisée.
- QR card en second plan narratif, jamais parfaitement centrée.
- Une main et une partie du téléphone peuvent entrer dans le cadre.
- Les invités restent perceptibles, en interaction, dans l'arrière-plan.

### Ambiance

- Table vivante : verres déplacés, serviette, petits objets personnels et lumière imparfaite.
- Premium accessible, sans dorures ni mise en scène cérémonielle.
- Flash doux ou lumière mixte, profondeur de champ modérée.

### Présence du téléphone

**Moyenne mais secondaire.** Environ 10–15 % du cadre. L'écran reste flou, sombre ou abstrait, sans interface lisible.

### Présence du QR

**Moyenne.** Environ 5–10 % du cadre. Il doit être identifiable comme QR card sans devenir un produit photographié en studio.

Si le motif QR est assez net pour être inspecté, utiliser un vrai QR neutre lors du shooting ou le remplacer en postproduction. Ne jamais conserver un QR généré déformé présenté comme fonctionnel.

### Erreurs à éviter

- Flat lay symétrique ou photographie de catalogue.
- QR card surdimensionnée, parfaitement verticale ou seule dans le cadre.
- Table de mariage luxueuse avec bougies, fleurs blanches et dorures dominantes.
- Téléphone face caméra, écran lisible ou fausse interface Flaash.
- Main anatomiquement incorrecte ou geste de scan impossible.
- QR généré incohérent suffisamment net pour attirer l'attention.

### Critères de validation

- Le scan se comprend sans explication mais reste secondaire à la scène.
- La table semble habitée et non préparée pour une publicité.
- L'image reste crédible si l'écran du téléphone est entièrement flouté.
- La QR card paraît désirable sans perdre son caractère fonctionnel.
- Le crop carré conserve le geste, la carte et une trace de contexte social.

### Prompt de génération

> Candid editorial close-up at a real contemporary European celebration, a small tasteful QR card resting naturally on a slightly lived-in table while one guest casually scans it, the card placed off-center and integrated into the social environment, a partial natural hand and smartphone entering the frame, phone screen dark and abstract, glasses, a folded napkin and personal objects arranged imperfectly, other guests talking and laughing softly out of focus in the background, warm cream surfaces with subtle forest and muted amber details, gentle direct flash mixed with ambient evening light, natural hands and skin, authentic 35mm grain, premium but accessible, documentary photography rather than a product demonstration, landscape 3:2 composition with a square crop-safe center.

**Negative prompt:**

> app advertisement, people smiling at an app, perfectly centered QR code, oversized QR card, readable phone screen, fake interface, readable text, fake logo, malformed QR pattern in sharp focus, symmetrical flat lay, pristine luxury wedding table, gold decor, white flowers and candles dominating, stock photography, plastic skin, malformed hands, extra fingers, corporate event, orange monochrome color grade.

## 3. `capture-party-moment.webp`

### Rôle dans la landing

Prouver que photographier avec Flaash reste un geste bref à l'intérieur de l'interaction. Le sujet réel est le moment capturé, pas la personne qui utilise son téléphone.

### Section d'utilisation

Future étape « Capturez » et éventuelle carte immersive « Pendant la soirée ».

### Format et ratio recommandés

- Format final : WebP.
- Ratio principal : **4:5 portrait**.
- Export recommandé : **1 600 × 2 000 px**.
- Zone sûre : interaction principale dans les 75 % centraux ; téléphone éloigné des bords critiques.
- Crop secondaire : compatible avec un ratio 1:1.

### Cadrage

- Plan moyen ou légèrement large au milieu d'un toast, d'une danse ou d'un rire.
- Une personne photographie naturellement une interaction entre plusieurs invités.
- Corps, bras et mouvements peuvent traverser le cadre.
- L'image doit rester lisible malgré une légère imperfection.

### Ambiance

- Énergie spontanée et intime.
- Flash doux, mouvement léger, chaleur naturelle et noirs non bouchés.
- Aucun effet nightclub spectaculaire ni pose d'influenceur.

### Présence du téléphone

**Faible à moyenne.** Environ 5–10 % du cadre. Le téléphone confirme le geste mais ne devient jamais le point focal principal.

### Présence du QR

**Nulle.** Le scan appartient à l'image précédente.

### Erreurs à éviter

- Personne tenant son téléphone comme une publicité.
- Sujet photographié posant directement pour le téléphone.
- Écran lisible, fake UI ou reflet incohérent.
- Scène de nightclub générique, fumée artificielle ou éclairage néon dominant.
- Composition trop parfaite ou mouvement rendant les visages méconnaissables.

### Critères de validation

- L'interaction humaine attire le regard avant le téléphone.
- Au moins deux personnes vivent clairement un moment commun.
- Le téléphone peut être recadré sans détruire l'émotion de l'image.
- Le mouvement paraît accidentel mais maîtrisé.
- Les crops 4:5 et carré fonctionnent tous les deux.

### Prompt de génération

> Immersive candid documentary photograph during a lively private evening celebration in Europe, one guest naturally taking a quick photo of friends during a spontaneous toast, dance or shared laugh, the human interaction is the clear subject and the smartphone is only a small secondary gesture, viewpoint from inside the group, bodies and arms partially crossing the frame, genuine expressions, subtle direct flash, slight authentic motion blur, natural skin texture, warm cream and ink palette with muted amber and forest details, visible but refined 35mm film grain, elegant accessible party clothing, intimate social energy, portrait 4:5 framing with a square crop-safe center, the photographer immediately feels part of the party rather than separate from it.

**Negative prompt:**

> people happy to use an app, centered smartphone, readable screen, fake app UI, QR code, influencer pose, subject posing for the phone, people looking at camera, nightclub advertisement, corporate party, luxury ballroom wedding, orange cinematic filter, excessive neon, plastic skin, malformed hands, extra fingers, perfect commercial sharpness, heavy retro effects, visible text or logo.

## 4. `reveal-phone-group.webp`

### Rôle dans la landing

Incarner le sommet émotionnel de Flaash : le moment où l'événement revient. L'image doit montrer une mémoire partagée, pas la consultation satisfaite d'une application.

### Section d'utilisation

Future section reveal, idéalement sur fond Ink ou à proximité d'une transition sombre.

### Format et ratio recommandés

- Format final : WebP.
- Ratio principal : **3:2 paysage**.
- Export recommandé : **1 800 × 1 200 px**.
- Zone sûre : groupe et réactions dans les 80 % centraux.
- Crop secondaire : compatible avec un ratio 4:3 mobile.

### Cadrage

- Petit groupe rapproché, trois à cinq personnes.
- Téléphone tenu bas ou au centre secondaire du groupe.
- Les regards et gestes créent une relation circulaire entre les personnes.
- Le cadre doit rester intime, comme photographié par un proche.

### Ambiance

- Fin de soirée calme ou lendemain lumineux.
- Complicité, surprise douce et rire crédible.
- Lumière de fenêtre ou mélange discret avec flash ; chaleur sans dominante orange.
- La sensation recherchée est la redécouverte, pas l'excitation démonstrative.

### Présence du téléphone

**Faible à moyenne.** Environ 5–8 % du cadre. L'écran est flou, sombre ou hors axe. L'émotion doit rester compréhensible s'il est masqué.

### Présence du QR

**Nulle.** Le rituel est déjà entré dans sa phase de redécouverte.

### Erreurs à éviter

- Groupe aligné autour d'un téléphone face caméra.
- Sourires exagérés de publicité ou regard satisfait vers une interface.
- Écran montrant une galerie, du texte ou une marque inventée.
- Mise en scène de mariage luxueuse ou couple de mariés dominant.
- Réaction trop théâtrale, lumière orange uniforme ou peau artificielle.

### Critères de validation

- Les réactions semblent liées au souvenir et aux autres personnes.
- Le sens reste intact avec l'écran entièrement flouté.
- L'image fait sentir un « après » distinct de la soirée en train de se vivre.
- La composition fonctionne en 3:2 et en crop mobile 4:3.
- Elle matérialise la phrase : « Flaash crée le moment où l'événement revient. »

### Prompt de génération

> Intimate candid editorial photograph of three to five adult friends rediscovering shared event memories together after a celebration, gathered naturally in a close informal group, one small smartphone held low and secondary with its screen dark, blurred and unreadable, genuine affectionate laughter and quiet surprise directed toward each other rather than toward the device, relaxed end-of-night or next-morning setting in contemporary Europe, soft window light mixed with a subtle flash feeling, warm cream and ink palette with restrained amber tones, natural skin texture, imperfect documentary framing, tactile refined 35mm grain, emotionally truthful, the unmistakable feeling that the event is returning through their shared memories, landscape 3:2 composition with a central 4:3 crop-safe group.

**Negative prompt:**

> people happy to use an app, centered phone product shot, readable screen, fake gallery UI, visible text, fake logo, exaggerated surprise, staged symmetrical group, luxury wedding editorial, bride and groom focus, corporate team, stock-photo smiles, orange cinematic filter, plastic faces, malformed hands, extra fingers, heavy retro effects, QR code.

## Checklist de validation finale

### Bloquants

- [ ] Aucun texte lisible dans l'image.
- [ ] Aucun faux logo ou élément de marque inventé.
- [ ] Aucune fake UI ou galerie fictive sur un écran.
- [ ] Aucune main déformée, aucun doigt en trop ou geste anatomiquement impossible.
- [ ] Aucun rendu stock-photo, shooting mariage luxe ou publicité corporate.
- [ ] Aucun téléphone central ou traité comme le héros de la scène.
- [ ] Aucun QR démonstratif, déformé ou présenté comme fonctionnel s'il est généré.
- [ ] Aucun visage artificiel, peau plastique ou expression incohérente.

### Qualité Flaash

- [ ] Grain naturel et cohérent entre les quatre images.
- [ ] Chaleur crédible sans filtre orange excessif.
- [ ] Émotion réelle avant toute lecture fonctionnelle.
- [ ] Téléphone secondaire et écran illisible.
- [ ] Les personnes vivent ou redécouvrent le moment ; elles n'utilisent pas une app pour la caméra.
- [ ] Flaash est ressenti même si l'interface, le téléphone et le QR sont masqués.
- [ ] Le premium exprime la présence, pas le prestige.
- [ ] L'analogique agit comme texture émotionnelle, pas comme gimmick rétro.
- [ ] Les crops desktop et mobile prévus sont validés.
- [ ] L'ensemble couvre les quatre tensions du rituel sans répéter la même scène.

## Ordre de production recommandé

1. `hero-event-memory.webp` — valide l'univers général et remplace le placeholder du hero.
2. `reveal-phone-group.webp` — valide la capacité à montrer le retour émotionnel.
3. `scan-qr-table.webp` — valide l'objet social et la crédibilité des mains/QR.
4. `capture-party-moment.webp` — complète la séquence avec le geste naturel.

Chaque image doit être approuvée séparément avant export final et intégration dans `public/images/landing/`.
