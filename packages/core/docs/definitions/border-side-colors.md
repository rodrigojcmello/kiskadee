# Border side colors

`borderColor` remains the uniform border palette. `borderTopColor`, `borderRightColor`,
`borderBottomColor`, and `borderLeftColor` are optional physical-side overrides with
identical segment, theme, context, intent, emphasis and interaction-state grammar.
Button e1 explicitly supports these channels. Other component allowlists are unchanged.
They accept solid colors and contour references; Web gradients remain background-only.

An omitted side uses the uniform border. Omitted states introduce no delta. State-specific
uniform borders may replace a Rest side; when both properties occur at the same state
precedence and specificity, the side wins. Authors should explicitly retain or reset a
side in such states if required. Removing the side class restores the uniform border.

The Web Builder emits `border-color` once and individual longhands only when authored.
It orders side declarations after uniform declarations within equal state precedence;
HTML class order is irrelevant. Side declarations currently use direct CSS emission,
independent of the uniform border token/mirroring policy. No new runtime color props or
structural color decisions are introduced.
