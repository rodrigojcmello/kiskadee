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
`sm2` is smaller than `sm`; `lg2` is larger than `lg`. An unsupported requested level resolves to Medium before selecting the recipe.
The previous public `scale` prop is removed without a compatibility alias. Internal schema keys
remain `s:sm:1`, `s:md:1`, and so on.

Medium is the required central reference, not an absolute physical dimension and not the automatic
default. Even a visually small component with one recipe uses `s:md:1`.

`global.density` declares one, two, or three mappings, for example:

```ts
density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' }
```

`components.<name>.options.density` replaces the entire global map. One effective destination must
be `s:md:1`. Requested sizes are resolved against the active variant/mode support; an absent
size uses Medium. A sized recipe without Medium fails validation. A single-density component can declare `{ regular: 's:md:1' }`; no alternative
recipe is invented. Components without applicable size semantics do not consume density.

Fixed recipes cannot contain viewport overrides. A recipe includes geometry, matching internal
text metrics, icon geometry, radius and size-dependent optional effects. Density does not multiply
font metrics independently. Editorial Text profiles remain a separate channel. Fixed size means
independent of viewport width, not immune to browser zoom or user font enlargement.

## Selection and scope

Without an application choice, density is `adaptive`. With regular authored, viewport widths below
`bp:md:2` (768 CSS px) select spacious, widths from 768 to below `bp:lg:1` (1152 CSS px)
select regular, and widths at or above 1152 select compact. A missing outer branch uses regular.
Legacy compact/spacious maps without regular retain their single 1152 px transition.
A single mapping must be regular and stays fixed. At least one destination must be md; regular
is not otherwise required to reference md. DPR, pointer precision and operating system do not
participate. Explicit unavailable density selection falls back to regular, then compact, then spacious.

React hosts may set `KiskadeeContextValue.density`. `DensityProvider value="compact"` overrides it
for a subtree, including React portals. Precedence is explicit component `size`, nearest density
provider, application density, then `adaptive`. A component with only one size keeps its recipe even when its parent selects another density.
Invariant elements may author scalar/common values once; no duplicate size recipes are required.

The component resolves a size key and follows its normal class lookup. It does not receive an
injected prop, clone children, inspect the DOM, measure the viewport for adaptive CSS. Effects that depend on the effective size may observe the same published
breakpoints; they must use the resolved size (including Medium fallback). A real application may configure one density permanently; this does not
require exposing a user-facing toggle or rebuilding its preset.

## Web artifacts and optimization

Existing per-element maps retain fixed keys such as `sm:1`, `md:1`, and `lg:1`. The Builder adds `a`
to applicable size maps, including opt-in radius/effect and structural projection maps. The same
selection governs the entire recipe without activating optional buckets unconditionally.

`global.kiskadee.json` publishes the global map once as `density = { c, r, s }`.
Component metadata publishes only local overrides and sparse size support by variant/mode.
Fixed and adaptive selection use the same Core fallback for the whole recipe, including radius,
typography, icon geometry and optional effects. An unavailable requested size uses `md:1`;
no Small/Large recipe is generated as a copy. Pending metadata is not evidence of size support.

See [component resources](../../packages/web-builder/docs/definitions/component-resources.md)
for the JSON/CSS loading and readiness contract.

Adaptive lowering reuses identical utilities. Differing utilities receive aliases scoped to
mutually exclusive width media queries, preserving interaction selectors and existing CSS rule
contexts. Single-density mappings reuse fixed classes and require no additional adaptive CSS.
Do not create separate compact/spacious copies of the class map or a Builder inspection flag.
Compare raw, gzip and Brotli costs for CSS and JSON; distinguish the aggregate map distribution
from independently loaded component maps when reporting transfer size.

## Showcase and verification

The persistent header selects density from the preset global map, independently of the current
component/route. Mobile = spacious, Tablet = regular, Desktop = compact. Unsupported global options
remain visible and disabled. Adaptive is implicit; a manual choice reveals a reset icon.
The manual choice follows navigation during the session; changing preset preserves it only when
that preset allows it. The selection applies to `s-content`; administrative controls retain their
own context. Route size selectors default to following density and retain explicit fixed examples.
Card need not expose size props to allow environmental density for its descendants.

Verify viewport transitions at the central boundary, forced densities, single-density presets,
explicit-size precedence, portals, optional effects and preset-switch Wow transitions. Preserve
existing upstream geometry evidence; density mappings and the viewport policy are Kiskadee
adaptations, not claims of upstream operating-system detection.
