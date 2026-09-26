# Fluent 2 Microsoft Slider Evidence

Source:
[Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-2771&t=Uzju4AUhin0NMCn2-11)

- Figma file key: `qdtPPQysSX0kHGGcDpEXzw`
- Component node: `9121:2771`
- Component name: `Slider`
- Inspected variants:
  - `Size=Medium (Default), State=Rest` through `State=Disabled`
  - `Size=Small, State=Rest` through `State=Disabled`

## Density selection

The user-approved Kiskadee policy uses Medium for all global densities: Desktop,
Tablet, Mobile and adaptive selection. The local schema declares
`options.density: { regular: 's:md:1' }`, independently of the global density map.
This is a Kiskadee selection policy, not a claim that upstream Fluent lacks Small.
The Small recipe remains published for explicit `size="sm"`; explicit `size="md"`
also remains supported. Sandbox presets and other components are unchanged.

## Variant Geometry

The Figma component exposes two sizes:

| Fluent size | Kiskadee scale | Example frame | Rail height | Thumb | Thumb inner |
| --- | --- | --- | --- | --- | --- |
| `Medium (Default)` | `s:md:1` | `120 x 24` | `4` | `18 x 18` | `12 x 12` |
| `Small` | `s:sm:1` | `120 x 24` | `2` | `14 x 14` | `10 x 10` |

The Figma component uses a separate `Thumb` and `Thumb-inner`. Kiskadee maps
that directly:

- `e10`: outer thumb wrapper, with white fill and neutral stroke in the official
  Light onSubtle Neutral recipe;
- `e11`: inner thumb dot, with Fluent compound brand fill in that recipe.

Kiskadee also sets `e4.boxHeight` to the nominal thumb size for each scale. This
is a structural lane-stabilization token, not a separate Figma measurement: it
keeps the rail centered consistently when endpoint icons or a control-end value
summary are present.

The optional Kiskadee thumb-icon presentation uses `e12`/`e13` geometry overlays.
The user-approved Medium calibration (2026-09-26) uses a 30 x 30 host, a 24 x 24
inner surface and a 16px icon through `e19.iconSize` (`s:sm:1`). Small retains
14 x 14 / 10 x 10 geometry and its 8px icon. Without `thumbIcon`, the official
`e10`/`e11` dimensions remain unchanged. This is a Kiskadee extension; the inspected
Fluent reference does not require a built-in thumb icon.

The control lane `e4.boxHeight`, endpoint-icon sizes and composition padding are
unchanged by this calibration. The icon remains centered over the inner surface.

The Slider Showcase Area example uses the canonical `arrow-left-right` icon for
its thumb. The Fluent family maps it to `ArrowBidirectionalLeftRightRegular` from
[Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons/blob/main/icons_regular.md),
matching the user's selected reference. Other icon families keep their own
canonical mappings. This is a demonstration choice, not a required Slider icon.

The optional `e20` label indicator is another Kiskadee form-composition
affordance, not a Fluent Slider measurement. It selects the shared
`caption-medium` profile at every Slider scale. Its color alpha and label spacing remain owned by
the Slider schema; typography no longer changes line height to reproduce a component-local line
box. The existing centered alignment owns the single-line placement.

## Color And Token Provenance

The inspected node exposes these relevant variables:

| Figma variable | Value | Lookup | Kiskadee use |
| --- | --- | --- | --- |
| `NeutralStrokeAccessible.Rest` | `#5d616b` | `exact(slider.neutral, 50, component.slider)` | endpoint icon (`e6`), retained |
| Windows 11 quick-settings inactive rail | observed `#868686` | `exact(slider.neutral, 26, component.slider)` | `e8` onSubtle, Kiskadee calibrated `#939393` |
| Kiskadee inactive rail Pressed | user-approved lighter response | `exact(slider.neutral, 14, component.slider)` | `e8` onSubtle Pressed, `#c2c2c2` |
| `CompoundBrandBackground.Rest` | `#0064b4` | `reference(slider.primary, vivid)` | active rail, Neutral thumb inner and Primary onSubtle outer ring, rest/focus |
| `CompoundBrandBackground.Hover` | `#0055a4` | `reference(slider.primary, vivid +1)` | active rail, Neutral thumb inner and Primary onSubtle outer ring, hover |
| `CompoundBrandBackground.Pressed` | `#004694` | `reference(slider.primary, vivid +2)` | active rail, Neutral thumb inner and Primary onSubtle outer ring, pressed |
| `NeutralBackground1.Rest` | `#ffffff` | `cap(primitive.black.v1, light)` | Neutral outer thumb fill, Primary disabled fill and tick marks |
| `NeutralStroke1.Rest` | `#ccd1dd` | `exact(slider.neutral, 10, component.slider)` | Neutral outer thumb stroke |
| `TransparentStrokeDisabled.Rest` | `#ffffff00` | `cap(primitive.black.v1, light, 0%)` | disabled inactive rail |
| `NeutralForegroundDisabled.Rest` | `#b9bdc9` | `exact(slider.neutral, 16, component.slider)` | disabled active rail and thumb inner |
| `NeutralStrokeDisabled.Rest` | `#dbe0ec` | `exact(slider.neutral, 7, component.slider)` | disabled outer thumb stroke |

The fixed neutral stops form the evidence-bound `component.slider` catalog. They are source-token
adaptations, not replacement functional anchors. Brand interaction states remain relative to the
family's `vivid` anchor, while white, transparent, and optional black overlays use physical caps.
The optional indicator uses `cap(primitive.black.v1, dark, 30%)`, reduced to 18% when Disabled.

The [user-supplied Windows 11 onSubtle screenshot](../evidence/slider/windows-11-quick-settings-on-subtle.png)
shows a lighter inactive rail than the inspected Figma variable. The reference raster
measures `#868686` at an uninterrupted rail pixel on a `#f2f2f2` surface. The
approved Light neutral L26 stop resolves to `#939393`; both Neutral and Primary
Slider intents use it for `e8` Rest, Hover and Focus onSubtle. Their Pressed
state uses L14 `#c2c2c2` as a Kiskadee interaction calibration. The child `e8`
palette publishes this through a `ref` to the component-owned Pressed state;
pressing or dragging the thumb activates it without a new runtime state.
This is a user-approved visual calibration, not a claim that Microsoft publishes
L26 as an official rail token. The selected rail, thumb, endpoints and onVivid
recipes keep their prior mappings.

The approved tonal asset does not contain every upstream HEX verbatim. The retained adaptations
resolve Neutral Foreground 1 to `#21242d`, Disabled foreground to `#b6bac6`, Brand Hover/Pressed to
`#0059a1`/`#045091`, and thumb Rest/Disabled strokes to `#cdd1de`/`#dce0ed`. These are explicit
nearest-position adaptations, now frozen by the Slider schema test rather than silent literals.

## On-vivid trial (2026-09-26)

The [user-supplied Windows 11 quick-settings screenshot](../evidence/slider/windows-11-quick-settings-on-vivid.png)
is visual evidence for a light-blue selected rail and thumb center over a dark-blue
surface. The [Fluent Community Figma Slider node](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=8934-15)
does not document this onVivid appearance. The values below are a Kiskadee
calibration using approved assets and existing Slider slots, not exact Microsoft
tokens extracted from the raster.

On `onSubtle`, Neutral and Primary share text, rail and endpoint recipes. The
Primary thumb has a distinct Kiskadee calibration described below.
Light `onVivid` now publishes both intents at Medium. Neutral remains the default
and follows the approved Switch Neutral selected Light-track Primary
`subtle +10/+12/+14` progression: Microsoft Blue Rest `#68baff` for `e9`
active rail and `e11` thumb inner. Primary uses physical white for the active
rail and the exact Light Primary L50 Card surface color for its `e11` thumb
inner (`#0064b4` for Microsoft Blue, `#5053b2` for Teams), inside a white
outer ring. This follows the [user-marked Card surface reference](../evidence/slider/kiskadee-primary-thumb-card-color.png).
Both use a 35% white inactive rail, white endpoint
text/icons and translucent disabled treatment. The `e19` and `e14` channels
continue to author thumb-icon and value-indicator foregrounds independently.

Neutral uses a solid `reference(slider.neutral, vivid)` outer thumb fill and border
around its light-blue center, removing the earlier transparent black ring.

## Tooltip and thumb-icon contrast (2026-09-26)

The user compared [onSubtle](../evidence/slider/kiskadee-tooltip-before-on-subtle.png)
and [onVivid](../evidence/slider/kiskadee-tooltip-before-on-vivid.png) Showcase
screens and approved a context-specific correction. For both intents, `e14`
now uses the solid `reference(slider.neutral, vivid)` background and physical
white text onSubtle. OnVivid it uses a physical white background and the same
neutral-vivid foreground. The existing `e14::after` arrow inherits the tooltip
background, so it needs no additional authored slot.

OnVivid Neutral uses the solid neutral-vivid anchor for both `e10.boxColor`
and `e10.borderColor`; `e19.textColor` uses the physical dark cap (pure black)
on its light-blue `e11` center. Primary retains its white outer thumb and white
thumb icon; its center now matches the base Primary Highest Card surface. This
uses `exact(slider.primary, L50, component.slider)` rather than the Slider
family's vivid reference, because those positions differ in Teams. The lateral
endpoint icons (`e6`) remain
white against the dark-blue Card. These are Kiskadee calibrations based on
visual review, not newly asserted official Fluent tokens.

The brand recipe is `reference(slider.primary, subtle, +10/+12/+14)` so Teams
follows its own approved Primary scale. White and dark overlays use physical
`cap(primitive.black.v1)` locators. Geometry, theme coverage, interaction mode
and element topology remain unchanged; Dark/Darker Slider recipes are still not
published.

## Primary onSubtle thumb calibration (2026-09-26)

The user approved bringing the Primary onVivid thumb's two-color structure to
Light onSubtle, with the dark and light roles reversed. The outer `e10` fill and
its 1px stroke now use the same `reference(slider.primary, vivid)` Rest/Focus,
`+1` Hover and `+2` Pressed colors as the selected `e9` rail. Matching the
stroke to the fill removes the visible gray outline without changing thumb
geometry. The inner `e11` fill uses the current Neutral Low Card surface,
`exact(card.neutral, L1, component.card)` (`#fbfbfb` in both published segments),
across those active states. The Card surface Rest is published by Container.
The optional `e19` thumb icon uses the same
`reference(slider.primary, vivid)` Rest/Focus, `+1` Hover and `+2` Pressed
colors as the selected rail and outer ring over that light center. Disabled
thumb colors retain their earlier mapping. Neutral and onVivid recipes remain
unchanged. This is a user-approved Kiskadee visual adaptation, not a newly
asserted official Fluent token.

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
  `components.slider.options.markLabelPlacement = "adaptive"`;
- labels declared on edge marks use the Kiskadee adaptive responsive mapping
  `components.slider.options.edgeLabelPlacement = "adaptive"`;
- visual element: `e15`, with width `1px` and height equal to the rail height.

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
