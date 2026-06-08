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
4. Lancer `npm run quality`.
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

## Tâche sur `/print/[slug]`
```markdown
Tu travailles sur Flaash.

Objectif : modifier prudemment la page `/print/[slug]`.

Contexte :
La page `/print/[slug]` et le téléchargement PNG de la carte QR sont validés en local et sur Vercel.
Ne pas présenter le bug QR PNG comme actif.

Contraintes :
- La page `/print/[slug]` doit rester visuellement identique à l’écran.
- Si le PNG est concerné, conserver l’approche canvas natif contrôlé.
- Ne pas changer le pricing, Stripe, Supabase ou R2.
- Ne pas ajouter de dépendance production sans confirmation.

Validation :
- Tester desktop Chrome.
- Donner les étapes de test Safari iPhone si pertinent.
- Lancer `npm run quality`.
```
