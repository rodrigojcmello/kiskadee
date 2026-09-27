# TextField Focus Indicator

The optional `e6` element is a bottom indicator. It is not owned exclusively by the Underline
mode: a preset may use it as a resting field boundary, an interaction indicator, or both.
The field keeps the same variant and mode when its indicator changes appearance.

## Ownership

- Schema owns whether `e6` exists, its resting thickness, and its state colors.
- Runtime renders the indicator when authored and keeps its DOM stable across interaction states.
  Absence of `e6` means no bottom indicator; it is not synthesized from the mode name.
- Structural CSS owns alignment, rounded clipping, and application of the global focus width.
- Existing focus projection and global/component focus color selection remain authoritative.
  The bottom indicator is an alternate presentation of focus, not an independent focus system.

## Current Standard Compositions

Outline and Borderless with `e6` retain their schema-authored shell contour width/color during
highlighted focus and delegate the enlarged focus treatment to the indicator. Without `e6`,
their existing whole-outline focus treatment remains available. Underline uses its bottom lane.
The indicator expands inward on highlighted focus or native pressing; pressing excludes disabled
and read-only roots. Palette terminal states still govern indicator color.

A transparent resting contour can reserve its width for a later validation contour. Likewise,
a transparent resting indicator can become visible on interaction without a mode change or DOM
insertion. Borderless describes the habitual shell appearance, not a prohibition on validation
or focus affordances.

Floating modes retain their existing structural focus treatment. Optional element rendering does
not by itself imply that every branch implements the same bottom-focus geometry.
