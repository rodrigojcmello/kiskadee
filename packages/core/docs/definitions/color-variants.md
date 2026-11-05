# Shared color variants

Status: canonical Core contract.

Component palettes use `segment -> theme -> surfaceContext -> colorVariant -> property -> intent
-> emphasis -> state`. `colorVariants` is `standard | alternative`; `colorVariantBuckets` publishes
`s` and `a`. Each declared surface context requires Standard; Alternative is optional. The required
`onSubtle` branch and cross-context property/intent/emphasis parity apply only to Standard.

Missing Alternative leaves inherit Standard. A leaf is the entire state map at
property/intent/emphasis, or a direct state map on a color property. An authored Alternative leaf
replaces the whole Standard leaf, including Selected and its nested substates. A sparse Alternative
cannot accidentally inherit Standard Hover or Pressed. Ordinary authored leaves require Rest;
Button `e11/e12` retain their explicit sparse indicator exception.
Their palettes accept Standard only; declaring Alternative indicator paint is rejected because
the indicator contract does not consume it. Separator and Progress retain their required Standard
coverage while Alternative may override individual allowed intent/emphasis leaves.

Core exports pure `resolveColorVariantLeaves`, `resolveColorVariantPalette` and
`resolveContentSurfaceContextVariant` helpers. Builders materialize effective recipes before color
conversion and class emission. Direct state maps are covered by the generic Core inheritance
contract; the Web converter retains its existing explicit rejection of direct maps without
semantic intent and emphasis coordinates. This change does not add an artifact representation
for those maps. Runtime consumers choose published recipes; they do not merge
paint or reconstruct CSS. Color class maps, Card border metadata and connected frame omissions
use `context bucket -> variant bucket -> semantic intent -> emphasis`.

`contentSurfaceContext` has the same segment/theme/context/variant hierarchy, followed by
intent/emphasis/state, and uses identical whole-leaf inheritance. Foreground profiles now use the same variant coordinate below Surface Context, with whole-emphasis
leaf inheritance. Their Standard/Deep profile axis stays independent. Contour catalogs remain unchanged. Separator palettes use the shared variant grammar.
Variants do not duplicate anatomy, dimensions, state, effects, placement or accessibility.

Button exposes `ButtonIntentValue`: `SystemButtonIntent | \`${SystemButtonIntent}-alt\` |
ExternalButtonIntent`. `SystemButtonIntentValue` is the system-only subset used by preset
`options.selectionIntent`. `ButtonIntentKeys` remains semantic; no `*-alt` entries are registered.

Plain system intentions normalize to Standard; one `-alt` suffix selects Alternative. Invalid or
doubled system suffixes are rejected. External `brand.*` names are recognized first, so a brand
name ending in `-alt` remains its full external name. Qualified intentions affect body, selection paint, group projections and produced descendant
context consistently. Indicators retain Standard paint and follow the effective semantic intent,
emphasis and ambient context; a qualified body intent does not select Alternative indicator paint. Button keeps
only `e1` through `e12`; separate paint-treatment options and alternative output fields do not exist.
