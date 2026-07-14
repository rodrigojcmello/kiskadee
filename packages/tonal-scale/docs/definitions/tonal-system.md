# Kiskadee Tonal System v3

Status: canonical package-level definition.

The tonal system evaluates one exact sRGB primary against a fixed set of Layer
1 family references plus optional authored overrides. This controlled model
isolates harmony behavior from companion-color generation. It composes the
frozen `generateKiskadeeScale` operation without changing its L/D grid,
Balanced outputs, profiles, contrast guards, or golden hashes defined in
[tonal-scale.md](./tonal-scale.md).

The family taxonomy and hue boundaries are defined in
[munsell-family-taxonomy.md](./munsell-family-taxonomy.md). Presets, Core,
semantic aliases, components, and preset migration remain outside this package.

The multi-family system distinguishes three references that must not be
collapsed into one concept:

- the **generated anchor** is the technical slot where the low-level generator
  preserves or adapts the effective seed;
- the **harmony rest** is the shared Light or Dark checkpoint used to compare
  all families in one system;
- the **state anchor** is the per-family, per-theme starting slot from which an
  eventual semantic state projection may be derived.

Existing runtime and artifact fields named `rest`, `restColor`,
`functionalRest`, or `tonalAnchors.rest` represent the harmony-rest checkpoint.
They no longer imply that every family must use that slot as its component
state reference.

## Required Family Set

Every valid system resolves one `v1` appearance for each of the ten Munsell
sectors, the additional Brown appearance at `yr.brown.v1`, and Black at
`n.black.v1`. The primary may occupy one of those ids or an explicit additional
`v2` through `v4` variant. Optional overrides may replace a required seed or
add further authored variants of an existing appearance.

`n.black.*` is public Layer 1 terminology. Its internal color kind is
`achromatic`, never `neutral`. A black seed may be a warm, cool, or subtly
tinted gray, but it cannot be the chromatic primary reference.

The absolute caps remain part of every scale:

- Light uses L0 `#ffffff` and L100 `#000000`;
- Dark uses D0 `#000000` and D100 `#ffffff`.

## Input Contract

Draft format 3 contains:

- one exact primary seed, automatic or explicit natural appearance, explicit
  `v1` through `v4` variant, and Light/Dark policy;
- zero or more family overrides;
- one tonal profile (`balanced` or `muted-darks`);
- automatic or locked Light/Dark rest positions;
- `kiskadee-tonal-v1` grid and `kiskadee-munsell-rest-v1` harmony contracts.

Primary Light is always `source-exact`. Primary Dark may be `source-exact` or
`adaptive`. The primary sector is classified automatically; automatic
Yellow-Red appearance selection distinguishes `yr.orange.v1` and
`yr.brown.v1`. Export replaces the automatic appearance with a locked family
id.

Overrides are explicit and ordered semantically by id rather than input order.
Chromatic overrides may use `source-exact`, `adaptive`, or `harmonized` per
theme. `n.black.*` may use only `source-exact` or `adaptive`. Invalid ids,
duplicates, sector mismatches, Orange-like Brown overrides, unsupported
policies, and conflicting primary overrides fail explicitly.

Formats 1 and 2 are not migrated silently. Format 2 encoded Brown as a sector
variant and used complete sector names as public ids; neither meaning is
compatible with the format 3 sector, appearance, and variant axes.

## Fixed Reference Set

The active seed model is `fixed-reference`, backed by
`kiskadee-munsell-reference-v1`:

| Family | Reference seed |
| --- | --- |
| `r.red.v1` | `#d13438` |
| `yr.orange.v1` | `#ca5010` |
| `yr.brown.v1` | `#8e562e` |
| `y.yellow.v1` | `#ffb900` |
| `gy.lime.v1` | `#7fba00` |
| `g.green.v1` | `#107c10` |
| `bg.teal.v1` | `#038387` |
| `b.blue.v1` | `#0f6cbd` |
| `pb.indigo.v1` | `#4f6bed` |
| `p.purple.v1` | `#8764b8` |
| `rp.magenta.v1` | `#e3008c` |
| `n.black.v1` | `#20252b` |

The primary replaces only the reference whose resolved family id it occupies.
All other required families start from the same bytes for every primary.
Overrides remain possible but intentionally leave the controlled baseline.
Chromatic fixed references use `seedOrigin: reference`; Black retains its
existing `canonical` origin. They are not described as primary-derived or
silently clamped to the safe generation region. Sector identity remains
mandatory.

## Derivation And Harmony

Generation performs these deterministic stages:

1. Normalize and classify the exact primary.
2. Resolve its natural appearance, family variant, and exact Light/Dark scales.
3. Measure primary chroma against the maximum available anywhere along its
   hue, not only at the primary lightness. The measurement comes from the
   effective primary anchor, never from an incidental chroma overshoot in a
   neighboring scale slot, so automatic proposals and their locked replay use
   the same signature.
4. Materialize the fixed references, replacing only the primary family and any
   explicit overrides.
5. Generate family baselines to rank fallback Light and Dark harmony-rest
   positions.
6. Test the exact primary anchor first with the complete emitted chromatic v1
   harmony. A harmonized companion receives a free vivid anchor at the natural
   peak lightness of its hue, while its emitted color at the shared slot is
   scored against the primary `rest` behavior.
7. Keep the primary anchor as harmony rest when every v1 family satisfies the
   source-anchor balance guard; otherwise repeat the same separation at the
   nearest qualifying fallback position.
8. Compose the unchanged low-level scale generator and validate the complete
   atomic system.

The hue-global signature contains `C / peakC(hue)`. It has two separate uses:

- at each harmonized companion's free anchor, it transfers the primary's
  normalized vividness to the target hue;
- at the shared functional slot, it evaluates emitted rest balance without
  pretending that every hue has the same physical gamut at that lightness.

It does not generate the source colors of companion families. The
primary-derived seed strategy is preserved as a deferred proposal and stays
outside the active runtime while harmony is calibrated.

Light chromatic primaries can expose a separate sRGB limitation. At a very
light exact anchor, equal local-gamut utilization may leave green and yellow
recognizable while blue, purple, red, and yellow-red collapse toward gray. A
low-vivid primary therefore receives one opportunistic hue-global probe at its
exact source anchor when all of the following are true:

- the primary uses less than `0.5` of its hue-global chroma potential;
- its OKL chroma is at least `0.02`, so the hue remains a confident reference;
- the local baseline falls outside the source-anchor balance interval after a
  `0.005` quantization tolerance.

The probe is accepted only when every emitted chromatic v1 companion keeps at
least `0.025` OKL chroma and the family ratios remain between `0.495` and
`1 / 0.495`. It never moves the shared rest away from the exact primary
anchor. If any family cannot satisfy the complete probe, generation falls back
atomically to the prior local-gamut result; it does not select a cap-adjacent
rest merely because chroma ratios converge near white or black. Locked replay
repeats the same probe when its rest equals the source anchor.

For example, Blue-Green `#b2dfdb` remains exact at L9/D90. The accepted probe
keeps its Blue, Purple, Red, and Yellow-Red companions visibly pastel rather
than gray while preserving the already approved behavior of vivid primaries
and of low-vivid primaries whose local harmony is already balanced.

For vivid systems, a moved fallback must keep the emitted v1 family set inside
the hue-global balance interval of `0.6` through `1 / 0.6` relative to the
primary functional rest. The exact primary anchor has the special
source-preservation interval of `0.5` through `1 / 0.5`. These are one-sided
guards, not equality targets: candidates already inside the applicable interval
retain the approved local-gamut behavior and bytes. The source interval is
intentionally wider because some hues are physically limited at another hue's
exact rest lightness. For example, Purple-Blue reaches about `0.533` of the
primary hue-global rest utilization at Orange `#ff6200`'s L24 rest while still
using its complete local gamut there. Diagnostics retain both measurements so
the physical limitation is visible rather than reclassified as desaturation.
Brown applies its `0.6` normalization to both local and hue-global references.
A Brown primary is expanded to the shared Orange-equivalent signature exactly
once before companion targets are resolved; the ratio is not applied again by
the free-anchor search.

Within that feasible interval, harmony has two related target groups. The free
anchor first preserves chromatic identity:

1. natural hue-peak lightness;
2. primary-equivalent hue-global chroma utilization;
3. sector identity and safe sRGB gamut.

The emitted shared rest is then ranked hierarchically:

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
satisfy sector identity, safe-core generation, a valid scale, preservation of
the selected vivid anchor, and emission at the exact shared rest slot. A
harmonized candidate is not required to place its anchor at `rest`. Only those
feasible candidates participate in final selection. Exhausting an arbitrary
top-N window is not evidence that a harmony target is unreachable.

Functional-rest diagnostics are recalculated from the emitted `restColor` of
all ten v1 families after harmonization. Raw baseline projections may rank a
fallback, but they cannot reject the exact source anchor. That decision uses a
complete harmonized anchor probe and therefore measures the same emitted colors
that would enter the final system. Vivid-anchor diagnostics are calculated
separately from each generated anchor. Baselines are never exported as evidence
that the final system is balanced or that its companion peaks are equivalent.

At its free vivid anchor, Brown targets `0.6` of the base Orange hue-global
chroma utilization. Its emitted color keeps the same shared rest position and
the same rest lightness/contrast priority. A light rest may therefore appear
tan; physically darker positions retain the Brown character. If Brown is
primary, the harmony reference normalizes its utilization by the same ratio
before comparing it with the fixed companion set.

`n.black.v1` uses the fixed reference `#20252b`, remains `source-exact` in both
themes, and does not participate in chromatic harmony. Achromatic chroma above
`0.04` requires review and above `0.08` fails.

## Generated Anchor, Harmony Rest, And State Anchor

`seedHex`, generated anchor, harmony rest, and state anchor are separate
concepts:

- `seedHex` is the primary, fixed-reference, or authored source color;
- the generated anchor is where the low-level scale preserves or adapts the
  effective seed; for a harmonized companion it is free to occupy the natural
  peak lightness of that hue;
- harmony rest is the shared slot used to compare emitted companion colors and
  validate cross-family balance;
- state anchor is the family/theme reference intended for experiments with
  semantic interaction states.

All families use the same public harmony-rest positions, but they do not need
to share generated anchor or state-anchor positions. Harmony rest may be any
public chromatic slot from 1 through 99. In automatic mode, the exact primary
anchor is always the first candidate for the shared harmony rest. It becomes
harmony rest when the complete emitted v1 harmony satisfies the source-anchor
guard. When that probe fails, the primary itself is never moved or rewritten:
only the shared checkpoint moves. Harmonized companions preserve a
primary-equivalent vivid peak at their own hue's natural lightness, then expose
the color emitted by that scale at the shared harmony-rest slot.

State-anchor resolution is intentionally simple and deterministic:

- the primary family uses its generated anchor in each theme;
- every support family uses the shared harmony rest in each theme.

Consequently, Yellow `#ffeb3b` remains exact and uses L5/D95 as its primary
state anchor even when its system's shared harmony rest is L28/D65. Companion
families in that system continue to use L28/D65 as their state anchors. This
does not create family-specific harmony-rest slots; it separates the technical
checkpoint from the position that represents the family's authored primary
identity.

For example, Orange `#ff6200` remains exact and becomes the shared L24/D70
harmony rest: its raw fixed-reference baselines are imbalanced, but the emitted
harmonized chromatic v1 set passes the `0.5` source-anchor guard. Red and Yellow
may place their generated vivid anchors at different tones while still
emitting their harmonized colors at L24/D70. Twitter Blue `#1da1f2` likewise
keeps its exact L24/D70 anchors as harmony rest and primary state anchor.

The automatic vividness guard applies only when the source uses at least `0.5`
of its hue-global chroma potential. An exact source anchor is preserved while
every emitted v1 sector retains at least `0.5` of the primary normalized
chroma. When the harmonized source-anchor probe proves that the system must
move, the selected harmony rest must:

- retain at least `0.7` of the source hue-global chroma signature;
- keep every v1 family between `0.6` and `1 / 0.6` of the primary rest
  utilization;
- be the nearest qualifying public slot by grid position.

For example, `#ffeb3b` remains exact at L5/D95 while the harmonized
source-anchor probe confirms that harmony rest must move to L28/D65. Locked
positions remain authoritative, but an imbalance is reported for review rather
than hidden. The `0.5` source-anchor interval remains attached to an exact
rest/anchor match after export locks an automatic proposal, so replay preserves
the original diagnostics; locked positions away from the anchor use the `0.6`
fallback interval.

The free vivid-anchor behavior applies only to `harmonized` themes.
`source-exact` continues to preserve the authored seed at its generated anchor,
and `adaptive` retains its existing policy behavior. Neither this separation
nor the source/fallback balance ratios change `generateKiskadeeScale`; they are
multi-family orchestration rules above the frozen low-level generator.

### Ordinal State Projection

The package may preview interaction states by applying an integer offset to the
state anchor's index in the canonical public grid. The offset is ordinal, not
arithmetic: from L28, `+1` resolves to L30; from L55, `+1` resolves to L60.
Offsets that leave the chromatic range return no color instead of silently
clamping to an absolute cap.

The same sign does not have the same physical-lightness meaning in both
themes. Increasing the slot index makes a Light color physically darker and a
Dark color physically lighter. A future semantic mapping may therefore choose
different offset signs for Light and Dark. The current Rest/Hover/Pressed/Focus
display is an experiment for evaluating slot distance, DeltaE, and contrast;
it is not yet a preset or component-state contract.

State projection selects colors that already exist in the emitted scale. It
does not recolor a slot, regenerate a family, or change any low-level
`generateKiskadeeScale` output.

## Low-Level Invariants

The low-level 3:1 guards remain L35-L95 against white and D35-D95 against
black. They describe contrast properties and do not limit which slot may be
rest.

The full system preserves this invariant order:

1. absolute caps and canonical public grid;
2. exact primary and authored generated anchors plus locked harmony-rest
   positions;
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

Candidate ranking always prefers solutions that satisfy both the harmony score
and hue-drift hard ceilings before applying soft perceptual preferences. The
hard ceiling remains an error only when the complete finite search has no
hard-feasible candidate; a slightly better soft score cannot discard a valid
fallback.

## Artifact Set

An export is one deterministic directory-shaped bundle:

```txt
tonal-system.source.json
tonal-system.json
tonal-system.diagnostics.json
colors/
  b.blue.v1.json
  bg.teal.v1.json
  n.black.v1.json
  ...
  y.yellow.v1.json
  yr.brown.v1.json
  yr.orange.v1.json
```

The required system contains 12 color assets and 15 files total. Additional
authored variants add one color file each. All artifacts identify
`@kiskadee/tonal-scale@0.3.0`.

The locked source retains the primary id and seed, policies, overrides,
profile, rest positions, and contract identifiers. The manifest centralizes
asset hashes. Each color asset contains `munsellSector`, `appearance`,
`variant`, `colorKind`, `seedHex`, `seedOrigin`, policies, generated anchors,
harmony-rest colors,
per-theme `stateReferences`, and complete Light and Dark tone maps. A state
reference records its tone, hex, and whether it came from `generated-anchor` or
`harmony-rest`. The diagnostics identify the
`fixed-reference` seed model and `kiskadee-munsell-reference-v1` set alongside
cross-hue balance, classification, harmony metrics, and scale diagnostics.

Verification regenerates the complete bundle and compares canonical JSON byte
for byte. Missing, extra, non-canonical, or modified files invalidate it
atomically.

## Versioning And External Boundary

Family variant, package version, artifact format, grid contract, harmony
contract, and tonal profile are independent version axes. The V3 format and
Munsell harmony contract do not alter the `kiskadee-tonal-v1` low-level grid or
the canonical Balanced barrier.

The `kiskadee-munsell-rest-v1` system has not yet crossed its explicit visual
approval and systemic-golden milestone. Corrections before that milestone
refine the draft V1 behavior. After the golden is approved, any byte-changing
harmony algorithm requires a new harmony contract or generator version.

This package produces Layer 1 artifacts only. It does not write presets,
external types, semantic aliases, or component state mappings. In particular,
exporting a state anchor does not authorize a preset to adopt the experimental
state offsets. Preset integration and the definitive Light/Dark mapping require
a separate approved plan after this generator is visually accepted.
