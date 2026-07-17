# Fluent 2 Microsoft Button Evidence

This file records source evidence and color decisions for the Button currently authored in
`packages/presets/src/presets/fluent-2-microsoft/components/button.schema.ts`.

## Sources

- Figma Light reference:
  [Fluent 2 Button Light](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=11045-3896&t=VKTTOhGXjS8MYP2E-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - page node: `11045:3896`
  - inspected Primary state group: `11045:3945`
  - inspected Secondary state group: `11045:3976`
  - inspected Outline state group: `11045:4011`
  - inspected Subtle state group: `11045:4046`
  - inspected Transparent state group: `11045:4081`
- Figma Dark reference:
  [Fluent 2 Button Dark](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9026-2684&t=VKTTOhGXjS8MYP2E-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - page node: `9026:2684`
  - inspected Primary state group: `9026:2787`
  - inspected Secondary state group: `9026:2818`
  - inspected Outline state group: `9026:2853`
  - inspected Subtle state group: `9026:2888`
  - inspected Transparent state group: `9026:2923`
- Preset-wide tonal evidence:
  [`../colors/fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)
- Exact primitive de-para:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)

## Inspected Variant

- Fluent appearance: `Primary`.
- Content: text only.
- Size: medium, 32 px high.
- States: Rest, Hover, Pressed, Selected, Focus, and Disabled.
- Kiskadee surface: `primary.high` for the official Fluent mapping.

The medium scale declares 6 px of vertical padding per side in the platform-agnostic schema. The
Web Builder's Button emission policy subtracts the 1 px border from each side, producing 5 px of
rendered CSS padding. Together with the 20 px label line height and both 1 px borders, the final web
height remains the official 32 px: `5 + 1 + 20 + 1 + 5`.

## Kiskadee Extensions: Primary Medium, Low, And Lowest

Fluent 2 does not define Primary Button equivalents for Kiskadee's `primary.medium`, `primary.low`,
or `primary.lowest` emphases. Kiskadee still provides them because tonal, outlined, and borderless
primary actions are common across the design systems supported by the framework. These are
intentional framework extensions, not claims of upstream Fluent fidelity. Consumers that need
maximum fidelity to Fluent should use the documented `primary.high` Button and omit the three
extension emphases.

The extension uses the approved Blue primitive through `button.primary`. Light uses pale Blue
surfaces with a dark Blue foreground. Dark uses a low-lightness Blue-tinted surface with a lighter
Blue foreground; using a physically light filled surface in Dark would compete visually with the
official high-emphasis action. Its state rhythm follows the `primary.medium` pattern already
exercised by the Kiskadee Material 3 preset, recalibrated against the Fluent Blue scale.

| Theme/state | Kiskadee role/tone | Generated HEX |
| --- | --- | --- |
| Light Rest | `button.primary` L4 | `#e1efff` |
| Light Hover | `button.primary` L6 | `#d3e7ff` |
| Light Focus | Inherits Light Rest | `#e1efff` |
| Light Pressed | `button.primary` L8 | `#c1deff` |
| Light enabled foreground | `button.primary` L65 | `#0d477e` |
| Dark Rest | `button.primary` D10 | `#142d48` |
| Dark Hover | `button.primary` D8 | `#13273e` |
| Dark Focus | Inherits Dark Rest | `#142d48` |
| Dark Pressed | `button.primary` D14 | `#14375b` |
| Dark enabled foreground | `button.primary` D75 | `#61a7f3` |

### Adaptive Disabled Policy

Fluent supplies opaque disabled background tokens, mapped by Kiskadee to L3 in Light and D3 in
Dark. Kiskadee intentionally replaces those opaque fills with a surface-relative overlay across
the Button matrix:

- Light uses the `button.neutral` L100 absolute-black cap at 5% opacity;
- Dark and Darker use the `button.neutral` D100 absolute-white cap at 5% opacity;
- High, Medium, and Low use the overlay because their disabled states retain a visible fill;
- in Light, those three emphases use neutral L20 (`#a7abb6`) at 82% for the foreground;
- in Dark and Darker, those three emphases retain the solid neutral D35 foreground;
- Lowest remains fully transparent and keeps the solid L16/D35 foreground because its disabled
  state intentionally has no fill.

Over white, the Light overlay composes to approximately `#f2f2f2`, retaining the appearance of the
opaque L3 `#f0f2f7`. Over the Light neutral L3 surface, it composes to approximately `#e4e6eb`
instead of disappearing into the background. The inverse Dark overlay follows the same
surface-relative principle on dark and absolute-black surfaces. After the adaptive Button
background is composed, the Light foreground resolves to approximately `#b5b8c1` on white,
`#b2b6c0` on Light neutral L3, and `#aeb4c1` on Light primary. Disabled borders remain transparent.

This policy is a Kiskadee extension, not an official Fluent behavior. It was adopted after visual
comparison against the opaque mapping on white, neutral, and Primary surfaces: the opaque fill was
acceptable on white but either disappeared into a matching neutral surface or looked detached on a
colored surface. The translucent overlay preserved the disabled shape while allowing the surface
color to influence it.

Medium exposes Selected explicitly in every theme for every intent. Selected reuses the Medium
Rest surface: L4 in Light and D10 in Dark/Darker. Its disabled state follows the same adaptive
background and foreground policy as High and Low.

Low and Lowest reuse the Medium foreground but use a deliberately light interaction rhythm. The
states move toward the physically lighter end of each theme scale. Both are transparent at Rest,
and Focus inherits that transparent Rest surface; the external focus ring remains the focus
affordance. Selected uses L1 in Light and D18 in Dark/Darker. Low adds a one-pixel role-colored
border; Lowest keeps every border state transparent.

| Theme/state | Low and Lowest background | Low border | Enabled foreground |
| --- | --- | --- | --- |
| Light Rest and Focus | transparent | L50 at 50% `#0064b480` | L65 `#0d477e` |
| Light Hover | L2 `#f1f7ff` | L50 at 50% `#0064b480` | L65 `#0d477e` |
| Light Selected | L1 `#f8fbff` | L50 at 50% `#0064b480` | L65 `#0d477e` |
| Light Pressed | L4 `#e1efff` | L50 at 50% `#0064b480` | L65 `#0d477e` |
| Dark/Darker Rest and Focus | transparent | D35 at 50% `#005ba480` | D75 `#61a7f3` |
| Dark/Darker Hover | D14 `#14375b` | D35 at 50% `#005ba480` | D75 `#61a7f3` |
| Dark/Darker Selected | D18 `#133d68` | D35 at 50% `#005ba480` | D75 `#61a7f3` |
| Dark/Darker Pressed | D22 `#104375` | D35 at 50% `#005ba480` | D75 `#61a7f3` |

Disabled Low uses the same adaptive 5% neutral overlay and Light L20-at-82%/Dark D35 foreground as
Medium and High, without a visible border. Lowest remains fully transparent and borderless when
disabled, preserving its intentionally minimal appearance.
The enabled Low border uses the current intent family at the component Primary Rest position with
50% opacity: L50 in Light and D35 in Dark/Darker. This keeps the intent identity while allowing the
surface beneath it to soften the outline. Two opaque alternatives were explicitly rejected:
matching the foreground at L65/D75 was too dominant, while moving to L14/D50 made the border too
light. The 50% alpha is an experimental Kiskadee value pending visual approval; it is not an
upstream Fluent token.

## Canonical Kiskadee Intent Recipe

The active schema generates `primary`, `neutral`, `destructive`, and `positive` from one tonal
recipe. The intent changes only the Layer 3 color role; theme, emphasis, state positions, disabled
policy, and border policy remain identical. This is deliberate diagnostic infrastructure: when a
new segment replaces the primitive scales, visual differences reveal the behavior of the recipe or
the tonal family without hidden per-intent compensation.

The canonical positions are explicit slots in the irregular Kiskadee grid, not arithmetic offsets:

| Theme/emphasis | Rest | Hover | Pressed | Selected |
| --- | --- | --- | --- | --- |
| Light Medium | L4 | L6 | L8 | L4 |
| Light High | L50 | L55 | L75 | L60 |
| Light Low/Lowest | transparent | L2 | L4 | L1 |
| Dark Medium | D10 | D8 | D14 | D10 |
| Dark High | D35 | D40 | D14 | D28 |
| Dark Low/Lowest | transparent | D14 | D22 | D18 |
| Darker Medium | D10 | D8 | D14 | D10 |
| Darker High | D30 | D35 | D12 | D26 |
| Darker Low/Lowest | transparent | D14 | D22 | D18 |

Medium, Low, and Lowest foregrounds use the intent role at L65 in Light and D75 in Dark/Darker.
High uses the white neutral cap, L0 or D100. Low uses the intent role at L50 in Light and D35 in
Dark/Darker with 50% opacity for its border. Lowest is borderless. Focus is intentionally absent
from every palette map, so it inherits Rest while the global focus ring remains the accessibility
affordance. Selected stays explicit even when it equals Rest because the schema must declare that
the component supports the Selected state.

The recipe is currently canonical for this preset, but it is not claimed as an official Fluent
cross-intent formula. Primary High is the upstream-calibrated reference; all other intent/emphasis
combinations are Kiskadee extensions used to evaluate the reusable contract.

## Fluent Neutral Source Evidence

The following relationship records how Fluent's neutral appearances relate to Kiskadee's emphasis
vocabulary. It is preserved as upstream evidence and does not override the active shared recipe.

| Kiskadee emphasis | Fluent relationship | Decision |
| --- | --- | --- |
| `neutral.high` | No direct equivalent | Kiskadee extension. |
| `neutral.medium` | No direct equivalent | Kiskadee extension. |
| `neutral.low` | `Secondary (default)` | Closest official Fluent relationship. |
| `neutral.lowest` | `Outline`, `Subtle`, and `Transparent` | Closest structural relationship pending separate appearance capabilities. |

Fluent differentiates the three low-prominence appearances through border presence and
foreground/state behavior. The current Kiskadee contract does not claim that one shared emphasis
can reproduce all three exactly.

### Neutral Low: Fluent Secondary

Light mappings:

| State | Source background / border / foreground | Kiskadee background / border / foreground |
| --- | --- | --- |
| Rest and Focus | `#ffffff` / `#ccd1dd` / `#21242d` | L0 / L10 / L85 |
| Hover | `#f0f5ff` / `#c3c7d3` / `#21242d` | L2 / L12 / L85 |
| Pressed | `#dbe0ec` / `#afb3bf` / `#21242d` | L7 / L18 / L85 |
| Selected | `#e6ebf7` / `#b9bdc9` / `#21242d` | L5 / L16 / L85 |
| Disabled | `#ebf0fc` / `#dbe0ec` / `#b9bdc9` | L100 at 5% / transparent / L20 at 82% |

Dark mappings:

| State | Source background / border / foreground | Kiskadee background / border / foreground |
| --- | --- | --- |
| Rest and Focus | `#262932` / `#626671` / `#ffffff` | D9 / D45 / D100 |
| Hover | `#393d47` / `#717580` / `#ffffff` | D20 / D50 / D100 |
| Pressed | `#1c1f28` / `#676b76` / `#ffffff` | D6 / D45 / D100 |
| Selected | `#343842` / `#6c707b` / `#ffffff` | D16 / D50 / D100 |
| Disabled | `#11141c` / `#3e424c` / `#585c66` | D100 at 5% / transparent / D35 |

### Neutral Lowest: Borderless Collapse

The enabled foreground follows Fluent `NeutralForeground1`: L85 in Light and D100 in Dark. The
background is transparent at Rest and Focus. Hover, Pressed, and Selected reuse the official
`SubtleBackground` sequence: L2/L7/L5 in Light and D16/D10/D12 in Dark. Disabled is fully
transparent with L16/D35 foreground. Every border state is transparent.

### Retired Intent-Specific Neutral Mapping

An earlier implementation tuned Neutral independently: Medium used L5/L7/L10 and D16/D20/D10;
High used L85/L90/L95 and D85/D90/D75; Low and Lowest followed the Secondary/Subtle source tables
above. That approach was retired because it hid whether visual differences came from the Button
contract or the neutral tonal scale. The active schema now applies the canonical recipe unchanged
to `button.neutral`. These historical positions remain here only to preserve the design evidence.

## Kiskadee Extensions: Destructive And Positive

Fluent 2 exposes Cranberry for danger semantics and Green for success semantics, but it does not
define complete Button families matching Kiskadee's four emphasis levels. The Fluent preset now
provides `destructive` and `positive` Buttons as explicit Kiskadee extensions so components can use
the same semantic and emphasis contract across design systems. These appearances must not be
presented as upstream Fluent Button variants.

The extensions preserve the approved official families rather than deriving new component colors:

| Intent | Fluent semantic source | Approved primitive |
| --- | --- | --- |
| `destructive` | Cranberry Primary `#c50f1f` | `r.red.v1` through `button.destructive` |
| `positive` | Green Primary `#107c10` | `g.green.v1` through `button.positive` |

Both intents use the canonical recipe without semantic-specific tonal compensation. Their Light
High sequence is L50/L55/L75/L60 for Rest/Hover/Pressed/Selected; Dark is
D35/D40/D14/D28; Darker is D30/D35/D12/D26. Focus inherits Rest. High uses the white neutral cap
in every theme. Medium, Low, Lowest, borders, and disabled states follow the same recipe as Primary
and Neutral.

## Kiskadee Darker Theme

Fluent 2 provides Light and Dark references but no separate `darker` Button theme. Kiskadee adds
`darker` as an explicit framework extension for interfaces rendered on an absolute-black surface.
It copies the complete Dark Button contract and moves only High-emphasis enabled states one public
tonal slot toward the physically darker end of each approved scale. Medium, Low, Lowest, text,
borders, and the shared disabled mapping remain identical to Dark.

| Applies to | Dark High Rest/Hover/Focus/Pressed/Selected | Darker High Rest/Hover/Focus/Pressed/Selected |
| --- | --- | --- |
| Every intent | D35 / D40 / inherited Rest / D14 / D28 | D30 / D35 / inherited Rest / D12 / D26 |

The one-slot rule is relative to the canonical Kiskadee grid, not a fixed numeric subtraction.
This keeps the state rhythm intact when neighboring public tones use different numeric intervals.

## Background De-para

The generated colors are selected by the preset-wide OKLab nearest-tone mapping. Light and Dark
are resolved independently rather than mirroring the numeric positions.

| Theme/state | Fluent source | Source HEX | Kiskadee role/tone | Generated HEX | Delta E OK |
| --- | --- | --- | --- | --- | --- |
| Light Rest | `BrandBackground.Rest` / Brand-80 | `#0064b4` | `button.primary` L50 | `#0064b4` | `0` |
| Light Hover | `BrandBackground.Hover` / Brand-70 | `#0055a4` | `button.primary` L55 | `#0059a1` | `0.012877` |
| Light Pressed | `BrandBackground.Pressed` / Brand-40 | `#002b6b` | `button.primary` L75 | `#14375a` | `0.053265` |
| Light Selected | `BrandBackground.Selected` / Brand-60 | `#004694` | `button.primary` L60 | `#045091` | `0.029862` |
| Light Focus | `BrandBackground.Rest` / Brand-80 | `#0064b4` | `button.primary` L50 | `#0064b4` | `0` |
| Light Disabled | `NeutralBackgroundDisabled.Rest` / Grey-94 | `#ebf0fc` | `button.neutral` L3 | `#f0f2f7` | `0.011744` |
| Dark Rest | `BrandBackground.Rest` / Brand-70 | `#0055a4` | `button.primary` D35 | `#005ba4` | `0.017032` |
| Dark Hover | `BrandBackground.Hover` / Brand-80 | `#0064b4` | `button.primary` D40 | `#0064b4` | `0` |
| Dark Pressed | `BrandBackground.Pressed` / Brand-40 | `#002b6b` | `button.primary` D14 | `#14375b` | `0.052062` |
| Dark Selected | `BrandBackground.Selected` / Brand-60 | `#004694` | `button.primary` D28 | `#074d89` | `0.029039` |
| Dark Focus | `BrandBackground.Rest` / Brand-70 | `#0055a4` | `button.primary` D35 | `#005ba4` | `0.017032` |
| Dark Disabled | unbound Figma instance color | `#141414` | `button.neutral` D3 | `#131416` | `0.004340` |

The Disabled rows preserve the official Fluent sources and their nearest opaque Kiskadee tonal
matches. The active Button schema intentionally substitutes the adaptive policy documented above:
L100 absolute black at 5% in Light and D100 absolute white at 5% in Dark/Darker for High, Medium,
and Low. This component-level exception must not be interpreted as a revised preset-wide mapping
for `NeutralBackgroundDisabled.Rest`.

## Foreground De-para

| Theme/state | Fluent source | Source HEX | Kiskadee role/tone | Generated HEX | Delta E OK |
| --- | --- | --- | --- | --- | --- |
| Light enabled | `NeutralForegroundOnBrand.Rest` / White | `#ffffff` | `button.neutral` L0 | `#ffffff` | `0` |
| Light disabled | `NeutralForegroundDisabled.Rest` / Grey-74 | `#b9bdc9` | `button.neutral` L16 | `#b6bac5` | `0.009860` |
| Dark enabled | `NeutralForegroundOnBrand.Rest` / White | `#ffffff` | `button.neutral` D100 | `#ffffff` | `0` |
| Dark disabled | unbound Figma instance color | `#5c5c5c` | `button.neutral` D35 | `#555965` | `0.022414` |

The Dark disabled instance exposes fixed colors rather than local variable aliases. Those two
values are preserved here as component evidence and mapped with the same Delta E OK method used by
the preset-wide primitive de-para.

All Light High, Medium, and Low disabled Buttons use a surface-relative foreground. Neutral L20
(`#a7abb6`) at 82% replaces the solid L16 foreground for these filled states. After the adaptive 5%
black Button background is composed, the text resolves to approximately `#b5b8c1` on white, close
to the official solid L16 reference `#b6bac5`, while preserving 18% surface influence. It resolves
to approximately `#b2b6c0` on Light neutral L3 and `#aeb4c1` on Light primary. This avoids the
excessive darkening produced by low-opacity absolute black on colored surfaces. Lowest keeps solid
L16 because it has no disabled fill, and all Dark/Darker disabled foregrounds remain solid D35.

## Three-Layer Mapping

1. Layer 1 primitives:
   - generator `b.blue.v1` is promoted as Core role `primitive.blue.v1`;
   - generator `n.black.v1` is promoted as Core role `primitive.black.v1`;
   - generator `r.red.v1` is promoted as Core role `primitive.red.v1`;
   - generator `g.green.v1` is promoted as Core role `primitive.green.v1`.
2. Layer 2 global semantics:
   - `primary.v1` points to `primitive.blue.v1` in Light and Dark;
   - `neutral.v1` points to `primitive.black.v1` in Light and Dark;
   - `redLike.v1` points to `primitive.red.v1` in Light and Dark;
   - `greenLike.v1` points to `primitive.green.v1` in Light and Dark.
3. Layer 3 Button intents:
   - `button.primary` points to global `primary`;
   - `button.neutral` points to global `neutral`;
   - `button.destructive` points to global `redLike`;
   - `button.positive` points to global `greenLike`.

The Munsell sector prefix remains in generated-artifact provenance. Core currently addresses the
primitive through its natural appearance name, so `b.blue.v1` becomes `primitive.blue.v1` without
changing the asset scales.

## Schema Mapping

- `BUTTON_TONAL_RECIPE` is the single source of tonal positions for every Button intent.
- `createButtonIntent()` applies that recipe to `button.primary`, `button.neutral`,
  `button.destructive`, or `button.positive`; it does not contain intent-specific positions.
- `e1.boxColor.*.medium.selected` explicitly reuses Medium Rest in all three themes.
- Filled `e1.boxColor.*.*.disabled` surfaces use the adaptive neutral overlay: L100 absolute black
  at 5% in Light and D100 absolute white at 5% in Dark/Darker. High, Medium, and Low use this
  treatment; Lowest remains transparent. This is an explicit Kiskadee extension; the official
  opaque mappings remain documented above.
- Filled `e2.textColor.*.*.disabled` foregrounds use neutral L20 at 82% in Light and solid D35 in
  Dark/Darker. Lowest keeps the official solid L16/D35 mapping because it has no disabled fill.
- Every intent exposes High, Medium, Low, and Lowest in Light, Dark, and Darker.
- `e1.borderColor.*.low` is the only visible border while enabled; every Low disabled border and
  all Lowest borders are transparent.
- Official Fluent Button surfaces omit `focus` when Focus is visually identical to Rest. The base
  Rest class remains active and the global focus ring provides the focus affordance without
  generating a duplicate surface rule.
- When Hover and focus-visible coexist, the omitted surface override preserves Hover and adds the
  focus ring. An explicit `focus` value is reserved for a documented component-owned visual delta.
- Every emphasis and intent omits component-owned Focus palette deltas. The optional Button shadow
  remains a separate global effect with its authored focus delta.
- Only the documented Selected rest color is emitted. Selected hover and pressed are not inferred.
- Existing Kiskadee Button shadow behavior is retained, but its black color now resolves from the
  `primitive.black.v1` absolute cap instead of a schema HEX literal.

## Adaptations

- Kiskadee preserves its canonical tonal grid, so non-exact Fluent stops use the nearest generated
  L/D position and expose the adaptation distance above.
- Dark support in this schema covers Primary, Neutral, Destructive, and Positive Button intents.
  It does not imply Dark support for the preset's other components.
- Darker is a Kiskadee-only Button theme derived from Dark; it is not an upstream Fluent mode.
- Every Neutral appearance in the active schema is a Kiskadee extension using the shared recipe.
  The official Secondary, Outline, Subtle, and Transparent values remain documented as source
  evidence rather than active intent-specific tuning.
- Primary Medium, Low, and Lowest are Kiskadee extensions. Only Primary High maps to an official
  Fluent Primary Button appearance.
- Destructive and Positive use official Fluent semantic color families, but all four Button
  emphasis appearances are Kiskadee extensions rather than official Fluent variants.

## Open Gaps

- Revisit whether Outline, Subtle, and Transparent need separate structural capabilities instead
  of sharing `neutral.lowest`.
- Exercise the shared recipe with additional segments before introducing any intent-specific tonal
  exception. A mismatch must first be classified as a recipe defect or a tonal-scale defect.
