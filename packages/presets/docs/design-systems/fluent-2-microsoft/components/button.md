# Fluent 2 Microsoft Button Evidence

This file records source evidence and color decisions for the Button currently authored in
`packages/presets/src/presets/fluent-2-microsoft/components/button.schema.ts`.

## Sources

- Figma Light reference:
  [Fluent 2 Button Light](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=11045-3896&t=VKTTOhGXjS8MYP2E-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - page node: `11045:3896`
  - inspected Primary state group: `11045:3945`
- Figma Dark reference:
  [Fluent 2 Button Dark](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9026-2684&t=VKTTOhGXjS8MYP2E-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - page node: `9026:2684`
  - inspected Primary state group: `9026:2787`
- Preset-wide tonal evidence:
  [`../colors/fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)
- Exact primitive de-para:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)

## Inspected Variant

- Fluent appearance: `Primary`.
- Content: text only.
- Size: medium, 32 px high.
- States: Rest, Hover, Pressed, Selected, Focus, and Disabled.
- Kiskadee surface: `primary.high`. Other emphases, intents, and Fluent appearances remain out of
  scope for this migration.

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

- `e1.boxColor.primary.high` owns the Primary Button background in both themes.
- `e2.textColor.primary.high` owns enabled and disabled foreground colors in both themes.
- Focus reuses Rest because that is the value authored by Fluent for this variant.
- Only the documented Selected rest color is emitted. Selected hover and pressed are not inferred.
- Existing Kiskadee Button shadow behavior is retained, but its black color now resolves from the
  `primitive.black.v1` absolute cap instead of a schema HEX literal.

## Adaptations

- Kiskadee preserves its canonical tonal grid, so non-exact Fluent stops use the nearest generated
  L/D position and expose the adaptation distance above.
- This migration registers a Dark palette only for the current Primary Button. It does not imply
  Dark support for the preset's other components.
- Other Fluent Button appearances, Kiskadee emphases, and semantic intents will be reviewed
  separately.

## Open Gaps

- Inspect and map the remaining Fluent Button appearances and their Kiskadee emphasis placement.
- Decide semantic Button intents only after the corresponding primitive families are promoted.
