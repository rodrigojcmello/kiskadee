# Button Variants

## Subtle as Low-Emphasis Base

Kiskadee treats `subtle` as the low-emphasis base for button styling. The
`outline` and `flat` variants, when available, are derived from `subtle`, since
those variants are conceptually low-emphasis: white/transparent background with
colored or neutral text.

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
