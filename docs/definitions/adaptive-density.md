# Adaptive density and fixed component sizes

Status: accepted cross-project contract.

## Identity and proportions

Density selects proportions within a visual identity. It does not identify an operating system,
physical device, or input method. Apple's iOS/macOS relationship illustrates this separation but
is not the model every application must reproduce. A typical application has one visual identity
and chooses adaptive proportions or one fixed density without authoring another preset.

Core owns the grammar and public size vocabulary. Presets own size recipes and density mappings.
The Web Builder validates and lowers them into CSS and class references. React selects published
references. Showcase inspects the same production capability.

## Fixed sizes and authored density

Public components use `size`: `sm5`, `sm4`, `sm3`, `sm2`, `sm`, `md`, `lg`, `lg2`, `lg3`, `lg4`, `lg5`.
`sm2` is smaller than `sm`; `lg2` is larger than `lg`. A component only accepts its supported levels.
The previous public `scale` prop is removed without a compatibility alias. Internal schema keys
remain `s:sm:1`, `s:md:1`, and so on.

Medium is the required central reference, not an absolute physical dimension and not the automatic
default. Even a visually small component with one recipe uses `s:md:1`.

`global.density` declares one or two mappings, for example:

```ts
density: { compact: 's:sm:1', spacious: 's:md:1' }
```

`components.<name>.options.density` replaces the entire global map. One effective destination must
be `s:md:1`; all referenced sizes must exist in each supported structural variant. Invalid maps
fail the build. A single-density component can declare `{ spacious: 's:md:1' }`; no alternative
recipe is invented. Components without applicable size semantics do not consume density.

Fixed recipes cannot contain viewport overrides. A recipe includes geometry, matching internal
text metrics, icon geometry, radius and size-dependent optional effects. Density does not multiply
font metrics independently. Editorial Text profiles remain a separate channel. Fixed size means
independent of viewport width, not immune to browser zoom or user font enlargement.

## Selection and scope

Without an application choice, density is `adaptive`. Two available mappings select spacious below
the central breakpoint and compact at or above it. One mapping stays fixed. The initial central
threshold is `bp:lg:1` (1152 CSS px), calibrated centrally by Kiskadee rather than exposed as a
consumer option. DPR, pointer precision and operating system do not participate.

React hosts may set `KiskadeeContextValue.density`. `DensityProvider value="compact"` overrides it
for a subtree, including React portals. Precedence is explicit component `size`, nearest density
provider, application density, then `adaptive`. A component with only one available density keeps
its recipe even when its parent selects the other density.

The component resolves a size key and follows its normal class lookup. It does not receive an
injected prop, clone children, inspect the DOM, measure the viewport or subscribe to viewport
changes for density. A real application may configure one density permanently; this does not
require exposing a user-facing toggle or rebuilding its preset.

## Web artifacts and optimization

Existing per-element maps retain fixed keys such as `sm:1`, `md:1`, and `lg:1`. The Builder adds `a`
to applicable size maps, including opt-in radius/effect and structural projection maps. The same
selection governs the entire recipe without activating optional buckets unconditionally.

`global.kiskadee.json` publishes effective mappings once per component as
`density.<component> = { c: 'sm:1', s: 'md:1' }`. References are never duplicated per element.
A missing mapping while resources load resolves to the medium reference; it does not manufacture
unpublished density alternatives.

Adaptive lowering reuses identical utilities. Differing utilities receive aliases scoped to
mutually exclusive width media queries, preserving interaction selectors and existing CSS rule
contexts. Single-density mappings reuse fixed classes and require no additional adaptive CSS.
Do not create separate compact/spacious copies of the class map or a Builder inspection flag.
Compare raw, gzip and Brotli costs for CSS and JSON; distinguish the aggregate map distribution
from independently loaded component maps when reporting transfer size.

## Showcase and verification

The route panel exposes the preset default and available density choices. Its override applies to
`s-content`; administrative controls retain their own context. Route size selectors default to
following density and retain explicit fixed-size examples.

Verify viewport transitions at the central boundary, forced densities, single-density presets,
explicit-size precedence, portals, optional effects and preset-switch Wow transitions. Preserve
existing upstream geometry evidence; density mappings and the viewport policy are Kiskadee
adaptations, not claims of upstream operating-system detection.
