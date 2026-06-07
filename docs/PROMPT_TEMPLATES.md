# Prompt templates — Flaash

## Diagnostic sans coder
```markdown
Tu travailles sur Flaash.

Objectif : diagnostiquer le problème suivant sans modifier le code pour l’instant.

Problème : [décrire le bug]
Attendu : [ce qui devrait arriver]
Obtenu : [ce qui arrive]
Contexte : [URL / page / composant / logs]

Consignes :
- Inspecte uniquement les fichiers pertinents.
- Liste les hypothèses les plus probables.
- Indique les fichiers concernés.
- Propose un plan de correction minimal.
- Ne modifie aucun fichier pour l’instant.
```

## Correction de bug ciblée
```markdown
Tu travailles sur Flaash.

Objectif : corriger le bug suivant avec le minimum de changements possible.

Bug : [décrire le bug]
Attendu : [résultat attendu]
Obtenu : [résultat actuel]
Contraintes :
- Ne change pas le design visible sauf nécessité technique.
- Ne touche pas au pricing, Stripe, Supabase RLS ou R2 sauf si indispensable et explicitement justifié.
- N’ajoute pas de dépendance production sans confirmation.

Étapes attendues :
1. Inspecter les fichiers concernés.
2. Résumer la cause probable.
3. Appliquer le correctif minimal.
4. Lancer `npm run lint`, `npm run typecheck`, `npm run build` si disponibles.
5. Donner les tests manuels à effectuer.
```

## Revue de diff
```markdown
Tu travailles sur Flaash.

Objectif : relire les changements actuels avant commit.

Consignes :
- Analyse le diff.
- Cherche les régressions possibles.
- Vérifie les risques sécurité, mobile, Stripe, Supabase et R2.
- Ne modifie rien sauf si tu trouves un problème bloquant.
- Donne une recommandation : OK commit / à corriger / à tester manuellement.
```

## Feature MVP
```markdown
Tu travailles sur Flaash.

Objectif : implémenter la feature suivante : [feature]

Contexte produit : [pourquoi cette feature est nécessaire]
Comportement attendu : [détailler]
Critères d’acceptation :
- [critère 1]
- [critère 2]
- [critère 3]

Contraintes :
- Mobile-first.
- Design cohérent avec l’existant.
- Pas de dépendance production sans confirmation.
- Pas de modification hors périmètre.

Commence par proposer le plan et les fichiers concernés avant de coder.
```

## Bug QR PNG actuel
```markdown
Tu travailles sur Flaash.

Objectif : corriger le bug de téléchargement PNG sur `/print/[slug]`.

Contexte :
La page affiche correctement la carte QR avec le logo, le QR code et le titre. En revanche, le PNG téléchargé est vide ou ne contient que le fond crème.

Tentatives déjà échouées :
- html-to-image avec backgroundColor
- SVGs inlinés comme composants React
- ssr:false avec dynamic import
- document.getElementById au lieu de ref
- fonts chargées dans layout isolé

Approche souhaitée :
Ne plus capturer le DOM. Générer le PNG via canvas natif contrôlé :
- fond crème dessiné dans le canvas
- QR généré en data URL
- logo SVG chargé puis dessiné dans le canvas
- textes dessinés directement dans le canvas

Contraintes :
- La page `/print/[slug]` doit rester visuellement identique à l’écran.
- Le PNG doit contenir fond, logo, QR code, titre et textes.
- Ne pas changer le pricing, Stripe, Supabase ou R2.
- Ne pas ajouter de dépendance production sans confirmation.

Validation :
- Tester téléchargement PNG desktop Chrome.
- Donner les étapes de test Safari iPhone.
- Lancer `npm run lint`, `npm run typecheck`, `npm run build` si disponibles.
```
