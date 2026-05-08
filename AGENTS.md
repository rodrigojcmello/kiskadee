# AGENTS.md

## Role Of This File

This file contains the repository-level operating rules for AI agents working in `kiskadee`.

Keep it short and durable. Put project purpose and architecture in `PROJECT-PURPOSE.md`, and
keep task-specific workflows inside skills.

## Repository Snapshot

- `kiskadee` is a PNPM monorepo for a design-system framework.
- Workspace packages live under `packages/**`.
- Main package areas:
  - `packages/core`: shared schema types, color utilities, breakpoints.
  - `packages/presets`: official presets and schema/token definitions.
  - `packages/runtime`: runtime theming support.
  - `packages/web-builder`: schema-to-web generation and showcase sync scripts.
  - `packages/headless/react`: headless React primitives.
  - `packages/components/react`: styled React components and Sass output.
  - `packages/showcase`: Next.js playground/consumer app.

## Tooling

- Package manager: `pnpm`.
- Runtime baseline: Node version from `.nvmrc`.
- Build convention: `node` executes TS/JS tooling scripts, `esbuild` emits runtime JS only for
  packages that publish JS artifacts, and `tsc` owns type checking/declaration output. See
  `ESM-MIGRATION-RULES.md`.
- Test runner: `vitest` via root `pnpm test`.
- Formatter/linter: `biome` configured in `biome.jsonc`.
- Commit messages: `commitlint` via Husky `commit-msg`.

## Working Rules

- Keep changes focused and package-scoped; avoid cross-package refactors unless required.
- Follow the existing ESM + TypeScript patterns already used in each package.
- Use ASCII by default unless the target file already uses non-ASCII content.
- Keep code, identifiers, comments, and logs in English.
- Keep chat responses in Portuguese.
- Do not add or modify unit tests unless the user explicitly asks for it.
- Prefer `rg` / `rg --files` for search. If unavailable, use the closest fallback.
- Prefer minimal edits over broad rewrites.
- Before editing any `*.structural.scss` file, or any structural Sass/CSS in `packages/components/react`, read
  `STRUCTURAL-CSS.md` and treat it as the source of truth for structural styling rules.

## Documentation

- `docs/` is the root for a project's documentation. In this monorepo, prefer the nearest project-specific
  `docs/` directory over the repository root. For example, package- or feature-specific documentation should live
  with that package or feature when it has its own documentation root.
- The repository root `docs/` directory is for cross-project or cross-package documentation only, and should be
  updated with care.
- Use exactly one `docs/in-progress.md` per project, always at the root of that project's `docs/` directory.
  Do not create nested or additional `in-progress` files for the same project.
- Use that single `docs/in-progress.md` as the active feature handoff when it exists: read it before continuing
  work, and update it after implementation changes with the current status, relevant decisions, files changed,
  and validations run. If that file is missing or empty, assume there is no active handoff for that project and
  the current task starts a new context if the user asks for one.
- Within a project's `docs/` root, use `docs/definitions/` for durable definitions, terminology, and concepts that
  should stay stable over time.
- Within a project's `docs/` root, use `docs/proposals/` for ideas and proposals that are intentionally deferred
  but still worth keeping.
- Within a project's `docs/` root, use `docs/rejected/` for approaches that were considered and explicitly rejected,
  so the reasoning is not lost.
- If a task changes behavior exposed across packages, document the relevant assumptions in the handoff and promote
  durable outcomes into the appropriate docs location when needed.
- `CHAT-CONTEXT.md`: single-file bootstrap for new chats.
- `PROJECT-PURPOSE.md`: canonical project purpose and architecture map.
- `SCHEMA-BUILD-RUNTIME-RULES.md`: ownership rules for schema, build artifacts, runtime, and Sass.
- `STRUCTURAL-CSS.md`: structural Sass naming and scope rules.
- `skills/kiskadee-architecture/SKILL.md`: architecture workflow for cross-package decisions.

## Package Guidance

- In `packages/core`, preserve framework-agnostic utilities and types.
- In `packages/presets`, preserve design-system fidelity unless the task explicitly targets a
  Kiskadee extension.
- In `packages/web-builder`, inspect package scripts before changing pipeline behavior.
- In `packages/components/react`, preserve public exports and Sass build expectations.
- In `packages/headless/react`, keep behavior accessible and headless; avoid styling concerns.
- In `packages/showcase`, preserve Next.js app conventions and treat it as a consumer/demo app.

## Validation

- For targeted changes, prefer the narrowest relevant validation first.
- Treat build-time/runtime-in-Node tooling costs differently from browser/runtime artifact costs:
  heavier validation is acceptable in build-only flows when it improves correctness, but optimize
  generated artifacts and browser code aggressively.
- Useful commands:
  - `pnpm test`
  - `pnpm --filter @kiskadee/web-builder build`
  - `pnpm --filter @kiskadee/react-components build`
  - `pnpm --filter @kiskadee/showcase dev`
- Do not fix unrelated failing tests or unrelated build issues as part of a scoped task.

## Notes

- `node_modules/` is already ignored at repo level; do not commit dependencies or build artifacts.
