# Presets Color Tools Migration

Status: deferred until after Kiskadee Tonal Scale v1 approval.

Color-generation experiments currently live in `packages/presets/src/tools`, even when they are not
part of the stable preset build pipeline. This makes `packages/presets` carry both production preset
definitions and exploratory color tooling.

Candidate files to assess only after `@kiskadee/tonal-scale` is approved:

- `packages/presets/src/tools/generate-material-color-artifacts.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale-from-subtle-vivid.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale-material-like.ts`.

Already retired:

- `packages/presets/src/tools/generate-fast-color-scale.ts`: retired during the former tonal-scale
  lab exploration.

Target direction:

- keep stable preset artifacts and schemas in `packages/presets`;
- keep Kiskadee scale generation and validation in `packages/tonal-scale`;
- do not move or retire additional preset tooling during Tonal Scale Milestone 1;
- treat the local `generate` CLI as inspection-only, not as an export contract;
- plan migration separately after the generated artifact format and preset integration contract are
  approved.
