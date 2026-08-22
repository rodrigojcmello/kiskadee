# iOS 27 Apple Switch Evidence Note

The existing optional Switch icon ramp remains `8`, `10`, `12`, `16`, and `20` pixels across the
authored component scales. Each value is now referenced through `e6.iconSize` and
`global.iconSizes`; local icon `boxWidth` and `boxHeight` declarations were removed.

This schema representation change preserves the current geometry and does not add new iOS 27
source evidence.
