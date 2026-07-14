# Preset Tonal Color Contract

Official and experimental presets use the same continuous primitive tonal contract.

Each static primitive asset declares `kind: 'static'` and one or more complete `scales` keyed by
theme. Dynamic assets declare `kind: 'dynamic'` and use the same positions with CSS color
references. Presets may omit a theme they do not support, but a declared theme may not omit tones.

This migration converted the former HSLA `subtle`/`vivid` tracks mechanically:

- source colors at shared positions were preserved as their previously emitted sRGB HEX values;
- new positions were interpolated in OKLab;
- reused Light-as-Dark scales were reversed before sampling;
- component references to removed positions moved to the numerically nearest canonical position,
  with ties resolved upward.

These transformations keep every preset buildable under the new contract. They are infrastructure
migration rules, not source evidence or visual approval for an official Design System. Subsequent
preset reviews must replace provisional ramps with source-backed artifacts and document the mapping
under `packages/presets/docs/design-systems/<preset>/`.

The existing preset family taxonomy remains unchanged in this phase. Munsell IDs, rest anchors,
semantic state offsets, and tonal-system bundle imports belong to the later preset-specific review.
