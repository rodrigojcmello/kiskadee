# Switch Cursor Policy

## Problem

The styled React Switch previously used `cursor: pointer` on the structural root. That matched a
common web convention for clickable labels, but it made the Switch behave more like a link than a
native control. Kiskadee should preserve visual affordance through state color, motion, focus, and
activation feedback instead of relying on a hand cursor.

Simply removing the root cursor would be fragile because `cursor` inherits. A Switch rendered inside
an ancestor with `cursor: pointer` could accidentally pick up the ancestor's affordance.

## Policy

Interactive Switch roots use `cursor: default`. This applies to both structural branches:

- static Switch branch `a`;
- motion Switch branch `b`.

Structural children keep `cursor: inherit` so the track, label, control text, and visual wrappers all
mirror the root cursor without duplicating policy across slots.

Disabled and read-only Switch states keep the existing `cursor: not-allowed` structural override.
Those states are non-interactive even though the native input is visually hidden, so the cursor state
has to be mirrored from the root to the rendered visual slots.

This policy is Switch-specific. Button, Tabs, links, and other controls should be reviewed in their
own tasks before changing their cursor behavior.
