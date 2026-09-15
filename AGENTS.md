# AGENTS.md

## Role Of This File

This file contains the repository-level operating rules for AI agents working in `kiskadee`.

Keep it short and durable. Put product context in `README.md`, technical contracts in their
definitions, and task-specific workflows inside skills.

## Repository Snapshot

`kiskadee` is a PNPM design-system monorepo with packages under `packages/**`.
Use `README.md` for product context and `docs/definitions/project-governance.md` for the package
map and authority boundaries; load only the sections relevant to the task.

## Task Scope And Completion

- Follow the user's current request and accepted corrections over skill defaults. Analysis-only
  requests do not authorize implementation.
- Before starting a new implementation, recap the intended outcome, concrete changes, relevant
  boundaries, assumptions, and validation in concise Portuguese, then wait for the user's approval.
  Read-only investigation may precede the recap to make it concrete. A first request to implement
  does not replace this scope confirmation; approval of a recap already given in the conversation
  does. Clear approval of the recapped scope authorizes the agreed work, interpreted in context
  without requiring specific keywords. Honor an explicit request to skip this checkpoint for the task.
- Requests to inspect, analyze, review, validate, or correct an existing `CODE-REVIEW.md` authorize
  the report workflow (verification, pertinent fixes, validation, and closure) without the scope
  approval checkpoint. Explicit analysis-only or no-edit instructions take precedence. Follow
  `skills/kiskadee-code-review-markdown/SKILL.md`; this exception does not expand a fresh diff review.
- Apply that checkpoint at the transition from discussion/refinement to implementation, including
  code, configuration, generated assets, and implementation-related documentation. Do not interrupt
  ordinary questions, read-only analysis, or explicitly requested task-status updates with it.
  Do not repeat it for routine implementation choices, fixes, tests, or validation within approved
  scope. If findings materially change the intended outcome or scope, recap that change and wait
  before implementing the affected part; continue independent approved work.
- Once the recap is approved, complete the focused edits, useful regression tests, and required
  local validation without another confirmation. For open-ended architecture analysis with
  unsettled scope, agree on the analysis scope and deliverables first.
- Finish authorized work through implementation, relevant validation, and a clear handoff. Ask only
  when missing information materially changes the result or an action needs additional authority;
  continue independent authorized work while waiting.
- Read a skill's entrypoint when it applies, then only the references needed for the current mode.
  Reuse instructions already read in the session unless they changed. Merely mentioning a component
  does not require loading every skill associated with it.
- If an instruction blocks progress, cite the exact file and rule, distinguish its requirement from
  your interpretation, and explain what remains possible within the user's scope.
- Inspect the working-tree state before editing; preserve unrelated staged and unstaged work.
  Report what changed, what was verified, and material limitations in concise Portuguese.

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
- For changes or reviews that cross project boundaries, use
  `docs/definitions/project-governance.md` to identify the authority, allowed inputs, published
  handoff, and forbidden ownership for each concern.
- Before introducing or materially changing a public component or slot, global profile or catalog,
  Effect, Provider, or named structural pattern, use `docs/definitions/composition-strategies.md` to
  choose the mechanism without transferring its documented authority.
- Before editing any `*.structural.scss` file, or any structural Sass/CSS in `packages/components/react`, read
  `STRUCTURAL-CSS.md` and treat it as the source of truth for structural styling rules.

## Documentation

- Use the nearest package/feature `docs/` root; root `docs/` is for cross-project concerns.
- Within that root, `definitions/` holds durable contracts, `proposals/` deferred ideas,
  `technical-debt/` known follow-ups, and `rejected/` rejected approaches and their rationale.
- Document new durable decisions and changed cross-package assumptions with the implementation.
  Normative documentation is the source of intended behavior; promote a rule to root docs only
  when it applies across projects.
- Keep official preset evidence under `packages/presets/docs/design-systems/<preset>/`, following
  `packages/presets/docs/definitions/preset-schema-organization.md`.
- See `docs/definitions/agent-instruction-design.md` for the rationale behind instruction routing
  and validation scope. It does not replace domain ownership rules.

## Task-Specific Routing

Use these entrypoints only for the indicated concern; this is a routing index, not a reading list.

| Concern | Required entrypoint |
| --- | --- |
| Ownership, shared contracts, or architecture decisions | `skills/kiskadee-architecture/SKILL.md` |
| Code review, report assessment, or authorized review fixes | `skills/kiskadee-code-review-markdown/SKILL.md` |
| Official preset schema or source-derived visual decisions | `skills/kiskadee-preset-evidence/SKILL.md` |
| Official preset color mapping, authorship, or review | `skills/kiskadee-resolve-preset-colors/SKILL.md` |
| Rest/Hover/Pressed/Selected/Disabled maps or state precedence | `skills/kiskadee-author-interaction-states/SKILL.md` |
| Tonal generator/version, Shared Viewer output, or asset promotion | `skills/kiskadee-sync-tonal-scale-preset-docs/SKILL.md` |
| Token-only utility reuse on another structural owner or `p` bucket | `skills/kiskadee-structural-utility-projections/SKILL.md` |
| Canonical icon names, family mapping, RTL, or coverage | `skills/kiskadee-map-icon-families/SKILL.md` |
| Kiskadee Linear issues | `skills/kiskadee-linear/SKILL.md` |

Preserve source evidence with preset changes; never add literal colors to official schemas.
Keep interaction states sparse and document intentional Rest-equal precedence overrides.
Keep the Structural Utility Projection Registry separate from Style Emission Policy; `p` never
contains raw values. Preserve approved tonal asset provenance when updating current candidates.
`SCHEMA-BUILD-RUNTIME-RULES.md` defines the Schema/build/runtime/Sass handoff and remains derived
from the project-governance definition.

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

- Match validation to the changed behavior and handoff. Add or update regression tests when they
  exercise a meaningful failure mode; do not add tests that only repeat a label or implementation.
- For docs/skill-only edits, check references, instruction consistency, skill metadata, and diff
  whitespace. Application builds, artifact generation, and browser tests are not required unless
  executable behavior or its contract also changes.
- Start with focused tests/typechecking for the affected package. Run broader builds or the full
  suite when shared impact, a changed pipeline, unresolved failures, or the user requires them.
  Once relevant checks pass, do not repeat or widen them without new evidence.
- Verify rendered behavior when it is part of the requested change. Honor an explicit user-owned
  visual validation boundary; do not claim browser or screenshot validation that was not performed.
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
