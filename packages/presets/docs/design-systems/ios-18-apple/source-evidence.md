# iOS 18 Apple Source Evidence

This file records preset-level source evidence for
`packages/presets/src/presets/ios-18-apple/`.

## Primary Sources

- [Apple SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Human Interface Guidelines: SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)

## Interface Icon Evidence

Apple identifies SF Symbols as the symbol family designed to integrate with San Francisco and
Apple-platform text. Kiskadee recommends the semantic family ID `sf-symbols` for the iOS 18
preset. This is **Official adapted**: the preset records the official platform family without
embedding or redistributing its assets.

The optional Web catalog declares `sf-symbols -> iconoir` as an explicit **Kiskadee extension**.
It is a portability fallback, never an assertion that Iconoir is Apple's family. Consumers with a
licensed native implementation can register `sf-symbols` directly and take precedence over the
fallback.
