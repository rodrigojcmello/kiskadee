# Material Design 3 Google Separator Evidence

This file records source evidence and schema decisions for the shared Separator recipe and
`packages/presets/src/presets/material-3-google/components/separator.schema.ts`.

## Sources

- [Material Design 3 Menus overview](https://m3.material.io/components/menus/overview)
- [Material Design 3 Menus specifications](https://m3.material.io/components/menus/specs)
- Existing Material Dropdown mapping documented in [Dropdown evidence](dropdown.md)

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Menu grouping | Material Menu specifications | Official adapted | An explicit divider separates logical groups. |
| Shared recipe and standalone component | Kiskadee contract | Kiskadee extension | Material semantics are adapted to Kiskadee's reusable recipe. |

## Color And Token Provenance

The `subtle` recipe preserves the existing `Dropdown.e7` output without changing its color:

| Segment and theme | Existing role | Primitive and tone | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Default/Light | `dropdown.neutral` | `primitive.black.v1`, Light 20 at 12% | `#c9c5cd1f` | `global.separators.profiles.subtle` |
| Dynamic/Light | inherited neutral mapping | `primitive.black.v1`, Light 20 at 12% | `#c9c5cd1f` | `global.separators.profiles.subtle` |

The Material 3 Kiskadee preset inherits this profile and component mapping through its existing
Material Google base-schema merge; it does not duplicate the recipe.

## Kiskadee Mapping

- The recipe contains a one-pixel `boxWidth` and Neutral/Medium/Rest `boxColor` only.
- `components.separator.e1` and `components.dropdown.e7` reference the same build-time recipe.
- Orientation is structural. Spacing and inset belong to the surrounding layout or Dropdown group.
- Dropdown does not render the standalone Separator component; equal style keys deduplicate in the
  Builder.

## Validation

- The mapping resolves through Material's existing neutral semantic and introduces no literal in
  schema code.
- Default and Dynamic preserve the previous Dropdown tone and alpha exactly.

## Open Gaps

- Dark-theme Divider evidence and a complete Material Divider capability review are deferred.
