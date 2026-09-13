# Material Design 3 Google Tabs Evidence

## Sources

- [Material Design 3 Tabs overview](https://m3.material.io/components/tabs/overview)
- [Material Design 3 Tabs specifications](https://m3.material.io/components/tabs/specs)
- Existing Material primitive, semantic, typography, radius, and elevation evidence in this preset

## Coverage

All authored Tab variants (`line`, `dot`, `box`, `bridge`, and `segmented`) emit `default` and
`dynamic` segments with independent `light` and `dark` palettes. Each authored palette has matching
`onSubtle` and `onVivid` contexts. `onVivid` reuses the same approved Material recipe because the
source component describes the tab relationship and does not publish a second Kiskadee surface
recipe.

The existing line and bridge icon viewports remain `20px` at `s:sm:1` and `24px` at `s:md:1`.
They are represented through `e4.iconSize` references into `global.iconSizes`, with the existing
`4px` label gap in `e4.scales.marginRight`.

## Mapping and adaptations

- `line` and `dot` retain the Material indicator, label, icon, and state-layer geometry.
- `box` retains the wider tab track and selected indicator while using the shared Material primary
  family for selected labels and indicators.
- `segmented` retains its bordered shell, selected shell, indicator, and separator slots. The tab
  background is explicitly cleared in selected compound states so the shell owns the fill.
- `bridge` retains its curved bridge presentation. Its authored orange values are mapped to the
  approved `yellowLike` family, and its selected shell uses the approved neutral/yellow palettes.

Colors are resolved through `c` and `c.ref`; no literal color is part of the official schema.
State maps keep only visual deltas and the selected compound resets that prevent inherited states
from painting over the owning shell: `line`/`dot` clear `e2.selected.rest` before applying their
selected hover and pressed layers; `box` clears `e2.selected.rest`, `hover`, and `pressed` because
the indicator owns the selected treatment; `segmented` clears those same three `e2` entries because
the selected segment uses the enclosing shell; and `bridge` clears `e2.selected.rest`, `hover`,
`focus`, and `pressed` because `e5` owns the selected shell. These entries are deliberately
duplicated across compound states to suppress inherited tab interaction paint.

Transparent tabs on `onVivid` use light state layers and foregrounds derived from the approved
primitive black cap, preserving contrast against the parent vivid surface. Variants with an opaque
Material container retain their container recipe across contexts where that container supplies the
contrast relationship.

Box Tabs own an opaque neutral-subtle bar in each theme, so their labels use the bar's context
regardless of the external parent. The selected box uses Light primary vivid with white content;
hover/pressed darken that fill. Segmented Tabs keep their unselected opaque tab recipe; their
selected shell uses primary/white on subtle parents and white/primary on vivid parents. Label and
icon recipes are shared within each variant. These Kiskadee adaptations prevent white-on-white
selected content and are covered by contrast checks against the actual bar/indicator paint.
