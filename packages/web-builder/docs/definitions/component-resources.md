# Component-scoped runtime resources

Status: canonical Web Builder publication contract (format 2).

## Button indicator handoff

Button's optional `e11` (inside) and `e12` (outside) each publish complete geometry in `s`, `rr`,
`rp` and `rs`, and ordinary surface-context, intent and emphasis color buckets in `c`. Both use the
normal palette pipeline, including element-owned emphasis metadata and global utility
deduplication. The runtime selects one recipe for one rendered indicator. There is no
position-specific style-key or artifact branch. Selected-state references keep the host as
interaction owner; no new state selector is added.

The component metadata publishes `indicator.sizesByRadius`, with `rounded`, `pill` and `square`
arrays of compact supported sizes. A size requires baseline indicator width, height, both vertical
gaps, both horizontal safety insets, the selected radius and the root `e1` border-width token.
Scalars and `s:all` are supported. When the Button has only invariant geometry, its empty fixed-size
catalog still resolves to Medium through Core. Indicator coverage checks that effective `md:1`
without adding a fixed size to `sizeSupport` or publishing indicator-only sizes.
Breakpoint maps require `bp:all`. When stacked anatomy is present, `indicator.stackedSizesByRadius`
independently requires the actual stacked `e8` border-width token and complete stacked geometry
for that size and radius. Missing horizontal border geometry does not suppress valid stacked
support, and missing stacked geometry does not suppress horizontal support.

The same completeness checks apply independently to `e12`, published as `outsideSizesByRadius`
and optional `stackedOutsideSizesByRadius`. If only `e12` exists, `sizesByRadius` remains present
with empty arrays for compatibility and outside coverage remains available. If only `e11` exists,
outside coverage fields are absent. No support for one placement is inferred from the other.

Neither indicator recipe introduces a Button size. The metadata is absent when both recipes are
absent and stale previous metadata is removed on republishing. These are geometry capabilities; consumers
also require paint for the active palette coordinate in the selected element. Both recipes consume
the Button's ambient context with its actual intent and emphasis. Position changes the selected
recipe, without changing the context produced for the Button's independent descendants.

The style-emission policy makes both recipes' dimensions, all four margins and radius token-only.
Structural CSS consumes existing `--k-bxw`, `--k-bxh`, `--k-mgt`, `--k-mgb`, `--k-mgl`, `--k-mgr` and `--k-bdr`
variables. No raw offsets, reference heights, custom color buckets or alternate state activators
are published.
Nominal width remains a literal preset-authored scalar or size map. The Builder performs no
measurement or geometry-based derivation of that width.

`options.selectionEmphasis` publishes the authored `lowest`, `low`, `medium` or `high` default.
Omission stays omitted and the runtime uses `lowest`. Indicator activation is part of that scale;
there is no independent `indicatorScope`, and stale scope metadata is removed when republishing.
The scale does not change indicator geometry capability metadata.

`options.selectionIntent` publishes an optional system-intent default unchanged. Omission remains
omitted; the runtime resolves an explicit Button prop before this option and otherwise inherits
the Button's base intent. It is not a palette branch or a replacement for `selectionEmphasis`.

### Button selection paint projection

The Button class map may publish a component-specific `selectionRest` object alongside its ordinary
`eN` records. It references only existing classes and does not change Schema palettes, Style Keys,
Style Emission Policy, or Structural Utility Projection (`p`) semantics. It emits no additional CSS.

- Its optional `e1` through `e5` records contain only `c` and `e`, never geometry, decorations,
  control-state classes, authored values or inferred colors.
- `c` contains the ordinary High Rest/Hover/Focus/Pressed and terminal-state classes, excluding every
  Selected rule. The surfaced icon region `e4` retains its existing emphasis coordinates because it
  owns a separate surface rather than inheriting the Button's High paint.
- `e` contains the ordinary effect buckets with Selected-specific classes removed. Effect bucket
  names and size keys are identical to the ordinary class map.
- Core resources carry effect projections, while palette resources carry color projections. Both
  remain on the existing split-resource loading path; a combined map contains their merged values.
- Projected High color classes establish paint coverage for the exact intent and ambient surface
  context. Missing High is not synthesized from Selected-only classes or another palette coordinate.

The existing intent keys also support `selectionIntent`: consumers choose the effective selected
intent in these same maps and the ordinary element maps. No additional selected-intent bucket,
pair matrix or CSS is emitted. System-intent coverage fallback is whole-recipe, while external
brand requests preserve the existing strict resource-boundary rules.

Runtime consumers preserve semantic selection on the Button root, including the indicator's parent
state and connected-group stacking. For the two stronger selection levels, they select this paint
projection instead of attaching the ordinary Selected palette/effect classes. Old class maps remain
valid without the projection and cannot be treated as publishing High Rest selection support.

Foreground references continue to resolve only in `textColor`, except for indicator `boxColor`
inside the authorized Button `e11.palettes` and `e12.palettes` paths. Their foreground coordinates
resolve before normal palette conversion; no foreground token reaches CSS or runtime artifacts.

### Button connected-group paint projection

The Button class map may also publish `group.frame`, `group.member`, and
`group.selectionRestMember` for a connected group with a compatible divider. These are references
to the existing `e1` recipe, not new Schema elements, preset palettes, public options, or entries in
the scale-only Structural Utility Projection Registry.

- `frame` contains only border geometry, radius, and Rest border paint, including independent side
  colors. It excludes backgrounds and interaction-state deltas. The group resolves its base
  intent, emphasis, and surface context before applying it to decorative segments of one logical
  perimeter. React omits the segment over a selected member actually using the normal High
  projection; neighboring Rest segments remain visible and return locally after deselection.
- `member` retains ordinary surface and interaction paint while excluding every border-color
  property. A Builder-emitted transparent suppression class prevents default border painting
  without changing border widths or compensated padding.
- `selectionRestMember` provides the same border-free paint subset for the existing normal High
  selection projection, without Selected deltas. Semantic selection remains on each member.
  Members resolve these paint subsets with their effective selection intent; `frame` continues
  using the shared base Group intent.
- Core and palette portions use the existing split-resource merge path. Runtime consumes their
  classes directly; it must not split class strings, inspect CSS, infer colors, or measure member
  geometry to reconstruct the frame. Intrinsic grid columns align its non-overlapping pieces.

The existing `e1.p.gd` remains separate: the same authored `e6.boxWidth` utility is applied to member
roots for seam overlap and frame pieces for shared-strip clipping. The artifact owner remains `e1`
without another Registry entry. The line's own classes retain its dimensions and color. Missing a
complete frame/member/divider handoff preserves the ordinary collapsed-border composition. See
[connected groups](../../../components/react/docs/definitions/button/connected-groups.md) for
the painting, interaction, and clipping contract.

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
