# Testing Checklist

Use this checklist when implementing architecture-related or headless React changes.

## Select Relevant Checks

Follow the validation policy in `AGENTS.md`. Inspect affected package scripts before selecting a
command; headless-react is not the default target for every architecture task.

- Docs and instruction changes: validate links, scope/authority consistency, skill metadata when
  applicable, and `git diff --check`.
- Runtime or component changes: focused regression tests and affected-package typechecking.
  Use `pnpm exec vitest run <test-path>` and the package's existing typecheck script/config.
- Schema, builder, exports, or shared-contract changes: also verify the affected producer-to-consumer
  handoff, including required artifact generation or consumer builds.
- Run root `pnpm test` when shared impact warrants it or the user requests it, rather than for
  every task. Do not substitute npm/npx for the repository's PNPM workflow.
- Stop after the required checks pass. Broaden only to resolve new failures or remaining risk.
  Separate pre-existing failures from regressions and report any unverified part of the result.

## Architecture checks

- Identify the concern's authority, transformers, consumers, and published handoff using
  `docs/definitions/project-governance.md`.
- Confirm each change is in the correct project boundary and that consumption does not redefine the
  upstream contract.
- Confirm generated outputs and fixtures remain derived representations rather than authoring
  sources.
- Confirm token classification uses the right taxonomy bucket.
- Confirm no platform-specific behavior leaked into platform-agnostic layers.

## Headless checks

- Controlled/uncontrolled behavior is deterministic.
- Keyboard interactions cover happy path and disabled path.
- ARIA roles/states/relationships are preserved.

## Output checks

- Public exports are updated when new APIs/types are added.
- Tests cover new subcomponents and failure modes (outside-context usage, etc.).
