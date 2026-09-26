# Fluent 2 Microsoft Separator Evidence

> Current neutral mapping: [2026-09-19 achromatic calibration](neutral-surface-calibration.md).
> It supersedes the earlier tinted-neutral and Light contour values below; those sections retain historical provenance.


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

| Theme | Existing role | Lookup | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Light | NeutralStroke2 source | `reference(primitive.black.v1, subtle +3)` | L7 `#e0e0e0` | Kiskadee color adaptation |
| Dark | NeutralStroke2 source | `reference(primitive.black.v1, subtle +16)` | D30 `#4f4f4f` | Kiskadee color adaptation |
| Darker | No upstream theme | `reference(primitive.black.v1, subtle +7)` | D12 `#313131` | Kiskadee extension |

## Kiskadee Mapping

- The recipe contains a one-pixel `boxWidth` and Neutral Low/Medium Rest colors.
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

## Optional Primary composition line (2026-09-24)

Primary Lowest was added on 2026-09-26 as a Kiskadee calibration: L50 at 7% alpha
onSubtle and initially L4 at 5% onVivid, half the then-current Low opacity. Light publishes
Lowest, Low and Medium for both intents. The subsequent visual calibration separates
onSubtle strengths into 7%, 14% and 28%; Medium was previously equal to Low. This is not an official
Fluent token mapping and does not add Primary recipes to Dark/Darker.

Status: user-authorized Kiskadee composition trial, not an upstream Fluent Divider token.
Light publishes Primary Medium as an optional standalone Separator intent while retaining
all Neutral recipes and the one-pixel geometry. On subtle surfaces Medium uses
Microsoft L50 `#0064b4` at 28% (`#0064b447`) and Teams L50 `#5053b2` at 28%
(`#5053b247`). Card borders continue referencing Low at 14%, unchanged. The initial
onVivid Primary line used the shared pale L4 contour at 5/10/20%; the current mapping
is documented below.
Low onSubtle retains its 14% contour; Medium now provides a distinct stronger line.
No literal color is authored in the Schema; both values resolve through the existing
approved Primary assets. Dark and Darker continue publishing only Neutral separators.
Consumers may use a neutral line instead; Primary is a composition choice, not a
nesting rule.

## Primary dark line on vivid (2026-09-26)

Status: user-authorized Kiskadee composition trial, not an official Fluent Divider token.
On a vivid surface, Neutral retains its light line while Primary now darkens the surface.
The segment's approved Primary Light scale supplies L85 through an evidence-backed `exact`
locator in the Separator recipe. No Card border or shared contour recipe changes.

| Emphasis | Alpha | Microsoft Blue L85 `#12263b` | Teams Primary L85 `#1f223c` |
| --- | --- | --- | --- |
| Lowest | 8% | `#12263b14` | `#1f223c14` |
| Low | 16% | `#12263b29` | `#1f223c29` |
| Medium | 32% | `#12263b52` | `#1f223c52` |

These values are a visual calibration for the existing three-level hierarchy. They use
translucent Primary rather than physical black; the latter remains an option if the trial
does not read well in use. Primary onSubtle keeps its L50 7/14/28% hierarchy, and Dark
and Darker still publish only Neutral Separator recipes.

## Low Emphasis Extension

Low is a user-requested Kiskadee hierarchy extension, not an upstream Fluent token mapping.
It uses the approved `primitive.black.v1` physical caps through `absoluteCap`:

| Context | Light | Dark / Darker | Rationale |
| --- | --- | --- | --- |
| onSubtle Low | dark cap, 8% alpha | light cap, 12% alpha | Quiet grouping line over neutral surfaces |
| onVivid Low | light cap, 15% alpha | light cap, 15% alpha | Matches the existing Card onVivid boundary convention |
| onVivid Medium | light cap, 30% alpha | light cap, 30% alpha | Stronger separation while remaining below content contrast |

The existing onSubtle Medium tonal mappings remain unchanged. These alpha choices are explicit
Kiskadee adaptations; no new primitive asset or upstream color claim is introduced. The p-react
Separator selects emphasis and inherits its local content surface context. The Card Showcase
controls explicitly select Low in both contexts.
