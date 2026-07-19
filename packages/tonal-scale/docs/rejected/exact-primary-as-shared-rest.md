# Exact Primary As The Shared Rest

Status: rejected as a universal tonal-system invariant.

## Context

The first Munsell system treated the exact primary anchor as the shared Light
and Dark functional rest. This works for many middle-lightness colors and made
the primary input, generated anchor, harmony checkpoint, and component state
vivid reference identical.

Vivid luminous colors expose a physical limitation. `#ffeb3b`, for example,
is exact at L5/D95. sRGB can preserve strong Yellow chroma at that lightness,
but Red, Blue, Purple, and Red-Purple can emit only a small fraction of their
hue-global chroma potential there. Measuring utilization only against the
small local gamut incorrectly described those pastel companions as fully
chromatic.

## Rejected Invariant

The system cannot guarantee all four conditions for every sRGB primary:

1. the exact primary is the harmony rest;
2. every family shares the same harmony-rest slot;
3. every family also uses that slot as its generated vivid anchor and semantic
   vivid reference;
4. every family retains comparable chromatic character.

Keeping the first three conditions sacrifices the fourth for luminous Yellow,
Green-Yellow, vivid Orange, and related boundary cases. Assigning a special
rest per family would instead break the shared primitive-slot contract.

## Decision

Preserve the exact primary at its generated source anchor and test that anchor
first with the complete emitted v1 chromatic harmony. Select the shared
harmony rest independently only when the hue-global vividness guard still
proves, after that harmonized probe, that the source anchor cannot support all
ten emitted chromatic v1 sectors. Raw fixed-reference baselines may rank
fallback positions but cannot reject the anchor by themselves.

The exact primary's generated anchor is also its per-theme vivid reference,
whether or not the shared harmony rest had to move. Support families use the
shared harmony rest as their automatic vivid reference. Thus `#ffeb3b` may keep L5/D95 as
its exact primary vivid reference while the system compares support families
at L28/D65. This is not a special Yellow scale or a family-specific harmony
rest; it is an explicit distinction between authored identity, shared harmony,
and functional projection.

Companion families keep the shared harmony rest but are not forced to use it
as their generated vivid anchor. A `harmonized` companion receives a free
anchor at the natural peak lightness of its hue, targeting the primary's
hue-global vividness. Harmony is scored from the color that its completed scale
emits at the shared rest slot. This preserves semantic slot consistency and
allows, for example, a vivid Yellow to exist elsewhere in the same scale when
Orange `#ff6200` is the L24/D70 primary rest.

The exact-source balance guard uses `0.5`; moved fallback positions keep the
stricter `0.6` guard. The wider source ratio represents physical hue-gamut
limits at the primary's lightness, while diagnostics continue to expose full
local-gamut use and the lower hue-global rest ratio separately.

Vivid state offsets walk the existing public grid by ordinal index rather than by
adding to the numeric tone label. Their physical direction reverses between
Light and Dark, so the preview experiment does not define a preset mapping.
Preset and component-state integration remain explicitly deferred.

The low-level `generateKiskadeeScale` contract and emitted scale colors are
unchanged. The separation exists only in the multi-family system above it and
is represented by artifact fields `generatedAnchors`, `restColors`, and
per-theme `functionalReferences`. Format V4 additionally separates the vivid
and subtle functional pointers; neither pointer changes this rejected
shared-rest decision.
