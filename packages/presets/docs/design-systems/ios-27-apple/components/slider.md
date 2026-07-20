# iOS 27 Apple Slider Evidence Status

The Slider implementation carried into `ios-27-apple` is still based on the previous source set:

- [Apple iOS 26 and iPadOS 26 Community](https://www.figma.com/design/c2E5uInBeaV5dQti9UxvUl/Apple-iOS-26-and-iPadOS-26--Community-?node-id=50-86890)
- [macOS 26 Community](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=121-12407)
- [macOS 26 center-biased reference](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=533-3570)

This evidence remains useful provenance for the current provisional geometry, marks, and shadow
adaptations, but it is not proof of iOS 27 fidelity. The component must be revalidated against an
iOS 27 Slider source before its styling is called official.

## Carried Contract

- `e8`: track / rail;
- `e9`: active track;
- `e10`: thumb wrapper and visible thumb body;
- `e11`: visually empty thumb inner;
- `e15`: ordinary marks / ticks;
- `e18`: neutral origin mark for center-biased sliders;
- `markPlacement: "below"` for external ordinary marks;
- `thumbEdge: "contain"` for rail-bound endpoint geometry;
- `fillOrigin: "min"` with `fillOriginMark: "auto"` for optional center/numeric origins.

The optional `e19` thumb icon and `e20` label indicator are Kiskadee composition affordances, not
Apple measurements. The Liquid Glass thumb material remains approximated by a white surface,
border, and the global `s:sm:2` shadow extracted from the older iOS 26 reference.
