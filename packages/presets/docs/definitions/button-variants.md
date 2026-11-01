# Button Variants

## Subtle as Low-Emphasis Base

Kiskadee treats `subtle` as the low-emphasis base for button styling. The
`outline` and `flat` variants, when available, are derived from `subtle`, since
those variants are conceptually low-emphasis: an explicit base own surface with
colored or neutral text. Prefer that base close or equal to the intended supporting surface;
it can be near-white on a light Card or a matching solid color on a vivid Card.

A transparent/no-own-surface Button is the recommended starting point for `lowest`.
Transparency is not the canonical definition of `low`, but remains valid at `low`, `medium`,
and `high` when deliberately authored. This guidance does not restrict the Schema or require
existing presets to migrate. See [surface-relative emphasis authoring](component-intents.md#surface-relative-authoring-guidance)
for the shared recommendation and its contrast-context boundary.

Important: official presets stay faithful to the original design systems. If a
design system does not define outline/flat, such as Material 3 or Carbon, those
variants are not introduced in the official preset. The `kiskadee` versions may
extend the design system by:

- Adding a `subtle` low-emphasis definition when the original only provides
  `vivid`.
- Exposing `outline` and `flat` based on that `subtle` base.

This keeps fidelity for official presets while enabling richer variants in
`kiskadee` presets.

## Outline Border Rule

- `borderStyle: solid` means the border is always on for that base button
  style.
- `borderStyle: none` means the border is only used in `outline`.
- `borderWidth` remains flexible and is used by both cases.
