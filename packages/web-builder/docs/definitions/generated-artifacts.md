# Generated Artifacts

## CSS and maps

- Core CSS: utilities for decorations/scales and palette-independent base rules.
- Effects CSS: gated effect utilities such as shadows, ripple tokens, and stateful radius effects.
- Per-palette CSS: color rules only.
- `classNamesMapSplit`: maps classes per component/element/state/palette at runtime.

## Metadata

Metadata is written per template under `packages/web-builder/build/<template-key>`:

- `manifest.json`: used by the showcase to discover templates, segments and themes.
- `schema.json` / `segments.json`: schema and segment data for inspection or tooling.
- `global.kiskadee.json`: global metadata consumed by runtime/components.
- `components/<component>.kiskadee.json`: component-scoped semantic metadata loaded on demand by
  component runtime hooks. `components/switch.kiskadee.json` is the first emitted artifact in this
  family.

## Typical usage

1. Choose a preset from `@kiskadee/presets` and run the web-builder to generate CSS and class maps.
2. Consume `core` and palette CSS in the app, and apply classes from `classNamesMapSplit`.
3. Keep layout/structure in component code; the builder should only own visual identity.
