# Segment Color Model

Status: accepted shared-recipe authoring model, updated 2026-09-13.

## Recipe base, semantic primary and identity

A base recipe owns one harmonization reference (its generation primary). A simple segment
selects a different generated family as its semantic primary without changing that reference.
Seeds alone do not guarantee reuse: the complete scales and functional references must stay equal.

- **Simple segment:** shares a base recipe and catalog. It can select another primary and that
  entry's associated neutral. Shared semantic colors remain the same assets.
- **Complex segment:** may use an independent recipe and palette. Independence does not itself
  guarantee good contrast or internal coherence; each palette still requires validation.

These are authoring concepts, not new Core Schema enums. Segment count is not the definition.

## Directories and catalogs

Color directories represent independent base palettes. The main palette lives in
`colors/default/`. Simple segments of that family share this directory and their Layer 1 assets;
`purple` need not have a `colors/purple/` directory. A future independent palette may have its own
folder. Folder names do not implicitly select semantic roles or reset globally referenced IDs.

This supersedes the earlier ban on directories and the suggestion of a complete recipe per simple
segment. Reuse is by imports and explicit Layer 2 mapping, never by copies of shared assets.

## Stable variants, names and neutrals

Primitive variants are positive numbered IDs (`v1`, `v2`, ...), not limited to four. Existing
`dynamic` support remains. Semantic variants remain `v1` and `v2`. IDs are stable; names are
optional internal metadata and do not affect color generation. Removing/reordering entries does
not renumber other entries.

Additional colors belong to the shared recipe catalog. They follow the base reference but do not
recalibrate the base or each other. A name such as "Spotify green" does not replace the existing
`greenLike` family. Selecting a segment does not trigger color generation.

Each explicit chromatic entry may opt into an associated neutral. The association records its own
neutral ID, origin entry and Subtle/Chromatic offset strategy. Derivation follows the source
entry's resolved Light harmony-rest HEX, after that entry is generated. Neutrals never feed back
into the base. Red-tinted neutral is still a neutral primitive, not a red family. Canonical pure
gray `n.black.v1` remains immutable and shared.

Deleting an entry must explicitly remove its associated neutral; missing origins and ID collisions
are errors. One atomic export contains source metadata, every scale and association, diagnostics
and preset-ready assets with hashes and deterministic replay.

## Responsibilities

Tonal Scale owns generation and serialization. Core owns the public primitive/semantic grammar.
Presets own recipe inputs, source evidence, approvals, directories and segment mappings. Web Builder
publishes those mappings; Showcase consumes them. No directory or metadata name reauthors color
semantics at runtime.

The initial migration is Material: `default` and `purple` share `colors/default/`, with existing
`dynamic` behavior preserved. Other presets are not reorganized by this migration.

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


## Published segment order

Web Builder publishes default first, then preserves the remaining declaration order. Showcase
consumes that published order; Headless Select does not sort segment identities. This order also
makes first-segment fallback select default. Source registries remain authored by Presets.

## Identity variants do not replace semantic colors

Family identity and semantic purpose are separate. For example, red.v1 can remain
the shared destructive color while red.v2 is a product segment's primary. That
segment may still use red.v1 for destructive actions. Adding or selecting red.v2
does not redefine destructive red for this or any other segment.

Fluent keeps the automatic pb.indigo.v1 catalog entry and adds Teams as
pb.indigo.v2. Its existing p.purple.v1 remains the novelty color. Core currently
addresses the Teams asset as primitive.purple.v2; this is an explicit schema
mapping, not a change to the generator's family identifier. All belong to one
base recipe; variants have independent semantic uses, not independent generation
references. Only explicit Layer 2 mappings change a segment's roles.
