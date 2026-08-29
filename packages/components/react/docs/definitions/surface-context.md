# Surface Context

Status: canonical p-react definition.

`SurfaceContextProvider` transports only the semantic values `onSubtle` and `onVivid`. It does not
transport colors, tokens, class maps, or preset data.

`useSurfaceContext(explicitSurfaceContext)` resolves an explicit prop first, then the nearest
Provider, then the `onSubtle` portability default. Components that create a new descendant surface
resolve their serialized `contentSurfaceContext` map and publish the result with a Provider.

Output precedence is `disabled > pending > selected > rest`. Missing state output inherits Rest;
missing map branches and explicit `inherit` preserve the consumed context. Runtime resolution does
not invent an `onSubtle` color fallback when the active preset lacks `onVivid` classes.

Button and Chip publish their authored descendant surface. Card publishes its canonical content
surface. Dropdown and BottomSheet reset their portaled surfaces to `onSubtle` so trigger ancestry
does not leak into the overlay.

`Button.Badge` routes context by placement. Inline placements remain inside Button's produced
surface. External placements republish the surface consumed by Button because their Badge renders
outside that produced surface. An explicit `surfaceContext` on Badge still wins over either
Provider; the relation never detects color, luminance, or DOM paint.

See the cross-package [Badge and Chip contract](../../../../../docs/definitions/badge-chip-contract.md).
