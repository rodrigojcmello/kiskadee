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

For Outline/Borderless with an indicator, the contour is inset inside the sized shell. The indicator
shares that bottom edge and shell radius, so the painted contour does not add to the control height.

## Native Outline border with bottom indicator

Outline shells with e6 use a single native border box, with e3 borderBottomColor overriding
its bottom color. No pseudo-element paints the contour. Shells without e6 retain their
existing outline treatment. Fluent compensates its Outline padding by the authored 1px
border on each side, preserving control height and input alignment. The absolute e6 insets
compensate that border to retain its outer-shell position. e6 remains visible at Rest and
retains its existing Focus/Pressed thickness and color. Visual acceptance remains user-owned.

## Indicator transitions

Standard Outline, Underline and Borderless animate e6 block-size and its painted background
using the shared interaction duration and ease-out tokens. Outline/Borderless paint resides
on ::before and receives its own background-color transition. Base-state declarations animate
both focus entry and exit. Reduced motion disables these transitions; global no-transitions
continues to take precedence. Schema state colors and thickness rules are unchanged.

## Terminal visual intent

Follow the [Core intent contract](../../../../../core/docs/definitions/text-field-intents.md).
React selects neutral classes for disabled/read-only fields before resolving element palettes.
Consumer validation status remains unchanged in Headless, including aria-invalid and messages.
Restoring editability restores the requested intent without rewriting consumer state.
