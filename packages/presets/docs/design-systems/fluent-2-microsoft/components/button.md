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

## Kiskadee Extension: Primary Medium

Fluent 2 does not define a Primary Button equivalent to Kiskadee's `primary.medium` emphasis.
Kiskadee still provides this emphasis because a tonal, lower-prominence primary action is common
across the design systems supported by the framework. This is an intentional framework extension,
not a claim of upstream Fluent fidelity. Consumers that need maximum fidelity to Fluent should use
the documented `primary.high` Button and omit `primary.medium`.

The extension uses the approved Blue primitive through `button.primary`. Light uses pale Blue
surfaces with a dark Blue foreground. Dark uses a low-lightness Blue-tinted surface with a lighter
Blue foreground; using a physically light filled surface in Dark would compete visually with the
official high-emphasis action. Its state rhythm follows the `primary.medium` pattern already
exercised by the Kiskadee Material 3 preset, recalibrated against the Fluent Blue scale.

| Theme/state | Kiskadee role/tone | Generated HEX |
| --- | --- | --- |
| Light Rest | `button.primary` L4 | `#e1efff` |
| Light Hover | `button.primary` L6 | `#d3e7ff` |
| Light Focus | `button.primary` L4 | `#e1efff` |
| Light Pressed | `button.primary` L8 | `#c1deff` |
| Light enabled foreground | `button.primary` L65 | `#0d477e` |
| Dark Rest | `button.primary` D10 | `#142d48` |
| Dark Hover | `button.primary` D8 | `#13273e` |
| Dark Focus | `button.primary` D10 | `#142d48` |
| Dark Pressed | `button.primary` D14 | `#14375b` |
| Dark enabled foreground | `button.primary` D75 | `#61a7f3` |

Disabled continues to use the official neutral mappings already shared by `primary.high`: L3/L16
for Light background/foreground and D3/D35 for Dark background/foreground.

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
| Disabled | `#ebf0fc` / `#dbe0ec` / `#b9bdc9` | L3 / L7 / L16 |

Dark mappings:

| State | Source background / border / foreground | Kiskadee background / border / foreground |
| --- | --- | --- |
| Rest and Focus | `#262932` / `#626671` / `#ffffff` | D9 / D45 / D100 |
| Hover | `#393d47` / `#717580` / `#ffffff` | D20 / D50 / D100 |
| Pressed | `#1c1f28` / `#676b76` / `#ffffff` | D6 / D45 / D100 |
| Selected | `#343842` / `#6c707b` / `#ffffff` | D16 / D50 / D100 |
| Disabled | `#11141c` / `#3e424c` / `#585c66` | D3 / D22 / D35 |

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

## Three-Layer Mapping

1. Layer 1 primitives:
   - generator `b.blue.v1` is promoted as Core role `primitive.blue.v1`;
   - generator `n.black.v1` is promoted as Core role `primitive.black.v1`.
2. Layer 2 global semantics:
   - `primary.v1` points to `primitive.blue.v1` in Light and Dark;
   - `neutral.v1` points to `primitive.black.v1` in Light and Dark.
3. Layer 3 Button intents:
   - `button.primary` points to global `primary`;
   - `button.neutral` points to global `neutral`.

The Munsell sector prefix remains in generated-artifact provenance. Core currently addresses the
primitive through its natural appearance name, so `b.blue.v1` becomes `primitive.blue.v1` without
changing the asset scales.

## Schema Mapping

- `e1.boxColor.primary.medium` and `e2.textColor.primary.medium` implement the documented
  Kiskadee-only extension in both themes.
- `e1.boxColor.primary.high` owns the Primary Button background in both themes.
- `e2.textColor.primary.high` owns enabled and disabled foreground colors in both themes.
- `e1.boxColor.neutral` and `e2.textColor.neutral` expose High, Medium, Low, and Lowest in both
  themes.
- `e1.borderColor.neutral.low` is the only visible neutral Button border; all other Button borders
  are transparent so the shared one-pixel geometry does not change component dimensions.
- Focus reuses Rest because that is the value authored by Fluent for this variant.
- Only the documented Selected rest color is emitted. Selected hover and pressed are not inferred.
- Existing Kiskadee Button shadow behavior is retained, but its black color now resolves from the
  `primitive.black.v1` absolute cap instead of a schema HEX literal.

## Adaptations

- Kiskadee preserves its canonical tonal grid, so non-exact Fluent stops use the nearest generated
  L/D position and expose the adaptation distance above.
- Dark support in this schema covers the current Primary and Neutral Button intents. It does not
  imply Dark support for the preset's other components.
- The neutral High and Medium appearances are Kiskadee extensions. Consumers that require strict
  upstream Fluent fidelity should use `neutral.low` or the documented `neutral.lowest` adaptation.

## Open Gaps

- Revisit whether Outline, Subtle, and Transparent need separate structural capabilities instead
  of sharing `neutral.lowest`.
- Decide semantic Button intents only after the corresponding primitive families are promoted.
