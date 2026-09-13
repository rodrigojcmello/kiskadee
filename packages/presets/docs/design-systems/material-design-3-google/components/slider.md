# Material Design 3 Google Slider Evidence

This document records the source evidence and the schema decisions for
`packages/presets/src/presets/material-3-google/components/slider.schema.ts`.

## Sources

- [Material 3 Slider overview](https://m3.material.io/components/sliders/overview); the page is client-rendered in this environment.
- [Material 3 Design Kit Community](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=58008-10356), file key `Peqe9lNMsuQHLIUZsiTZNg`, page `Sliders`, component set `Standard slider` node `58008:10356`; inspected 2026-09-13.
- [Android Compose Material 3 Slider](https://developer.android.com/develop/ui/compose/components/slider?hl=en) and [Slider API](https://developer.android.com/reference/kotlin/androidx/compose/material3/Slider.composable).
- Local fallback: [Fluent 2 Microsoft Slider evidence](../../fluent-2-microsoft/components/slider.md).

The Figma component set covers horizontal `XSmall`, `Small`, and `Medium` sizes, enabled,
hovered, pressed, and disabled states, values at 0/50/100, a value indicator, tick stops, and a
24px icon in the medium example. The official Compose contract confirms a range selection with a
track and thumb, optional value labels and steps, custom colors, and an enabled flag.

## Coverage status

| Area | Status | Decision |
| --- | --- | --- |
| Horizontal standard slider | **Official adapted** | Use the existing `standard/base` slider contract and keep the source's horizontal geometry. |
| Enabled, hover, focus, pressed, disabled | **Official adapted** | State maps are sparse; pressed colors change while the source's interaction affordance stays in the existing halo effect. |
| Compact and regular/spacious density | **Kiskadee extension** | Existing density vocabulary maps compact to the source Small recipe and regular/spacious to Medium. No new size or breakpoint is introduced for XSmall. |
| Neutral and primary intents | **Official adapted** | `slider.neutral` and `slider.primary` resolve through the existing Material component-intent mappings. |
| Marks and value indicator | **Official adapted** | Source geometry is available in `e15`/`e18` and `e14`; the default options keep `marks: none` and `valueDisplay: none`, matching the current showcase contract. |
| Range/vertical variants | **Deferred** | They are outside the existing Kiskadee slider contract and would require a new capability. |

## Geometry mapping

| Contract element | Material source | Schema mapping |
| --- | --- | --- |
| `e1` | Slider root | `slider-root` |
| `e2`/`e3` | Field label and value summary | `body-small` at `sm`, `body-medium` at `md` |
| `e4` | Small `354 x 44`; Medium `354 x 52` control lane | `boxHeight: 44` at `sm`, `52` at `md`; 12px field gap |
| `e5` | Endpoint wrapper | 12px track gap and 8px content gap |
| `e6`/`e7` | Endpoint icon and label | 20px/24px icon references and the shared text palette |
| `e8` track | Small 24px; Medium 40px track height | `boxHeight: 24` at `sm`, `40` at `md`; minimum width `100`; pill radii `12`/`20` |
| `e9` active track | Same Small/Medium heights as the source | Same heights and radii as `e8` |
| `e10` thumb | 4px wide, 44px high Small; 4px wide, 52px high Medium | `boxWidth: 4`, `boxHeight: 44/52`, radius `2` |
| `e11` thumb inner | No independent inner layer in the inspected Material handle | Name-only compatibility slot; the visible 4px handle is owned by `e10` |
| `e12`/`e13` | Medium icon-host geometry | Existing thumb-with-icon overrides, `40/52` and `32/52` |
| `e14` value indicator | `48 x 44` pressed indicator | 44px high, 12px horizontal padding, pill radius `1000` |
| `e15`/`e18` marks | 4px stops and a 2px origin mark | 4px dots and a 2px origin mark |
| `e19` | Medium thumb icon `24 x 24` | `s:lg:1` at `md` |
| `e20` | Optional label indicator | Shared `label-medium` treatment with 2px gap |

XSmall's source track is 16px high and therefore remains documented as evidence rather than a
new public Kiskadee size. The existing `sm` recipe uses the source Small lane so responsive density
can remain a two-value mapping.

## Color mapping

The schema contains no literal source colors. Source literals are recorded here only as evidence:

| Visual | Figma observation | Schema resolution |
| --- | --- | --- |
| Active track | Historical Material purple `#615690` | `c.ref(..., 'slider.primary'/'slider.neutral', 'vivid')` |
| Inactive track | `#D9E2FF` in the inspected light source | `c.ref(..., 'slider.primary'/'slider.neutral', 'subtle')` |
| Stop marks | Dark blue source stop | `c.ref(..., 'slider.primary'/'slider.neutral', 'medium')` |
| Value indicator | Dark neutral surface with light text | The active/neutral family for the box and physical white for the text |
| Disabled | Source opacity `.10`/`.38` treatments | Existing physical black/white caps through `c(..., 'primitive.black.v1', ..., alpha)` |

Root color integration maps `slider.neutral` to the tinted neutral family (`#03233C`) and
`slider.primary` to the approved Material blue family (`#0B57D0`). No secondary family or new
platform capability is required. Dark chromatic active references use the existing positive offset
from the vivid anchor so the active rail remains visually distinct from the dark subtle rail.
Neutral vivid already sits at a light endpoint and therefore keeps its public reference position.
The dark subtle value indicator uses the neutral subtle surface with physical white text to retain
readable contrast.

On vivid parents, the active interval uses the family's Light subtle reference; the thumb/value
indicator retain vivid ink. This prevents a blue active interval from disappearing on a blue
parent. Disabled paint uses white caps in this context in both themes. This is a Kiskadee
surface-context adaptation, not an additional Material role.

## State and option rules

- Rest values are direct; hover, focus, and pressed references are authored only where the resolved
  color changes, including clamped neutral endpoints. No Rest-equal Focus reset is needed: Hover
  remains active alongside the existing focus effect. Constant white subparts and the subtle rail
  omit transient paint entries. Disabled is a terminal reference for rail, active track, thumb, labels, marks, and the
  optional indicator.
- `valueDisplay: none`, `marks: none`, and `edgeMarks: exclude` are the default options, while
  `e14`, `e15`, `e18`, and their palettes remain available to existing builder/showcase consumers.
- `fillOrigin: min` matches the source's left-to-right active segment. `fillOriginMark: auto`
  keeps the existing contract's origin behavior available without adding a runtime primitive.
- The source value indicator is represented as geometry and palette data; animation and tooltip
  behavior remain owned by the existing builder/runtime contract.

Neutral seed updated on 2026-09-13 through the approved Chromatic offset primary-derived recipe;
see [current tonal provenance](../colors/README.md). Component formulas remain unchanged.
