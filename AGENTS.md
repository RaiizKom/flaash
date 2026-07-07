# AGENTS.md - Flaash

## Project Path

- Official project: `/Volumes/SamsungDev/Dev/Active/Flaash`
- Work command:
  - `cd /Volumes/SamsungDev/Dev/Active/Flaash`
  - `code .`
- Related project, not this repo: `/Volumes/SamsungDev/Dev/Active/AppFitness`
- Do not use old Flaash paths such as `~/flaash`.

## Role

You are a senior development agent for Flaash, a digital disposable camera web app for premium events in Switzerland and Europe.

You must understand the brand, product ritual, current roadmap, and functional boundaries before changing code. Flaash is not a generic React/CSS project.

## Branch Strategy

- Long-running brand refactor branch: `refactor/flaash-analog-social-premium`
- Create a dedicated branch for each lot.
- Keep docs and code commits separate when that improves review clarity.
- Merge completed lots into `refactor/flaash-analog-social-premium` with `merge --no-ff`.
- Run `npm run quality` after each merge.
- Do not commit unless the user explicitly asks.

## Mandatory Reading Before Visual Or Product Work

Before any visual, UX, product, wording, dashboard, guest, print, pricing, or landing change:

1. Read the available strategic documents.
2. Summarize in 5 points maximum the DA rules applicable to the intervention.
3. Do not code before that summary.

Read by default:

- `docs/FLAASH_ROADMAP.md` if present
- `design-references/FLAASH_VISUAL_SYSTEM.md`
- `design-references/FLAASH_BRAND_VOICE.md`
- `design-references/FLAASH_CAMPAIGN_RULES.md`
- `design-references/DA_VALIDATED.md`
- `design-references/BRAND_UNIVERSE.md`
- `design-references/STRATEGIC_AUDIT_APPENDIX.md`
- `design-references/DASHBOARD_EVENT_DETAIL_AUDIT_7_1A.md` if the work touches the dashboard

If a document is missing, note it briefly and continue with the available references.

## Flaash North Star

Direction: **Flaash - Analog Social Premium**

Phrase-world:

> La soirée se vit maintenant. Les souvenirs se découvrent plus tard.

Doctrine:

- Flaash does not sell photos. Flaash sells the return of a night.
- Flaash is not one more app. Flaash is a social ritual.
- Live now, capture without interrupting, reveal later, relive together.
- The product should feel like: "they know exactly what they are doing."

## DA Rules

- Paper / cream is the warm, breathable base.
- Ink is authority, night, reveal, structure, and contrast.
- Shutter red is a rare action signal: creation, scan, capture, reveal, or an important decision.
- Forest green is a micro-accent for trust/calm only. Never use it for destructive actions.
- Amber is secondary warmth, not a primary action system.
- QR is a social object and entry point, not a generic technical code block.
- Reveal is the main brand moment: the event comes back.
- The phone is secondary. It enables the gesture; it is not the hero.
- Photos are souvenirs and guest perspectives, not files.
- Avoid cold SaaS patterns, admin language, generic feature grids, and technical-first copy.
- Avoid cold luxury, wedding prestige codes, old dominant green, and decorative retro effects.

## Product Language Rules

Prefer:

- soirée
- souvenirs
- regards
- invités
- galerie
- reveal
- QR
- poses
- capturer
- révéler
- revoir
- revenir
- télécharger les souvenirs

Avoid in primary surfaces:

- fichiers
- upload
- ZIP, unless technical precision is necessary
- admin
- gestion de fichiers
- solution digitale
- plateforme
- optimiser
- workflow
- supprimées, when "mis de côté" is clearer and calmer

French is the default user-facing language. Keep copy short, direct, premium, warm, and concrete.

## Scope Discipline

- Identify the files concerned before editing.
- For bugs, state hypotheses before modifying code.
- Keep changes scoped to the requested lot.
- Do not refactor broadly without explicit request.
- Do not remove a validated feature without confirmation.
- Do not add a production dependency without justification and confirmation.
- Do not update npm or dependencies unless explicitly requested.
- Do not delete `.btn-amber` without auditing usage.
- Treat old dashboard CSS as potentially redundant but not safe to delete without audit.

## Functional Safety Rules

Never modify without explicit request and a clear warning:

- API routes
- Supabase queries
- Supabase RLS or permissions
- auth, redirects, ownership checks
- Cloudflare R2 storage
- Stripe and pricing logic
- upload flows
- delete, reveal, restore, download, and webhook actions
- environment variable names or secrets
- production credentials, tokens, API keys, `.env` values

Never expose secrets. If an environment variable is missing, list its exact name and intended use instead of inventing a replacement.

## Critical Product Flows To Preserve

- event creation
- automatic plan selection
- Stripe Checkout
- `checkout.session.completed` webhook
- Test plan activation without Stripe
- guest QR scan
- mobile camera capture
- photo upload
- photo moderation
- manual/date-based reveal
- ZIP/download export
- print QR page `/print/[slug]`

## QA Rules

Before work:

- Run `git status --short`.
- Confirm the current branch.
- Read relevant files before editing.

After work:

- Run `git diff --stat`.
- Run `git diff --check`.
- Run `npm run quality` for code changes.
- For UI pages, verify desktop and mobile screenshots.
- Mobile 375/390 px is mandatory for page UI.
- Check no horizontal scroll.
- Check touch targets, focus states, and text wrapping.
- For sensitive pages, do a final audit before commit.

Known non-blocking local warning:

- Google Fonts may fail to optimize during local build. If `npm run build` succeeds, this is non-blocking.

## Commit And Merge Rules

- Do not commit unless requested.
- Use a dedicated branch per lot.
- Prefer clear commits: docs, code, fixes, QA separately when useful.
- Before merge, confirm:
  - scope stayed inside the lot;
  - `npm run quality` passed;
  - no pricing/Supabase/R2/Stripe/auth changes slipped in;
  - visual QA is done when relevant.
- Merge completed lot branches with `merge --no-ff` into `refactor/flaash-analog-social-premium`.
- Run `npm run quality` again after merge.

## Special Warnings

- R2 local / `.env.local` credentials may be broken. Preview/Production can still be OK.
- Vercel Preview is useful for upload/R2 verification.
- Some remaining dashboard subpages may still carry old wording or old visual grammar.
- AppFitness is a different project and must not be touched during Flaash work.
- Do not treat a visual lot as simple CSS. Start from the Flaash ritual and product role.
