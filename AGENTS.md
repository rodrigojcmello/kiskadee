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
  - `packages/fonts`: opt-in online font providers and preset integrations.
  - `packages/icons`: canonical cross-platform SVG assets and generated platform adapters.
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
- Within a project's `docs/` root, use `docs/definitions/` for durable definitions, terminology, and concepts that
  should stay stable over time.
- Within a project's `docs/` root, use `docs/proposals/` for ideas and proposals that are intentionally deferred
  but still worth keeping.
- Within a project's `docs/` root, use `docs/technical-debt/` for known follow-ups, migrations, and cleanup work
  that is not part of the stable contract yet.
- Within a project's `docs/` root, use `docs/rejected/` for approaches that were considered and explicitly rejected,
  so the reasoning is not lost.
- If a task introduces a new durable decision, document why that decision exists in the nearest appropriate
  Markdown document. Prefer documentation as the source of truth for intended behavior; code can drift or be
  incomplete.
- If a task changes behavior exposed across packages, document the relevant assumptions in the nearest appropriate
  package docs and promote cross-package rules to the root documentation only when they truly apply across the
  monorepo.
- For official preset source evidence, follow `packages/presets/docs/definitions/preset-schema-organization.md`:
  keep design-system-level source notes and component evidence under `packages/presets/docs/design-systems/<preset>/`.
- When a task touches official preset schemas, Figma links, official design-system docs, or source-derived
  visual decisions, use `skills/kiskadee-preset-evidence/SKILL.md` and update the matching source-evidence docs
  before finalizing.
- When a task resolves Figma or official colors for a preset, edits preset color mappings, or styles an official
  preset schema with color, also use `skills/kiskadee-resolve-preset-colors/SKILL.md`. Resolve the documented
  source-to-tonal mapping before editing the schema; never add literal colors to official preset schemas.
- When a task authors or reviews component interaction-state maps such as Rest, Hover, Pressed,
  Focus, Selected, or Disabled, use `skills/kiskadee-author-interaction-states/SKILL.md`. Keep
  states as sparse visual deltas and document any intentional Rest-equal precedence override.
- When changing the `@kiskadee/tonal-scale` package or generator version, changing generated
  multifamily output referenced by a preset Shared Viewer, or promoting regenerated tonal assets,
  use `skills/kiskadee-sync-tonal-scale-preset-docs/SKILL.md`. Keep the current candidate version
  synchronized without rewriting the provenance of older approved assets.
- When a generated token-only scale utility must be applied conditionally to a wrapper or different
  structural DOM owner, or when proposing the compact `p` class-map bucket, use
  `skills/kiskadee-structural-utility-projections/SKILL.md`. Keep the Structural Utility Projection
  Registry distinct from Style Emission Policy and never put raw values in `p`.
- `CHAT-CONTEXT.md`: single-file bootstrap for new chats.
- `PROJECT-PURPOSE.md`: canonical project purpose and architecture map.
- `SCHEMA-BUILD-RUNTIME-RULES.md`: ownership rules for schema, build artifacts, runtime, and Sass.
- `STRUCTURAL-CSS.md`: structural Sass naming and scope rules.
- `skills/kiskadee-architecture/SKILL.md`: architecture workflow for cross-package decisions.
- `skills/kiskadee-code-review-markdown/SKILL.md`: code review workflow that writes `CODE-REVIEW.md`
  at the repository root for agent handoff.
- `skills/kiskadee-preset-evidence/SKILL.md`: source-evidence workflow for official presets and
  design-system-derived schema decisions.
- `skills/kiskadee-resolve-preset-colors/SKILL.md`: official color-to-tonal mapping workflow and
  no-literal-color rule for preset schemas.
- `skills/kiskadee-author-interaction-states/SKILL.md`: sparse state-authoring workflow, compound
  state precedence, and focus-ring ownership.
- `skills/kiskadee-sync-tonal-scale-preset-docs/SKILL.md`: tonal-scale version workflow that keeps
  preset Shared Viewer candidates synchronized while preserving approved asset provenance.
- `skills/kiskadee-structural-utility-projections/SKILL.md`: explicit registry and artifact workflow
  for reusing an existing token-only scale utility on a different structural owner.
- `skills/kiskadee-map-icon-families/SKILL.md`: canonical icon-name, family mapping, RTL, generation,
  and coverage workflow.
- `skills/kiskadee-linear/SKILL.md`: Linear issue workflow, including title/description language
  and label rules.

## Package Guidance

- In `packages/core`, preserve framework-agnostic utilities and types.
- In `packages/fonts`, preserve explicit subpath loading and inert registration; Kiskadee font
  integrations use documented public online sources and do not redistribute font binaries.
- In `packages/icons`, preserve canonical SVG sources, generated family exports, and accessibility
  defaults in platform adapters.
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
