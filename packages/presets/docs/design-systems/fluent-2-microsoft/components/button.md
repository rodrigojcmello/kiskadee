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
- Official Fluent documentation:
  - [Button usage](https://fluent2.microsoft.design/components/web/react/core/button/usage)
  - [Color tokens](https://fluent2.microsoft.design/color-tokens/)
- Preset-wide tonal evidence:
  [`../colors/fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)
- Exact primitive de-para:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Light Button component set | `11045:3896` | Primary, Secondary, Outline, Subtle, Transparent | Official adapted |
| Dark Button component set | `9026:2684` | Primary, Secondary, Outline, Subtle, Transparent | Official adapted |
| Inverse Button appearance | Figma component set and official Button usage | No inverse/on-brand appearance exists | Kiskadee extension |
| Fluent inverted color aliases | Official color-token table | Background, foreground, stroke, subtle-state, and disabled aliases | Official adapted as source material |

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

## Surface Contexts

Kiskadee authors Button colors under the independent `surfaceContext` axis:

- `default` is the existing Button appearance on the theme's ordinary surfaces;
- `inverse` is the Button appearance intended for a locally strong surface, such as a Primary vivid
  fill, without changing the global Light, Dark, or Darker theme.

Fluent's Button component set and official Button documentation do not expose an inverse,
inverted, or on-brand Button appearance. Every `inverse` combination is therefore a **Kiskadee
extension**. The extension is not visually arbitrary: it composes the official Fluent
`BrandBackgroundInverted`, `BrandForegroundOnLight`, `SubtleBackgroundInverted`,
`NeutralForegroundOnBrand`, `NeutralStrokeOnBrand2`, and inverted disabled-token relationships.
Those aliases are source material, not evidence that Fluent ships the resulting Button variant.

`on-primary` is an upstream/application relationship that maps to Kiskadee `inverse`. It is not a
new theme, intent, or emphasis. The surrounding surface remains a consumer decision; neither the
schema nor the React component detects its color.

### Inverse High

Primary High adapts the official inverted Brand state rhythm. Other intents replace only the color
family and remain Kiskadee extensions.

| State | Official Primary source | Source value | Kiskadee inverse mapping |
| --- | --- | --- | --- |
| Rest background | `BrandBackgroundInverted.Rest` | White | neutral L0 |
| Hover background | Brand-160 | `#d9f1ff` | current intent L4 |
| Pressed background | Brand-140 | `#96cfff` | current intent L12 |
| Selected background | Brand-150 | `#b8e0ff` | current intent L8 |
| Rest foreground | Brand-80 | `#0064b4` | current intent Light vivid +0 |
| Hover foreground | Brand-70 | `#0055a4` | current intent Light vivid +1 |
| Pressed foreground | Brand-50 | `#003881` | current intent Light vivid +3 |
| Selected foreground | Brand-60 | `#004694` | current intent Light vivid +2 |

The generated Fluent Blue values are L4 `#e1efff`, L12 `#a4cfff`, L8 `#c1deff`, L50
`#0064b4`, L55 `#0059a1`, L65 `#0d477e`, and L60 `#045091`. Non-Primary intents use the same
positions in their approved primitive family. The recipe deliberately uses the physically Light
track for inverse High in Light, Dark, and Darker because the local Button surface itself is light.

### Inverse Medium, Low, And Lowest

The remaining inverse emphases extend Fluent's inverted/on-brand token grammar:

| Emphasis | Rest | Hover | Pressed | Selected | Foreground | Border |
| --- | --- | --- | --- | --- | --- | --- |
| Medium | White 28% | White 36% | White 44% | White 36% | White | Transparent |
| Low | Transparent | Black 10% | Black 30% | Black 20% | White | White |
| Lowest | Transparent | Black 10% | Black 30% | Black 20% | White | Transparent |

Focus has no palette delta and inherits Rest while the global Button focus ring remains the
accessibility affordance. Selected stays explicit. High, Medium, and Low disabled states use White
at 10% for the background and White at 40% for content, with no visible border. Lowest remains
transparent with White at 40% content. All percentages resolve through `button.neutral` and the
preset color helper before publication; no platform performs alpha or contrast calculations.

The same inverse recipe is published for all four intents and all three themes. High preserves the
intent family through its foreground and state tints. Medium, Low, and Lowest intentionally use
universal on-brand White/Black overlays so their contrast does not depend on the hue of the strong
surrounding surface.

## Kiskadee Extensions: Primary Medium, Low, And Lowest

Fluent 2 does not define Primary Button equivalents for Kiskadee's `primary.medium`, `primary.low`,
or `primary.lowest` emphases. Kiskadee still provides them because tonal, outlined, and borderless
primary actions are common across the design systems supported by the framework. These are
intentional framework extensions, not claims of upstream Fluent fidelity. Consumers that need
maximum fidelity to Fluent should treat the documented source de-para below as the upstream
reference. The active shared recipe preserves the official Primary Rest identity but deliberately
normalizes the remaining states across intents.

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
| Dark Rest | `button.primary` subtle D4 | `#0b1929` |
| Dark Hover | subtle +2 positions, D6 | `#102134` |
| Dark Focus | Inherits Dark Rest | `#0b1929` |
| Dark Pressed | subtle +4 positions, D8 | `#13273e` |
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

Medium exposes Selected explicitly in every theme for every intent. Selected reuses that family's
Medium subtle reference in Light, Dark, and Darker. Its disabled state follows the same adaptive
background and foreground policy as High and Low.

Low and Lowest reuse the Medium foreground but use a deliberately light interaction rhythm. The
states move toward the physically lighter end of each theme scale. Both are transparent at Rest,
and Focus inherits that transparent Rest surface; the external focus ring remains the focus
affordance. Selected uses L1 in Light and D18 in Dark/Darker. Low adds a one-pixel role-colored
border; Lowest keeps every border state transparent.

| Theme/state | Low and Lowest background | Low border | Enabled foreground |
| --- | --- | --- | --- |
| Light Rest and Focus | transparent | vivid L50, normalized 56% `#0064b48e` | L65 `#0d477e` |
| Light Hover | L2 `#f1f7ff` | vivid L50, normalized 56% `#0064b48e` | L65 `#0d477e` |
| Light Selected | L1 `#f8fbff` | vivid L50, normalized 56% `#0064b48e` | L65 `#0d477e` |
| Light Pressed | L4 `#e1efff` | vivid L50, normalized 56% `#0064b48e` | L65 `#0d477e` |
| Dark Rest and Focus | transparent | vivid D40, normalized 57% `#0064b492` | D75 `#61a7f3` |
| Dark Hover | D14 `#14375b` | vivid D40, normalized 57% `#0064b492` | D75 `#61a7f3` |
| Dark Selected | D18 `#133d68` | vivid D40, normalized 57% `#0064b492` | D75 `#61a7f3` |
| Dark Pressed | D22 `#104375` | vivid D40, normalized 57% `#0064b492` | D75 `#61a7f3` |
| Darker Rest and Focus | transparent | vivid -1, D35, normalized 20% `#005ba433` | D75 `#61a7f3` |
| Darker Hover | D14 `#14375b` | vivid -1, D35, normalized 20% `#005ba433` | D75 `#61a7f3` |
| Darker Selected | D18 `#133d68` | vivid -1, D35, normalized 20% `#005ba433` | D75 `#61a7f3` |
| Darker Pressed | D22 `#104375` | vivid -1, D35, normalized 20% `#005ba433` | D75 `#61a7f3` |

Disabled Low uses the same adaptive 5% neutral overlay and Light L20-at-82%/Dark D35 foreground as
Medium and High, without a visible border. Lowest remains fully transparent and borderless when
disabled, preserving its intentionally minimal appearance.
The enabled Low border keeps the current intent family's vivid reference and solves only its alpha.
The solver composites that color over the canonical Neutral surface and chooses the nearest alpha
byte to a shared perceptual-distance target: Delta E OK `0.30` over Light L0, and `0.18` over Dark
D5 or Darker D0. Darker starts one ordinal position below the Dark vivid reference, matching its
High Rest shift before opacity is resolved. The schema still publishes a static eight-digit HEX;
no consumer platform performs this calculation at runtime.

| Theme | Primary | Neutral | Destructive | Positive |
| --- | --- | --- | --- | --- |
| Light | 56% `#0064b48e` | 44% `#21242d71` | 50% `#c50f1f80` | 56% `#107c108e` |
| Dark | 57% `#0064b492` | 24% `#d3d6df3e` | 53% `#b6302f86` | 56% `#08720990` |
| Darker | 20% `#005ba433` | 9% `#c1c5cf17` | 19% `#a8292930` | 20% `#00690234` |

This normalization replaces the rejected fixed-50% rule. A single alpha made Neutral substantially
more prominent than the chromatic intents, especially when its contrast-mirrored Dark vivid was
composited over D5. Lowering that alpha globally would have made Primary and Positive even more
subtle. Two opaque alternatives remain rejected: matching the foreground at L65/D75 was too
dominant, while moving to L14/D50 was too light. The perceptual targets are a Kiskadee adaptation,
not upstream Fluent tokens.

## Canonical Kiskadee Intent Recipe

The active schema generates `primary`, `neutral`, `destructive`, and `positive` from one tonal
recipe. The intent changes the Layer 3 color role while theme, emphasis, state positions, disabled
policy, and border formula remain identical. The only authored intent-specific value is the
explicit Dark/Darker Neutral High foreground polarity documented below. Low border alpha can differ
by intent because the shared formula measures each resolved vivid color against the same canonical
surface; those values are derived rather than authored exceptions. This keeps new segments
diagnostic without fixing their colors to the current Fluent assets.

Medium and High are expressed as ordinal offsets from each family's functional reference. The
offset is an index movement through the irregular public grid, not numeric tone arithmetic.
Consequently, `L30 + 1` means L35 and `L55 + 1` means L60.

| Theme/emphasis | Rest | Hover | Pressed | Selected |
| --- | --- | --- | --- | --- |
| Light Medium | subtle +0 | subtle +2 | subtle +4 | subtle +0 |
| Light High | vivid +0 | vivid +1 | vivid +3 | vivid +2 |
| Light Low/Lowest | transparent | L2 | L4 | L1 |
| Dark Medium | subtle +0 | subtle +2 | subtle +4 | subtle +0 |
| Dark High | vivid +0 | vivid +1 | vivid -2 | vivid -1 |
| Dark Low/Lowest | transparent | D14 | D22 | D18 |
| Darker Medium | subtle +0 | subtle +2 | subtle +4 | subtle +0 |
| Darker High | vivid -1 | vivid +0 | vivid -3 | vivid -2 |
| Darker Low/Lowest | transparent | D14 | D22 | D18 |

Medium, Low, and Lowest foregrounds use the intent role at L65 in Light and D75 in Dark/Darker.
High uses the white neutral cap, L0 or D100, except for Neutral High in Dark/Darker, which uses the
absolute-black D0 cap. Low uses the intent family's vivid reference, shifted by -1 only in Darker,
with opacity normalized against the canonical theme surface. Lowest is borderless. Focus is
intentionally absent from every palette map, so it inherits Rest while the global focus ring remains
the accessibility affordance. Selected stays explicit even when it equals Rest because the schema
must declare that the component supports the Selected state.

### Neutral High Foreground Polarity

Black is the explicit exception to the shared High foreground rule. Its contrast-mirrored Dark
`vivid` reference is a physically light neutral: D90 `#d3d6df`. Darker shifts that surface one
public position to D85 `#c1c5cf`. White text would make both appearances visually unreadable, so
Neutral High uses the absolute-black D0 cap in Dark and Darker. Light retains the white L0 cap over
the physically dark L85 surface.

This is a fixed preset decision, not a runtime contrast calculation. The authored recipe resolves
the selected cap to a final HEX before the schema artifact is published. Primary, Destructive, and
Positive High continue to use white in Dark and Darker.

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
contract or the neutral tonal scale. The active schema now applies the canonical surface and state
recipe unchanged to `button.neutral`; only the explicit Dark/Darker High foreground polarity differs.
These historical positions remain here only to preserve the design evidence.

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

Both intents use the canonical functional-reference recipe without semantic-specific tonal
compensation. Their absolute positions differ because Cranberry and Green own distinct vivid and
subtle references, but their ordinal state offsets are identical to Primary and Neutral. Focus
inherits Rest. High uses the white neutral cap in every theme. Medium, Low, Lowest, borders, and
disabled states follow the same recipe.

The promoted generator `0.4.1` moderates eligible support-family chroma on the Dark track relative
to the unchanged Primary Blue. Consequently, Destructive High now begins at Cranberry vivid D40
`#b6302f` instead of preserving the Light seed `#c50f1f` in Dark. This correction belongs to the
primitive tonal asset: the shared Button recipe and its ordinal state offsets remain unchanged.

## Kiskadee Darker Theme

Fluent 2 provides Light and Dark references but no separate `darker` Button theme. Kiskadee adds
`darker` as an explicit framework extension for interfaces rendered on an absolute-black surface.
It reuses the Dark tonal scale and moves the High base plus its state sequence one public position
toward the physically darker end. Medium, Low, Lowest backgrounds, text, and the shared disabled
mapping remain identical to Dark; the Low border follows the same one-position vivid shift, then
normalizes its opacity against the absolute-black D0 surface.

| Applies to | Dark High Rest/Hover/Focus/Pressed/Selected | Darker High Rest/Hover/Focus/Pressed/Selected |
| --- | --- | --- |
| Every intent | vivid +0 / +1 / inherited Rest / -2 / -1 | vivid -1 / +0 / inherited Rest / -3 / -2 |

The one-slot rule is relative to the canonical Kiskadee grid, not a fixed numeric subtraction.
This keeps the state rhythm intact when neighboring public tones use different numeric intervals.

## Background De-para

The generated colors are selected by the preset-wide OKLab nearest-tone mapping. Light and Dark
are resolved independently rather than mirroring the numeric positions.

| Theme/state | Fluent source | Source HEX | Kiskadee role/tone | Generated HEX | Delta E OK |
| --- | --- | --- | --- | --- | --- |
| Light Rest | `BrandBackground.Rest` / Brand-80 | `#0064b4` | `button.primary` L50 | `#0064b4` | `0` |
| Light Hover | `BrandBackground.Hover` / Brand-70 | `#0055a4` | `button.primary` L55 | `#0059a1` | `0.012877` |
| Light Pressed | `BrandBackground.Pressed` / Brand-40 | `#002b6b` | vivid +3, L65 | `#0d477e` | `0.087973` |
| Light Selected | `BrandBackground.Selected` / Brand-60 | `#004694` | `button.primary` L60 | `#045091` | `0.029862` |
| Light Focus | `BrandBackground.Rest` / Brand-80 | `#0064b4` | `button.primary` L50 | `#0064b4` | `0` |
| Light Disabled | `NeutralBackgroundDisabled.Rest` / Grey-94 | `#ebf0fc` | `button.neutral` L3 | `#f0f2f7` | `0.011744` |
| Dark Rest | `BrandBackground.Rest` / Brand-70 | `#0055a4` | vivid D40 | `#0064b4` | `0.046895` |
| Dark Hover | `BrandBackground.Hover` / Brand-80 | `#0064b4` | vivid +1, D45 | `#106bbc` | `0.023423` |
| Dark Pressed | `BrandBackground.Pressed` / Brand-40 | `#002b6b` | vivid -2, D30 | `#045090` | `0.120551` |
| Dark Selected | `BrandBackground.Selected` / Brand-60 | `#004694` | vivid -1, D35 | `#005ba4` | `0.062569` |
| Dark Focus | `BrandBackground.Rest` / Brand-70 | `#0055a4` | inherits vivid D40 | `#0064b4` | `0.046895` |
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

- `BUTTON_DEFAULT_TONAL_RECIPE` is the source of Default tonal positions and explicit High
  foreground caps
  for every Button intent.
- `BUTTON_INVERSE_RECIPE` is the static on-strong-surface formula shared by Light, Dark, and
  Darker.
- `createButtonIntent()` applies that recipe to `button.primary`, `button.neutral`,
  `button.destructive`, or `button.positive`; it does not calculate foreground contrast.
- `createInverseButtonIntent()` resolves the same four Layer 3 roles through the Light physical
  track and official Fluent inverted-token rhythm; it does not inspect the surrounding surface.
- `e1.boxColor.*.medium.selected` explicitly reuses Medium Rest in all three themes.
- Filled `e1.boxColor.*.*.disabled` surfaces use the adaptive neutral overlay: L100 absolute black
  at 5% in Light and D100 absolute white at 5% in Dark/Darker. High, Medium, and Low use this
  treatment; Lowest remains transparent. This is an explicit Kiskadee extension; the official
  opaque mappings remain documented above.
- Filled `e2.textColor.*.*.disabled` foregrounds use neutral L20 at 82% in Light and solid D35 in
  Dark/Darker. Lowest keeps the official solid L16/D35 mapping because it has no disabled fill.
- Every intent exposes High, Medium, Low, and Lowest in Light, Dark, and Darker.
- `e1.borderColor.*.low` is the only visible border while enabled; every Low disabled border and
  all Lowest borders are transparent. Its emitted alpha is resolved from the shared Delta E OK
  target and the canonical Neutral surface; it is not a per-intent constant or runtime rule.
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
- Every Neutral appearance in the active schema is a Kiskadee extension using the shared surface
  and state recipe. Neutral High explicitly uses the D0 foreground cap in Dark/Darker because its
  contrast-mirrored `vivid` surface is physically light. The official Secondary, Outline, Subtle,
  and Transparent values remain documented as source evidence rather than active surface tuning.
- Primary Medium, Low, and Lowest are Kiskadee extensions. Only Primary High maps to an official
  Fluent Primary Button appearance.
- Destructive and Positive use official Fluent semantic color families, but all four Button
  emphasis appearances are Kiskadee extensions rather than official Fluent variants.

## Open Gaps

- Revisit whether Outline, Subtle, and Transparent need separate structural capabilities instead
  of sharing `neutral.lowest`.
- Exercise the shared recipe with additional segments before introducing any intent-specific
  surface-position exception. A mismatch must first be classified as a recipe defect or a
  tonal-scale defect.
- Migrate the existing Switch on-primary appearance from its overloaded Low emphasis to the shared
  `surfaceContext="inverse"` contract in a separate component-scoped change.
