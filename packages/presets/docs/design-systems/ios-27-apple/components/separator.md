# iOS 27 Apple Separator Evidence

This file records source evidence and schema decisions for the shared Separator recipe and
`packages/presets/src/presets/ios-27-apple/components/separator.schema.ts`.

## Sources

- [Apple Human Interface Guidelines: Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- Existing iOS 27 Dropdown mapping documented in [Dropdown evidence](dropdown.md)
- Promoted Apple Gray tonal evidence in
  [`ios-27-color-evidence.md`](../colors/ios-27-color-evidence.md)

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Menu grouping | Apple Menus guidance | Official adapted | Separators distinguish explicit logical groups. |
| Shared recipe and standalone Web component | Kiskadee contract | Kiskadee extension | It is not presented as a native Apple Separator API. |

## Color And Token Provenance

The `subtle` recipe preserves the existing `Dropdown.e7` output without changing its color:

| Theme | Existing role | Primitive and tone | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Light | `dropdown.neutral` | Apple Gray `primitive.black.v1`, Light 10 | `#d1d1d4` | `global.separators.profiles.subtle` |
| Dark | `dropdown.neutral` | Apple Gray `primitive.black.v1`, Dark 16 | `#38383b` | `global.separators.profiles.subtle` |

## Kiskadee Mapping

- The recipe contains a one-pixel `boxWidth` and Neutral/Medium/Rest `boxColor` only.
- `components.separator.e1` and `components.dropdown.e7` reference the same build-time recipe.
- Orientation is structural. Spacing and inset belong to the surrounding layout or Dropdown group.
- Dropdown does not render the standalone Separator component; equal style keys deduplicate in the
  Builder.

## Validation

- The mapping uses the promoted source-backed Apple Gray family and introduces no literal in schema
  code.
- Light and Dark preserve the previous Dropdown tones exactly.

## Open Gaps

- Native Liquid Glass and platform-specific separator materials remain outside this opaque Web
  adaptation.
