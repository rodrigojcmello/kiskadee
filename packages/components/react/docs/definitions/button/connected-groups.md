# Connected Button groups

`Button.Group` composes independent Buttons into one horizontal connected surface. It owns visual
topology only: the wrapper does not add a role, selection model, keyboard model, or shared action.

## Shared visual contract

The group is authoritative for `scale`, `radius`, `emphasis`, `intent`, and `surfaceContext`.
Every descendant Button inherits those values. Conflicting child values are ignored with a
development warning; action props, state, content, focus, and activation feedback remain local to
each Button.

Individual `shadow` and `radiusEffect` requests are suppressed inside a connected group. When the
group enables `shadow`, its wrapper reuses the compiled Rest shadow bucket from `Button.e1` and
does not opt into Hover, Pressed, or Focus shadow selectors.

## Connected seams

The preset options have separate responsibilities:

- `groupDivider` draws `Button.e6` between direct Button roots;
- `disclosureDivider` draws the same `Button.e6` before a trailing disclosure when a label is
  present.

`e6` owns only the line thickness, height, and color. Structural CSS centers the line without
adding margin, padding, or layout width. The node is decorative (`aria-hidden`) and is not the
public `Separator` component because connected Button seams do not divide semantic groups.

When `groupDivider` is absent, connected borders overlap into one seam. When it is enabled, the
internal Button borders are removed, their compensated padding is restored, and `e6` becomes the
authoritative paint. An unsupported external intent may reuse the preset's neutral divider paint;
if neither the requested nor neutral paint exists in the active surface context, the divider stays
inactive and the authored border seam is preserved. Logical border and radius properties preserve
the same topology in RTL.

Focus rings and activation feedback remain owned by each Button, and the group never clips focus
painting. Without `e6`, Hover temporarily owns the overlapped authored border. With `e6`, the line
is the authoritative boundary and remains above every Button surface in Rest, Hover, Pressed, and
Focus. Its zero-width node preserves layout geometry while its paint stays visible over the seam.

A disclosure-only Button, such as the secondary trigger of a split button, does not consume the
label-to-disclosure spacing authored for a labelled menu button. Its glyph keeps the full `e5`
viewport and is centered by the Button's own inline padding.

## Boundaries

The first version is horizontal, connected, and gapless. It does not define Tabs, segmented
selection, vertical grouping, arbitrary group-shadow levels, or a semantic toolbar. Compound
components such as `ButtonMenu` may reuse `Button.Group`, but their popup behavior and semantics
remain outside Button. Transparent React `Fragment` wrappers are flattened so their Buttons keep
the same direct-group topology; authored DOM wrappers remain real layout boundaries.
