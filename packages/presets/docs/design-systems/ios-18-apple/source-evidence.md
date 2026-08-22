# iOS 18 Apple Source Evidence

This file records preset-level source evidence for
`packages/presets/src/presets/ios-18-apple/`.

## Primary Sources

- [Apple Human Interface Guidelines: Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Human Interface Guidelines: SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)

## Interface Icon Evidence

Apple identifies SF Symbols as the symbol family designed to integrate with San Francisco and
Apple-platform text. Kiskadee recommends the semantic family ID `sf-symbols` for the iOS 18
preset with the `regular` variant. This is **Official adapted**: the preset records the official
platform family and regular weight intent without embedding or redistributing its assets.

The optional Web catalog declares `sf-symbols.regular -> iconoir.regular` as an explicit
**Kiskadee extension**.
It is a portability fallback, never an assertion that Iconoir is Apple's family. Consumers with a
licensed native implementation can register `sf-symbols` directly and take precedence over the
fallback.

## Typography Evidence

Apple defines Body as a system text style and identifies SF Pro as the iOS system family. The
preset's existing Switch label uses the default 17/22 Regular recipe and now selects the reusable
`body-medium` profile. This is **Official adapted** for Web: the semantic role and metrics follow the
Apple reference, while the preset uses the platform `system-ui` stack and does not embed SF Pro.
A complete review of the wider Apple type ramp remains **Deferred**.

## Switch Icon Size Representation

The existing `16px` optional Switch icon viewport is preserved through `e6.iconSize` referencing
`global.iconSizes.s:md:1`. This is a Kiskadee schema ownership change, not new Apple source evidence.
