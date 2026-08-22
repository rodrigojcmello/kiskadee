# Kiskadee Chat Context

Use this as the single file to attach in a new chat.

It contains the minimum context needed to start work and points to the canonical docs for deeper
decisions.

## Project Summary

`kiskadee` is a PNPM monorepo for a design-system framework. It models design systems as Schema,
ships official presets, generates Web artifacts, provides shared browser runtime infrastructure,
and exposes headless behavior plus Web and native visual components. Its canonical Showcase is a
Next.js consumer and inspection application.

## Essential Rules

- Keep chat responses in Portuguese.
- Keep code, identifiers, comments, and logs in English.
- Use `pnpm` and the Node version from `.nvmrc`.
- Keep changes focused and package-scoped.
- Prefer minimal edits over broad rewrites.
- Do not add or modify unit tests unless the user explicitly asks for it.
- Prefer the narrowest relevant validation for the edited area.

## Package Map

- `packages/core`: schema contracts, types, and framework-agnostic utilities.
- `packages/presets`: official design-system presets and token mappings.
- `packages/tonal-scale`: deterministic tonal-family generation.
- `packages/brands`: portable third-party brand definitions and packs.
- `packages/runtime`: dynamic colors, font-preparation orchestration, and platform classes in the
  browser.
- `packages/fonts`: opt-in online font providers and preset integrations.
- `packages/icons`: canonical cross-platform SVG assets and generated platform adapters.
- `packages/css-build`: shared CSS processing mechanics.
- `packages/web-builder`: CSS/JSON generation and showcase sync flow.
- `packages/headless/react`: headless React behavior and accessibility primitives.
- `packages/components/react`: visual React components and structural Sass.
- `packages/components/android`: native Android components and local showcase.
- `packages/components/ios`: native iOS components and local showcase.
- `packages/showcase`: Next.js consumer/playground app.

## Read Next When Needed

- Read `PROJECT-PURPOSE.md` for architecture, taxonomy, package boundaries, and delivery flow.
- Read `docs/definitions/project-governance.md` for project authority, allowed consumption,
  forbidden ownership, and handoffs.
- Read `SCHEMA-BUILD-RUNTIME-RULES.md` when deciding whether something belongs in schema, runtime,
  generated artifacts, or structural Sass.
- Read `ESM-MIGRATION-RULES.md` before changing package build scripts, TS/ESM import conventions,
  or JS/declaration emission.
- Read `STRUCTURAL-CSS.md` before changing structural Sass in `packages/components/react`.
- Apply `skills/kiskadee-architecture/SKILL.md` for architecture-heavy or cross-package tasks.
- Apply `skills/kiskadee-structural-utility-projections/SKILL.md` when an existing generated
  token-only scale utility must be conditionally reused by a wrapper or different structural DOM
  owner, or when discussing the compact `p` class-map bucket.
- Check package-local `package.json`, `tsconfig.json`, and relevant `README.md` files before bigger
  changes.

## Practical Default

If the task is small and package-local, this file is usually enough.

If the task changes architecture, package ownership, token taxonomy, or cross-package behavior,
load `PROJECT-PURPOSE.md` and the architecture skill before proposing code.
