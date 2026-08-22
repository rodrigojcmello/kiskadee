# Fluent 2 Microsoft Switch Evidence Note

The current Switch source-derived geometry remains unchanged. Its optional `e6` icon viewport is
`10px` at `s:md:1`; the schema now represents that exact measurement through `e6.iconSize`
referencing `global.iconSizes.s:sm:3`.

This is a Kiskadee ownership migration from local `boxWidth`/`boxHeight` values to the global icon
size profile. It introduces no new Fluent visual claim.
