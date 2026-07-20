# iOS 27 Apple Source Evidence

This directory records official source evidence and preset-level decisions for
`packages/presets/src/presets/ios-27-apple/`.

## Primary Source

- [iOS and iPadOS 27 Community](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
  - file key: `GeO2lMY65IAFczDmjs6oei`;
  - inspected Button page/node: `507:24673`;
  - inspected Colors page: `0:1746`;
  - inspected default color section: `5707:28659`;
  - inspected local variable collection: `Colors`, with `Light` and `Dark` modes.

## Source Status

- The Figma file exposes one centralized local `Colors` collection. Its official Accent and Gray
  variables are preserved in
  [`colors/figma-color-variables.json`](colors/figma-color-variables.json).
- Apple provides system-color seeds per appearance rather than complete multi-stop ramps. The JSON
  therefore records source variables, not a reconstructed tonal scale.
- The preset identity and build slug are now `ios-27-apple`.
- The primitive scales currently in the preset are provisional values inherited from the former
  iOS 26 implementation. They must not be described as approved iOS 27 tonal assets.
- A generator `0.4.1` tonal candidate now exists under `colors/generated/`, together with its
  editable recipe and source-to-tonal mapping. It remains evidence-only until visual approval;
  none of its assets have been promoted into the preset runtime.

## Component Evidence

- [Button](components/button.md)
- [Slider](components/slider.md) — legacy iOS 26/macOS 26 evidence retained until the component is
  revalidated against iOS 27.

## Color Evidence

- [iOS 27 color variables](colors/ios-27-color-evidence.md)
