# Fluent TextField Evidence

Scope: Light and Dark, `onSubtle`, medium emphasis; default and Teams segments. Inspected 2026-09-27.

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
| Dark and onVivid | Later contextual adaptations below | Local recipes and Showcase | Kiskadee extension |

## Official Contract

Input has four appearances, not just one. Standard field labels may be above or alongside the
control; `inline` is label placement, independent of appearance. Placeholder is supplementary
and must not replace an accessible label. Windows guidance initially informed semantics; the approved visual adaptation below also uses user-provided Windows screenshots; no clear
button, multiline behavior, validation logic, or other capability is introduced here.

Figma heights are 24/32/40 px, radius 4 px, text 12/14/16 px. Medium horizontal text inset is
12 px (10 px wrapper plus 2 px text lane). Underline is transparent with a 1 px accessible
neutral line; Focus uses the Brand compound stroke and a 2 px line. Outline also has a separate
bottom line; Filled has a bottom focus line. Kiskadee retains its existing focus mechanisms.

## Internal content and action composition (2026-10-18)

Status: **Official adapted** for before/after content and 16/20/24 px passive icons;
**Kiskadee extension** for typed passive slots, surfaced full-height lateral regions, multiple
composed actions, validation-colored passives and Floating modes. Sources inspected on this date:
[official Input slot types](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-input/library/src/components/Input/Input.types.ts)
and the official Input styles linked above. Upstream supports content before and after the input,
uses NeutralForeground3 for content and defines 16/20/24 px icons for Small/Medium/Large.

### Region ownership and geometry

The optional anatomy is e8 content region, e9 passive icon and e10 passive text. This approved
composition replaces the earlier per-item frames; e11 and the per-item emphasis API are retired.
Region emphasis is independent on each logical side: Lowest is transparent and Medium paints a
neutral tonal region with a separator at its inner edge. Neither region owns a radius scale or a
four-sided frame. Its paint follows the field's existing contour. Passive content, Buttons and
other composed items can share the same region.

The existing 8 px child gap and 8 px separation from the editable area are preserved at every
supported size: e8.paddingLeft emits --k-pdl for child gap, and e8.marginRight emits --k-mgr for
region-to-input separation. These are token-only logical composition channels, not physical
padding or margin declarations. No additional region layout inset is authored. The shell owns
the border and minimum height; a persistent editing lane consumes its existing token-authored
block padding once. Lateral regions remain centered siblings without repeating that padding.
Input insets and native Button geometry are preserved. Painting Medium cannot add another copy
of the insets or change the field's dimensions.

A fitting internal action keeps the same control height as the input-only composition in the
corresponding empty, filled, or focused state. Only intrinsic content larger than the available
inner height may grow the field, with its existing borders. Growth caused by applying the input's
block padding again around a side action is not part of this composition. Floating labels stay
absolute children of the control, with label-clearance flow restricted to the editing lane.

Chrome validation with the Showcase's Open Sans/fallback setup retained the same Medium input node
while toggling a native 28px Button Small: Standard stayed at 32px, Notched at 40px, and Inside at
approximately 46px (samples included 45.96875px), comparing corresponding value/focus states.
The floating line-center measurement accounts for the input's own block padding and borders
before resolving label clearance, avoiding excess reserved space. The explicit oversized
Standard Medium comparison measured 34px with a native 32px Button Medium and the field's two
1px borders. These are observations of the composition, not new preset scales or Button changes.

The region paints a 1 px separator through e8.borderWidth (--k-bdw), outside layout flow. Lowest
suppresses that decorative paint; Medium reveals it. Box and border colors emit token-only
--k-bgc and --k-bdc for the full-height background and separator. Structural geometry locates the
paint against the actual shell bounds without reconstructing preset values or clipping action
focus. The field's focus indicator remains independent of the lateral paint.

Passive icon size still references global.iconSizes (16/20/24 px Standard, 20/24 px Floating), and
text still references the active input typography. The connected action composes a native Button
at an existing size: no stretching, new Button size or new radius recipe is introduced. Floating
compositions demonstrate their existing size-pairing limitations rather than inventing a missing
Button scale.

### Region paint and descendant surface

Medium reuses Card neutral/medium fill (card.neutral, exact L3/D3 and Darker D2, component.card)
and the existing onSubtle Outline neutral contour (the approved neutral Vivid/physical-cap
balance). Neutral, Error and Warning share that gray region. Lowest resolves both paint channels
to the existing transparent physical cap. All palettes contain Rest only; no new disabled,
read-only, hover, focus or pressed paint is authored. The n.black.v1 asset and its provenance
remain unchanged.

Each mode publishes two independent optional surface maps. contentSurfaceContext still describes
the shell: Outline/Underline inherit, while Borderless/Notched/Inside produce onSubtle.
contentRegionSurfaceContext describes each region: Lowest inherits its consumed shell context;
Medium produces onSubtle. Both maps cover medium field emphasis or Lowest/Medium region emphasis
as applicable, all validation intents, both segments and Light/Dark/Darker. A Provider inside each
region gives nested independent components its actual surface. Buttons retain their own intent,
emphasis, size, states and focus behavior.

### Passive foregrounds

Region emphasis selects e9/e10 palettes; the icon/text helpers do not independently select a
surface. Text prefixes retain their existing foregrounds. Medium chromatic content keeps the
approved Deep foreground references because the region actually paints an onSubtle surface.

| Role | Source / existing recipe | Kiskadee lookup and current value |
| --- | --- | --- |
| Neutral icon onSubtle | NeutralForeground4, official Light #707070 / Dark #999999; existing placeholder mapping | Exact textField.neutral L40 #737373 / D75 #a3a3a3, evidence component.text-field |
| Neutral icon onVivid | Existing global Medium-strength neutral foreground | fg(neutral.standard.light.onVivid.medium), white at 68%, #ffffffad |
| Neutral text onSubtle | Existing passive NeutralForeground3 adaptation | Exact L50 #616161 / D80 #b4b4b4 |
| Plain validation text/icon | Existing validation Vivid anchor | Error L45/D40; Warning L24/D40, unchanged |
| Medium validation text/icon | Existing global Deep text profile | fg(red.deep.<theme>.onSubtle.high) / fg(orange.deep.<theme>.onSubtle.high) |

Neutral icon mapping is intentionally more subdued than the earlier L50/D80 recipe, without
altering the prefix typography or colors. The onVivid Medium coordinate is existing catalog data,
not a new alpha literal or a P-React color override. Its composited contrast is 3.64:1 over Fluent
Microsoft Blue #0064b4 and 3.42:1 over Teams Blue #5b5fc7; the opaque Button neutral foreground
#dbdbdb produces 4.36:1 and 3.88:1 respectively. These are concrete supported backgrounds, not a
claim that a binary context guarantees contrast over arbitrary RGB backgrounds.

Medium Error/Warning references reuse the catalog's evidence-backed L65 / D75 recipe
(global.foreground.deep, documented in [Text Deep profiles](./text.md#deep-profile-extension)).
Core catalogs and primitive assets are unchanged.

| Theme | Medium region | Error Deep / contrast | Warning Deep / contrast |
| --- | --- | --- | --- |
| Light | #f2f2f2 | L65 #811819, 9.03:1 | L65 #6f3217, 8.75:1 |
| Dark | #141414 | D75 #ff746c, 6.99:1 | D75 #f68035, 7.07:1 |
| Darker | #0e0e0e | D75 #ff746c, 7.32:1 | D75 #f68035, 7.41:1 |

Ratios are rounded only for reporting; focused tests use unrounded relative luminance and require
at least 4.5:1 for informational text and 3:1 for the inspected informational icon scenarios.
See [WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Colors in this evidence are source/mapping values, never schema literals.

Browser validation of the local Showcase on 2026-10-18 covered both segments, all three themes,
both ambient contexts, Outline/Inside, Neutral/Error/Warning and both regional emphasis
inversions: 144 combinations and 288 regions. Resolved e8 paint, e9/e10 foregrounds and effective
surface contexts matched the authored recipes. Medium's minimum measured text contrast was
5.53:1 and its minimum neutral icon contrast was 4.24:1.

Two limitations are intentionally preserved. First, the independent NeutralForeground4 mapping
can coincide with Button neutral/lowest at Rest in Dark/Darker: both resolve to #a3a3a3 onSubtle.
This recipe therefore does not guarantee that a passive icon has less contrast than every Button
composition. Second, Lowest text retains its earlier foreground policy, which does not guarantee
4.5:1 on every supported surface. Samples included Light Warning at approximately 2.9-3.0:1,
Light neutral text over vivid at approximately 4.0:1, and Light Error text over vivid near 1.01:1.
These are existing Lowest text limitations; changing that policy or Button foregrounds is outside
the regional surface extension. Medium's measured contrast results above do not imply that
Lowest text passes the same threshold.

Start/end follow the shell's logical direction independently of the value. Currency symbol
placement remains application-owned locale data, as specified by
[Unicode CLDR currency formats](https://unicode.org/reports/tr35/tr35-numbers.html#Currency_Formats).
Direction and isolation follow [HTML dir](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute)
and [W3C bidi guidance](https://www.w3.org/International/questions/qa-html-dir.en.html).
No TextField-specific SVG mirroring policy is introduced.

## Color And Token Provenance

The Figma aliases resolve to tinted neutrals (for example Grey-82 `#ccd1dd`, Grey-38 `#5d616b`,
Grey-44 `#6c707b`). The current preset deliberately uses the approved achromatic `n.black.v1`
asset from generator 0.19.0, so official Web grayscale tokens below govern neutral mapping.
Historical `figma-to-kiskadee.json` tinted-neutral mappings are not reapplied.
No primitive asset is changed. Distances below are per-channel grayscale byte differences,
not perceptual Delta E measurements.

| Source concept | Source value | Lookup | Current generated value | Mapping / adaptation |
| --- | --- | --- | --- | --- |
| Neutral Background 1 | White `#ffffff` | cap light | `#ffffff` | Notched surface |
| Transparent | White alpha 0 | cap light, alpha 0 | `#ffffff00` | Underline, disabled/read-only surfaces |
| Neutral Background 3 | Grey-96 `#f5f5f5` | exact neutral L2 | `#f6f6f6` (+1) | Floating Inside surface |
| Neutral Stroke 1 | Grey-82 `#d1d1d1` | exact neutral L10 | `#d1d1d1` | Floating Notched Rest |
| Neutral Stroke 1 Hover | Grey-78 `#c7c7c7` | exact neutral L12 | `#cbcbcb` (+4) | Floating Notched Hover |
| Neutral Stroke Accessible | Grey-38 `#616161` | exact neutral L50 | `#616161` | Underline Rest; supporting text |
| Accessible Hover | Grey-34 `#575757` | exact neutral L55 | `#585858` (+1) | Underline Hover |
| Neutral Foreground 1 | Grey-14 `#242424` | reference neutral vivid +0 | L85 `#252525` (+1) | Label and input; remappable role |
| Neutral Foreground 4 | Grey-44 `#707070` | exact neutral L40 | `#737373` (+3) | Placeholder base, before existing structural opacity |
| Neutral Foreground Disabled | Grey-74 `#bdbdbd` | exact neutral L16 | `#bababa` (-3) | Disabled content |
| Neutral Stroke Disabled | Grey-88 `#e0e0e0` | exact neutral L7 | `#e0e0e0` | Disabled/read-only edge |
| Brand Compound Stroke | Figma Brand-80 `#0064b4` | reference primary vivid +0 | default L50 `#0064b4`; Teams L50 `#5b5fc7` | Focus follows segment |
| Danger Stroke 2 | Cranberry Primary `#c50f1f` | reference error vivid +0 | L45 `#c50f1f` | Error edge/message |
| Warning extension | Approved Orange Vivid anchor | reference warning vivid +0 | L24 `#f7630c` | Warning edge/message; no claim of official Input warning |

TextField exact locators use evidence ID `component.text-field`; the reused Card surface uses `component.card`. Component intents map neutral to its global role, error to `redLike`, and warning to `primitive.orange.v1`. Focus directly references global `primary`. Physical caps
use `primitive.black.v1`. Light and Dark are authored for onSubtle and onVivid; Darker remains deferred.

## Kiskadee Mapping

| Appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Standard / Underline, top or inline | Fluent Underline | Official adapted | Transparent shell, neutral bottom line, Brand focus |
| Standard / Outline, top or inline | Fluent Outline | Official adapted | Default; Button low-neutral transparent surface and contour retained on Focus, independent bottom line: 1 px at Rest, 2 px on Pressed/highlighted Focus; semantic contours stay 1 px |
| Standard / Borderless, top or inline | Filled darker | Official adapted | Canonical Card neutral/medium fill; transparent neutral contour and indicator at Rest; bottom indicator on Pressed/Focus; semantic validation contour |
| Floating / Notched | Material-derived Kiskadee composition | Kiskadee extension | Fluent colors/type/radius; white shell and existing notch |
| Floating / Inside | Material-derived Kiskadee composition | Kiskadee extension | Fluent colors/type/radius; subtle fill and existing floating layout |

Top labels default to preserve familiar Fluent Field composition; inline placement remains an
independent public choice. Rounded radius is 4 px, square is 0; Underline stays square. Pill is
an existing Kiskadee extension. Standard density maps compact/regular/spacious to 32/32/40 px; explicit Small remains 24 px.
Desktop uses Medium geometry, independently of its compact density name;
floating controls use Medium/Large at 40/48 px to reserve the additional label lane. No Material factory is
imported, so subsequent Material visual changes cannot silently change Fluent.

## States And Schema Mapping

`e1` owns states; descendants use reference states. `e2`/`e7` own labels, `e3` shell and Rest
placeholder color, `e4` value, `e5` message, and Standard `e6` the bottom indicator.

Surfaces do not acquire an invented Hover tint. Outline neutral contours retain their Rest color on Hover/Pressed/Focus; the bottom indicator carries Brand emphasis. Semantic contours
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

- Darker, other emphases, Filled lighter as a separate option.
- Focus animation and a separate Filled lighter appearance remain deferred. Floating focus mechanics are unchanged.
- Existing structural placeholder opacity (0.62) attenuates the schema color in Standard modes;
  the Rest-only placeholder contract cannot represent official disabled placeholder independently.
  This is an existing limitation, not silently corrected or compensated with an invented color.
- Existing highlighted-focus policy controls thickness. Runtime remains unchanged. Outline structural CSS aligns `e6` with the inset outline, clips its paint to the shell radius, and thickens inward on highlighted focus. Shells without `e6` retain whole-outline focus; inline label widths are 96/112/128 px to avoid wrapping the Showcase labels.

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

## Size Comparison

Standard exposes Small/Medium/Large at 24/32/40 px. Floating intentionally omits Small and
publishes Medium/Large at 40/48 px. These floating sizes and the Button Large 2 extension are
Kiskadee adaptations, not claims about official Fluent Input sizes.

Button Large 2 has a 48 px content-plus-padding extent (22 px label line plus 13 px block
padding per side). Its authored 1 px borders produce a 50 px native border box in the observed
Showcase composition. It uses 20 px inline padding and 24 px pill radius. Typography and icon
size retain Large values.
Connected and external Showcase examples pair Floating Medium with Button Large and Floating Large
with Button Large 2. Internal examples use Button Small for a Medium field and Button Medium for a
Large field; the persistent Medium-field toggle demonstrates adding/removing a fitting Small
Button. Standard Small has no fitting native Button size and retains its action as an oversized
composition. The Small/Medium comparison remains separate and demonstrates that true oversized
content can require a larger control. These are demonstration choices: consumers independently
choose either component's size, without changing Button or adding an intermediate size.
Sizes initializes from the preset TextField variant/mode options, offers a looping mode selector,
and can hide comparison buttons. Standard does not gain a Large 2 size.

## Approved Windows-inspired color adaptation (2026-09-27)

Status: Kiskadee extension, approved by the user. Windows Settings and Calculator screenshots
supplied in this conversation establish the visual direction; the user's sampled Input bottom
color `#cccccc` is a target, not a verified official Microsoft token. Button remains unchanged.

- Standard Outline surface: physical light cap at alpha 0, matching Button low neutral.
- Outline contour: neutral Vivid reference (Black v1 L85, `#252525`) balanced against the
  physical white cap with target Delta E 0.06, using the existing Button color helper.
  This resolves to `#25252517`, matching Button low neutral. No Hover/Pressed/Focus contour
  delta is authored; semantic validation and terminal-state overrides remain unchanged.
- Outline e6 Rest: Black v1 L12, `#cbcbcb`, exact `component.text-field`; each channel is
  one byte below the user-provided `#cccccc` target. Hover uses the approved L22 adaptation below; Focus/Pressed retain
  the brand indicator. Geometry, clipping, radius, positioning and thickness are unchanged.
- Borderless surface: Card neutral/medium Light Rest, `card.neutral` Black v1 L3 (`#f2f2f2`),
  exact `component.card`. This reuses the canonical Card recipe without a runtime dependency.
  All validation intents use this same neutral surface.
- Underline and both Floating appearances retain their previous recipes.

This supersedes the initial Web-derived Outline surface/contour/indicator and Borderless fill
mappings above. No primitive asset, Button recipe, structural CSS or runtime behavior changes.

## Native Outline border with bottom indicator

Outline shells with e6 use a single native border box, with e3 borderBottomColor overriding
its bottom color. No pseudo-element paints the contour. Shells without e6 retain their
existing outline treatment. Fluent compensates its Outline padding by the authored 1px
border on each side, preserving control height and input alignment. The absolute e6 insets
compensate that border to retain its outer-shell position. e6 remains visible at Rest and
retains its existing Focus/Pressed thickness and color. Visual acceptance remains user-owned.

## Outline hover contrast

Approved Kiskadee adaptation: Outline neutral e6 and native bottom border use Black v1 L22
(`#a3a3a3`) on Hover, versus L12 (`#cbcbcb`) at Rest. Both use exact locators with
`component.text-field` evidence; the approved existing tonal asset is unchanged. Thickness
remains 1px on Hover. Error/warning do not acquire neutral hover paint. Disabled/read-only
retain their existing terminal overrides. Focus/Pressed keep the e6 brand treatment; the
native bottom border explicitly resets to Rest to suppress simultaneous Hover paint behind it.
These Rest-equal Focus/Pressed entries are intentional compound-state precedence overrides.

Inspected Figma nodes [9119:3810](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/?node-id=9119-3810)
and [9119:3816](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/?node-id=9119-3816)
use Hover (1px) and Pressed (2px) tokens respectively. The chosen neutral hover shade is a
user-approved Windows-inspired adaptation, not an exact reproduction of those tinted tokens.

## Dark onSubtle (2026-09-27)

Both Microsoft and Teams publish Dark for all five modes. Light recipes are preserved.
Sources: [official Dark aliases](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts)
and the official Input implementation linked above. Numeric differences below are deliberate
adaptations to the approved achromatic asset, not newly generated colors.

| Role | Official / adopted reference | Kiskadee lookup | Resolved Dark color |
| --- | --- | --- | --- |
| Input/label | NeutralForeground1, white | physical light cap | #ffffff |
| Placeholder | NeutralForeground4, #999999 | neutral D75 | #a3a3a3 |
| Disabled text | NeutralForegroundDisabled, #5c5c5c | neutral D35 | #5a5a5a |
| Disabled edge | NeutralStrokeDisabled, #424242 | neutral D24 | #454545 |
| Underline Rest / supporting text | NeutralStrokeAccessible, #adadad | neutral D80 | #b4b4b4 |
| Underline Hover | NeutralStrokeAccessibleHover, #bdbdbd | neutral D85 | #c5c5c5 |
| Outline indicator Hover | Approved stronger hover contrast adaptation | neutral D90 | #d7d7d7 |
| Floating Notched surface | NeutralBackground1, #292929 | neutral D9 | #2a2a2a |
| Floating contour / hover | NeutralStroke1 #666666 / Hover #757575 | neutral D40 / D50 | #626262 / #727272 |
| Borderless / Inside surface | Canonical Card neutral medium | card.neutral D3 | #141414 |
| Error | Approved Red Vivid anchor | reference textField.error vivid +0, D40 | #b6302f |
| Warning | Approved Orange Vivid anchor | reference textField.warning vivid +0, D40 | #a5430f |

Outline contour reuses Button low-neutral balancing: neutral Vivid D90 against neutral D5,
target Delta E 0.18. Its surface remains transparent like Button. Outline bottom Rest uses
D80, Hover D90; native border and e6 stay synchronized. Focus references the active segment's
primary Vivid Dark reference. All neutral exact locators use component.text-field;
the Card surface uses component.card. No schema color literals or new assets are introduced.

Geometry, transitions and state precedence remain shared with Light. Placeholder still uses
the existing structural opacity; that limitation remains unchanged. Darker remains deferred. The later onVivid adaptation is documented below.

## Validation family references

Error and warning use their own family Vivid reference with offset zero in both Light and Dark.
This approved consistency rule replaces warning L50 and semantic D75 overrides. Red resolves
L45/D40; Orange resolves L24/D40. Matching Dark positions come from each asset's independent
functional reference, not a shared fixed position. Contours, indicators and messages consume
these references; disabled/read-only overrides and input text remain unchanged. No primitive
assets are changed. This rule does not claim that Vivid anchors guarantee text contrast.

## Shared terminal intent contract

Disabled and read-only palettes are authored only for neutral, following the
[Core TextField contract](../../../../../core/docs/definitions/text-field-intents.md).
Error and warning retain editable-state recipes; terminal presentation resolves through neutral.
This framework contract supersedes earlier semantic read-only/disabled mappings in this document.
It is a Kiskadee contract rather than a claim of upstream state coverage.


## On-vivid Light and Dark (2026-09-28)

Status: **Kiskadee extension** approved from the Showcase comparison with Button low neutral,
not an upstream Input specification. Applies to Microsoft and Teams; Button is unchanged.
This supersedes earlier notes deferring onVivid. Darker remains outside this change.

- Outline keeps the transparent Button low surface and its physical-white contour: 30% in
  Light, 85% in Dark, consuming `FLUENT_BUTTON_ON_VIVID_RECIPE.low.borderAlpha`.
- The bottom contour/e6 uses physical white 38% in Light (Button's existing bottom Rest),
  85% in Dark. Hover becomes opaque white. Focus/Pressed use primary Light `subtle +4`;
  the native bottom border resets to Rest under Focus/Pressed to suppress concurrent Hover.
- External labels and transparent-shell input/placeholder use neutral Light `subtle +4`,
  matching Button low's foreground recipe. Supporting text uses white 75%; disabled text
  uses Button's white 40%, terminal edges its Light disabled-contour alpha (7%). These are
  cap/reference locators, with no new primitive asset or exact-tone mapping.
- Borderless retains canonical Card neutral medium (`card.neutral` L3/D3, evidence
  `component.card`). Floating filled surfaces also retain their existing onSubtle fill.
  Their input, placeholder and internal labels use the foreground of that actual fill;
  external labels/messages follow onVivid. Filled backgrounds remain present when disabled
  or read-only so their content palette stays paired with the surface.
- Semantic validation continues to use each family's Vivid anchor. This change does not
  replace the approved error/warning policy or guarantee their contrast on every vivid hue.
- Underline uses white 75% at Rest and opaque white on Hover. Neutral floating contours
  use the contextual contour, white Hover, and primary Light `subtle +4` Focus.
- Geometry, e6 thickness/motion, and neutral-only terminal intent ownership are unchanged.

Showcase card titles use contextual Text, as do the Sizes-mode label and existing section titles.

The React adapter now forwards inherited SurfaceContext to every TextField slot resolver.
This repairs selection of the authored palette without adding a new public prop or changing
Headless behavior. Regression coverage checks a live onSubtle-to-onVivid context change.

## Canonical neutral outlined controls (2026-09-28)

**Kiskadee extension**, approved from the user's Showcase comparison. Outline TextField,
low-neutral Button and future Select share the preset-owned `neutral-control-recipe.ts`.
This is schema-authoring reuse, with no runtime dependency between components.

- Outline Hover background consumes the existing Button neutral Low locator: exact
  `button.neutral` L2/D14 (`component.button`) onSubtle; physical white 8% in Light
  onVivid and physical black 10% in Dark onVivid.
- Button neutral Low bottom Rest/Hover now consumes the TextField indicator recipe:
  exact `textField.neutral` L12/L22 or D80/D90 (`component.text-field`); onVivid uses
  physical white 38%/100% in Light and 85%/100% in Dark.
- Outline Focus/Pressed reset the hover fill to its transparent Rest, leaving e6 as the
  focus signal. These Rest-equal overrides intentionally suppress concurrent Hover.
- Button retains its activation/focus policy and terminal states. Pending visibility is
  calculated from the new bottom Rest color. Other Button intents/emphases are unchanged.
- Underline/Borderless/Floating fills are unchanged. Darker is deferred until the TextField
  recipe exists. The future Select adopts this composition when implemented.

This supersedes earlier notes that Outline never changes its Hover surface and that Button's
bottom color remains untouched. Primitive assets, geometry, and e6 thickness are unchanged.

## Darker and independent Select (2026-09-28)

This approved Kiskadee adaptation supersedes the Darker deferrals above. TextField now publishes
Darker in both surface contexts, alongside Select. `field-visual-recipe.ts` shares named color
recipes and standard typography/size helpers; schemas remain independent.
Darker follows Button's neutral Vivid -1 contour calibrated over the physical black cap, with
Card neutral low D2 for Borderless. Dark text, terminal and underline contrast remain the starting
calibration. Light and Dark recipes and TextField geometry are preserved. This is a documented
adaptation to Kiskadee Darker, not an upstream Fluent Darker specification.
