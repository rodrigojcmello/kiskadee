# Segment Color Model

In Kiskadee, the word `segment` appears in two related but distinct places. They
both follow a similar mental model, a `base` plus `overrides`, but they operate
at different levels and solve different problems.

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
