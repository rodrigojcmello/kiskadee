# Fluent 2 Microsoft Source Evidence

This file records source evidence and preset-level decisions for
`packages/presets/src/presets/fluent-2-microsoft/`.

## Primary Sources

- Figma community file:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927&t=Uzju4AUhin0NMCn2-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - top-level page: `1:840`, `Cover`
- Official documentation:
  [Fluent 2 typography](https://fluent2.microsoft.design/typography)
- Official implementation:
  [Fluent UI Web font-family tokens](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts)
- Microsoft licensing reference:
  [Windows typography](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography)
- Kiskadee fallback source:
  [Open Sans on Google Fonts](https://fonts.google.com/specimen/Open+Sans) and the
  [official Open Sans repository](https://github.com/googlefonts/opensans)
- Official interface-icon source:
  [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)

## Source Notes

- Fluent 2 officially defines a single brand color ramp that is reused in both
  light and dark themes. In Kiskadee we expose two ramps per theme to give a bit
  more flexibility when choosing tones for different use cases.
- In Fluent 2 the focus ring is rendered inside the component. In Kiskadee the
  focus ring is rendered outside the element for visual consistency with the
  rest of the system, so there is a small intentional difference here.
- The Figma file exposes exact Brand, Neutral, and Shared primitive ramps as
  local variables. Kiskadee preserves those source values as evidence, then
  maps each upstream stop to the nearest position in its own canonical L/D
  scale. The mapping is explicit because the two grids and theme orientations
  are not identical.

## Typography Evidence

Fluent 2 identifies Segoe UI as its primary Web typeface and the Fluent UI Web token source
publishes this base stack:

```text
Segoe UI
Segoe UI Web (West European)
-apple-system
BlinkMacSystemFont
Roboto
Helvetica Neue
sans-serif
```

The same token source publishes `Consolas, Courier New, Courier, monospace` for monospaced text.
Kiskadee maps the base stack to `body`; `heading` reuses `body`; and the monospace stack maps to
`code`. This is **Official adapted** because Kiskadee translates upstream tokens into semantic
font roles.

Segoe UI is proprietary and Microsoft's Fabric Assets license limits its downloadable assets to
specific Microsoft-integrated applications. The preset therefore does not redistribute or
automatically download Segoe.

Kiskadee inserts `Open Sans` after the two Segoe aliases and before Fluent's platform fallbacks.
This is a **Kiskadee extension**, not an official Microsoft fallback. It was selected as the public
portable alternative after visual review; Open Sans remains independently published by its
authors and is available through Google Fonts.

The optional `@kiskadee/fonts/presets/fluent-2-microsoft` integration probes the two Segoe aliases
through the browser FontFace API. An installed Segoe produces no Google request. When Segoe is
unavailable, or the probe API is unavailable, the integration prepares the Open Sans stylesheet
from Google Fonts. The preset schema still contains no URL or loader. Without that integration,
applications may provide either family themselves or let the browser continue through the stack.

## Interface Icon Evidence

Microsoft publishes Fluent UI System Icons as its familiar, friendly, and modern interface-icon
collection. The upstream repository provides Regular and Filled variants and explicit direction
metadata for mirrored and direction-specific glyphs.

Kiskadee recommends family `fluent-system` with variant `regular` for the Fluent 2 Microsoft
preset. This is **Official adapted**: the family and Regular style are official, while Kiskadee maps its
canonical semantic names to upstream glyphs and normalizes their presentation through the shared
Icon contract. The schema records only family and variant IDs; it does not import the React
package or embed glyphs.

## ProgressBar Evidence

ProgressBar evidence is recorded at static node `9121:5771` and animated node `9121:5796`. Those
variants establish the 2px/4px scales, circular geometry, and Default/Success/Warning/Error
semantic anchors. The source does not expose a Progress emphasis axis, so Kiskadee publishes one
canonical `medium` profile per intent. Fluent's Dark Orange Warning anchor is temporarily mapped
to the existing `primitive.orange.v1`; no new Orange v2 asset is introduced for this preset.

## Color Scale Evidence

The color investigation and generated candidate system live under
[`colors/fluent-tonal-scale-evidence.md`](./colors/fluent-tonal-scale-evidence.md). That evidence includes:

- exact Figma Brand, Neutral, Cranberry, Orange, Marigold, Green, Light green,
  and Berry ramps;
- semantic alias provenance from Badge, Presence Badge, Field, Input, Message
  Bar, and Persona nodes;
- the reproducible Kiskadee tonal recipe and verified canonical bundle;
- a per-stop OKLab de-para for both Light and Dark.

Generator `0.5.0` is the promoted tonal baseline. Seven generated assets remain
backed by explicit Fluent seeds: Blue, tinted Neutral, Cranberry/Red, Orange,
Marigold/Yellow, Green, and Berry/Purple. The preset additionally promotes the
Kiskadee-owned pure grayscale.

- **Official adapted**: Fluent Neutral `Grey-14 #21242d` is `n.black.v2`.
  `Neutral/Background/3/Rest` and `Neutral/Background/4/Rest` are positions in
  that same primitive family, not separate Black variants.
- **Kiskadee extension**: immutable `n.black.v1` supplies pure grayscale,
  absolute white/black caps, and the absolute-black Darker surface.

The harmony-derived Teal, Lime, Indigo, Magenta, and Brown assets remain review
inputs until separately approved.

## Shadow Scale

The inspected Figma file does not provide a single centralized shadow reference
page in the nodes used for this preset. The `Shadow <number>` names are local
Figma effect styles, not labels copied from a visible documentation table on
the canvas.

A direct local effect-style query for names containing `Shadow` returned exactly
six styles:

- `Shadow 02`
- `Shadow 04`
- `Shadow 08`
- `Shadow 16`
- `Shadow 28`
- `Shadow 64`

No additional local effect styles named `Shadow 12`, `Shadow 20`, `Shadow 32`,
or similar were found in the file. The shadow scale was therefore rebuilt from
two sources in the same file:

- local Figma effect styles whose names expose the full scale;
- component instances that apply those effect styles in real Fluent UI
  contexts.

This split is intentional. The component links prove where the shadows are used,
while the local effect styles fill gaps where a style exists but no inspected
component instance uses it directly.

| Kiskadee level | Fluent effect style | Source component evidence | Figma node evidence | Layers |
| --- | --- | --- | --- | --- |
| `s:sm:1` | `Shadow 02` | Card media icon backplate | Card component set `9230:4927`, descendant `Media icon backplate` | `0 0 2 #0000001F`, `0 1 2 #00000024` |
| `s:md:1` | `Shadow 04` | Card Filled rest, pressed, selected, disabled, and Subtle rest | Card component set `9230:4927`, variants such as `9230:4928` and `9230:4952` | `0 0 2 #0000001F`, `0 2 4 #00000024` |
| `s:lg:1` | `Shadow 08` | Toolbar, contextual floating toolbar, Tooltip, Card hover/draggable | `9383:31035`, `9383:24619`, `9460:10273`, Card variants such as `9230:4940` and `9230:4976` | `0 0 2 #0000001F`, `0 4 8 #00000024` |
| `s:lg:2` | `Shadow 16` | Toast and Dropdown list content | `9472:13071`, `9472:14307`, Dropdown list content under `9183:4601` | `0 0 2 #0000001F`, `0 8 16 #00000024` |
| `s:lg:3` | `Shadow 28` | No usage found in the inspected component nodes | Local effect style only | `0 0 8 #00000033`, `0 14 28 #0000003D` |
| `s:lg:4` | `Shadow 64` | Dialog and overlay Drawer | `9345:42130`, overlay drawer under `9183:11317` | `0 0 8 #00000033`, `0 32 64 #0000003D` |

`Shadow 28` is preserved because it is part of the local Fluent effect-style
scale even though it was not applied by the inspected component nodes. A
search across the inspected component links found no direct node usage for that
effect style.

Kiskadee maps those styles to the global outer shadow levels in order:

- `s:sm:1` -> `Shadow 02`
- `s:md:1` -> `Shadow 04`
- `s:lg:1` -> `Shadow 08`
- `s:lg:2` -> `Shadow 16`
- `s:lg:3` -> `Shadow 28`
- `s:lg:4` -> `Shadow 64`

The source styles are two-layer shadows. The preset should preserve both layers
instead of flattening them to the larger offset layer.

## Component Evidence

- [Button](components/button.md)
- [Card](components/card.md)
- [Icon](components/icon.md)
- [Progress](components/progress.md)
- [Slider](components/slider.md)
