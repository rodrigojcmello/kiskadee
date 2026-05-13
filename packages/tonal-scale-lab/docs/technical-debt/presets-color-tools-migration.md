# Presets Color Tools Migration

Status: deferred technical debt.

Color-generation experiments currently live in `packages/presets/src/tools`, even when they are not
part of the stable preset build pipeline. This makes `packages/presets` carry both production preset
definitions and exploratory color tooling.

Candidate files to move or retire after the tonal-scale lab stabilizes:

- `packages/presets/src/tools/generate-material-color-artifacts.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale-from-subtle-vivid.ts`;
- `packages/presets/src/tools/legacy/generate-color-scale-material-like.ts`.

Already retired:

- `packages/presets/src/tools/generate-fast-color-scale.ts`: replaced by the tonal-scale lab
  exploration path.

Target direction:

- keep stable preset artifacts and schemas in `packages/presets`;
- keep exploratory color-generation workflows in `packages/tonal-scale-lab`;
- move only after the lab has a stable CLI contract and the generated output format needed by
  Kiskadee presets is defined.
