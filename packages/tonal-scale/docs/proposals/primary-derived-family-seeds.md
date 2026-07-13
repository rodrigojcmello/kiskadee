# Primary-Derived Family Seeds

Status: deferred until fixed-reference harmony is visually approved.

## Context

The first Munsell system derived every companion seed from the exact primary.
It transferred sector-relative hue position, local or hue-global chroma use,
and lightness behavior before the harmony stage. This produced distinctive
systems for different brands, but it also changed two variables at once:

1. the source color entering each family;
2. the harmonizer adapting that source to the shared functional rest.

When a resulting Red, Yellow, or Purple looked wrong, the output did not reveal
which stage caused the problem.

## Current Decision

The runtime now uses `kiskadee-munsell-reference-v1`, a fixed source seed for
each required family. The primary remains exact and replaces only the reference
of its own resolved id. This creates a controlled baseline in which different
primary inputs exercise the same companion sources.

The primary-derived strategy is not rejected. Its projection helpers and
decision history remain available, but it is intentionally not selectable in
the UI and does not participate in current artifact generation.

## Re-entry Criteria

Reconsider dynamic family generation only after:

- varied primary inputs produce an approved fixed-reference harmony;
- emitted diagnostics prove the final family balance rather than a baseline
  prediction;
- failures can be attributed independently to reference generation or harmony;
- the fixed-reference result is preserved as a comparison baseline;
- a strategy/version change is explicitly documented before new artifacts are
  treated as stable.

When resumed, the dynamic strategy should be evaluated against the exact same
primary matrix and fixed-reference outputs. It must improve system identity
without weakening sector recognition, functional-rest coherence, or the frozen
low-level tonal-scale invariants.
