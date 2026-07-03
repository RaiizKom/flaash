# Flaash Roadmap

Living roadmap and task log for Flaash. Update it as lots finish, decisions change, or new debt appears.

## North Star

Direction: **Flaash - Analog Social Premium**

Phrase-world:

> La soirée se vit maintenant. Les souvenirs se découvrent plus tard.

Doctrine:

- Flaash does not sell photos. Flaash sells the return of a night.
- Flaash is not one more app. Flaash is a social ritual.
- Live now, capture without interrupting, reveal later, relive together.
- Quality target: the product should feel like "they know exactly what they are doing."

## Current Project Paths

- Flaash: `/Volumes/SamsungDev/Dev/Active/Flaash`
- AppFitness: `/Volumes/SamsungDev/Dev/Active/AppFitness`
- Do not use: `~/flaash`
- Work command:
  - `cd /Volumes/SamsungDev/Dev/Active/Flaash`
  - `code .`

## Current Branch Status

- Main refactor branch: `refactor/flaash-analog-social-premium`
- Current operating-system docs branch: `docs/flaash-project-operating-system`
- Merge policy: lot branches merge into `refactor/flaash-analog-social-premium` with `merge --no-ff`.
- Do not commit or merge unless explicitly requested.

## Completed Lots

- [x] Brand system and landing conversion updates
- [x] Landing pricing / FAQ / CTA / footer alignment
- [x] Auth pages alignment
- [x] Guest event pages alignment
- [x] Guest gallery alignment
- [x] Dashboard event detail command center
- [x] Dashboard photos moderation / reveal preparation
- [x] Dashboard settings alignment
- [x] Dashboard guests participation alignment
- [x] Lot 7.5 - `/dashboard` overview + `/dashboard/new` event creation
- [x] Lot 7.6 - `/print/[slug]` printable QR card alignment
  - Page web editorialisee pour preparer la carte QR.
  - Carte A6 conservee.
  - QR scannable conserve.
  - PNG corrige.
  - Note impression ajoutee pour desactiver les en-tetes/pieds de page navigateur.
- [x] Lot 7.7 - production route cleanup / error surfaces
  - `/test` supprime.
  - `error.tsx` et `global-error.tsx` rendus non techniques.
  - `not-found.tsx` micro-polish.
  - Aucune logique metier modifiee.

Known merges:

- [x] `merge: integrate Flaash brand system and landing conversion updates`
- [x] `merge: align auth pages with Flaash visual system`
- [x] `merge: align guest event pages with Flaash visual system`
- [x] `merge: redesign dashboard event detail command center`
- [x] `merge: align dashboard photos moderation with Flaash visual system`

Planned commits:

- [ ] `feat: align dashboard settings with Flaash visual system`
- [ ] `feat: align dashboard guests participation with Flaash visual system`
- [x] `feat: redesign dashboard overview as event memory hub`
- [x] `feat: align dashboard event creation with Flaash visual system`
- [x] `feat: align printable QR card with Flaash visual system`
- [x] `chore: clean production routes and error surfaces`

## Active / Next Lots

- [ ] Final lot - general QA + Vercel Preview + production preparation

## Backlog Product

- [ ] guest name on photo
- [ ] remaining poses counter
- [ ] photos taken counter
- [ ] guest event hub
- [ ] cover photo
- [ ] image grid improvements
- [ ] delayed reveal refinements
- [ ] QR table card improvements
- [ ] ZIP/download refinements
- [ ] sort by guest
- [ ] best photos filter
- [ ] photobook export
- [ ] App Clip / web app
- [ ] possible V2 landing images, not priority

## Technical Debt

- [ ] R2 local / `.env.local` credentials are broken; Preview/Production can still be OK.
- [ ] Use Vercel Preview for upload/R2 verification.
- [ ] Old dashboard CSS blocks may be redundant in `app/globals.css`.
- [ ] Remaining dashboard subpages may still contain old wording or old visual grammar.
- [ ] Do not update npm/dependencies for now.
- [ ] Do not remove `.btn-amber` without usage audit.
- [ ] Local Google Fonts optimization warning can appear during build; non-blocking if build succeeds.

## Rules For Every Lot

- [ ] Confirm branch and `git status --short`.
- [ ] Read `AGENTS.md`.
- [ ] Read this roadmap.
- [ ] Read the relevant DA and audit references.
- [ ] Before coding, summarize in 5 points maximum the DA rules applicable to the lot.
- [ ] Identify files in scope before editing.
- [ ] Keep changes inside the requested lot.
- [ ] Do not touch API routes, Supabase, auth, R2, Stripe, pricing, upload, delete/reveal/download actions, permissions, or secrets unless explicitly requested.
- [ ] Preserve critical product flows: event creation, plan selection, Stripe Checkout, webhook, Test plan, guest QR scan, camera capture, upload, moderation, reveal, download, print QR.
- [ ] Keep French user-facing copy short, premium, warm, and concrete.

## QA Checklist

For code changes:

- [ ] `git diff --stat`
- [ ] `git diff --check`
- [ ] `npm run quality`

For UI/page changes:

- [ ] Desktop screenshot, at least 1280 or 1440 px.
- [ ] Mobile screenshots at 375 and 390 px.
- [ ] No horizontal scroll.
- [ ] Text wraps cleanly.
- [ ] Touch targets are comfortable.
- [ ] Focus states are visible.
- [ ] Critical action still works.
- [ ] Vercel Preview when upload/R2/production-like behavior matters.

Before commit or merge:

- [ ] Final scope audit.
- [ ] Functional safety audit.
- [ ] Manual QA notes captured.
- [ ] Roadmap update proposed if relevant.

## Parking Lot

- [ ] Decide whether `reveal` remains the stable product term everywhere or gets localized in some contexts.
- [ ] Audit old `app/globals.css` dashboard blocks after all dashboard subpages are aligned.
- [ ] Re-check landing image V2 only after dashboard/print alignment is stable.
- [ ] Revisit transactional emails with Resend.
- [ ] Revisit privacy message visibility on guest event pages.
- [ ] Remplacer certains messages d'erreur contenant "dashboard" par "espace organisateur" dans `/dashboard/new`.
- [ ] Plan production QA checklist after final dashboard and print lots.

## Update Protocol

At the end of each lot, the agent must propose a roadmap update if:

- a lot is completed;
- a technical debt item is added, resolved, or reclassified;
- a DA decision is made;
- a future feature is added;
- a procedure changes;
- a known risk is accepted or removed.

Roadmap updates should be small, factual, and made in the same branch as the relevant lot unless the user asks for a separate docs branch.
