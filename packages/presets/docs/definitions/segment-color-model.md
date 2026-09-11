# Segment Color Model

In Kiskadee, the word `segment` appears in two related but distinct places. They
both follow a similar mental model, a `base` plus `overrides`, but they operate
at different levels and solve different problems.

## Shared Catalog and Identity

Status: accepted preset-authoring direction (KIS-106). The Layer 2 override
mechanism below already exists. Incremental segment generation and optional
primary-derived neutrals remain follow-up implementation work.

A preset owns one shared Layer 1 color catalog. Segments select entries through
Layer 2 mappings; they do not own separate source directories or copies of a
complete tonal palette. Materialized component palettes and builder artifacts
are derived representations, not duplicate authoring catalogs.

The Kiskadee tonal generator remains the generation source for new candidates.
Presets own the chosen inputs, identity, source evidence, and approval of those
candidates. Using official colors as inputs does not require adopting the
upstream design system's generator or all of its semantic roles.

### Simple and Complex Segments

These terms describe identity scope, not new Schema enums or a rigid count of
changed colors:

- **Simple:** products or services in the same family share most colors. The
  initial operation changes the primary while reusing the remaining assets.
  A deliberately selected different neutral is also possible.
- **Complex:** independent identities may choose several different families.
  Material for WhatsApp and Material for Spotify are illustrative identities:
  both may choose green, but need not share the same green or semantic colors.
  This example does not prescribe either company's actual palette.

A preset is not limited to the hue of its default segment. Independent
identities may share assets when appropriate; shared product families may
have exceptions. Neither case requires a separate catalog per segment.

### Reuse and Variant Safety

Adding a segment must preserve reused published assets, including their tone
values and functional references, rather than merely preserve their seeds.
Full multifamily generation can adjust companions relative to the primary;
rerunning that operation is not equivalent to reusing existing assets.

Add or select a variant for a new identity without overwriting one referenced
by other segments. A red primary must not replace the shared `redLike` asset.
Selecting a new tonal profile must not silently regenerate shared families.

For example, two service segments can use different primary variants while
sharing the same red, green, and neutral entries. A third segment can select a
new tinted neutral while the first two keep their existing neutral references.

### Neutral Identity and Representation

A neutral may be pure gray or tinted. Tint does not change its identity into a
chromatic family: a red-tinted neutral is conceptually another neutral variant
(`neutral.v3`, for example), not `red` or `redLike`.

That conceptual notation is not a new public reference syntax. Currently,
Core semantic variants are `v1` and `v2`, while primitive variants include
`v1` through `v4`. The tonal generator represents the pure-gray baseline as
`n.black.v1` and optional tinted neutrals as `n.black.v2` through `n.black.v4`.
A segment can map a supported neutral semantic variant to a different black
primitive variant. Any expansion of public semantic variants requires a
separate Core contract change; this decision does not introduce one.

The accepted neutral-origin choices are:

- reuse the configured neutral, either pure gray or an explicitly sourced tint;
- explicitly derive a tinted neutral from the selected primary.

Preserve the pure-gray baseline. A preset without a tinted neutral can use one
black family; a second family is optional. New derived neutrals enter the same
catalog as variants and must retain their origin and generation provenance.
The derivation option is pending KIS-108: current V5 recipes still require
independent explicit seeds and must not be silently reinterpreted.

### Independent Responsibilities

| Concern | Owner and meaning |
| --- | --- |
| Tonal profile | Tonal Scale defines the curve and invariants. It does not choose semantic identity. |
| Neutral origin | Presets select the identity/input mode; Tonal Scale implements deterministic generation and provenance. |
| Segment | Presets select catalog entries using Core's Layer 2 grammar. |
| Component use | Presets author intents, emphasis and states using those mappings. |
| Published Web view | Web Builder materializes the mappings without inventing color identity. |

These choices compose without transferring authority. See
[project governance](../../../../docs/definitions/project-governance.md),
[global color semantics](./global-color-semantics.md), and the generator's
[current tonal-system contract](../../../tonal-scale/docs/definitions/tonal-system.md).

## Delivery Boundaries

The follow-up deliveries are intentionally separate:

1. KIS-106 records this model without changing executable contracts or assets.
2. KIS-107 adds an experimental profile with more vivid physically light tones,
   preserving existing profiles; it does not automatically promote assets.
3. KIS-108 implements optional primary-derived neutrals with explicit provenance
   and compatibility rules.
4. KIS-109 prepares the Material candidate: blue primary (exact input still to
   select), fixed existing red `#ba1a1a`, pure gray and one blue-tinted neutral.
5. KIS-110 promotes the approved Material candidate and remaps consumers.
6. KIS-111 implements segment composition with stable reused assets. Fully
   automatic generation of independent complex identities is outside that step.

For the Material adaptation, strong and pale primary colors express different
emphasis levels of primary. Muted blue/gray support becomes neutral. The
secondary support role is absorbed by the tinted neutral; reproducing
`neutralVariant` does not require a third black family. This is the accepted
Kiskadee adaptation, not a claim about universal Material usage. It does not
impose Material surface/content roles on Kiskadee's `neutral` semantic.

The candidate uses the Kiskadee generator and a fixed red without per-segment
harmonization. Other inputs need explicit provenance; do not label a chosen
green as a canonical Material success color without evidence. Existing
published Material assets and mappings remain unchanged until candidate
approval and migration. Official source evidence belongs in the preset's
[design-system documentation](../design-systems/material-design-3-google/).

## Segment Overrides in Color Layer 2

Where: `schema.colors.globalSemantics` +
`schema.colors.globalSemanticsBySegment`

What it does: defines the identity/brand of a segment by overriding Layer 2
semantic mappings.

- `globalSemantics` is the baseline: per theme, it maps global semantic keys
  like `primary` and `neutral` to a `PrimitiveRole` (Layer 1), e.g.
  `primary -> primitive.blue.v1`.
- `globalSemanticsBySegment[segment].themes` is optional and only exists when a
  segment must override the baseline, e.g. `modern.primary ->
  primitive.purple.v1`.

Why it exists: lets a segment change what `primary` means globally, and
therefore affect every component intent that points to `primary`, without
rewriting component palettes.

Conceptually:

```ts
override = colors.globalSemanticsBySegment[segment].themes?.[theme]?.[semantic]
base = colors.globalSemantics[theme][semantic]
resolved = override ?? base
```

This is used by the `color()` resolver in `@kiskadee/core`, and it is also the
source of truth for segment discovery in builders/tooling. For Web, see
`@kiskadee/web-builder` documentation.

## Segment Composition When Authoring a Preset Schema

Where: preset `*.schema.ts` files (element `palettes`), via
`packages/presets/src/utils/buildBySegment.ts`

What it does: helps preset authors generate a `Schema` where `element.palettes`
contains an explicit object for each segment, such as `default`, `modern`, or
`dynamic`, without duplicating the entire palette or adding `if`/ternary
conditionals everywhere.

`buildBySegment` is an authoring utility:

- You provide a `base(segment)` palette generator: the default behavior of the
  element.
- You optionally provide a patch/override per segment for the few paths that
  differ.
- It produces a fully materialized `palettes` map for the Schema.

This does not change the public `Schema` contract. It only changes how the
preset code builds the final object.

## How They Work Together

They complement each other:

- Layer 2 segment overrides answer: What is `primary` in this segment?
- Schema palette composition answers: How does this element use `primary` in
  this segment?

For example, a `modern` segment can:

- Map `primary` to a purple primitive in Layer 2.
- Choose to consume it as `button.primary.gradient` in `boxColor` palettes for
  some elements.
