# Exact Primary As The Shared Rest

Status: rejected as a universal tonal-system invariant.

## Context

The first Munsell system treated the exact primary anchor as the shared Light
and Dark functional rest. This works for many middle-lightness colors and made
the primary input, generated anchor, and component rest color identical.

Vivid luminous colors expose a physical limitation. `#ffeb3b`, for example,
is exact at L5/D95. sRGB can preserve strong Yellow chroma at that lightness,
but Red, Blue, Purple, and Red-Purple can emit only a small fraction of their
hue-global chroma potential there. Measuring utilization only against the
small local gamut incorrectly described those pastel companions as fully
chromatic.

## Rejected Invariant

The system cannot guarantee all three conditions for every sRGB primary:

1. the exact primary is the functional rest;
2. every family shares the same rest slot;
3. every family retains comparable chromatic character.

Keeping the first two conditions sacrifices the third for luminous Yellow,
Green-Yellow, and related boundary cases. Assigning a special rest per family
would instead break the shared primitive-slot contract.

## Decision

Preserve the exact primary at its generated source anchor and select the shared
functional rest independently when a hue-global vividness guard proves that
the source anchor cannot support the complete family. The generated anchor and
functional rest remain identical for already balanced systems.

The low-level `generateKiskadeeScale` contract is unchanged. The separation
exists only in the multi-family system above it and is represented by the
existing artifact fields `generatedAnchors` and `restColors`.
