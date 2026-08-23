# Fluent 2 Microsoft Separator Evidence

This file records source evidence and schema decisions for the shared Separator recipe and
`packages/presets/src/presets/fluent-2-microsoft/components/separator.schema.ts`.

## Sources

- [Fluent 2 Menu usage](https://fluent2.microsoft.design/components/web/react/core/menu/usage)
- [Fluent Web Community Figma Divider](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-6400)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - node id: `9121:6400`
- [Fluent Web Community Figma: divider raster example](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9383-30544)
  - node id: `9383:30544`
  - supporting visual reference only; the raster is not used to infer numeric color values
- Existing Fluent Dropdown mapping documented in [Dropdown evidence](dropdown.md)
- Promoted Fluent Neutral tonal evidence in
  [`fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Menu grouping | Fluent Menu usage | Official adapted | An explicit divider separates logical groups. |
| Menu Divider | Figma `9121:6400` | Official adapted geometry | One-pixel NeutralStroke2 source line. |
| Divider in context | Figma raster `9383:30544` | Supporting | Confirms visual usage without replacing inspectable token evidence. |
| Shared recipe and standalone component | Kiskadee contract | Kiskadee extension | Fluent evidence does not define Kiskadee's cross-component recipe. |

## Color And Token Provenance

The `subtle` recipe keeps the one-pixel official geometry but deliberately replaces the subtly
blue NeutralStroke2 family with Kiskadee's approved achromatic Black v1 scale:

| Theme | Existing role | Primitive and tone | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Light | NeutralStroke2 source | Achromatic `primitive.black.v1`, Light 7 | `#e0e0e0` | Kiskadee color adaptation |
| Dark | NeutralStroke2 source | Achromatic `primitive.black.v1`, Dark 30 | `#4f4f4f` | Kiskadee color adaptation |
| Darker | No upstream theme | Achromatic `primitive.black.v1`, Dark 12 | `#313131` | Kiskadee extension |

## Kiskadee Mapping

- The recipe contains a one-pixel `boxWidth` and Neutral/Medium/Rest `boxColor` only.
- `components.separator.e1`, `components.dropdown.e7`, and `components.bottomSheet.e12` reference
  the same build-time recipe.
- Orientation is structural. Spacing and inset belong to the surrounding layout or Dropdown group.
- Dropdown does not render the standalone Separator component; equal style keys deduplicate in the
  Builder.

## Validation

- The mapping uses the approved zero-chroma Black v1 family and introduces no literal in schema
  code.
- Light and Dark intentionally diverge from NeutralStroke2 color while preserving its geometry.
  Darker remains an explicit Kiskadee extension because Fluent does not define that upstream Menu
  theme.

## Open Gaps

- A complete standalone Fluent divider capability review is not part of this change.
