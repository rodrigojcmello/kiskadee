# Connected Button groups

`Button.Group` composes independent Buttons into one horizontal connected surface. It owns visual
topology only: the wrapper does not add a role, selection model, keyboard model, or shared action.

## Shared visual contract

The group is authoritative for `size`, `radius`, `emphasis`, `intent`, and `surfaceContext`.
Every descendant Button inherits those values. Conflicting child values are ignored with a
development warning; action props, state, content, focus, and activation feedback remain local to
each Button.

The shared `intent` defines the base appearance. A member's `selectionIntent` remains local to
that Button and selects its paint only while selected; it does not change its siblings or the
group's Rest frame. Selection intent and selection emphasis do not introduce another Group axis.

Individual `shadow` and `radiusEffect` requests are suppressed inside a connected group. When the
group enables `shadow`, its wrapper reuses the compiled Rest shadow bucket from `Button.e1` and
does not opt into Hover, Pressed, or Focus shadow selectors.

A group containing a direct Button that requests `iconLayout="stacked"` resolves a shared Pill
request to Rounded, including when Stacked is the preset default. All members and the group shadow
use that same effective radius; Square is preserved. This is the existing Stacked shape restriction,
not a separate group option. An explicit Pill group request emits a development warning. Groups
containing only horizontal requests retain Pill. Transparent Fragments participate in this check.
The group does not execute custom React components to discover their eventual children: if such an
indirect Button inherits an unnormalized Pill group, its Stacked request keeps the horizontal
fallback and warning rather than disagreeing with the group shape.

## Connected seams

The preset options have separate responsibilities:

- `groupDivider` draws `Button.e6` between direct Button roots;
- `disclosureDivider` draws the same `Button.e6` before a trailing disclosure when a label is
  present.

`e6` owns the line thickness, height, and color. Its ordinary element classes provide token-only
dimensions for a centered decorative overlay (`aria-hidden`), not a public `Separator` component.
Connected Button seams do not divide semantic groups. The line reserves no empty inline track;
neighboring surfaces overlap by the authored thickness so the short divider remains inside their
Hover, Pressed, or Selected area without leaving gaps above and below it. The existing
`e1.p.gd` projection exposes only that thickness utility to member roots for overlap and to frame
pieces for clipping the shared strip before a High-painted member. No value is copied into React
or structural Sass. Logical properties preserve the topology in RTL.

With a compatible divider recipe, the group paints one logical outer frame. The frame uses
`e1` border geometry, the effective group radius, and only the border colors from the group's base
Rest recipe, including independently authored sides. Intent, emphasis, theme, and surface context
still select the frame's appearance. Hover and Pressed do not recolor that border. Ordinary
Selected, Disabled, or Pending paint also preserves its base Rest recipe.

A selected member actually using the normal High projection through
`selectionEmphasis="medium|high"` suppresses only the frame segment over its own box. Rest-border
segments remain visible on its other neighbors and return when the member is deselected or no
longer uses the High projection. This is a local omission of the group frame, not a promotion of
the group's border colors to High. Missing High support keeps the ordinary Selected fallback and
its Rest frame segment.

Each internal `e6` divider is hidden whenever either adjoining member is selected, regardless of
`selectionEmphasis`, surface contrast, or availability of the High projection. Dividers between
unselected members remain visible and return when neither adjoining member is selected. Changing
selection emphasis alone never restores a divider. This changes painting only; divider geometry,
focus, selection indicators, and the label-to-disclosure divider are unchanged.

The Builder publishes `group.frame`, `group.member`, and `group.selectionRestMember` as class
projections in the ordinary Button class map. The frame references only border geometry and Rest
paint. Member projections exclude border paint while retaining their surfaces and interactions;
the stronger-selection projection keeps the normal High recipe without Selected deltas. A
Builder-emitted suppression class removes the members' border paint without changing their border
widths, compensated padding, or content geometry. These palette-aware projections are separate
from the scale-only `p` Registry and do not add a Schema element or public option.

The framed group uses intrinsic inline-grid columns while native Buttons remain direct children.
Decorative segments occupy those same columns in a separate top layer; they do not contribute
another width, padding, or height. Neighboring members overlap by one authored divider thickness,
applied only to the following member. Frame painting excludes the shared strip where the next
member uses the High projection, preventing a preceding Rest border from crossing that surface.
The frame pieces do not overlap their translucent strokes and require no JavaScript measurement.

Focus rings, selection indicators, and activation feedback remain owned by each Button. Frame
segments and dividers do not receive events, and the group never clips external painting. Local
clipping applies only to the decorative frame pieces. Active and focused Buttons retain their
layer priority below the independent divider. These pieces form one logical perimeter recipe,
not new interactive surfaces. Groups without the framed handoff retain their inline-flex layout.

When `groupDivider` or a complete frame/member/divider handoff is absent, the group preserves the
ordinary collapsed-border composition. An unsupported external intent may reuse the preset's
neutral divider paint; without either paint, the divider stays inactive. Standalone Buttons and
the label-to-disclosure divider retain their existing behavior.

The frame segments prevent translucent perimeter strokes from accumulating at joins. Overlapping
translucent member backgrounds can still accumulate color independently of that border fix; inspect
that result in the real composition rather than introducing runtime color compensation.

A disclosure-only Button, such as the secondary trigger of a split button, does not consume the
label-to-disclosure spacing authored for a labelled menu button. Its glyph keeps the full `e5`
viewport and is centered by the Button's own inline padding.

## Boundaries

The first version is horizontal and connected, without consumer-authored gaps. It does not define
Tabs, segmented selection, vertical grouping, arbitrary group-shadow levels, or a semantic toolbar.
Compound components such as `ButtonMenu` may reuse `Button.Group`, but their popup behavior and semantics
remain outside Button. Transparent React `Fragment` wrappers are flattened so their Buttons keep
the same direct-group topology; authored DOM wrappers remain real layout boundaries.
