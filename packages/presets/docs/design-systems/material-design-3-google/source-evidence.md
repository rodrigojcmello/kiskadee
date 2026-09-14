# Material Design 3 Google Source Evidence

This file records source evidence and preset-level decisions for
`packages/presets/src/presets/material-3-google/`.

## Current secondary color decision

The preset intentionally has no mandatory secondary family or secondary Button intent.
See [the accepted rationale](colors/secondary-color-decision.md) for the separation
of intent and emphasis, user-facing clarity, and the tinted neutral's visual boundary.
This is a **Kiskadee extension**, accepted on 2026-09-12.

The older secondary and CorePalette mapping decisions are superseded. Current
color mapping is defined in [the tonal evidence](colors/README.md); Button behavior
is defined in [Button evidence](components/button.md).

## Reference Note

The image used as a reference for the Material color roles was downloaded from:
https://m3.material.io/styles/color/roles

This image records the historical role organization. Active seeds and assets are defined in
[the tonal evidence](colors/README.md).

Date: 2026-01-19

Local reference image:
- File: `packages/presets/docs/design-systems/material-design-3-google/evidence/source/material-color-roles.png`
- Preview: ![Material color roles reference](evidence/source/material-color-roles.png)

Figma reference:
- File: https://www.figma.com/community/file/1035203688168086460
- Name: Material 3 Design Kit
- Version: 1.23
- Last updated: 2025-08-12

Official typography reference:
- [Material 3 type scale tokens](https://m3.material.io/styles/typography/type-scale-tokens)

## Typography Evidence

The preset publishes a reusable type catalog and component elements select its profiles by
Kiskadee scale. Source-aligned profiles include Material's `label-medium`, `label-large`,
`body-small`, `body-medium`, and `body-large` metrics.

Button-only recipes are normalized as `label-extra-large`, `label-display-small`, and
`label-display-large`. They remain **Kiskadee adaptations** of the existing 16/24, 24/32, and
32/40 weight-500 output rather than claims that Material publishes those normalized labels.

Tabs now reuse `label-medium` and `label-large`; Bridge Tabs reuse `label-extra-large`. TextField
messages and floating labels reuse `body-small`. The former Tabs-only, compact supporting-text,
and floating-label recipes were removed: a component does not receive a distinct global
typography profile solely to preserve local geometry. Component alignment, padding, and height
remain local to the component schema.

This is a minimal normalization. A complete review of the current Material type ramp and its
tracking values is **Deferred**.

## Component Evidence

- [Complete coverage and adaptation register](components/coverage.md)

- [Card](components/card.md)

- [Button](components/button.md)

- [BottomSheet](components/bottom-sheet.md)
- [Switch](components/switch.md)
- [Dropdown and Menu](components/dropdown.md)
- [Separator](components/separator.md)
- [Badge](components/badge.md)
- [Chip](components/chip.md)
- [Progress](components/progress.md)
- [Slider](components/slider.md)
- [Tabs](components/tabs.md)
- [TextField](components/text-field.md)

## Interface Icon Evidence

Primary source:
[Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols).

Google identifies Material Symbols as the current Material icon family and exposes Outlined,
Rounded, and Sharp styles with variable fill, weight, grade, and optical-size axes. Kiskadee
recommends family `material-symbols` with variant `fill-0` for this preset: Outlined, Fill `0`,
Weight `400`, Grade `0`, and Optical Size `24`.

This is **Official adapted**: the upstream family and axis values are official, while Kiskadee
maps its canonical semantic names to Material ligatures and loads an alphabetically subsetted
Google Fonts variable stylesheet covering the supported Fill 0–1 axis only when this family is
selected. The `fill-1` variant is available to applications but is not the preset recommendation.
No icon-font URL or loader is stored in the preset schema.

## Historical references and superseded decisions

The January/February 2026 inspection compared the Material website's purple `#65558e`, the
Figma kit's `#6750A4` and the plugin default `#673AB7`. These remain historical observations,
not active primary seeds. The approved Google blue and Balanced export supersede them.

The former 16-position model, separate secondary ramp, CorePalette mappings and pure-gray-only
surface policy are retired. The current Kiskadee scale publishes subtle, medium and vivid
references; neutral uses the explicit tinted Black V2 while pure Black V1 remains canonical.

Archived visual evidence:

- [Material website scale](evidence/source/material-website-color-scale.png)
- [Figma scale](evidence/source/material-figma-color-scale.png)
- [Website focus ring](evidence/source/material-website-focus-ring.png)
- [Figma focus ring](evidence/source/material-figma-focus-ring.png)
- [Figma outlined button](evidence/source/material-figma-outlined-button.png)
- [Play Store outlined button](evidence/source/play-store-outlined-button.png)
- [Figma elevated toggle](evidence/source/material-figma-toggle-elevated.png)
- [Figma toggle](evidence/source/material-figma-toggle.png)

## Current interaction adaptations

Kiskadee keeps a visible 2px focus outline with 2px offset and uses the current primary family
for focus color. This is a deliberate adaptation of the Figma focus indication, not an exact
claim for every upstream focus-ring thickness.

Interaction palettes are authored per component. The old blanket ten-tone pressed shift and
Rest-equal Focus rules are no longer normative. Button's current formula follows the observed
state-layer direction and composes final colors at build time; other components document their
Material evidence and authorized Fluent fallback in their individual evidence files.

Activation feedback remains the existing optional ripple/halo effect, independent of static
Pressed colors. Shadow remains an optional effect and does not introduce a separate semantic
intent. This task does not add new Material-specific states, overlays or runtime capabilities.

## Control Cursor Preference

**Kiskadee extension**: the preset explicitly selects `pointer` with `web` scope. This is
a framework convention, not a cursor value extracted from the upstream design kit. Native
targets retain their platform cursor. See [cursor policy](../../definitions/cursor-policy.md).

## Kiskadee density adaptation

Density selection is a **Kiskadee extension**, not an upstream operating-system rule. The preset
reuses its existing fixed recipes through a global compact/spacious mapping and explicit component
exceptions. A single-density component keeps its medium reference; no unsupported recipe is
synthesized. Explicit public `size` selections remain independent of viewport width. See the
[adaptive density contract](../../../../../docs/definitions/adaptive-density.md).

The inline TextField label width now keeps the existing base value for each fixed recipe:
`sm` uses `88px` and `md` uses `96px`, across standard outline, underline and borderless modes. The former
viewport-specific widths (`104px`/`120px` for small and `120px`/`144px` for medium) are removed
so an explicit size remains fixed. This is a Kiskadee layout adaptation, not a newly extracted
Material measurement. Density selects the complete recipe instead of changing its label width
independently at another breakpoint.


## Balanced tonal migration - 2026-09-12

The user authorized replacing the legacy purple Material-generated scales with
Kiskadee tonal generator 0.13.0, Balanced, and configuring all three color layers.
The authored Google blue/error/green references, explicit tinted neutral, exported
functional references, legacy alias compatibility and source adaptations are
recorded in [the tonal evidence](colors/README.md). The initial promotion retained component formulas. KIS-110 subsequently revised component
consumers and completed the current [coverage](components/coverage.md). That component pass preserved the color assets. On 2026-09-13 the user separately approved
the Chromatic primary-derived neutral promotion with generator 0.14.0; only n.black.v2
scale colors changed, as recorded in the tonal evidence.

The subsequent approved 0.15.0 promotion uses Chromatic offset and neutral seed #03233C.
Only neutral scale colors changed; component formulas and the segment catalog were preserved.

## Shared purple segment — 2026-09-13

Generator 0.16.0 adds the user-approved #6750A4 primary candidate and its #1C1D3E neutral
within the existing blue recipe. See [shared catalog provenance](colors/README.md).
All colors are stored in colors/default; purple is a semantic segment, not an independent palette.

## Retirement of the derived Material Kiskadee preset

The user authorized retiring `material-design-3-kiskadee` after its original purpose (adding a
red/destructive button) was absorbed into the Google preset's documented Kiskadee adaptations.
Its old button-tone patches and experimental `modern` segment are not promoted. Material Google
remains the single Material preset, with `default` and `purple` and existing dynamic behavior.
The retired source, web registration and native Showcase fixtures/options were removed.
Persisted web selections migrate to Material Google, preserving a supported segment/theme and
mapping the retired `modern` segment to `default`. Historical review/archive notes remain intact.
