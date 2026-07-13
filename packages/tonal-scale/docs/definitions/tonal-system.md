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
3. Measure primary chroma against the maximum available anywhere along its
   hue, not only at the primary lightness.
4. Test whether the exact primary anchor offers enough cross-hue capacity for
   a vivid system. Balanced anchors keep the local projection; luminous vivid
   anchors use the hue-global projection described below.
5. Materialize concrete seeds for required families, Brown, canonical Black,
   and authored overrides.
6. Generate family baselines and establish one shared Light and one shared
   Dark functional `rest` position independently from every generated anchor.
7. Harmonize eligible seeds at those shared functional rest positions.
8. Compose the unchanged low-level scale generator and validate the complete
   atomic system.

The hue-global signature contains `C / peakC(hue)` and the signed lightness
displacement around `peakL(hue)`. When an exact primary lightness cannot carry
the other sectors, that displacement is projected around each target hue's own
chroma peak. If the projected lightness cannot emit the desired chroma, it
moves only as far as necessary toward that peak. This prevents a luminous
Yellow from creating pastel Red, Blue, and Purple seeds while preserving the
previous projection for already balanced primaries.

For vivid systems, harmonized candidates must first return to the permitted
hue-global balance interval of `0.6` through `1 / 0.6` relative to the primary
functional rest. This is a one-sided guard, not an equality target: candidates
already inside the interval retain the approved local-gamut behavior and bytes.
Brown applies its `0.6` normalization to both local and hue-global references.

Within that feasible interval, harmony targets remain hierarchical:

1. emitted OKL lightness;
2. relative chroma utilization within the target hue's sRGB gamut;
3. primary rest luminance and contrast behavior;
4. perceptual distance from the materialized seed.

Relative luminance is retained as a harmony metric and review signal, but it
does not define primitive color equivalence across hues. WCAG luminance weights
green much more heavily than red or blue; prioritizing exact luminance across
families can therefore desaturate otherwise valid companions. Functional
contrast remains enforced by the low-level theme guards, while the primitive
harmony ranking preserves perceptual lightness and chromatic character first.

Candidate ranking is a soft preference and cannot run before hard feasibility.
The finite coarse grid is traversed in ranked order until enough candidates
satisfy sector identity, safe-core generation, a valid scale, and the exact
shared rest anchor. Only those feasible candidates participate in final
selection. Exhausting an arbitrary top-N window is not evidence that a harmony
target is unreachable.

Functional-rest diagnostics are recalculated from the emitted `restColor` of
all ten v1 families after harmonization. Baseline projections are used only to
select a candidate position; they are never exported as evidence that the
final system is balanced.

Brown uses `0.6` of the base Orange chroma utilization while preserving the
same rest position and lightness/contrast priority. A light rest may therefore
appear tan; physically darker positions retain the Brown character. If Brown
is primary, its utilization is normalized by the same ratio before deriving
the base companion system.

`black.v1` defaults to `#20252b`, uses `source-exact` in both themes, and is not
derived from the primary. Achromatic chroma above `0.04` requires review and
above `0.08` fails.

## Generated Anchor And Functional Rest

`seedHex`, generated anchor, and functional rest are separate concepts:

- `seedHex` is the authored or derived source color;
- the generated anchor is where the low-level scale preserves or adapts that
  seed;
- functional rest is the shared slot read by component semantics.

All families use the same public functional rest positions. A source-exact
primary or support seed may occupy another generated anchor without changing
the shared rest. Rest may be any public chromatic slot from 1 through 99.
Twitter Blue `#1da1f2` remains exact at L24/D70, and those anchors remain its
functional rest because the complete system is already balanced there.

The automatic vividness guard applies only when the source uses at least `0.5`
of its hue-global chroma potential. An exact source anchor is preserved while
every v1 sector retains at least `0.55` of the primary normalized chroma. When
the system must move, the selected functional rest must:

- retain at least `0.7` of the source hue-global chroma signature;
- keep every v1 family between `0.6` and `1 / 0.6` of the primary rest
  utilization;
- be the nearest qualifying public slot by grid position.

For example, `#ffeb3b` remains exact at L5/D95 while its functional rest moves
to L22/D75. Locked positions remain authoritative, but an imbalance is
reported for review rather than hidden.

## Low-Level Invariants

The low-level 3:1 guards remain L35-L95 against white and D35-D95 against
black. They describe contrast properties and do not limit which slot may be
rest.

The full system preserves this invariant order:

1. absolute caps and canonical public grid;
2. exact primary generated anchors and locked functional rest positions;
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
`seedHex`, `seedOrigin`, policies, generated anchors, functional rest colors,
and complete Light and Dark tone maps. Cross-hue rest balance, classification,
clamps, harmony metrics, and scale diagnostics remain in the review-only
diagnostics file.

Verification regenerates the complete bundle and compares canonical JSON byte
for byte. Missing, extra, non-canonical, or modified files invalidate it
atomically.

## Versioning And External Boundary

Family variant, package version, artifact format, grid contract, harmony
contract, and tonal profile are independent version axes. The V2 format and
Munsell harmony contract do not alter the `kiskadee-tonal-v1` low-level grid or
the canonical Balanced barrier.

The `kiskadee-munsell-rest-v1` system has not yet crossed its explicit visual
approval and systemic-golden milestone. Corrections before that milestone
refine the draft V1 behavior. After the golden is approved, any byte-changing
harmony algorithm requires a new harmony contract or generator version.

This package produces Layer 1 artifacts only. It does not write presets,
external types, semantic aliases, or component state mappings. Those changes
require a separate approved plan after this generator is visually accepted.
