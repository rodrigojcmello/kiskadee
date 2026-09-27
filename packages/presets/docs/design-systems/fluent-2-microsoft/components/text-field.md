# Fluent TextField Evidence

Scope: Light, `onSubtle`, medium emphasis; default and Teams segments. Inspected 2026-09-27.

## Sources

- [User-provided Fluent Web Figma](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=8934-4).
  File `qdtPPQysSX0kHGGcDpEXzw`, Input page `8934:4`, component set `9115:8452`.
- [Fluent Input guidance](https://fluent2.microsoft.design/components/web/react/core/input/usage).
- [Fluent Field guidance](https://fluent2.microsoft.design/components/web/react/core/field/usage).
- [Windows TextBox guidance](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box).
- [Official React Input styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-input/library/src/components/Input/useInputStyles.styles.ts).
- [Official Light semantic tokens](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts).

## Source Coverage

| Source area | Nodes | Inspected | Status |
| --- | --- | --- | --- |
| Input variants | `9115:8452` | Outline, Filled darker/lighter, Underline; Small/Medium/Large | Official adapted |
| Medium Outline | `9115:8630`, `8655`, `8708`, `8735`, `8759`, `8783` (all `9115:`) | Rest, Hover, Focus, Error, Disabled, Read only; geometry and bound variables | Official adapted |
| Medium Underline | `9115:9024` through `9115:9079` | Rest, Hover, Pressed, Focus, Error, Disabled, Read only | Official adapted |
| Medium Filled | `9115:8639`, `9115:8647`, `9115:8717`, `9115:8726` | Background and focus layer | Official adapted |
| Floating labels, warning field, pill shape | No equivalent inspected in Input set | Existing Kiskadee composition | Kiskadee extension |
| Dark and onVivid | Not visually inspected | Outside this pass | Deferred |

## Official Contract

Input has four appearances, not just one. Standard field labels may be above or alongside the
control; `inline` is label placement, independent of appearance. Placeholder is supplementary
and must not replace an accessible label. Windows guidance informs semantics only; no clear
button, multiline behavior, validation logic, or other capability is introduced here.

Figma heights are 24/32/40 px, radius 4 px, text 12/14/16 px. Medium horizontal text inset is
12 px (10 px wrapper plus 2 px text lane). Underline is transparent with a 1 px accessible
neutral line; Focus uses the Brand compound stroke and a 2 px line. Outline also has a separate
bottom line; Filled has a bottom focus line. Kiskadee retains its existing focus mechanisms.

## Color And Token Provenance

The Figma aliases resolve to tinted neutrals (for example Grey-82 `#ccd1dd`, Grey-38 `#5d616b`,
Grey-44 `#6c707b`). The current preset deliberately uses the approved achromatic `n.black.v1`
asset from generator 0.19.0, so official Web grayscale tokens below govern neutral mapping.
Historical `figma-to-kiskadee.json` tinted-neutral mappings are not reapplied.
No primitive asset is changed. Distances below are per-channel grayscale byte differences,
not perceptual Delta E measurements.

| Source concept | Source value | Lookup | Current generated value | Mapping / adaptation |
| --- | --- | --- | --- | --- |
| Neutral Background 1 | White `#ffffff` | cap light | `#ffffff` | Outline/notched surface |
| Transparent | White alpha 0 | cap light, alpha 0 | `#ffffff00` | Underline, disabled/read-only surfaces |
| Neutral Background 3 | Grey-96 `#f5f5f5` | exact neutral L2 | `#f6f6f6` (+1) | Filled-derived borderless/inside |
| Neutral Stroke 1 | Grey-82 `#d1d1d1` | exact neutral L10 | `#d1d1d1` | Outline Rest |
| Neutral Stroke 1 Hover | Grey-78 `#c7c7c7` | exact neutral L12 | `#cbcbcb` (+4) | Outline Hover |
| Neutral Stroke Accessible | Grey-38 `#616161` | exact neutral L50 | `#616161` | Underline Rest; supporting text |
| Accessible Hover | Grey-34 `#575757` | exact neutral L55 | `#585858` (+1) | Underline Hover |
| Neutral Foreground 1 | Grey-14 `#242424` | reference neutral vivid +0 | L85 `#252525` (+1) | Label and input; remappable role |
| Neutral Foreground 4 | Grey-44 `#707070` | exact neutral L40 | `#737373` (+3) | Placeholder base, before existing structural opacity |
| Neutral Foreground Disabled | Grey-74 `#bdbdbd` | exact neutral L16 | `#bababa` (-3) | Disabled content |
| Neutral Stroke Disabled | Grey-88 `#e0e0e0` | exact neutral L7 | `#e0e0e0` | Disabled/read-only edge |
| Brand Compound Stroke | Figma Brand-80 `#0064b4` | reference primary vivid +0 | default L50 `#0064b4`; Teams L50 `#5b5fc7` | Focus follows segment |
| Danger Stroke 2 | Cranberry Primary `#c50f1f` | reference error vivid +0 | L45 `#c50f1f` | Error edge/message |
| Warning extension | Existing Fluent Progress readable Orange recipe | exact warning L50 | `#9d4012` | Warning edge/message; no claim of official Input warning |

Every exact locator uses evidence ID `component.text-field`. Component intents map neutral to its global role, error to `redLike`, and warning to `primitive.orange.v1`. Focus directly references global `primary`. Physical caps
use `primitive.black.v1`. Only Light is authored; Dark/Darker and inverse palettes are deferred.

## Kiskadee Mapping

| Appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Standard / Underline, top or inline | Fluent Underline | Official adapted | Transparent shell, neutral bottom line, Brand focus |
| Standard / Outline, top or inline | Fluent Outline | Official adapted | Default; white surface, neutral contour retained on Focus, independent bottom line: 1 px at Rest, 2 px on Pressed/highlighted Focus; semantic contours stay 1 px |
| Standard / Borderless, top or inline | Filled darker | Official adapted | Subtle neutral fill; transparent neutral contour and indicator at Rest; bottom indicator on Pressed/Focus; semantic validation contour |
| Floating / Notched | Material-derived Kiskadee composition | Kiskadee extension | Fluent colors/type/radius; white shell and existing notch |
| Floating / Inside | Material-derived Kiskadee composition | Kiskadee extension | Fluent colors/type/radius; subtle fill and existing floating layout |

Top labels default to preserve familiar Fluent Field composition; inline placement remains an
independent public choice. Rounded radius is 4 px, square is 0; Underline stays square. Pill is
an existing Kiskadee extension. Standard density maps compact/regular/spacious to 32/32/40 px; explicit Small remains 24 px.
Desktop uses Medium geometry, independently of its compact density name;
floating controls use 40/48/56 px to reserve the additional label lane. No Material factory is
imported, so subsequent Material visual changes cannot silently change Fluent.

## States And Schema Mapping

`e1` owns states; descendants use reference states. `e2`/`e7` own labels, `e3` shell and Rest
placeholder color, `e4` value, `e5` message, and Standard `e6` the bottom indicator.

Surfaces do not acquire an invented Hover tint. Outline neutral contours retain the Hover
neutral tone on Pressed/Focus; the bottom indicator carries Brand emphasis. Semantic contours
retain their validation color. Borderless authors a transparent neutral contour with nonzero
width so validation can reveal the contour without changing geometry. Its indicator remains
transparent at Rest and becomes visible on Pressed/Focus. Disabled/read-only override transient
indicator colors; Borderless explicitly resets the indicator to transparent. These terminal
Rest-equal entries intentionally suppress simultaneous Focus/Pressed colors.

Pressed uses a full-width indicator and the same semantic/Brand color as Focus in this adaptation;
no short central segment or focus animation is inferred from the Figma snapshot. Geometry consumes
the existing global focus width and native active state. Highlighted-focus activation remains
under the existing focus policy. No runtime interaction state is added.

### Optional Bottom Indicator

`e6` is an optional bottom indicator, not exclusive to the Underline mode. It can delimit the
field at Rest and/or serve as the TextField focus indicator. A Borderless field does not change
mode when its focus indicator becomes visible. The schema declares element presence and state
colors; runtime renders a stable span only when the element is authored. Structural CSS owns
positioning, clipping, and interaction thickness, and preserves global/component focus color
selection. See the [React contract](../../../../../components/react/docs/definitions/text-field/text-field-focus-indicator.md).

### Figma Appearance Labels

The user-provided comparison screenshots have column headings that do not match the official
React appearances. Map by rendered composition: complete contour plus bottom line maps to Outline;
transparent surface plus bottom line maps to Underline; filled surfaces without a habitual contour
map to Borderless. Do not infer that the underlying Figma variant properties are also mislabeled.
Both filled appearances fit Borderless conceptually; only the darker fill is authored in this pass.

## Deferred Or Unsupported

- Dark/Darker, onVivid, other emphases, Filled lighter as a separate option.
- Focus animation and a separate Filled lighter appearance remain deferred. Floating focus mechanics are unchanged.
- Existing structural placeholder opacity (0.62) attenuates the schema color in Standard modes;
  the Rest-only placeholder contract cannot represent official disabled placeholder independently.
  This is an existing limitation, not silently corrected or compensated with an invented color.
- Existing highlighted-focus policy controls thickness. Runtime remains unchanged. Outline structural CSS aligns `e6` with the external outline, clips its paint to the expanded shell radius, and thickens inward on highlighted focus. Shells without `e6` retain whole-outline focus; inline label widths are 96/112/128 px to avoid wrapping the Showcase labels.

## Validation

- Web Builder build/sync/registry generation passed.
- Six focused TextField schema tests passed, including Outline contour retention and Borderless terminal-state resets.
- Biome and diff whitespace checks passed; no literal colors were added to the schema.
- Generated Focus palette audit found no Rest-equal Focus entries.
- Browser inspection at `/text-field` confirmed all five Light/onSubtle compositions, top/inline
  Standard labels, validation examples and keyboard focus. The local browser selected the existing
  Open Sans fallback for Segoe UI; this is not a native Windows rendering certification.
- Package typechecking remains blocked by diagnostics in unchanged classify-primitives,
  Button, Switch and Slider-test files. No diagnostics remain in the new TextField files.
