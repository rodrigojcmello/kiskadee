# iOS 26 Apple Slider Evidence

Sources:

- [Apple iOS 26 and iPadOS 26 Community](https://www.figma.com/design/c2E5uInBeaV5dQti9UxvUl/Apple-iOS-26-and-iPadOS-26--Community-?node-id=50-86890&t=O0uDULQOrwGy6fYB-11)
- [macOS 26 Community](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=121-12407&t=364z1L3qiz5fuPv2-11)
- [macOS 26 center-biased reference](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=533-3570&t=364z1L3qiz5fuPv2-11)

## Schema Mapping

The Apple Slider references use a rectangular pill-like thumb and visible marks
that can sit outside the rail. Kiskadee maps that to the generic Slider
contract:

- `e8`: track / rail;
- `e9`: active track;
- `e10`: thumb wrapper and visible thumb body;
- `e11`: thumb inner, kept visually empty for this preset;
- `e15`: ordinary marks / ticks;
- `e18`: neutral origin mark for center-biased sliders.

The preset uses:

- `markPlacement: "below"` so ordinary marks render outside the track by
  default;
- `thumbEdge: "contain"` so the thumb stays within the rail at
  `min`/`max`;
- `fillOrigin: "min"` for ordinary sliders;
- `fillOriginMark: "auto"` so a neutral origin mark appears when an instance uses
  `fillOrigin="center"` or a numeric origin.

Kiskadee sets `e4.boxHeight` to the nominal thumb height for each scale. This is
a structural lane-stabilization token, not a separate Figma measurement: it keeps
the track vertically stable when endpoint icons overflow the control lane.

The optional Kiskadee `e19` thumb icon slot is also schema-styled for the preset.
The preset does not declare the optional `e12`/`e13` enlarged icon-thumb
geometry overlays, so `thumbIcon` preserves the official `e10`/`e11`
dimensions. It is a generic Kiskadee composition affordance, not a separate
iOS 26 Slider measurement from the Figma source.

The optional `e20` label indicator is also a Kiskadee form-composition
affordance rather than an Apple Slider measurement. Its text size, color alpha,
and label spacing remain schema-owned.

## Adaptations

The upstream visual treatment includes a Liquid Glass thumb material. This
preset does not implement that material yet. The schema uses a mostly opaque
white thumb, solid white border, and the `s:sm:2` global outer shadow level
registered from the iOS Slider thumb node as a pragmatic cross-platform
approximation. The inspected thumb shadow is a two-layer stack:
`0 6px 13px rgba(0,0,0,0.12)` and `0 0.5px 4px rgba(0,0,0,0.12)`. A low-alpha
white fill without the full Liquid Glass material lets the track show through
the thumb and makes the control look weak in Kiskadee, so the preset favors
legibility until a real material effect exists.

Tooltip-style value indicators use a white surface, black text, and the
`s:sm:3` global outer shadow level. That shadow is a Kiskadee adaptation, not a
direct Figma extraction, because the thumb shadow is too strong for the smaller
tooltip surface.

The macOS reference shows a darker selected track during interaction. Kiskadee
uses that as evidence for a `pressed` state, but derives the pressed color from
the iOS primary blue instead of copying the macOS blue into the unified
`ios-26-apple` preset.

The center-biased reference uses a neutral mark at the origin and lets the
active range grow away from that origin. Kiskadee implements this with
`fillOrigin` and `fillOriginMark` instead of creating a platform-specific
Slider variant.
