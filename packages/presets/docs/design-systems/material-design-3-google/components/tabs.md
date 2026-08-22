# Material Design 3 Google Tabs Evidence Note

The existing line and bridge Tab icon viewports remain `20px` at `s:sm:1` and `24px` at `s:md:1`.
They are now represented through `e4.iconSize` references into `global.iconSizes`; the authored
`4px` label gap remains in `e4.scales.marginRight`.

This is a Kiskadee schema ownership migration and does not change the existing Material geometry.
