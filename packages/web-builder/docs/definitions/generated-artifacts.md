# Generated Artifacts

## CSS and maps

- Core CSS: utilities for decorations/scales and palette-independent base rules.
- Effects CSS: gated effect utilities such as shadows, ripple tokens, and stateful radius effects.
- Per-palette CSS: color rules only.
- Generated CSS remains aggregated by design. It behaves like a shared utility layer with maximum
  class reuse across components, while structural CSS remains owned by the component packages.
- `core.kiskadee.json` and `<segment>.<theme>.kiskadee.json`: aggregate class maps kept for
  compatibility while component hooks migrate to smaller artifacts.
- `class-maps/core/<component>.kiskadee.json`: component-scoped core class map.
- `class-maps/<segment>.<theme>/<component>.kiskadee.json`: component-scoped palette class map.

## Metadata

Metadata is written per template under `packages/web-builder/build/<template-key>`:

- `manifest.json`: used by the showcase to discover templates, segments and themes.
- `schema.json` / `segments.json`: schema and segment data for inspection or tooling.
- `global.kiskadee.json`: global metadata consumed by runtime/components, such as fonts, radius,
  and global effects. Component semantic metadata should live in component artifacts.
- `components/<component>.kiskadee.json`: component-scoped semantic metadata loaded on demand by
  component runtime hooks. Current emitted metadata artifacts include
  `components/switch.kiskadee.json`, `components/tabs.kiskadee.json`, and
  `components/text-field.kiskadee.json`.
- `class-maps/**/<component>.kiskadee.json`: component-scoped class maps loaded on demand by
  component runtime hooks. These are class resolution artifacts, not semantic metadata.

## Typical usage

1. Choose a preset from `@kiskadee/presets` and run the web-builder to generate CSS and class maps.
2. Consume `core` and palette CSS in the app, and apply classes from `classNamesMapSplit`.
3. Keep layout/structure in component code; the builder should only own visual identity.
