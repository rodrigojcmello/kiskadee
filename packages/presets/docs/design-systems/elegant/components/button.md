# Elegant Button Shadow Recipe

Status: **Kiskadee extension**. Elegant is an opinionated Kiskadee preset; this optional recipe
does not claim an upstream Apple or Fluent Button appearance.

Button references the existing global outer small/medium levels for Rest/Hover and removes
elevation for Pressed, Pending and Disabled. Small is `0 1 3 0` with black at 18%; medium is
`0 3 8 0` with black at 20%. The existing global geometry and colors are unchanged. This replaces
the local Fluent-like geometry with a smaller elevation appropriate to a compact action.

The recipe is shared across Elegant's published Button appearances. Focus and Selected add no
shadow delta; Hover plus Focus keeps Hover elevation with the independent external focus ring.
Pending removal is an intentional terminal-state adaptation rather than an inferred source token.
