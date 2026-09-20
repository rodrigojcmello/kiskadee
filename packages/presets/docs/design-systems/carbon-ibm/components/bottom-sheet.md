# Carbon BottomSheet Evidence

## Sources

- [Preview Modal specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/modal/specifications), inspected 2026-09-20.
- [Preview Menu specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/menu/specifications).
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`.

## Source Coverage

| Area | Relationship | Status |
| --- | --- | --- |
| Layer, overlay, title typography and header spacing | Modal source tokens and metrics | Official adapted |
| Menu rows, text, interactions and separators | Shared Carbon Dropdown recipe | Official adapted |
| BottomSheet presenter and handle | Existing Kiskadee component | Kiskadee extension |

## Kiskadee Mapping

This is a Carbon-styled Kiskadee BottomSheet, not a claim that Carbon defines a matching sheet
component. Carbon documents mobile modals that may occupy full width and attach to the bottom;
the schema reuses that surface vocabulary without replacing the existing presenter behavior.

`e1` uses the official `overlay` token. `e2` establishes `layer-01` with square corners and the
shared Figma Menu shadow. `e4/e5` use 16px header spacing and the 20/28 regular heading profile.
`e7-e15` reuse Menu colors and a 48px structured row treatment. `e3` is a square 32x4 handle.

## Color And State Provenance

White/G90/G100 exact/cap locators come from `source.tokens` and
[token-mapping.json](../colors/token-mapping.json). Item states follow
[Dropdown evidence](dropdown.md), including deliberate disabled resets and no duplicate Focus
surface. Both contexts establish an independent neutral overlay.
Destructive Hover/Pressed share the documented danger Button fill adaptation for on-color contrast;
both presenters keep their existing selection and disabled behavior.

## Extensions And Deferred Capabilities

**Kiskadee extension:** drag handle, sheet height/swipe/page-transition defaults, structured menu
composition, and use of the menu shadow on the modal-derived surface.
**Deferred:** modal border, transactional footer/button arrangements, AI aura, and responsive
percentage sizing are not added to the BottomSheet contract. No fake upstream variant is emitted.

## Validation

All fifteen slots and configured options pass the Core BottomSheet contract. Integrated build and
render validation are reported in the preset-wide handoff.
