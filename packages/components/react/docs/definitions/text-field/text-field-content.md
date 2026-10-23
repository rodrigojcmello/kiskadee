# TextField Internal Content

`startContent` and `endContent` are logical regions inside the control shell. They accept React
content or a function receiving `{ disabled, readOnly }`. Multiple children retain their semantic
DOM order. The field's direction places the regions; `inputProps.dir` controls only the value.
See [Bidirectional layout](../../../../../../docs/definitions/bidirectional-layout.md).

`TextFieldIcon` and `TextFieldText` are passive field anatomy. They consume the field's scale and
resolved intent without owning keyboard stops, action handlers, surfaces, or individual emphasis.
Icons are decorative by default and accept accessible attributes for meaningful artwork. Text
uses `bdi` isolation without adding characters to the editable or submitted value. Password
examples explicitly compose the canonical `lock`; the field does not infer artwork from input type.

## Region surfaces and passive geometry

`startContentEmphasis` and `endContentEmphasis` independently select `'lowest' | 'medium'`,
defaulting to `lowest`. Lowest is plain content. Medium paints the complete lateral region through
the control's inner block extent, with a separator toward the input. Multiple passive children
share that one region surface rather than receiving individual frames.

- `e8`, content-region, owns the region surface, separator, authored spacing, and child gap.
- `e9`, icon, consumes preset-authored `iconSize` mapped to `global.iconSizes`.
- `e10`, text, consumes the preset's typography and foreground recipe.

The `e8` surface is painted by its own `::before` pseudo-element. The layout binder measures the
existing control and region rectangles: `--k-txf-rbs` / `--k-txf-rbe` extend the paint to the inner
block boundaries, `--k-txf-rio` / `--k-txf-rii` resolve its logical outer/inner extent, and
`--k-txf-rr` follows the control's inner paint radius. These are platform measurements, not new
preset insets or padding. The pseudo-element expands the paint without stretching region children
or contributing to the control's height.

Switching region emphasis preserves passive glyph dimensions, typography, and the control's
height. The surface follows the existing control geometry. Neutral passive icons use the preset's
lighter informational foreground. That neutral-icon adjustment leaves the input value, passive
text recipes, and validation-intent colors unchanged. Passive content remains Rest-only, with
neutral terminal presentation and no extra passive disabled delta in this delivery.

Floating text affixes follow the editable line's measured block center, including input padding
and enlarged-text label clearance. The center calculation accounts for the input's own block
padding and borders, rather than treating its outer box center as the content line. This avoids
reserving excess clearance between a promoted label and the value. The platform binder publishes
the passive text displacement as `--k-txf-tbo`; Icon and Button geometry remain independent.

The shell and surfaced regions publish their preset-authored semantic content surface for
independent descendants. No consumer infers it from concrete colors or luminance. Other presets
may omit this optional anatomy; only Fluent 2 authors the capability in this delivery.

## Internal actions and free composition

The control shell owns the border and minimum height. Its persistent editing lane
(`data-text-field-editing-lane`, structural `x3`) always contains the input and consumes the
existing Schema-authored block padding once. Lateral regions remain centered siblings and do not
receive another copy of that editing padding. Direct Buttons are individually centered, including
multiple Buttons in one region, without changing their intrinsic dimensions. Floating labels remain
absolute children of the control; their measured clearance participates in the editing lane, not
every side item.

A fitting internal Button preserves the input-only control's height in the same empty, filled,
or focused state. Its intrinsic box is compared with the control's inner height. If that box is
larger, genuine oversized content may increase the control only as needed to contain the child
and borders; duplicating the input's block padding around it is not acceptable growth.

Compose actions with the existing Button. `TextFieldAction` wraps one internal Button when it is
the region's isolated action. The wrapper provides equal clearance at the outer inline edge and
the top and bottom of the control, accounting for the control border. It preserves the Button's
intrinsic dimensions, visual choices, and interaction behavior; it does not stretch the Button or
choose a new size.

Only a sole direct `TextFieldAction` child enables this adjustment. The binder publishes
`--k-txf-aio` for the region's outer inline margin and `--k-txf-abo` for the wrapper's relative block
offset, deriving both from the measured inner control box and intrinsic action. No Button padding,
height, or glyph size is replaced. Mixed content clears those isolated-action adjustments.

Mixed passive content, multiple actions, and arbitrary React content remain supported as free
composition. Their ordinary region layout does not promise the isolated-action optical spacing
guarantee. Their intrinsic content still follows the same height-fit rule, and the input retains
its own lane without an absolute overlay over the editable area.

Internal Showcase examples choose Button Small for a Medium field and Button Medium for a Large
field. A Standard Small field has no fitting native Button at the available existing sizes;
Button Small remains visible there as explicitly oversized content. No action is hidden and no
new Button size is introduced. The Medium-field toggle keeps the same mounted field while adding
or removing Button Small; the separate Small/Medium comparison retains an oversized case.

Content functions expose terminal state so consumers can disable editing actions for
`disabled || readOnly`, while allowing consultation actions such as copy or reveal under
`readOnly`. The field does not configure arbitrary child events. Use `type="button"` for auxiliary
actions and explicit submission for Send; icon-only actions require accessible names. Passive
content may focus the input; an action keeps its own focus and keyboard behavior.

## Built-in clear and password visibility

`clearAction` and `visibilityToggle` are opt-in field actions using the existing Button and
`TextFieldAction` relation. The field owns their action behavior while a controlled value remains
consumer-owned. Their default Button size is Small (`sm`); each optional `size` selects an existing
Button size without changing that Button's padding, glyph viewport, or intrinsic dimensions. The
same fitting and oversized-content rules apply.

`clearAction` requires `icon: ReactNode`, `label`, and `clearedAnnouncement`. The action is present
only while the value is nonempty and the field is editable. It is absent for empty, disabled, and
read-only fields. Clearing uses the Headless value owner: an uncontrolled field updates its
internal value, while a controlled field requests `onValueChange('')` and the consumer decides
whether to update `value`. It does not turn a controlled field into an uncontrolled one or
maintain a second value in the styled adapter.

The behavior bridge is defined in the
[Headless TextField action contract](../../../../../headless/react/src/components/text-field/docs/definitions/text-field-actions.md).

The clear confirmation uses the caller's `clearedAnnouncement` through an atomic, polite
`role="status"` live region. The structural `x4` extra hides this status visually without removing
it from assistive technology or adding a visible message row. An unchanged controlled value does
not announce a completed clear. The consumer supplies localized wording; there is no embedded
English default.

`visibilityToggle` requires `inputProps.type="password"` and has two explicit presentations:

- `presentation: 'text'` requires `showText`, `hideText`, `showLabel`, and `hideLabel`.
- `presentation: 'icon'` requires `showIcon`, `hideIcon`, `showLabel`, and `hideLabel`.

Visible state chooses the hide text/artwork/label; masked state chooses the show equivalents.
Every accessible label and text string is consumer-supplied and localizable. The icon properties
accept arbitrary React nodes, including caller SVG and icon components. FamilyResolvedIcon is one
possible artwork provider, not a required icon-key API. The field does not infer an icon family
or artwork from `type="password"`.

The toggle preserves the same native input, its value, and selection while changing only masking.
It remains available for read-only consultation and is disabled when the field is disabled.
Supplying a password input alone does not enable reveal; supplying `visibilityToggle` for another
input type does not add that control.

Both actions occupy the logical end region after consumer `endContent`, in clear-then-visibility
order. They can coexist with each other and with custom end content without replacing that
content. Their combined region uses the same emphasis and surface context as other end content.
When more than one child is present, ordinary mixed-flow layout applies and the isolated-action
outer-inline-spacing adjustment is not promised. Custom Copy, Attach, Send, and other actions
continue to use consumer handlers and independent Button choices.

## Connected end action

`connectedEndAction` is a TextField-local render function receiving
`{ disabled, readOnly, className }`. It renders an existing Button at logical end, outside the
input control. Attach the supplied `className` to that Button to consume the field's connected
relation. The consumer still chooses size, intent, emphasis, availability, action type, and handler.

The relation handles the seam and logical placement for the five field modes and both directions.
It is not Button.Group and does not introduce a generic Select/input grouping mechanism. The
native Button is centered on the control line, not stretched to manufacture an equal height or
reduced to a new intermediate scale. Its geometry can therefore remain different from a field
whose typography or floating label produces a larger natural control.

The connected-action Showcase uses existing pairings: Standard follows equal semantic size names;
Floating Medium uses Button Large and Floating Large uses Button Large 2. Those are explicit
demonstration choices, not a universal equivalence contract. A separate Medium-field comparison
retains Small and Medium Buttons; both use 20px glyphs, while their control dimensions differ.

## Component independence and surface context

Button retains its own size, intent, emphasis, radius, focus, and keyboard contract in every
composition. It consumes the nearest produced surface through the existing
`SurfaceContextProvider`; an explicit Button `surfaceContext` retains precedence. Field validation
does not copy its intent into the Button, and a Medium region does not rewrite Button recipes.

Internal actions consume their region's resolved context, derived from the shell and the region's
own produced surface. The connected action is outside that control and retains the field's
surrounding consumed context. It does not inherit a filled input surface that is not behind it.

The ownership boundary follows existing compositions such as Accordion: the host owns its
grouping and anatomy, while composed public components retain their identity. See the
[Accordion contract](../accordion/accordion-contract.md),
[Surface Context](../../../../../../docs/definitions/badge-chip-contract.md#surface-context), and
[composition strategies](../../../../../../docs/definitions/composition-strategies.md).

Prefix/suffix formatting remains consumer-owned. A logical start region is physically right in
RTL; mirroring alone does not implement a currency format. Choose region, local direction, and
accessible wording deliberately. No new Button scale or general nested-radius compensation is
introduced by this composition.

## Observed internal geometry

Chrome verification with the Showcase Open Sans/fallback typography setup compared the same
mounted Medium field with and without a native 28px Button Small. The following representative
control measurements matched within each corresponding value/focus state:

| Field mode | Input-only control | With Button Small | Native Button height |
| --- | --- | --- | --- |
| Standard Outline / Underline / Borderless | 32px | 32px | 28px |
| Floating Notched | 40px | 40px | 28px |
| Floating Inside | approximately 46px | approximately 46px | 28px |

Floating Inside samples included 45.96875px. The invariant compares the same typography and
input state before and after toggling the action; it does not fix one height for every state or
font. Verification covered LTR/RTL, narrow layouts, empty/filled/focused states, and retained the
input's DOM identity. A separately composed 32px Button Medium in Standard Medium measured a
34px control: its native height exceeds the original 30px inner space, so the existing two 1px
field borders require that genuine oversized result.

## Observed connected-action geometry

The Chrome Showcase rendering with its Open Sans/fallback typography setup measured the following
connected-action pairings. Field height means the `e3` control box, excluding external label and
message boxes. Measurements settled after fonts were ready and transitions had completed. Standard
pairs equal semantic size names; Floating Medium uses Button Large and Floating Large uses Button
Large 2. These observations do not define new scale values or an equal-height guarantee.

| Field mode | Field size | Native Button size | Field control height | Button height | Field minus Button |
| --- | --- | --- | --- | --- | --- |
| Standard Outline / Underline / Borderless | Small | Small | 24px | 28px | -4px |
| Standard Outline / Underline / Borderless | Medium | Medium | 32px | 32px | 0px |
| Standard Outline / Underline / Borderless | Large | Large | 40px | 42px | -2px |
| Floating Notched | Medium | Large | 40px | 42px | -2px |
| Floating Notched | Large | Large 2 | 48px | 50px | -2px |
| Floating Inside | Medium | Large | approximately 46px | 42px | approximately +4px |
| Floating Inside | Large | Large 2 | 48px | 50px | -2px |

Only the Standard Medium pairing has equal measured heights. Floating Inside Medium measured
46px, with some frames at 45.96875px, a difference of approximately 4px from its native Button.
The input-line center accounts for the input's own padding before determining label clearance.
Button Large measured 42px and Large 2 measured 50px in this composition. The connected relation
centers the existing components and joins their logical edges without stretching either into
equivalence. Native control geometry,
floating label clearance, and typography can therefore leave a visible height difference. That
limitation is accepted for the current pairings; no Button geometry is changed to compensate.

## Verification

Verify passive geometry before and after region-emphasis changes; full-height region surfaces and
logical separators; isolated action clearance at either side; native connected-action dimensions;
and free composition without input or label overlap. Exercise all five modes in LTR/RTL, dynamic
ancestor direction, independent input direction, narrow layouts, and supported field scales.

Validate authored palettes and surface handoffs across Fluent's Default/Teams segments,
Light/Dark/Darker themes, onSubtle/onVivid contexts, and Neutral/Error/Warning intents. Browser
geometry and palette verification are separate evidence.
