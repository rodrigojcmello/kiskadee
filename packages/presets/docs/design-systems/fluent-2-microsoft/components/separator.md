# Fluent 2 Microsoft Separator Evidence

This file records source evidence and schema decisions for the shared Separator recipe and
`packages/presets/src/presets/fluent-2-microsoft/components/separator.schema.ts`.

## Sources

- [Fluent 2 Menu usage](https://fluent2.microsoft.design/components/web/react/core/menu/usage)
- Existing Fluent Dropdown mapping documented in [Dropdown evidence](dropdown.md)
- Promoted Fluent Neutral tonal evidence in
  [`fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Menu grouping | Fluent Menu usage | Official adapted | An explicit divider separates logical groups. |
| Shared recipe and standalone component | Kiskadee contract | Kiskadee extension | Fluent evidence does not define Kiskadee's cross-component recipe. |

## Color And Token Provenance

The `subtle` recipe preserves the existing `Dropdown.e7` output without changing its color:

| Theme | Existing role | Primitive and tone | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Light | `dropdown.neutral` | Fluent Neutral `primitive.black.v2`, Light 10 | `#cdd1de` | `global.separators.profiles.subtle` |
| Dark | `dropdown.neutral` | Fluent Neutral `primitive.black.v2`, Dark 16 | `#353842` | `global.separators.profiles.subtle` |
| Darker | `dropdown.neutral` | Fluent Neutral `primitive.black.v2`, Dark 12 | `#2e313a` | `global.separators.profiles.subtle` |

## Kiskadee Mapping

- The recipe contains a one-pixel `boxWidth` and Neutral/Medium/Rest `boxColor` only.
- `components.separator.e1` and `components.dropdown.e7` reference the same build-time recipe.
- Orientation is structural. Spacing and inset belong to the surrounding layout or Dropdown group.
- Dropdown does not render the standalone Separator component; equal style keys deduplicate in the
  Builder.

## Validation

- The mapping uses the promoted Fluent Neutral family and introduces no literal in schema code.
- Light, Dark, and Darker preserve the previous Dropdown tones exactly.

## Open Gaps

- A complete standalone Fluent divider capability review is not part of this change.
