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
- `e13`: ordinary marks / ticks;
- `e16`: neutral origin mark for center-biased sliders.

The preset uses:

- `markPlacement: "below"` so ordinary marks render outside the track by
  default;
- `thumbEdgeBehavior: "contain"` so the thumb stays within the rail at
  `min`/`max`;
- `activeTrackOrigin: "min"` for ordinary sliders;
- `originMark: "auto"` so a neutral origin mark appears when an instance uses
  `activeTrackOrigin="center"` or a numeric origin.

## Adaptations

The upstream visual treatment includes a Liquid Glass thumb material. This
preset does not implement that material yet. The current schema uses a
translucent thumb fill, border, and shadow as a lightweight approximation while
preserving the cross-platform Slider contract.

The center-biased reference uses a neutral mark at the origin and lets the
active range grow away from that origin. Kiskadee implements this with
`activeTrackOrigin` and `originMark` instead of creating a platform-specific
Slider variant.
