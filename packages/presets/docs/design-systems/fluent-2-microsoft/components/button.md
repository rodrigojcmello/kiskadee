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

Primary Medium now exposes Selected explicitly in every theme. Selected reuses the Medium Rest
surface: L4 in Light and D10 in Dark/Darker. Its disabled state follows the same adaptive
background and foreground policy as High and Low.

`primary.low` and `primary.lowest` reuse the Medium foreground but use a deliberately light
interaction rhythm. The states move toward the physically lighter end of each theme scale. Both
are transparent at Rest, and Focus inherits that transparent Rest surface; the external focus ring
remains the focus affordance. Selected uses L1 in Light and D18 in Dark/Darker. Low adds a one-pixel
Blue border; Lowest keeps every border state transparent.

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
The enabled Low border uses the component Primary Rest color with 50% opacity: L50 in Light and D35
in Dark. This keeps the exact Primary identity while allowing the surface beneath it to soften the
outline. Two opaque alternatives were explicitly rejected: matching the foreground at L65/D75 was
too dominant, while moving to L14/D50 made the border too light. The 50% alpha is an experimental
Kiskadee value pending visual approval; it is not an upstream Fluent token.

## Neutral Emphasis Contract

Kiskadee maps the Fluent appearances into its emphasis model as follows:

| Kiskadee emphasis | Fluent relationship | Decision |
| --- | --- | --- |
| `neutral.high` | No direct equivalent | Kiskadee extension: black-like action in Light and a physically inverted high-emphasis neutral action in Dark. |
| `neutral.medium` | No direct equivalent | Kiskadee extension: filled light-gray action, adapted to a dark-gray surface in Dark. |
| `neutral.low` | `Secondary (default)` | Official surface, border, foreground, and state tokens mapped to the generated neutral scale. |
| `neutral.lowest` | `Outline`, `Subtle`, and `Transparent` | Temporary Kiskadee collapse: borderless, neutral foreground, and the `Subtle` interaction fills. |

The `lowest` collapse is intentional. Fluent differentiates the three upstream appearances through
border presence and foreground/state behavior, while the current Kiskadee Button emphasis contract
has one neutral slot for this prominence. Until that contract is revisited, only `neutral.low` owns
a visible border.

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

### Kiskadee Neutral Extensions

`neutral.medium` uses a visibly filled neutral rhythm: L5/L7/L10 for Light Rest/Hover/Pressed and
D16/D20/D10 for Dark. `neutral.high` uses the exact Fluent neutral seed `#21242d` at L85 as its
Light Rest surface, progressing to L90/L95 for Hover/Pressed. In Dark, D85 is used as Rest with a
D0 foreground; this physical inversion is required for the action to retain high emphasis against
a dark interface instead of disappearing into the page background.

## Kiskadee Extensions: Destructive And Positive

Fluent 2 exposes Cranberry for danger semantics and Green for success semantics, but it does not
define complete Button families matching Kiskadee's four emphasis levels. The Fluent preset now
provides `destructive` and `positive` Buttons as explicit Kiskadee extensions so components can use
the same semantic and emphasis contract across design systems. These appearances must not be
presented as upstream Fluent Button variants.

The extensions preserve the approved official families rather than deriving new component colors:

| Intent | Fluent semantic source | Approved primitive | Light High Rest | Dark High Rest |
| --- | --- | --- | --- | --- |
| `destructive` | Cranberry Primary `#c50f1f` | `r.red.v1` through `button.destructive` | L45 `#c50f1f` | D65 `#ee4f4b` |
| `positive` | Green Primary `#107c10` | `g.green.v1` through `button.positive` | L45 `#107c10` | D75 `#67b661` |

Light High follows Rest/Hover/Focus/Pressed/Selected at L45/L50/L45/L65/L55 for both intents.
Dark resolves each semantic independently: Destructive uses D65/D70/D65/D45/D60, while Positive
uses D75/D80/D75/D55/D70. High foregrounds use the physical neutral cap: L0 white in Light and D0
black in Dark.

Medium, Low, and Lowest reuse the approved Primary extension rhythm because they describe
emphasis, not a Fluent-authored component variant. Light interaction fills use L4/L6/L4/L8 and
Dark uses D10/D8/D10/D14 for Rest/Hover/Focus/Pressed. Low and Lowest remain transparent at Rest;
Low uses its own High Rest color at 50% opacity for the border, while Lowest remains borderless.
Enabled Medium/Low/Lowest foregrounds use L65 in Light and D75 in Dark. Filled disabled surfaces
use the shared adaptive 5% overlay. Their Light foreground uses neutral L20 at 82%, while Dark and
Darker use solid neutral D35; Low removes its border when disabled.

## Kiskadee Darker Theme

Fluent 2 provides Light and Dark references but no separate `darker` Button theme. Kiskadee adds
`darker` as an explicit framework extension for interfaces rendered on an absolute-black surface.
It copies the complete Dark Button contract and moves only High-emphasis enabled states one public
tonal slot toward the physically darker end of each approved scale. Medium, Low, Lowest, text,
borders, and the shared disabled mapping remain identical to Dark.

| Intent | Dark High Rest/Hover/Focus/Pressed/Selected | Darker High Rest/Hover/Focus/Pressed/Selected |
| --- | --- | --- |
| Primary | D35 / D40 / D35 / D14 / D28 | D30 / D35 / D30 / D12 / D26 |
| Neutral | D85 / D90 / D85 / D75 / D80 | D80 / D85 / D80 / D70 / D75 |
| Destructive | D65 / D70 / D65 / D45 / D60 | D60 / D65 / D60 / D40 / D55 |
| Positive | D75 / D80 / D75 / D55 / D70 | D70 / D75 / D70 / D50 / D65 |

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

- `e1.boxColor.primary.medium`, `primary.low`, and `primary.lowest`, together with their text and
  border mappings, implement the documented Kiskadee-only extensions in Light, Dark, and Darker.
- `e1.boxColor.primary.medium.selected` explicitly reuses Medium Rest in all three themes.
- `e1.boxColor.primary.high` owns the Primary Button background in all three themes.
- Filled `e1.boxColor.*.*.disabled` surfaces use the adaptive neutral overlay: L100 absolute black
  at 5% in Light and D100 absolute white at 5% in Dark/Darker. High, Medium, and Low use this
  treatment; Lowest remains transparent. This is an explicit Kiskadee extension; the official
  opaque mappings remain documented above.
- Filled `e2.textColor.*.*.disabled` foregrounds use neutral L20 at 82% in Light and solid D35 in
  Dark/Darker. Lowest keeps the official solid L16/D35 mapping because it has no disabled fill.
- `e1.boxColor.neutral` and `e2.textColor.neutral` expose High, Medium, Low, and Lowest in both
  themes.
- `e1.boxColor.destructive`/`positive`, their text colors, and their borders expose all four
  Kiskadee emphasis levels in both themes.
- `e1.borderColor.neutral.low` is the only visible neutral Button border while enabled; every Low
  disabled border and all Lowest borders are transparent.
- Official Fluent Button surfaces omit `focus` when Focus is visually identical to Rest. The base
  Rest class remains active and the global focus ring provides the focus affordance without
  generating a duplicate surface rule.
- When Hover and focus-visible coexist, the omitted surface override preserves Hover and adds the
  focus ring. An explicit `focus` value is reserved for a documented component-owned visual delta.
- Every Primary emphasis omits component-owned Focus palette deltas, including the Kiskadee-only
  Low and Lowest surfaces. The optional Button shadow remains a separate global effect with its
  authored focus delta.
- Only the documented Selected rest color is emitted. Selected hover and pressed are not inferred.
- Existing Kiskadee Button shadow behavior is retained, but its black color now resolves from the
  `primitive.black.v1` absolute cap instead of a schema HEX literal.

## Adaptations

- Kiskadee preserves its canonical tonal grid, so non-exact Fluent stops use the nearest generated
  L/D position and expose the adaptation distance above.
- Dark support in this schema covers Primary, Neutral, Destructive, and Positive Button intents.
  It does not imply Dark support for the preset's other components.
- Darker is a Kiskadee-only Button theme derived from Dark; it is not an upstream Fluent mode.
- The neutral High and Medium appearances are Kiskadee extensions. Consumers that require strict
  upstream Fluent fidelity should use `neutral.low` or the documented `neutral.lowest` adaptation.
- Primary Medium, Low, and Lowest are Kiskadee extensions. Only Primary High maps to an official
  Fluent Primary Button appearance.
- Destructive and Positive use official Fluent semantic color families, but all four Button
  emphasis appearances are Kiskadee extensions rather than official Fluent variants.

## Open Gaps

- Revisit whether Outline, Subtle, and Transparent need separate structural capabilities instead
  of sharing `neutral.lowest`.
