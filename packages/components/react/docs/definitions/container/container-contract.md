# Container Contract

`Container` is a public passive `div` for a continuous themed surface. It forwards its ref and
ordinary HTML `div` attributes, and accepts `children`, `className`, `intent`, `emphasis`, and
`surfaceContext`. Its default selection is `neutral.medium`. It has no Headless behavior, focus,
keyboard contract, padding, corner radius, border, or shadow.

The component loads its generated Container artifact and applies the class for its Rest surface.
It consumes the explicit `surfaceContext` or the inherited context, then publishes the resulting
context to descendants. A transparent surface can publish `inherit`. A missing preset recipe is
unsupported; Container does not substitute a literal color or another emphasis.

Container's Schema owns the canonical surface catalog. The Web Builder also keeps a resolved
copy in the Card artifact for existing Card/Showcase consumers; this does not alter Container's
authorship or require Card to load Container at runtime.

Container may fill a page, section, or a region inside a Card. A Container within a static Card
represents a second surface, not an implementation detail of Card. The Card remains a single
`div`, and `CardAction` remains a single native `button`. The shared context-resolution hook is
private to the React implementation; it is not a third public component.

`neutralComplementary` and `primaryComplementary` are optional intents for companion regions.
Their emphasis is the recommended base pairing, not a restriction on ancestry. Layout and inner
spacing belong to the consumer composition. For a full-width internal band, use the static
Card's `flushContent` option and provide spacing inside the Container.

See the [cross-package surface decision](../../../../../../docs/definitions/container-and-card-surfaces.md)
and [Card contract](../card/card-contract.md).
