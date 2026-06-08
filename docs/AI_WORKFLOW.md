# AI workflow — Flaash

## Objectif
Utiliser les outils IA sans gaspiller les crédits et sans laisser les agents casser le produit.

## Dossier officiel
Travailler uniquement dans `/Users/pedrolopes05/flaash`.

Ne pas utiliser l’ancien dossier `/Users/pedrolopes05/Desktop/flaash`, supprimé.

## Répartition des rôles

### ChatGPT
Utiliser pour :
- réfléchir au produit
- diagnostiquer les bugs
- analyser les logs
- générer des prompts cadrés pour agents de code
- challenger les choix techniques
- prioriser le MVP
- préparer les critères d’acceptation

Ne pas utiliser ChatGPT comme seul validateur du code. Toujours vérifier dans le projet.

### Codex
Utiliser en priorité pour :
- petits bugs ciblés
- compréhension de code
- modifications localisées
- ajout de tests simples
- refactoring léger
- revue de diff

Mode recommandé au départ : approbation manuelle ou auto-edit prudent, pas full-auto tant que le projet n’a pas de tests solides.

### Claude Code
Utiliser comme outil premium pour :
- bugs complexes multi-fichiers
- refactors larges
- architecture Supabase / Stripe / R2
- problèmes où Codex tourne en rond
- analyse approfondie de parcours utilisateur

### Playwright / tests E2E
À ajouter progressivement pour éviter que les agents produisent du code qui compile mais casse l’expérience réelle.

Parcours prioritaires :
1. Création événement Test
2. Création événement payant jusqu’à Checkout Stripe test
3. Scan QR invité
4. Upload photo depuis mobile
5. Reveal manuel
6. Téléchargement ZIP
7. Téléchargement PNG QR

## Cycle de travail standard
1. Décrire le problème en une phrase.
2. Ajouter le contexte : URL, fonctionnalité, attendu, obtenu.
3. Ajouter logs, screenshots, erreurs console ou terminal.
4. Demander à ChatGPT un diagnostic et un prompt agent.
5. Lancer Codex avec le prompt.
6. Faire relire le diff par Codex ou ChatGPT.
7. Lancer `npm run quality`.
8. Tester manuellement le parcours.
9. Commit uniquement si tout est validé.

## Vérification standard
`npm run quality` existe et passe. Il lance :
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## État validé à ne pas retraiter comme bug actif
La page `/print/[slug]` et le téléchargement PNG de la carte QR sont validés en local et sur Vercel.

Dernier commit validé sur `origin/main` : `fix: stabilize QR card PNG export`.

## Règle d’or
Un agent ne doit jamais “continuer le MVP” tout seul. Il doit résoudre une tâche précise avec des critères de validation précis.
