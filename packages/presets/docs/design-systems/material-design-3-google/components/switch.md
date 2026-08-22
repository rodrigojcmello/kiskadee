# Material Design 3 Google Switch Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/material-3-google/components/switch.schema.ts`.

## Source

- File: Material 3 Design Kit Community
- URL: https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=54446-25289
- File key: `Peqe9lNMsuQHLIUZsiTZNg`
- Node: `54446:25289`
- Page: `Switch`
- Component set: `Switch`
- Component set size: `492 x 312`
- Inspected on: 2026-05-28

## Variant Axes

The component set exposes 20 variants:

- `Selected=True|False`
- `State=Enabled|Hovered|Focused|Pressed|Disabled`
- `Icon=True|False`

Kiskadee does not implement the internal Switch icon in the current Material 3 Switch. The icon
data below is kept as reference for future work.

## Variant Coordinates

Each variant component is `52 x 32` with `cornerRadius: 100`.

| Icon | Selected | State | Component x | Component y |
| --- | --- | --- | ---: | ---: |
| False | True | Enabled | 20 | 20 |
| False | True | Hovered | 120 | 20 |
| False | True | Focused | 220 | 20 |
| False | True | Pressed | 320 | 20 |
| False | True | Disabled | 420 | 20 |
| True | True | Enabled | 20 | 100 |
| True | True | Hovered | 120 | 100 |
| True | True | Focused | 220 | 100 |
| True | True | Pressed | 320 | 100 |
| True | True | Disabled | 420 | 100 |
| False | False | Enabled | 20 | 180 |
| False | False | Hovered | 120 | 180 |
| False | False | Focused | 220 | 180 |
| False | False | Pressed | 320 | 180 |
| False | False | Disabled | 420 | 180 |
| True | False | Enabled | 20 | 260 |
| True | False | Hovered | 120 | 260 |
| True | False | Focused | 220 | 260 |
| True | False | Pressed | 320 | 260 |
| True | False | Disabled | 420 | 260 |

## Shared Geometry

| Part | Size | Notes |
| --- | ---: | --- |
| Track/component | `52 x 32` | Pill, `cornerRadius: 100` in Figma. |
| Touch target | `48 x 48` | Internal wrapper named `Target`. |
| State layer | `40 x 40` | Internal wrapper named `State-layer`, `cornerRadius: 100`. |
| Focus indicator | `56 x 36` | `3px` outside stroke, positioned at `x: -2`, `y: -2`. |
| Selected default handle shape | `24 x 24` | Used for selected enabled, hovered, focused, disabled. |
| Unselected no-icon default handle shape | `16 x 16` | Used only when `Icon=False` and not pressed. |
| Icon default handle shape | `24 x 24` | Used when `Icon=True`, selected or unselected, not pressed. |
| Pressed handle shape | `28 x 28` | Used for selected and unselected pressed variants. |
| Icon slot | `16 x 16` | Child instance named `Icon`. |

Kiskadee represents that exact `16px` icon viewport through `e6.iconSize` and the existing
`global.iconSizes` profile. Local `boxWidth` and `boxHeight` values are intentionally not authored
on the Switch slot.

## Icon False Geometry

### Unselected

| State | Handle frame | Target | State layer | Handle shape |
| --- | --- | --- | --- | --- |
| Enabled | `36 x 28`, `x: 8`, `y: 2` | `48 x 48`, `x: -16`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `16 x 16`, `x: 12`, `y: 12` |
| Hovered | `36 x 28`, `x: 8`, `y: 2` | `48 x 48`, `x: -16`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `16 x 16`, `x: 12`, `y: 12` |
| Focused | `36 x 28`, `x: 8`, `y: 2` | `48 x 48`, `x: -16`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `16 x 16`, `x: 12`, `y: 12` |
| Pressed | `48 x 28`, `x: 2`, `y: 2` | `48 x 48`, `x: -10`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `28 x 28`, `x: 6`, `y: 6` |
| Disabled | `36 x 28`, `x: 8`, `y: 2` | `48 x 48`, `x: -16`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `16 x 16`, `x: 12`, `y: 12` |

### Selected

| State | Handle frame | Target | State layer | Handle shape |
| --- | --- | --- | --- | --- |
| Enabled | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` |
| Hovered | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` |
| Focused | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` |
| Pressed | `48 x 28`, `x: 2`, `y: 2` | `48 x 48`, `x: 10`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `28 x 28`, `x: 6`, `y: 6` |
| Disabled | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` |

## Icon True Geometry

### Unselected

| State | Handle frame | Target | State layer | Handle shape | Icon slot |
| --- | --- | --- | --- | --- | --- |
| Enabled | `44 x 24`, `x: 4`, `y: 4` | `48 x 48`, `x: -12`, `y: -12` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Hovered | `44 x 24`, `x: 4`, `y: 4` | `48 x 48`, `x: -12`, `y: -12` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Focused | `44 x 24`, `x: 4`, `y: 4` | `48 x 48`, `x: -12`, `y: -12` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Pressed | `48 x 28`, `x: 2`, `y: 2` | `48 x 48`, `x: -10`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `28 x 28`, `x: 6`, `y: 6` | `16 x 16`, `x: 6`, `y: 6` |
| Disabled | `44 x 24`, `x: 4`, `y: 4` | `48 x 48`, `x: -12`, `y: -12` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |

### Selected

| State | Handle frame | Target | State layer | Handle shape | Icon slot |
| --- | --- | --- | --- | --- | --- |
| Enabled | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Hovered | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Focused | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |
| Pressed | `48 x 28`, `x: 2`, `y: 2` | `48 x 48`, `x: 10`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `28 x 28`, `x: 6`, `y: 6` | `16 x 16`, `x: 6.5`, `y: 6` |
| Disabled | `44 x 28`, `x: 4`, `y: 2` | `48 x 48`, `x: 8`, `y: -10` | `40 x 40`, `x: 4`, `y: 4` | `24 x 24`, `x: 8`, `y: 8` | `16 x 16`, `x: 4`, `y: 4` |

## State Layer Colors

| Selected | State | State-layer fill | Variable |
| --- | --- | --- | --- |
| False | Enabled | none | none |
| False | Hovered | `#1D1B20` at `0.08` alpha | `State Layers/On Surface/Opacity-08` |
| False | Focused | `#1D1B20` at `0.10` alpha | `State Layers/On Surface/Opacity-10` |
| False | Pressed | `#1D1B20` at `0.10` alpha | `State Layers/On Surface/Opacity-10` |
| False | Disabled | none | none |
| True | Enabled | none | none |
| True | Hovered | `#6750A4` at `0.08` alpha | `State Layers/Primary/Opacity-08` |
| True | Focused | `#6750A4` at `0.10` alpha | `State Layers/Primary/Opacity-10` |
| True | Pressed | `#6750A4` at `0.10` alpha | `State Layers/Primary/Opacity-10` |
| True | Disabled | none | none |

Dark mode values observed through the state-layer variables:

| Token | Dark value |
| --- | --- |
| `State Layers/On Surface/Opacity-08` | `#E6E0E9` at `0.08` alpha |
| `State Layers/On Surface/Opacity-10` | `#E6E0E9` at `0.10` alpha |
| `State Layers/Primary/Opacity-08` | `#D0BCFF` at `0.08` alpha |
| `State Layers/Primary/Opacity-10` | `#D0BCFF` at `0.10` alpha |

## Track And Handle Colors

These colors were extracted from the `Icon=False` variants. `Icon=True` uses the same track and
handle colors, except that the unselected default handle shape is `24 x 24` instead of `16 x 16`.

Figma naming note: Kiskadee's off/rest visual state maps to `Selected=False` and `State=Enabled` in
the Figma component set. This is not the same as Figma `State=Disabled`.

| Selected | State | Track fill | Track stroke | Handle fill |
| --- | --- | --- | --- | --- |
| False | Enabled | `#E6E1E9` | `#79757F` | `#79757F` |
| False | Hovered | `#E6E1E9` | `#79757F` | `#48454E` |
| False | Focused | `#E6E1E9` | `#79757F` | `#48454E` |
| False | Pressed | `#E6E1E9` | `#79757F` | `#48454E` |
| False | Disabled | `#E7E0EC` at `0.10` alpha | `#1D1B20` at `0.10` alpha | `#1C1B20` at `0.38` alpha |
| True | Enabled | `#615690` | none | `#FFFFFF` |
| True | Hovered | `#615690` | none | `#E7DEFF` |
| True | Focused | `#615690` | none | `#E7DEFF` |
| True | Pressed | `#615690` | none | `#E7DEFF` |
| True | Disabled | `#1D1B20` at `0.10` alpha | none | `#FDF7FF` |

Rest/off border reference:

- Extracted Figma off/rest track border: `#79757F`, `2px`.
- Kiskadee calibrated Material preset off/rest track border: `#C9C4CF`, `2px`.
- Off/disabled track border: `#1D1B20` at `0.10` alpha, `2px`.
- Off/disabled handle fill: `#1C1B20` at `0.38` alpha.
- Selected/on rest has no visible track border.
- Kiskadee stores disabled alpha with `withAlpha(...)`; generated artifacts may emit the same value
  as 8-digit hex.

## Icon Details

The icon slot is an instance named `Icon` with `16 x 16`.

| Selected | States | Icon slot | Vector glyph | Glyph fill |
| --- | --- | --- | --- | --- |
| False | Enabled, Hovered, Focused, Disabled | `16 x 16`, `x: 4`, `y: 4` | `9.333 x 9.333`, `x: 3.333`, `y: 3.333` | `#E6E1E9` |
| False | Pressed | `16 x 16`, `x: 6`, `y: 6` | `9.333 x 9.333`, `x: 3.333`, `y: 3.333` | `#E6E1E9` |
| True | Enabled, Hovered, Focused | `16 x 16`, `x: 4`, `y: 4` | `10.867 x 8.017`, `x: 2.567`, `y: 3.983` | `#493E76` |
| True | Pressed | `16 x 16`, `x: 6.5`, `y: 6` | `10.867 x 8.017`, `x: 2.567`, `y: 3.983` | `#493E76` |
| True | Disabled | `16 x 16`, `x: 4`, `y: 4` | `10.867 x 8.017`, `x: 2.567`, `y: 3.983` | `#1C1B20` |

## Kiskadee Adaptation Notes

- The current Material 3 Switch does not support internal icons.
- The off/rest track border is visually calibrated to `#C9C4CF` in Kiskadee after component review,
  even though the extracted Figma value is `#79757F`.
- Kiskadee does not change component geometry for interaction states, so the Figma `28 x 28`
  pressed handle is reference-only for now.
- The V0 `activationFeedback` halo uses the stable `24 x 24` thumb carrier and `profiles.halo.size: 8`,
  producing the Figma `40 x 40` state-layer outer size without layout shift.
- Figma uses selected-aware state-layer colors: unselected uses `On Surface`; selected uses
  `Primary`. The V0 activation feedback has one token, so exact selected/unselected color switching
  is intentionally deferred.
- Figma differentiates selected-disabled and unselected-disabled colors. Kiskadee's current selected
  color sub-map does not model `selected:disabled`; keep this in mind before treating disabled
  selected colors as fully represented.
