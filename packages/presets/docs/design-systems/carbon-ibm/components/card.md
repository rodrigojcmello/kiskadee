# Carbon Card / Tile Evidence

## Sources

- [Preview Tile guidelines](https://preview.carbondesignsystem.com/building-blocks/core/components/tile/guidelines).
- [Preview color overview](https://preview.carbondesignsystem.com/building-blocks/foundations/color/overview).
- [Figma Tile page](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=404-0).

## Observed official behavior

Tile uses square geometry, 16px interior spacing and theme-relative `layer` tokens.
The recommended border feature flag adds a 1px `border-tile` contour to interactive tiles.
Hover/Active/Selected use separate layer tokens. Layering alternates White/G10 in light themes
and progressively lightens G90/G100 surfaces.

## Coverage and adaptations

**Official adapted:** neutral background/layer/accent surfaces, hover/pressed/selected tokens,
1px contours, square geometry and 16px padding. A single Card border option generalizes the interactive
Tile treatment; no Tile-specific API is introduced.

**Kiskadee extension:** five emphasis names, primary tinted surfaces, vivid brand canvas,
optional rounding and shadows. Light neutral lowest = White, low = subtle - 3 (near-white intermediate),
medium = layer-01 (Gray 10), high = layer-accent-01 (Gray 20). The high surface is the upstream accent
layer promoted to a static emphasis; it is not presented as a new Carbon Tile type.
Dark/Darker lowest = background, low/medium/high = layers 01/02/03. Primary low/medium/high use
subtle offsets -2/0/+2; their interaction deltas use the same family. Primary highest uses
background-brand with Primary Button hover/active tokens; Selected uses the fixed Blue 70
link-secondary Light source to preserve a distinct one-step darkening on all three themes.

All non-vivid surfaces publish `onSubtle` to descendants; Primary highest publishes `onVivid`
and Disabled returns `onSubtle`. Both surrounding contexts are authored independently from that
outgoing context. Canonical surfaces expose each declared Rest layer in a stable order.

## Color and token provenance

Exact neutral/brand coordinates are in [token mapping](../colors/token-mapping.json).
All exact lookups use `source.tokens`; tinted families use functional references; transparency
and white boundary overlays use physical caps. Selected borders use `border-interactive`.

Neutral Rest borders follow the surface layer: Light lowest/low/medium use `border-tile-01`,
and high uses `border-tile-02` with the accent surface. Dark/Darker lowest/low use
`border-tile-01`, medium uses `border-tile-02`, and high uses `border-tile-03`. The mapping
applies in both surrounding contexts; it does not introduce automatic nested-layer selection.

## Deferred capabilities

Automatic cyclical layer providers, Tile expand behavior, tile-specific grids and persistent
selection machinery are outside this preset-only update. Existing Card/CardAction capabilities
remain the delivery boundary. Colored text on the highest G90 layers follows upstream token
limitations; the preset does not add runtime contrast inference.

## Validation

Canonical context declarations and generated Card artifacts are checked with the shared contracts.
Integrated visual validation is recorded in the preset source evidence.
