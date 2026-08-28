# Fluent 2 Microsoft Icon Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/fluent-2-microsoft/components/icon.schema.ts`.

## Sources

- Official documentation:
  [Fluent 2 iconography](https://fluent2.microsoft.design/iconography)
- Official icon assets:
  [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
- Figma community file:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - icon-specific node: not inspected

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Icon sizing and usage | Fluent 2 iconography | Size guidance and accessibility | Official adapted |
| Vector artwork | Fluent UI System Icons | Cross-platform SVG assets | Official exact |
| Intent and surface matrix | No upstream equivalent | Kiskadee schema coverage | Kiskadee extension |

## Official Contract

- Fluent icons use discrete sizes selected for their surrounding control or information density.
- The official icon library supplies cross-platform vector artwork in regular and filled styles.
- Fluent does not define a standalone component matrix matching Kiskadee's `neutral | primary`
  intents and `onSubtle | onVivid` surface contexts.

## Color And Token Provenance

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| Neutral foreground on ordinary surfaces | Fluent Neutral | `icon.neutral`, theme-specific vivid reference |
| Brand foreground on ordinary surfaces | Fluent Brand | `icon.primary`, theme-specific vivid reference |
| Neutral content on a strong surface | Fluent on-brand/inverted relationship | Absolute white at neutral Light tone `0` |
| Primary content on a strong surface | Fluent on-brand/inverted relationship | Primary Light subtle reference with ordinal offset `+4` |
| Brand artwork | Official asset-owned fills or gradients | Preserved by the SVG; semantic intent is inert |

The schema contains no literal color. It resolves the approved Fluent primitive assets through
the three-layer color contract.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Ten icon scales | Fluent discrete size model | Official adapted | `global.iconSizes` publishes `6`, `8`, `10`, `12`, `16`, `20`, `24`, `28`, `32`, and `48` px; `6`, `8`, and `10` preserve compact internal Badge, Slider, and Switch glyph measurements |
| `neutral.medium.rest` | Neutral foreground | Official adapted | Theme-specific neutral vivid reference |
| `primary.medium.rest` | Brand foreground | Official adapted | Theme-specific Brand vivid reference |
| `onVivid` | Inverted/on-brand content | Kiskadee extension | Absolute neutral white or a physically light Primary from the Light scale |

## Kiskadee Extensions

- `Icon` is a static visual component with only `rest`; it does not invent Hover, Pressed, Focus,
  Selected, or Disabled palettes.
- The public intents are limited to `neutral` and `primary`.
- Fixed-color brand artwork owns its paint. Only monochrome artwork responds to the preset intent.

## Shared Formula

- `onSubtle`: resolve the selected intent's theme-specific `vivid` reference at offset `0`.
- `onVivid neutral`: resolve neutral Light tone `0`, preserving absolute white on
  strong surfaces.
- `onVivid primary`: resolve the Primary Light `subtle` reference at offset `+4`,
  preserving the color-family identity.
- All values are resolved during schema authoring/build; no browser contrast logic is required.

## Deferred Or Unsupported

- Additional semantic intents and interaction states are deferred.
- Filled/regular icon style selection remains an artwork concern, not an Icon schema option.
- Figma icon-specific nodes have not been inspected.

## Schema Mapping

- `e1`: glyph wrapper; maps each component scale to the matching `global.iconSizes` reference and
  owns `textColor`. The Web Builder expands the reference into square `boxWidth` and `boxHeight`
  utilities.

## Validation

- Pending end-to-end Core, Web Builder, React, and Showcase validation.

## Open Gaps

- None known for the initial static contract.
