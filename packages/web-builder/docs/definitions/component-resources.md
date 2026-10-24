# Component-scoped runtime resources

Status: canonical Web Builder publication contract (format 2).

## Ownership and publication

Core defines size support and the Medium fallback. Presets author recipes. Web Builder resolves
and publishes support and resources; React selects the active recipe and coordinates readiness.
Showcase is a consumer, including its inspection metadata and environmental density control.

`manifest.json` contains identity, a content revision, segments/themes, global stylesheet references,
and a component index pointing to `components/<name>.kiskadee.json`. It does not embed component
states or size catalogs. Generated TypeScript registration contains availability only.

`global.kiskadee.json` contains shared foundations and the global density map. Component options,
effects and density overrides belong in component metadata. The Text typography class map belongs
to Text metadata. Resolved authoring catalogs are not a reason to send the entire Schema to a page.

A component metadata artifact carries:

- `component`, `sizeSupport` (separate variant/mode branches), and an optional density override;
- its existing semantic options/effects and inspection capabilities;
- core class-map path and stable stylesheet dependencies;
- per-palette descriptor paths. Each selected descriptor contains its class-map path, inspection
  metadata, surface-context/canonical-surface configuration and stylesheet dependencies.

Class maps retain only generated class references. Size fallbacks do not copy Medium recipes into
Small/Large. Palette-specific capabilities are loaded for the selected palette, not every palette.
The revision includes metadata, class maps and CSS references, independently of the preset version.

### Optional authored inspection values

Button may publish its authored reference heights under
`inspection.elements.e1.scales._boxHeight` for ordinary geometry and
`inspection.elements.e8.scales._boxHeight` for stacked geometry. Each optional field uses Core's
`ElementHeightReference`: either one number or the authored map of fixed size keys to numbers.
A number stays a number; publication does not synthesize an `s:all` entry or missing size keys.
The references are independent: neither element nor size is filled from the other layout.
The complete `inspection` branch is omitted when neither supported Button element has a reference.

This value is an inspection annotation, not a rendered scale. Web Builder separates `_boxHeight`
explicitly before style-key conversion, compensation, class/CSS generation, density recipe
validation and size-capability discovery. It cannot create a supported Button size, token or
utility. Other underscore-prefixed fields are not implicitly ignored or accepted. Core remains
responsible for allowed ownership and value validation; extraction does not mutate the schema.
Existing component metadata without `inspection` remains valid and requires no fallback value.

### Optional stacked Button anatomy

`Button.options.iconLayout` can select `stacked`; presets without the optional `e8`, `e9` and `e10`
elements remain valid. Selecting stacked by default requires the complete trio. Its generated class
maps use the existing element buckets without another artifact, variant, mode or projection.

- `e8` publishes the complete alternate root scale recipe: padding, border width and radius. Its
  border and radius emission mirrors `e1`, and padding uses the same border compensation. Consumers
  replace the root's scale and radius classes rather than merging conflicting ordinary geometry.
- `e9` publishes the complete alternate label typography and a direct `marginTop` for the distance
  below the icon. Consumers replace both ordinary label decorations and scales because typography
  compilation can place invariant font family and weight in the decoration bucket.
- `e10` publishes the alternate catalog-backed icon viewport as dimension tokens. It does not
  inherit ordinary inline spacing or the line-height fitting projection.

The ordinary `e1`, `e2` and `e3` retain paint and effect ownership. The new geometry elements do not
publish independent palettes or effects.

The component metadata publishes `layouts.stacked.sizes` with compact fixed-size keys such as
`md:1`. This list intersects every required root inset and border width, at least one authored
radius mode, label typography and top margin, and the icon-size reference. Scalars and `s:all`
assignments cover all fixed sizes; fixed-size maps cover only their own entries, and responsive
assignments need `bp:all`. The list is limited to the component's existing size support and ignores
`_boxHeight`. The trio's absence omits `layouts`; a present trio with no complete common size
publishes an empty list. Republication removes stale layout metadata.

New publication also supplies `layouts.stacked.sizesByRadius`, with `rounded`, `pill` and `square`
lists in that order. Each list requires the same complete geometry, typography and icon recipe,
plus a baseline value for that specific radius. The existing `sizes` list remains their union.
An explicit square radius of zero is supported; an absent radius or a responsive assignment
without `bp:all` is not. A class bucket for a responsive-only radius is insufficient because its
CSS might apply only at a larger breakpoint.

Runtime uses the effective radius (explicit or inherited/default) to select the radius-specific
list, together with generated classes, before activating stacked.
A nonempty `s.all` or `s[size]` bucket alone is insufficient because it might contain only a border
or margin. Consumers do not synthesize missing dimensions or borrow ordinary `e1` radius classes.
Older metadata without `sizesByRadius` remains valid, but consumers retain the horizontal layout
until compatible layout capabilities are regenerated. Absence of optional stacked anatomy continues
to omit `layouts`; publication with no complete size supplies empty lists for all three radii.

## CSS partitioning and order

Generated selectors and class names are preserved. Rules are assigned to their exact component
consumer set, so a shared rule is downloaded once by all its consumers. No general shared bundle
collects unrelated component rules. Media/supports ancestry and keyframe dependencies remain intact.
Component-independent rules remain global; palette globals are selected with their palette.

Each stylesheet reference includes its path, SHA-256 and original order. Compatible runs with the
same consumers are combined only if crossing intervening declarations cannot change the cascade.
Conflicting runs stay separate. Specificity and mutually exclusive recipe selections are considered
by build-only analysis; consumers do not parse or regenerate CSS. Thus minimizing request count never takes precedence over preserving
appearance. Loaders sort styles by the published order, not request completion order.

Aggregate class maps, CSS and the raw Schema are build-only intermediate/inspection outputs under
`_debug/`. Showcase synchronization excludes that directory. They are not fallback URLs for runtime.
Optional Brand Packs use the same partitioning, with their namespace and per-resource integrity,
behind the existing explicit BrandPackBoundary (build contract version 2).

## Loading, retry and SSR

Hosts load component metadata, selected class maps and stylesheet dependencies before reporting the
component ready. JSON requests are deduplicated by URL/content revision; styles by URL/integrity.
Repeated instances share resources. Rejected requests are evicted for retry; `pending`, `absent`
and `error` are distinct. Pending metadata is never treated as a one-size recipe.

Public React component resource boundaries delay first paint until the component handoff is ready,
without adding a layout wrapper. The host prepares resources for mounted consumers, including active Brand Pack boundaries, before
committing a selection change. Component and pack caches include the artifact revision. Unmounted components are not preloaded on subsequent selection changes. Late
responses for a superseded selection must not reactivate its styles.

SSR hosts may provide component metadata and class maps through `componentArtifacts` and
`classesMap`; they must include the matching ordered stylesheets in the document head. Client loaders
use the same paths and revision and recognize existing loaded links with matching integrity.
Brand Pack SSR preload is also checked for stylesheet readiness before client disclosure; metadata
alone does not establish that its CSS loaded.

## Validation

Exercise actual source/consumer handoffs, not only filename conventions: sparse sizes, variant/mode
support, absent Medium diagnostics, invariant values, retry, stylesheet gating, preload, navigation,
preset/segment/theme changes and the cascade. A synthetic catalog of 2,000 components with 15
consumers must request only those 15 component metadata/maps/styles and shared dependencies, plus
the small global index/foundations. Report local compressed sizes separately from observed transfer.

## Measured sample (2026-09-14)

Local file sizes, summed after compressing each response separately. The sample requests Button,
Card, Switch and Text in `default.light`. The previous aggregate sample includes manifest, global,
core/palette maps and core/palette/effects CSS. Token CSS is unchanged and excluded from both totals.
These are potential cold-cache requests and compressed file sizes, not a captured HTTP transfer;
headers, HTTP compression configuration and already cached shared resources are not included.

| Preset | Raw before / after | Gzip before / after | Brotli before / after | Files before / after |
| --- | ---: | ---: | ---: | ---: |
| material-design-3-google | 463313 / 85881 | 24466 / 22590 | 16839 / 18383 | 7 / 99 |
| fluent-2-microsoft | 221613 / 70217 | 15987 / 21113 | 12068 / 17143 | 7 / 101 |
| ios-27-apple | 192582 / 66806 | 14063 / 19313 | 10298 / 15566 | 7 / 87 |

The component boundary sharply reduces raw parsing/metadata work and bounds growth to the consumed
components. It increases cold-cache request count and can cost more compressed bytes for today's
small presets; this change does not claim a universal network-speed improvement. Shared rule
consumer sets and cascade constraints determine the remaining files. Repeated instances and later
routes reuse them. The 2,000-component test verifies that unrelated component payloads are excluded.

The Material manifest is approximately 1.6 KB raw and its global metadata approximately 1.8 KB;
component states, palette configuration, options and sizes are no longer embedded in those globals.

## Consumer validation

The production Showcase build passed from an isolated source copy, keeping the development server
active. React runtime/declaration builds and the Swift package build passed. Android compilation
could not run because no JDK is installed. React/Showcase tests passed 371 cases, with two existing
failures in the unchanged background-scenario expectation and structural fallback debt register.
Focused producer, fallback, resource/SSR and Brand Pack tests passed separately.

Browser checks covered desktop and 390 px adaptive density, manual density retained from Switch
to Card, Light/Dark changes, the enabled Card density control, and absence of new console errors.
The synthetic loader requested metadata/maps for 15 of 2,000 components, with repeated instances
sharing the same request and no aggregate resource request.

Showcase runtime imports now use component subpaths and the resources entrypoint. The consumer
bundle fixture reports 17 bytes of Text structural CSS through `/text`, versus 67,888 bytes through
the compatible root entrypoint; the resources entrypoint emits no component CSS. This is separate
from the preset-artifact transfer measurements above. Root exports remain available for compatibility.

### Stable stylesheet activation

Selection preparation must not reactivate resources already committed by the provider.
New stylesheets receive their cascade position once, while staged; existing common
stylesheets remain attached in the same position across segment and theme changes.
Activation updates only changed media states. Repeated component reads must not reorder
all stylesheet links: doing so interrupts browser color transitions even when React
preserves the component DOM. Newly mounted consumers activate only their ready resources.
