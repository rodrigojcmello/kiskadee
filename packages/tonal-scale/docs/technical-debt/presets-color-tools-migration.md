# Presets Color Tools Migration

Status: deferred. Tonal-system generation and artifact export do not authorize
preset tooling migration.

Color-generation experiments currently live in `packages/presets/src/tools`, even when they are not
part of the stable preset build pipeline. This makes `packages/presets` carry both production preset
definitions and exploratory color tooling.

Candidate files to assess only when a separate preset-integration plan is
approved:

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
- keep the canonical tonal-system recipe, manifest, and primitive-family assets
  in `packages/tonal-scale` until an explicit compiler boundary is designed;
- do not move or retire additional preset tooling as a side effect of local
  tonal-system work;
- plan migration separately with the preset adapter, ownership, compatibility,
  and rollout contract.
