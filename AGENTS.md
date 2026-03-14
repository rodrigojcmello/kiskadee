# AGENTS.md

## Overview
- This repository is `kiskadee`, a PNPM monorepo for a design-system framework.
- Workspace packages live under `packages/**`.
- Main package areas:
  - `packages/core`: shared schema types, color utilities, breakpoints.
  - `packages/presets`: official presets and schema/token definitions.
  - `packages/runtime`: runtime theming support.
  - `packages/web-builder`: build/generation pipeline and showcase sync scripts.
  - `packages/headless/react`: headless React primitives.
  - `packages/components/react`: styled React components and Sass output.
  - `packages/showcase`: Next.js app used as the visual playground.

## Tooling
- Package manager: `pnpm`.
- Runtime baseline: Node version from `.nvmrc`.
- Test runner: `vitest` via root `pnpm test`.
- Formatter/linter: `biome` configured in `biome.jsonc`.
- Commit messages: `commitlint` via Husky `commit-msg`.

## Working Rules
- Keep changes focused and package-scoped; avoid cross-package refactors unless required.
- Follow existing ESM + TypeScript patterns already used in each package.
- Use ASCII by default unless the target file already uses non-ASCII content.
- Keep all code, identifiers, comments, and logs in English.
- Keep chat responses in Portuguese.
- Do not add or modify unit tests unless the user explicitly asks for it.
- Prefer `rg` / `rg --files` for search.
- Prefer minimal edits over broad rewrites.

## Package Guidance
- In `packages/core`, preserve framework-agnostic utilities and types.
- In `packages/presets`, preserve design-system fidelity unless the task explicitly targets a Kiskadee extension.
- In `packages/web-builder`, treat generated/showcase-sync scripts carefully; inspect package scripts before changing pipeline behavior.
- In `packages/components/react`, preserve public exports and Sass build expectations.
- In `packages/headless/react`, keep behavior accessible and headless; avoid styling concerns here.
- In `packages/showcase`, preserve Next.js app conventions and treat it as a consumer/demo app, not the source of shared logic.

## Validation
- For targeted code changes, prefer the narrowest relevant validation first.
- Useful commands:
  - `pnpm test`
  - `pnpm --filter @kiskadee/web-builder build`
  - `pnpm --filter @kiskadee/react-components build`
  - `pnpm --filter @kiskadee/showcase dev`
- Do not fix unrelated failing tests or unrelated build issues as part of a scoped task.

## Files To Check Before Bigger Changes
- `package.json`
- `pnpm-workspace.yaml`
- `biome.jsonc`
- package-local `package.json` and `tsconfig.json`
- relevant package `README.md` files when changing public behavior

## Notes
- `node_modules/` is already ignored at repo level; do not commit generated dependencies or build artifacts.
- If a task changes behavior exposed across packages, document assumptions clearly in the handoff.
