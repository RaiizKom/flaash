# Flaash prompt system

Statut : système officiel de prompts pour les images Flaash.

Ce document définit comment écrire, comparer et valider les prompts d'images pour **Flaash — Analog Social Premium**. Il reprend la rigueur méthodologique des références de workflow locales : concept fort, rôle d'image clair, angle caméra, hiérarchie de sujet, styling, lumière, traitement photo, réalisme et validation. Il n'en reprend ni l'esthétique, ni le wording, ni les scènes.

## 1. Principe directeur

Une image Flaash doit montrer le rituel, pas simplement une belle scène.

Rituel :

1. vivre ;
2. scanner ;
3. capturer ;
4. attendre ;
5. révéler ;
6. revivre ensemble ;
7. conserver.

Règle : une image belle mais décorative doit être rejetée. Une image moins spectaculaire mais plus Flaash peut être gardée. Une image ne remplace une image existante que si elle gagne clairement sur la narration ou la marque.

## 2. Framework général

Chaque prompt Flaash doit contenir les blocs suivants.

### FORMAT

Définir :

- type d'image ;
- ratio ;
- cadrage desktop ;
- cadrage mobile ;
- usage final.

Exemple :

> Editorial documentary photograph, 4:5 portrait, crop-safe for mobile and square social usage, intended for the landing capture section.

### CORE IDEA

Formuler l'idée en une phrase.

Exemple :

> A guest captures one real moment, then immediately returns to the party.

### PRODUCT ROLE

Définir le rôle exact de Flaash dans la scène.

Questions :

- Le produit est-il entrée, capture, attente, reveal ou mémoire ?
- Quel asset Flaash doit être visible ?
- Que doit comprendre le spectateur ?

### CAMERA ANGLE

Définir précisément :

- hauteur caméra ;
- distance ;
- direction du regard ;
- niveau d'imperfection ;
- point de vue invité.

Angles Flaash recommandés :

- hauteur de table ;
- épaule d'invité ;
- plan moyen depuis le groupe ;
- léger hors-axe ;
- close-up contextuel ;
- jamais démonstration frontale produit.

### COMPOSITION

Définir :

- premier plan ;
- sujet principal ;
- sujet secondaire ;
- arrière-plan ;
- zone calme ;
- crop safety.

Règle : la composition doit clarifier la hiérarchie, pas seulement remplir le cadre.

### SUBJECT HIERARCHY

Ordre recommandé :

1. émotion humaine ;
2. interaction sociale ;
3. contexte événementiel ;
4. geste Flaash ;
5. détail produit.

Le téléphone et le QR ne doivent jamais passer devant l'interaction humaine, sauf si l'image est strictement dédiée à la QR card.

### SCENE

Définir le lieu et la situation.

Scènes acceptées :

- table habitée ;
- appartement de soirée ;
- jardin privé ;
- reveal en petit groupe ;
- toast ;
- danse ;
- lendemain calme ;
- galerie regardée ensemble.

### STYLING

Définir :

- vêtements élégants accessibles ;
- matières ;
- accessoires utiles ;
- couleur dominante ;
- détails personnels.

Interdit :

- styling mode comme sujet principal ;
- luxe ostentatoire ;
- uniformité corporate ;
- costume décoratif.

### LIGHTING

Définir :

- source ;
- direction ;
- température ;
- contraste ;
- ombres.

Lumières Flaash :

- flash direct doux ;
- tungstène chaud réaliste ;
- fenêtre de lendemain ;
- lumière de table ;
- contraste Ink lisible.

### PHOTOGRAPHIC TREATMENT

Définir :

- grain ;
- netteté ;
- couleur ;
- profondeur de champ ;
- mouvement.

Traitement Flaash :

- fine 35mm grain ;
- natural skin texture ;
- soft direct flash ;
- warm but not orange ;
- authentic documentary look ;
- no heavy vintage filter.

### BRAND FEELING

Définir l'impression finale.

Mots utiles :

- social ;
- warm ;
- intimate ;
- present ;
- candid ;
- premium accessible ;
- collective memory ;
- rediscovery.

### REALISM

Inclure les contraintes :

- anatomically correct hands and faces ;
- no extra fingers ;
- no readable fake UI ;
- no fake logo ;
- believable event ;
- phone screen abstract if visible ;
- QR natural if present.

### NEGATIVE PROMPT

Toujours ajouter une section négative.

Catégories à couvrir :

- app advertisement ;
- centered smartphone ;
- readable UI ;
- stock photo smiles ;
- luxury wedding cliché ;
- corporate event ;
- malformed hands ;
- plastic skin ;
- fake logo ;
- decorative retro effects ;
- absurd fashion pose.

### VALIDATION CHECKLIST

Chaque prompt doit produire une image vérifiable selon :

- rôle rituel clair ;
- émotion humaine ;
- téléphone secondaire ;
- QR naturel ;
- crop desktop/mobile ;
- réalisme ;
- absence d'artefacts IA ;
- cohérence marque.

## 3. Template — hero image

### Ce que l'image doit faire comprendre

Flaash commence par une soirée qui se vit. Le produit n'est pas encore au centre.

### Ce que l'image doit faire ressentir

Présence, chaleur, mouvement, groupe, envie d'être dans la scène.

### Téléphone

Très faible ou absent. Si présent, périphérique et non lisible.

### QR

Absent.

### Secondaire

Interface, démonstration produit, papeterie, mécanisme.

### Interdit

Mariage luxe dominant, groupe posé, téléphone héros, stock photo, regard caméra généralisé.

### Prompt template

```text
FORMAT: Editorial documentary photograph, [ratio], crop-safe for [desktop/mobile usage].

CORE IDEA: A real private celebration is being lived before it becomes content.

PRODUCT ROLE: Flaash is implied as the ritual that will bring these memories back later; no product demonstration yet.

CAMERA ANGLE: Shot from inside the group at guest height, slightly off-axis, candid imperfect framing.

COMPOSITION: Human interaction is the main subject, partial foreground gestures create immersion, background shows a believable event, calm area available for headline if needed.

SUBJECT HIERARCHY: 1. shared laughter or movement, 2. group energy, 3. event context, 4. subtle memory texture.

SCENE: Contemporary European private celebration, premium accessible, not ostentatious.

STYLING: Elegant but natural evening clothing, cream, ink, muted amber, forest details, no luxury uniform.

LIGHTING: Warm ambient interior light mixed with soft direct flash, credible shadows.

PHOTOGRAPHIC TREATMENT: Fine 35mm grain, natural skin texture, slight motion, warm but not orange, documentary realism.

BRAND FEELING: Present, social, warm, analog emotional texture, premium accessible.

REALISM: Real adult guests, natural hands and faces, no visible branding, no fake UI.

NEGATIVE PROMPT: people happily using an app, centered smartphone, readable screen, QR code, staged portrait, luxury wedding editorial, stock photo smiles, influencer pose, corporate event, orange filter, plastic skin, malformed hands, fake logo, retro date stamp.
```

## 4. Template — scan QR image

### Ce que l'image doit faire comprendre

Le QR est l'entrée simple dans le rituel.

### Ce que l'image doit faire ressentir

Un objet social posé dans une vraie soirée, pas une notice technique.

### Téléphone

Présent mais secondaire. Écran abstrait.

### QR

Visible, intégré, pas centré en produit.

### Secondaire

La main, le téléphone, les verres, les invités flous.

### Interdit

Flat lay, QR surdimensionné, écran lisible, table parfaite, faux logo, démo app.

### Prompt template

```text
FORMAT: Editorial close-up documentary photograph, 3:2 landscape, square crop-safe.

CORE IDEA: A small QR card quietly opens a collective event ritual.

PRODUCT ROLE: QR card as the social entry point to Flaash; the scan is understood without becoming an app demo.

CAMERA ANGLE: Table-height close-up, slightly imperfect angle, as if noticed by a guest.

COMPOSITION: QR card in a secondary but readable position, phone and hand entering from one side, lively table objects around it, guests softly visible in the background.

SUBJECT HIERARCHY: 1. lived-in table, 2. QR card, 3. scanning gesture, 4. social background.

SCENE: Real celebration table with glasses, napkin, personal objects, warm event atmosphere.

STYLING: Premium accessible table, cream paper, forest or amber details, no gold luxury setup.

LIGHTING: Soft direct flash mixed with warm ambient table light.

PHOTOGRAPHIC TREATMENT: Fine 35mm grain, natural hands, realistic paper texture, no commercial product sharpness.

BRAND FEELING: Simple, desirable, social, effortless.

REALISM: QR card plausible, hand anatomically correct, phone screen abstract, no readable fake UI.

NEGATIVE PROMPT: centered QR code, oversized QR, symmetrical flat lay, pristine luxury wedding table, readable phone screen, fake interface, fake logo, malformed hands, stock photography, corporate event, orange monochrome grade.
```

## 5. Template — capture moment image

### Ce que l'image doit faire comprendre

Capturer avec Flaash est un geste naturel dans la soirée.

### Ce que l'image doit faire ressentir

La soirée continue. Le téléphone ne l'interrompt pas.

### Téléphone

Visible mais périphérique.

### QR

Absent.

### Secondaire

La mécanique produit. Le sujet réel reste l'interaction.

### Interdit

Personne posant pour le téléphone, écran lisible, téléphone centré, nightclub générique.

### Prompt template

```text
FORMAT: Editorial documentary photograph, 4:5 portrait, square crop-safe.

CORE IDEA: One guest captures a true moment without pulling the party away from itself.

PRODUCT ROLE: Flaash enables quick participation; the capture is brief and social.

CAMERA ANGLE: Inside the group, guest-height or slightly shoulder-level, imperfect candid crop.

COMPOSITION: Human interaction dominates the center, phone appears at an edge or foreground, movement crosses the frame.

SUBJECT HIERARCHY: 1. laughter/toast/dance interaction, 2. group presence, 3. peripheral phone gesture, 4. event context.

SCENE: Lively private evening celebration, adults sharing a spontaneous moment.

STYLING: Contemporary party clothing, elegant accessible, no fashion editorial dominance.

LIGHTING: Soft flash burst with warm ambient background, natural shadows.

PHOTOGRAPHIC TREATMENT: Fine 35mm grain, slight motion blur, real skin texture, warm but controlled color.

BRAND FEELING: Alive, social, intimate, memory-in-progress.

REALISM: Natural hands, no readable phone screen, believable movement, no fake UI.

NEGATIVE PROMPT: people happy to use an app, centered smartphone, subject posing for phone, readable screen, fake app UI, influencer pose, nightclub advertising, corporate party, luxury ballroom wedding, malformed hands, plastic skin, heavy retro effects.
```

## 6. Template — reveal image

### Ce que l'image doit faire comprendre

Le reveal est le moment où l'événement revient.

### Ce que l'image doit faire ressentir

Complicité, surprise, mémoire collective, chaleur.

### Téléphone

Présent, bas ou secondaire. Les réactions comptent plus que l'écran.

### QR

Absent.

### Secondaire

Interface, écran, démonstration.

### Interdit

Tout le monde aligné autour d'un écran, faux UI lisible, surprise théâtrale.

### Prompt template

```text
FORMAT: Intimate editorial documentary photograph, 3:2 landscape, 4:3 mobile crop-safe.

CORE IDEA: The event returns through the eyes of the people who lived it.

PRODUCT ROLE: Flaash reveal as emotional payoff; the gallery is implied, not demonstrated.

CAMERA ANGLE: Close group composition, photographed by someone nearby, slightly off-center.

COMPOSITION: Faces and reactions create a circular relationship; phone remains low or secondary; background is warm and quiet.

SUBJECT HIERARCHY: 1. shared reactions, 2. connection between people, 3. phone as trigger, 4. memory atmosphere.

SCENE: End-of-night or next-day setting, contemporary European interior, intimate and credible.

STYLING: Relaxed premium accessible clothing, no ceremonial luxury.

LIGHTING: Soft window light or warm interior light with gentle flash feeling.

PHOTOGRAPHIC TREATMENT: Fine 35mm grain, natural skin, warm cream and ink palette, realistic emotion.

BRAND FEELING: Rediscovery, togetherness, quiet excitement, return of the evening.

REALISM: Phone screen not readable, faces natural, hands correct, no fake UI or logos.

NEGATIVE PROMPT: readable phone screen, fake gallery interface, staged symmetry, exaggerated surprise, luxury wedding styling, corporate team, stock photo smiles, orange cinematic lighting, plastic faces, malformed hands, centered product shot.
```

## 7. Template — product screenshot / interface lifestyle

### Ce que l'image doit faire comprendre

L'interface est simple, mais elle n'est pas le sujet principal.

### Ce que l'image doit faire ressentir

Clarté, confiance, aucune friction.

### Téléphone

Peut être visible, mais l'écran doit être soit réel et validé, soit volontairement abstrait.

### QR

Seulement si la scène parle d'accès.

### Secondaire

Décor, accessoires, effets.

### Interdit

Fake UI, texte inventé, écran illisible présenté comme produit, reflet incohérent.

### Prompt template

```text
FORMAT: Product-lifestyle editorial photograph, [ratio], crop-safe for landing or social.

CORE IDEA: Flaash is simple enough to use without leaving the moment.

PRODUCT ROLE: Show one validated product state or imply it without fake details.

CAMERA ANGLE: Natural hand-held phone angle, not straight-on commercial mockup unless screenshot is composited separately.

COMPOSITION: Phone secondary to the real environment; screen does not dominate; surrounding scene proves event context.

SUBJECT HIERARCHY: 1. real-world context, 2. simple product gesture, 3. device, 4. UI detail.

SCENE: Guest at an event, organizer preparing QR, or reveal setup.

STYLING: Clean, warm, accessible premium, no desk SaaS setup.

LIGHTING: Natural event light, believable screen glow if needed.

PHOTOGRAPHIC TREATMENT: Realistic device handling, fine grain, no glossy tech ad finish.

BRAND FEELING: Useful, calm, invisible after the gesture.

REALISM: Only validated UI may be readable; otherwise screen stays abstract.

NEGATIVE PROMPT: fake interface, unreadable invented text, tech startup ad, SaaS dashboard hero, floating phone mockup, centered device, cold blue lighting, malformed hands.
```

## 8. Template — QR card / print object

### Ce que l'image doit faire comprendre

La QR card est un objet social désirable et fonctionnel.

### Ce que l'image doit faire ressentir

Goût, attention, simplicité, envie de scanner.

### Téléphone

Optionnel, partiel, secondaire.

### QR

Visible, naturel, jamais surdimensionné.

### Secondaire

Décor et papeterie.

### Interdit

Papeterie mariage luxe, QR en studio, flat lay parfait, fond blanc produit.

### Prompt template

```text
FORMAT: Editorial object-in-context photograph, 3:2 or 1:1, crop-safe for social and landing.

CORE IDEA: A printed QR card quietly signals that the event has a collective memory ritual.

PRODUCT ROLE: QR card as entry object; functional and desirable.

CAMERA ANGLE: Table-level or hand-held close-up, slight angle, real environment.

COMPOSITION: QR card integrated into a lived-in setting, enough whitespace to read the object, surrounding traces of a real event.

SUBJECT HIERARCHY: 1. QR card as object, 2. table or event context, 3. optional scanning gesture, 4. texture.

SCENE: Table, entrance, welcome area, bar, or place setting at a real event.

STYLING: Paper cream, ink, small shutter red detail, natural table objects.

LIGHTING: Soft flash or warm ambient, no product studio lighting.

PHOTOGRAPHIC TREATMENT: Real paper texture, fine grain, natural shadows, premium accessible.

BRAND FEELING: Thoughtful, easy, social, tactile.

REALISM: QR must be replaced or validated if readable; no fake logo; no impossible folds.

NEGATIVE PROMPT: oversized QR, perfect flat lay, luxury wedding stationery, gold foil, white flowers dominating, fake QR in sharp focus, product catalog photography, sterile background.
```

## 9. Template — social campaign image

### Ce que l'image doit faire comprendre

Un angle de campagne, pas seulement un usage produit.

### Ce que l'image doit faire ressentir

Tension simple, mémorable, Flaash.

### Téléphone

Selon l'idée, toujours secondaire.

### QR

Selon l'idée, objet social plutôt que démonstration.

### Secondaire

Effets graphiques, décor, gimmick.

### Interdit

Image spectaculaire mais incompréhensible, absurdité gratuite, pose mode extrême.

### Prompt template

```text
FORMAT: Campaign photograph for social, [4:5 vertical / 1:1 square / 9:16 story], crop-safe with room for short copy.

CORE IDEA: [One campaign tension, e.g. The photos wait. The party doesn't.]

PRODUCT ROLE: [Entry / capture / hidden photos / reveal / gallery / export.]

CAMERA ANGLE: Candid editorial angle tied to the idea, never spectacle for spectacle.

COMPOSITION: Clear hook in one area, human emotion in another, space for short Flaash line.

SUBJECT HIERARCHY: 1. campaign tension, 2. human truth, 3. Flaash ritual asset, 4. environment.

SCENE: Believable event moment or after-event rediscovery.

STYLING: Analog Social Premium, accessible, warm, no fashion-led styling.

LIGHTING: Credible event or reveal lighting.

PHOTOGRAPHIC TREATMENT: Fine grain, realistic color, no heavy vintage.

BRAND FEELING: Memorable, direct, warm, ritual-led.

REALISM: No AI artifacts, no fake UI, no free surreal object.

NEGATIVE PROMPT: absurd fashion scene, suspended people, centered phone, QR advertisement, generic stock party, SaaS visual, luxury cold wedding, unreadable fake text, heavy retro filter.
```

## 10. Scoring sur 10

Chaque image est notée sur 10 pour chaque critère.

| Critère | 0–3 | 4–6 | 7–8 | 9–10 |
|---|---|---|---|---|
| Brand fit | Générique | Proche mais faible | Clairement Flaash | Flaash sans logo |
| Product clarity | Confus | Compréhensible après effort | Clair | Clair en une seconde |
| Hook strength | Aucun | Présent mais faible | Mémorable | Mémorable et juste |
| Emotional truth | Posé | Un peu artificiel | Crédible | Vrai et immédiat |
| Visual hierarchy | Chaotique | Lisible mais plat | Bonne hiérarchie | Lecture parfaite |
| Realism | IA visible | Quelques doutes | Réaliste | Photographique |
| Crop safety | Cassé | Fragile | Fonctionne | Fonctionne partout |
| AI artifact risk | Bloquant | Risqué | Faible | Aucun risque visible |

### Seuils

- Minimum par critère : 7.
- Moyenne minimale : 8.
- Remplacement d'une image existante : moyenne minimale 8,5 et gain narratif clair.
- Toute note inférieure à 7 sur réalisme, hiérarchie ou rôle produit bloque l'image.

## 11. Règle de remplacement

Une nouvelle image ne remplace une image existante que si elle améliore au moins deux dimensions :

- compréhension du rituel ;
- émotion ;
- distinctive asset ;
- cadrage mobile ;
- réalisme ;
- cohérence corpus ;
- mémorisation de Flaash.

Si elle est seulement plus belle, elle ne remplace pas.
