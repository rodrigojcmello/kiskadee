# Fluent 2 Microsoft Source Evidence

This file records source evidence and preset-level decisions for
`packages/presets/src/presets/fluent-2-microsoft/`.

## Primary Sources

- Figma community file:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927&t=Uzju4AUhin0NMCn2-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - top-level page: `1:840`, `Cover`

## Source Notes

- Fluent 2 officially defines a single brand color ramp that is reused in both
  light and dark themes. In Kiskadee we expose two ramps per theme to give a bit
  more flexibility when choosing tones for different use cases.
- In Fluent 2 the focus ring is rendered inside the component. In Kiskadee the
  focus ring is rendered outside the element for visual consistency with the
  rest of the system, so there is a small intentional difference here.
- Fluent 2 uses a very specific color ramp that adjusts hue, saturation, and
  lightness. Most design systems, including Kiskadee by default, use simpler
  ramps that usually vary only lightness. For this preset we generate a scale
  that approximates the Fluent 2 ramp; if we ever gain access to the official
  Fluent 2 ramp algorithm in the future, we can refine this approximation even
  further.

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

- [Card](components/card.md)
- [Slider](components/slider.md)
