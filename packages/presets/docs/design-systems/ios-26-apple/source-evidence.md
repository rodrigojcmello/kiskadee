# iOS 26 Apple Source Evidence

This file records source evidence and preset-level decisions for
`packages/presets/src/presets/ios-26-apple/`.

## Primary Sources

- Figma community file:
  [Apple iOS 26 and iPadOS 26 Community](https://www.figma.com/design/c2E5uInBeaV5dQti9UxvUl/Apple-iOS-26-and-iPadOS-26--Community-?node-id=50-86890&t=O0uDULQOrwGy6fYB-11)
  - file key: `c2E5uInBeaV5dQti9UxvUl`
  - inspected Slider node: `50:86890`
- Figma community file:
  [macOS 26 Community](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=121-12407&t=364z1L3qiz5fuPv2-11)
  - file key: `37jpyRzTWznKjRhFSF3GD3`
  - inspected Slider node: `121:12407`

## Source Notes

- Kiskadee unifies the Apple iOS 26, iPadOS 26, and macOS 26 Slider treatment
  under the `ios-26-apple` preset.
- The current Slider schema approximates platform geometry, color, and mark
  placement. The Liquid Glass thumb material is intentionally not implemented
  in this preset yet.
- The Slider thumb uses the smallest global iOS outer shadow level first. If
  that reads too weak or too strong, revise the iOS elevation scale instead of
  adding local ad hoc thumb shadow values.
- macOS Slider evidence includes a darker selected track during interaction.
  Kiskadee maps that to the Slider pressed state, while keeping the actual
  pressed color derived from the iOS primary blue for the unified preset.

## Component Evidence

- [Slider](components/slider.md)
