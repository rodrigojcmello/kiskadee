# Kiskadee Primary-Derived Tonal System v2

Status: canonical package-level definition.

The tonal system generates a complete Layer 1 primitive color system from one
exact sRGB primary plus optional authored overrides. It composes the frozen
`generateKiskadeeScale` operation without changing its L/D grid, Balanced
outputs, profiles, contrast guards, or golden hashes defined in
[tonal-scale.md](./tonal-scale.md).

The family taxonomy and hue boundaries are defined in
[munsell-family-taxonomy.md](./munsell-family-taxonomy.md). Presets, Core,
semantic aliases, components, and preset migration remain outside this package.

## Required Family Set

Every valid system resolves ten Munsell `v1` sectors, Brown at
`yellow-red.v2`, and `black.v1`. The primary may occupy one of those ids or an
explicit additional `v2` through `v4` variant. Optional overrides may replace a
required seed or add further authored variants.

`black.*` is public Layer 1 terminology. Its internal color kind is
`achromatic`, never `neutral`. A black seed may be a warm, cool, or subtly
tinted gray, but it cannot be the chromatic primary reference.

The absolute caps remain part of every scale:

- Light uses L0 `#ffffff` and L100 `#000000`;
- Dark uses D0 `#000000` and D100 `#ffffff`.

## Input Contract

Draft format 2 contains:

- one exact primary seed, automatic or explicit variant, and Light/Dark policy;
- zero or more family overrides;
- one tonal profile (`balanced` or `muted-darks`);
- automatic or locked Light/Dark rest positions;
- `kiskadee-tonal-v1` grid and `kiskadee-munsell-rest-v1` harmony contracts.

Primary Light is always `source-exact`. Primary Dark may be `source-exact` or
`adaptive`. The primary sector is classified automatically; automatic
yellow-red variant selection distinguishes Orange v1 and Brown v2. Export
replaces the automatic identity with a locked family id.

Overrides are explicit and ordered semantically by id rather than input order.
Chromatic overrides may use `source-exact`, `adaptive`, or `harmonized` per
theme. `black.*` may use only `source-exact` or `adaptive`. Invalid ids,
duplicates, sector mismatches, Orange-like Brown overrides, unsupported
policies, and conflicting primary overrides fail explicitly.

Format 1 is not migrated silently. Former natural family names do not have a
unique mapping onto the Munsell family and variant model.

## Derivation And Harmony

Generation performs these deterministic stages:

1. Normalize and classify the exact primary.
2. Resolve its family variant and exact Light/Dark scales.
3. Establish one shared Light and one shared Dark `rest` position.
4. Extract center-relative sector displacement, luminance, contrast, OKL
   lightness, and available-gamut chroma utilization.
5. Project 40% of that signed displacement into every target Munsell sector so
   center maps to center while the primary signature remains bounded, clamping
   generated hues to the safe inner 70% when needed.
6. Materialize concrete seeds for required families, Brown, canonical Black,
   and authored overrides.
7. Harmonize eligible seeds at the shared rest positions.
8. Compose the unchanged low-level scale generator and validate the complete
   atomic system.

Harmony targets remain hierarchical:

1. primary rest luminance and contrast behavior;
2. emitted OKL lightness;
3. relative chroma utilization within the target hue's sRGB gamut;
4. perceptual distance from the materialized seed.

Brown uses `0.6` of the base Orange chroma utilization while preserving the
same rest position and lightness/contrast priority. A light rest may therefore
appear tan; physically darker positions retain the Brown character. If Brown
is primary, its utilization is normalized by the same ratio before deriving
the base companion system.

`black.v1` defaults to `#20252b`, uses `source-exact` in both themes, and is not
derived from the primary. Achromatic chroma above `0.04` requires review and
above `0.08` fails.

## Rest And Low-Level Invariants

All families use the same public rest positions. A source-exact support seed
may occupy another natural anchor, but its rest color is still read from the
shared position. Rest may be any public chromatic slot from 1 through 99. For
example, Twitter Blue `#1da1f2` resolves exactly to L24 and D70.

The low-level 3:1 guards remain L35-L95 against white and D35-D95 against
black. They describe contrast properties and do not limit which slot may be
rest.

The full system preserves this invariant order:

1. absolute caps and canonical public grid;
2. exact primary and locked rest positions;
3. per-theme policy;
4. Munsell sector identity and Brown/Black guards;
5. valid sRGB output;
6. strict theme-direction lightness monotonicity;
7. emitted uniqueness;
8. theme contrast guards;
9. emitted-curve continuity diagnostics.

A color at an sRGB gamut cusp may retain a small local chroma prominence that
cannot be removed without changing its effective seed. Harmony searches prefer
clean candidates and use a continuity-review candidate only when no clean
candidate satisfies the shared rest contract. When the low-level scale remains
valid, this is a review condition rather than a system failure. The diagnostics
expose the prominence and any unresolved continuity review; invalid caps,
anchors, monotonicity, uniqueness, contrast, or gamut output still fail
normally.

## Artifact Set

An export is one deterministic directory-shaped bundle:

```txt
tonal-system.source.json
tonal-system.json
tonal-system.diagnostics.json
colors/
  black.v1.json
  blue-green.v1.json
  blue.v1.json
  ...
  yellow-red.v1.json
  yellow-red.v2.json
  yellow.v1.json
```

The required system contains 12 color assets and 15 files total. Additional
authored variants add one color file each. All artifacts identify
`@kiskadee/tonal-scale@0.2.0`.

The locked source retains the primary id and seed, policies, overrides,
profile, rest positions, and contract identifiers. The manifest centralizes
asset hashes. Each color asset contains `sector`, `variant`, `colorKind`,
`seedHex`, `seedOrigin`, policies, anchors, rest colors, and complete Light and
Dark tone maps. Classification, clamps, harmony metrics, and scale diagnostics
remain in the review-only diagnostics file.

Verification regenerates the complete bundle and compares canonical JSON byte
for byte. Missing, extra, non-canonical, or modified files invalidate it
atomically.

## Versioning And External Boundary

Family variant, package version, artifact format, grid contract, harmony
contract, and tonal profile are independent version axes. The V2 format and
Munsell harmony contract do not alter the `kiskadee-tonal-v1` low-level grid or
the canonical Balanced barrier.

This package produces Layer 1 artifacts only. It does not write presets,
external types, semantic aliases, or component state mappings. Those changes
require a separate approved plan after this generator is visually accepted.
