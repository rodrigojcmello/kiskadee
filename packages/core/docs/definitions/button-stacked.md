# Button stacked geometry

Status: canonical Schema contract.

`Button.iconLayout = stacked` composes the existing icon and label vertically. Its optional
`e8`, `e9` and `e10` recipes replace the corresponding geometry and typography domains; they do
not introduce another component or change ownership of the Button's palettes and effects.

`e8.scales.borderRadius` admits only `rounded` and `square`. Both the exported type
`ButtonStackedRadiusMode` and Schema validation enforce that domain. Ordinary `e1` geometry and
the inside/outside indicator recipes retain their own radius domains.

The shared `resolveButtonStackedRadiusMode` function preserves Rounded and Square and maps Pill
to Rounded. Consumers first apply their documented radius precedence, then resolve the stacked
shape before checking authored capability. This rule selects an existing recipe; it does not
invent numeric radii or authorize borrowing horizontal `e1` geometry when a stacked recipe is
missing. The normalized shape must be used consistently by the control, its effects and its
indicator.

Web Builder publishes only complete Rounded/Square stacked recipes for the effective size.
The existing `sizesByRadius.pill` key remains empty for artifact compatibility; it never advertises
Pill support, including in the stacked indicator coverage. Horizontal capability is unchanged.

See [Button icon composition](../../../components/react/docs/definitions/button/icon-composition.md)
for Web rendering, content requirements, fallback and connected-group behavior, and
[composition strategies](../../../../docs/definitions/composition-strategies.md) for the shared
domain-substitution mechanism.
