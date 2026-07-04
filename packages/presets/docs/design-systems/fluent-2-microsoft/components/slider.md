# Fluent 2 Microsoft Slider Evidence

Source:
[Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-2771&t=Uzju4AUhin0NMCn2-11)

- Figma file key: `qdtPPQysSX0kHGGcDpEXzw`
- Component node: `9121:2771`
- Component name: `Slider`
- Inspected variants:
  - `Size=Medium (Default), State=Rest` through `State=Disabled`
  - `Size=Small, State=Rest` through `State=Disabled`

## Variant Geometry

The Figma component exposes two sizes:

| Fluent size | Kiskadee scale | Example frame | Rail height | Thumb | Thumb inner |
| --- | --- | --- | --- | --- | --- |
| `Medium (Default)` | `s:md:1` | `120 x 24` | `4` | `18 x 18` | `12 x 12` |
| `Small` | `s:sm:1` | `120 x 24` | `2` | `14 x 14` | `10 x 10` |

The Figma component uses a separate `Thumb` and `Thumb-inner`. Kiskadee maps
that directly:

- `e10`: outer thumb wrapper, with white fill and neutral stroke;
- `e11`: inner thumb dot, with Fluent compound brand fill.

## State Colors

The inspected node exposes these relevant variables:

| Figma variable | Value | Kiskadee use |
| --- | --- | --- |
| `NeutralStrokeAccessible.Rest` | `#5d616b` | inactive rail (`e8`) |
| `CompoundBrandBackground.Rest` | `#0064b4` | active rail and thumb inner, rest/focus |
| `CompoundBrandBackground.Hover` | `#0055a4` | active rail and thumb inner, hover |
| `CompoundBrandBackground.Pressed` | `#004694` | active rail and thumb inner, pressed |
| `NeutralBackground1.Rest` | `#ffffff` | outer thumb fill and tick marks |
| `NeutralStroke1.Rest` | `#ccd1dd` | outer thumb stroke |
| `TransparentStrokeDisabled.Rest` | `#ffffff00` | disabled inactive rail |
| `NeutralForegroundDisabled.Rest` | `#b9bdc9` | disabled active rail and thumb inner |
| `NeutralStrokeDisabled.Rest` | `#dbe0ec` | disabled outer thumb stroke |

## Ticks

The Figma component exposes a boolean `ticks` property. Ticks are vertical white
marks with `1px` width and height matching the rail:

- medium ticks: `1 x 4`;
- small ticks: `1 x 2`.

Kiskadee maps this to the generic Slider marks contract:

- preset default: `components.slider.options.marks = "none"`;
- instance opt-in: `marks="step"`;
- automatic step ticks omit edge marks through
  `components.slider.options.edgeMarks = "exclude"`;
- mark labels use the generic Slider default
  `components.slider.options.markLabelPlacement = "auto"`;
- labels declared on edge marks use the generic responsive default
  `components.slider.options.edgeMarkLabelPlacement = "auto"`;
- visual element: `e13`, with width `1px` and height equal to the rail height.

The default remains `none` because the Figma component default has
`ticks=false`.

## Focus

The Figma focus variant draws a two-layer focus frame around the component
example. Kiskadee Slider V1 draws keyboard-visible focus on the thumb using the
global focus contract. This follows the current shared component behavior and
avoids adding a Slider-specific focus wrapper just for this preset.

## Activation Feedback

Fluent 2 Slider uses the Kiskadee shared activation-feedback effect to match the
interactive affordance already used by Fluent Switch. The preset declares
`components.slider.effects.activationFeedback` with the `halo` profile and uses
`e10` as the host:

- `e10`: outer thumb wrapper and activation-feedback host;
- `e11`: visual thumb inner only.

Range sliders render two physical `e10` thumbs. The generated effect capability
is slot-level, but the runtime active class is applied per thumb instance so
only the interacted thumb shows the feedback.
