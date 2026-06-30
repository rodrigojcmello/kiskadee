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

The Figma component uses a separate `Thumb` and `Thumb-inner`. Slider V1 has a
single schema element for the handle (`e10`). The Fluent preset therefore
represents the inner colored dot with the single `e10` element by using the
Fluent brand color as `boxColor` and a white border that consumes the remaining
outer ring:

- medium: `18px` thumb with `3px` border -> `12px` visible center;
- small: `14px` thumb with `2px` border -> `10px` visible center.

This preserves the most important visual proportions in the current Slider
contract. The neutral outer stroke from Figma is not represented separately
until Slider gains a dedicated thumb-inner or thumb-ring element.

## State Colors

The inspected node exposes these relevant variables:

| Figma variable | Value | Kiskadee use |
| --- | --- | --- |
| `NeutralStrokeAccessible.Rest` | `#5d616b` | inactive rail (`e8`) |
| `CompoundBrandBackground.Rest` | `#0064b4` | active rail and thumb center, rest/focus |
| `CompoundBrandBackground.Hover` | `#0055a4` | active rail and thumb center, hover |
| `CompoundBrandBackground.Pressed` | `#004694` | active rail and thumb center, pressed |
| `NeutralBackground1.Rest` | `#ffffff` | simulated thumb ring and tick marks |
| `NeutralStroke1.Rest` | `#ccd1dd` | Figma outer thumb stroke, noted but not represented separately in V1 |
| `TransparentStrokeDisabled.Rest` | `#ffffff00` | disabled inactive rail |
| `NeutralForegroundDisabled.Rest` | `#b9bdc9` | disabled active rail and thumb center |
| `NeutralStrokeDisabled.Rest` | `#dbe0ec` | Figma disabled outer thumb stroke, noted but not represented separately in V1 |

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
- visual element: `e12`, with width `1px` and height equal to the rail height.

The default remains `none` because the Figma component default has
`ticks=false`.

## Focus

The Figma focus variant draws a two-layer focus frame around the component
example. Kiskadee Slider V1 draws keyboard-visible focus on the thumb using the
global focus contract. This follows the current shared component behavior and
avoids adding a Slider-specific focus wrapper just for this preset.
