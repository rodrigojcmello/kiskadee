# Kiskadee Tonal System v5

Status: canonical package-level definition.

The tonal system evaluates one exact sRGB primary against a fixed set of Layer
1 chromatic family references, one immutable pure-gray Black, and optional
authored chromatic or tinted-neutral variants. This controlled model isolates
harmony behavior from companion-color generation. It composes the frozen
`generateKiskadeeScale` operation without changing its L/D grid, Balanced
outputs, profiles, contrast guards, or golden hashes defined in
[tonal-scale.md](./tonal-scale.md).

The family taxonomy and hue boundaries are defined in
[munsell-family-taxonomy.md](./munsell-family-taxonomy.md). Presets, Core,
semantic aliases, components, and preset migration remain outside this package.

The multi-family system distinguishes four references that must not be
collapsed into one concept:

- the **generated anchor** is the technical slot where the low-level generator
  preserves or adapts the effective seed;
- the **harmony rest** is the shared Light or Dark checkpoint used to compare
  all families in one system;
- the **vivid reference** is the per-family, per-theme starting slot for
  strong chromatic actions;
- the **subtle reference** is the per-family, per-theme starting slot for
  surface-adjacent chromatic actions.

Existing runtime and artifact fields named `rest`, `restColor`,
`functionalRest`, or `tonalAnchors.rest` represent the harmony-rest checkpoint.
They no longer imply that every family must use that slot as either functional
reference.

## Required Family Set

Every valid system resolves one `v1` appearance for each of the ten Munsell
sectors, the additional Brown appearance at `yr.brown.v1`, and the immutable
pure-gray family at `n.black.v1`. The primary may occupy one chromatic id or an
explicit additional `v2` through `v4` chromatic variant. Optional overrides may
replace a required chromatic seed or add further authored variants of an
existing chromatic appearance.

`n.black.*` is public Layer 1 terminology. Its internal color kind is
`achromatic`, never `neutral`. The variants have deliberately different
contracts:

- `n.black.v1` is the package-owned pure-gray baseline. It has zero chroma,
  cannot be replaced by an override, and cannot be the primary;
- `n.black.v2` through `n.black.v4` are optional authored neutral variants.
  Each variant owns one explicit `seedHex` and its own emitted chroma
  trajectory. They are not derived from `n.black.v1`, from the Primary, or from
  one another.

The absolute caps remain part of every scale:

- Light uses L0 `#ffffff` and L100 `#000000`;
- Dark uses D0 `#000000` and D100 `#ffffff`.

## Input Contract

Format 5 contains:

- one exact primary seed, automatic or explicit natural appearance, explicit
  `v1` through `v4` variant, and Light/Dark policy;
- zero or more chromatic overrides or explicit `n.black.v2` through
  `n.black.v4` neutral variants;
- one tonal profile (`balanced` or `muted-darks`);
- automatic or locked Light/Dark rest positions;
- sparse per-family Light/Dark vivid and subtle reference rules;
- `kiskadee-tonal-v1` grid and `kiskadee-munsell-rest-v1` harmony contracts.

Primary Light is always `source-exact`. Primary Dark may be `source-exact` or
`adaptive`. The primary sector is classified automatically; automatic
Yellow-Red appearance selection distinguishes `yr.orange.v1` and
`yr.brown.v1`. Export replaces the automatic appearance with a locked family
id.

Overrides are explicit and ordered semantically by id rather than input order.
Chromatic overrides may use `source-exact`, `adaptive`, or `harmonized` per
theme. Authored `n.black.v2` through `n.black.v4` variants may use only
`source-exact` or `adaptive`. They require their own explicit seed and never
inherit one from another. `n.black.v1` rejects overrides and policies because
its pure-gray bytes are package-owned. Invalid ids, duplicates, sector
mismatches, Orange-like Brown overrides, unsupported policies, and conflicting
primary overrides fail explicitly.

The three policies have distinct responsibilities:

- `source-exact` requires the authored seed to remain byte-exact at its
  generated anchor;
- `adaptive` treats the authored seed as the family identity and may move the
  effective seed to the shared harmony-rest position, but does not actively
  match the Primary fingerprint;
- `harmonized` treats the authored seed as a hue/identity reference and may
  change its effective lightness and chroma to align the emitted family with
  the Primary fingerprint.

These policy meanings are independent from the `muted-darks` tonal profile.
The Primary-relative guard introduced in generator `0.4.1` remains active in
`0.5.0`: it applies a hue-independent chroma ceiling to Dark `adaptive` and
Dark `harmonized` chromatic support families. The guard participates in
candidate selection, only reduces chroma, and evaluates the public D40 through
D70 functional range. Within that guarded range, a replacement candidate may
not increase chroma over the baseline at equivalent physical lightness. It
does not modify Light, either Primary theme, Dark `source-exact`, or
`n.black.*`. Its candidate status and visual-approval boundary are documented in
[dark-theme-chroma-moderation.md](../technical-debt/dark-theme-chroma-moderation.md).

Formats 1 through 4 are not migrated silently. Format 2 encoded Brown as a
sector variant and used complete sector names as public ids. Format 3 exposed
one ambiguous state anchor instead of the distinct vivid and subtle functional
references. Format 4 allowed the canonical Black to be tinted and did not
distinguish an immutable pure-gray baseline from authored neutral variants.
Those meanings are not compatible with format 5.

## Fixed Reference Set

The active seed model is `fixed-reference`, backed by
`kiskadee-munsell-reference-v2`:

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
| `n.black.v1` | `#000000` |

The primary replaces only the reference whose resolved family id it occupies.
All other required families start from the same bytes for every primary.
Overrides remain possible but intentionally leave the controlled baseline.
Chromatic fixed references use `seedOrigin: reference`; the immutable
`n.black.v1` uses `seedOrigin: canonical`. Optional `n.black.v2` through
`n.black.v4` use their own authored seeds and do not change the fixed reference
set. None of these references is described as primary-derived or silently
clamped to the safe generation region. Sector identity remains mandatory for
chromatic families.

## Derivation And Harmony

Generation performs these deterministic stages:

1. Normalize and classify the exact primary.
2. Resolve its natural appearance, family variant, and exact Light/Dark scales.
3. Measure primary chroma against the maximum available anywhere along its
   hue, not only at the primary lightness. The measurement comes from the
   effective primary anchor, never from an incidental chroma overshoot in a
   neighboring scale slot, so automatic proposals and their locked replay use
   the same signature.
4. Materialize the fixed chromatic references and immutable pure-gray Black,
   replacing only the primary chromatic family and explicit authored
   variants.
5. Generate family baselines to rank fallback Light and Dark harmony-rest
   positions.
6. Test the exact primary anchor first with the complete emitted chromatic v1
   harmony. A harmonized companion receives a free generated anchor at the natural
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
the selected generated anchor, and emission at the exact shared rest slot. A
harmonized candidate is not required to place its anchor at `rest`. Only those
feasible candidates participate in final selection. Exhausting an arbitrary
top-N window is not evidence that a harmony target is unreachable.

Functional-rest diagnostics are recalculated from the emitted `restColor` of
all ten v1 families after harmonization. Raw baseline projections may rank a
fallback, but they cannot reject the exact source anchor. That decision uses a
complete harmonized anchor probe and therefore measures the same emitted colors
that would enter the final system. Generated-anchor diagnostics are calculated
separately from each generated anchor. Baselines are never exported as evidence
that the final system is balanced or that its companion peaks are equivalent.

At its free generated anchor, Brown targets `0.6` of the base Orange hue-global
chroma utilization. Its emitted color keeps the same shared rest position and
the same rest lightness/contrast priority. A light rest may therefore appear
tan; physically darker positions retain the Brown character. If Brown is
primary, the harmony reference normalizes its utilization by the same ratio
before comparing it with the fixed companion set.

## Pure Gray And Seeded Neutral Variants

`n.black.v1` is the immutable pure-gray baseline. Its canonical reference is
`#000000`, every emitted non-cap position remains achromatic, and neither a
recipe nor a preset may tint or replace it. It does not participate in
chromatic harmony. This gives every system one stable gray axis whose meaning
does not depend on a brand seed or Design System source.

`n.black.v2` through `n.black.v4` are independent authored neutral variants.
Each id requires its own explicit `seedHex`. A variant does not inherit the
seed, hue, chroma, policy, or trajectory of another Black variant. These
families exist for warm, cool, or otherwise subtly tinted neutral ramps while
keeping `n.black.v1` genuinely gray.

A seeded neutral variant composes the canonical theme lightness geometry with
a neutral-specific chroma trajectory,
`kiskadee-tinted-achromatic-chroma-v1`. For every non-cap, non-anchor color,
the full-strength requested chroma is:

```txt
distanceToCap = min(OKL lightness, 100 - OKL lightness)
envelope = clamp(distanceToCap / 5, 0, 1) ^ 0.7
requestedChroma = effectiveSeedChroma * envelope
requestedHue = effectiveSeedHue
```

The resulting curve tapers only inside five OKL lightness units of either
absolute cap and otherwise holds the seed-derived chroma plateau. The exported
implementation parameters are:

```txt
contract: kiskadee-tinted-achromatic-chroma-v1
capTaperLightness: 5
capTaperGamma: 0.7
restoreScanSteps: 64
restoreBisectionSteps: 16
restoreRefinementPasses: 2
```

The invariants are:

- the effective seed defines the emitted hue and the plateau-like chroma
  target for that variant;
- target lightness remains unchanged. The trajectory preserves the authored
  seed hue instead of inheriting incidental near-achromatic hue drift from the
  baseline;
- absolute caps and the exact generated seed anchor remain byte-exact;
- sRGB fitting may reduce chroma when the requested neutral lies outside gamut,
  but it does not replace the seed hue or move a lightness target;
- the complete quantized scale is deterministically revalidated for caps,
  anchor preservation, gamut, monotonicity, uniqueness, contrast, and
  continuity. If the requested chroma cannot satisfy those invariants, the
  implementation restores only the minimum necessary amount toward the valid
  baseline and reports the restoration. Restoration uses the deterministic
  scan, bisection, and refinement limits above.

This trajectory is not chromatic harmony and is not the Primary-relative Light
or Dark support-family alignment. It cannot use a Primary fingerprint to
recolor a neutral. Authored Black variants remain excluded from cross-hue
harmony, physical-Light surface alignment, isolated harmony-peak alignment,
and Primary-relative Dark moderation.

Fluent's subtly tinted neutral ramps and Material's distinct `neutral` and
`neutral-variant` ramps are conceptual evidence that more than one authored
neutral axis can be useful. They do not define Kiskadee seeds, public ids,
trajectory parameters, semantic aliases, or preset mappings. Those decisions
remain explicit in each recipe and, later, in each consuming preset.

Seeded neutral chroma above `0.04` requires review and above `0.08` fails.
These guards apply to `n.black.v2` through `n.black.v4`; they are vacuously
satisfied by the zero-chroma `n.black.v1`.

## Physical-Light Surface Alignment

Harmony-rest and vivid-peak equivalence do not guarantee equal behavior near
physical white. At the same OKL lightness, sRGB can compress Blue or Red to a
small chroma while allowing Green or Lime to preserve much more color. A shared
surface position can consequently make one support family dominate even though
all families follow the same low-level curve.

The multi-family system therefore applies
`kiskadee-primary-relative-light-v1` after every family scale is resolved:

- the complete Primary scale remains byte-identical and is the per-position
  reference;
- `n.black.*` is excluded, while Brown remains eligible for one-sided
  reduction;
- support chroma is never increased;
- alignment is inactive at physical OKL `L <= 80`, complete at `L >= 90`, and
  follows a smoothstep transition between those limits;
- at complete strength, support chroma is limited to Primary chroma plus the
  greater of `0.005` or `15%` of Primary chroma;
- caps, generated anchors, and harmony-rest colors remain exact. A four-public-
  position smoothstep window protects continuity around generated anchors and
  harmony rest.

The transformation keeps the existing target lightness and emitted hue as its
OKLCH conversion inputs, then revalidates the quantized sRGB scale through the
canonical monotonicity, uniqueness, contrast, gamut, and continuity
diagnostics. If complete reduction would add a new continuity review or
invalidate the scale, the system restores only the conflicting public
positions toward the baseline and reports those restorations. Valid reductions
at other positions remain applied. Exact protected colors that exceed the
alignment envelope also remain valid but require review, and their measurable
excess remains visible in diagnostics. Alignment details do not expand the
primitive color asset contract.

## Isolated Harmony-Peak Alignment

Equal hue-global gamut utilization can still create a single dominant family
in the physical middle of a system. The available sRGB chroma near the Indigo
cusp is one example: the same relative utilization may produce substantially
more absolute OKL chroma than its Blue and Purple neighbors. A global cap based
only on the Primary would also weaken valid warm systems in which several
families intentionally form a vivid cohort.

The multi-family harmonizer therefore applies
`kiskadee-isolated-harmony-peak-v1` as a conditional second selection pass. It
does not contain an Indigo-specific multiplier. A harmonized support family is
eligible only when all of the following are true in one theme:

- its harmony-rest chroma exceeds both the adjacent-sector average envelope
  (`25%` plus a minimum `0.012`) and the complete-family median envelope (`50%`
  plus a minimum `0.012`);
- the rest exceeds that combined envelope by at least `0.015` OKL chroma;
- its maximum chroma between physical OKL `L=40` and `L=65` is at least `0.2`;
- at the peak's physical lightness, its chroma exceeds every other family
  (linearly interpolated between emitted stops) by the greater of `0.022` or
  `9%`.

When those conditions identify a singleton, candidate selection is repeated
with a peak target no higher than either the independent runner-up plus the
greater of `0.01` or `4%`, or the original peak minus `0.01`. Comparing
families at the same physical lightness prevents a peak elsewhere in another
curve from hiding the local imbalance, while the independent runner-up keeps
the final reduction intentionally modest.
This detection/target hysteresis avoids reacting to harmless quantization while
still producing a visible correction. Candidate search, rather than a visual
post-process, owns the reduction, so effective seed, generated anchor,
harmony-rest color, scale diagnostics, and exported bytes stay coherent.
Functional references are resolved from that final immutable result.

All candidates are measured from the same immutable system snapshot. If
different families qualify at different lightnesses in one theme, only the one
with the greatest excess above its local detection threshold is aligned. This
keeps the contract unilateral and prevents correction cascades.

The Primary and `n.black.*` are never reduced. Authored `source-exact` and
`adaptive` supports are also preserved and reported for review when they form
an isolated peak. A harmonized family keeps its prior result with review if no
lower candidate can satisfy sector identity, gamut, monotonicity, uniqueness,
contrast, and continuity. The contract is intentionally limited to one
isolated leader; it does not flatten a vivid cohort such as the Orange system.
Measurements before and after selection are emitted only in system
diagnostics, not in primitive color assets.

## Generated Anchor, Harmony Rest, And Functional References

`seedHex`, generated anchor, harmony rest, vivid reference, and subtle
reference are separate concepts:

- `seedHex` is the primary, fixed-reference, or authored source color;
- the generated anchor is where the low-level scale preserves or adapts the
  effective seed; for a harmonized companion it is free to occupy the natural
  peak lightness of that hue;
- harmony rest is the shared slot used to compare emitted companion colors and
  validate cross-family balance;
- vivid reference is the family/theme pointer for strong chromatic actions;
- subtle reference is the family/theme pointer for actions closer to the
  active theme surface.

All families use the same public harmony-rest positions, but they do not need
to share generated-anchor, vivid-reference, or subtle-reference positions.
Harmony rest may be any public chromatic slot from 1 through 99. In automatic
mode, the exact primary anchor is always the first candidate for the shared
harmony rest. It becomes harmony rest when the complete emitted v1 harmony
satisfies the source-anchor guard. When that probe fails, the primary itself is
never moved or rewritten: only the shared checkpoint moves. Harmonized
companions preserve a primary-equivalent vivid peak at their own hue's natural
lightness, then expose the color emitted by that scale at the shared
harmony-rest slot.

### Vivid Reference

Vivid resolution preserves the former state-anchor behavior. Each family may
select a different rule for Light and Dark:

- `auto` follows the generated anchor for Primary, `source-exact`, and
  `adaptive` themes; only `harmonized` themes follow harmony rest, except for
  the automatic Black rules described below;
- `generated-anchor` follows the exact/adapted seed position of that family;
- `harmony-rest` follows the shared cross-family checkpoint;
- `locked` points to one explicit non-cap public tone from 1 through 99.

Rules are sparse and sorted by family id. An omitted family is equivalent to
`auto` in both themes, and an entry in which both vivid and subtle rules are
fully automatic is removed during normalization. A rule for a family that is
not materialized fails explicitly. The resolved pointer records its tone, hex,
and source in each family asset. Changing a vivid rule never regenerates or
recolors the scale.

The canonical `n.black.v1` seed is the absolute cap in both themes, so its
generated anchors are L100 and D0 rather than eligible chromatic functional
positions. Its automatic vivid references therefore use the package-owned
near-cap positions L99 and D99. This is a deliberate fallback, not an anchor
relocation or review condition.

An automatic authored `n.black.v2` through `n.black.v4` Dark vivid reference
mirrors the functional contrast of its Light vivid reference instead of
preserving the same physically dark seed. The generator measures the resolved
Light reference against absolute white, then selects the non-cap Dark tone
whose contrast against absolute black is closest. Ties prefer the lower
contrast and then the lower public tone. The result is recorded as
`contrast-mirror`. An explicit Dark `generated-anchor`, `harmony-rest`, or
`locked` rule always takes precedence.

This rule changes only the functional pointer. It does not move the authored
seed, generated anchor, harmony rest, or any scale color. The former Fluent
Black example with seed `#21242d`, Light L85, and a mirrored Dark D90 now
describes a possible authored `n.black.v2`, never canonical `n.black.v1`.
Fluent remains conceptual evidence for the contrast-mirror rule; those bytes
and positions are not embedded in the generator.

Consequently, under `auto`, Yellow `#ffeb3b` remains exact and uses L5/D95 as
its primary vivid reference even when its system's shared harmony rest is
L28/D65. Companion families in that system continue to use L28/D65 as their
vivid references when they are harmonized, while authored `source-exact` or
`adaptive` companions follow their own generated anchors. This does not create
family-specific harmony-rest slots; it separates the technical checkpoint from
the position that represents each family's authored identity.

For example, Orange `#ff6200` remains exact and becomes the shared L24/D70
harmony rest: its raw fixed-reference baselines are imbalanced, but the emitted
harmonized chromatic v1 set passes the `0.5` source-anchor guard. Red and Yellow
may place their generated anchors at different tones while still
emitting their harmonized colors at L24/D70. Twitter Blue `#1da1f2` likewise
keeps its exact L24/D70 anchors as harmony rest and primary vivid reference.

### Subtle Reference

Subtle is relative to the active theme surface, not an alias for a universally
light physical color. Light grows away from white as L positions increase;
Dark grows away from black as D positions increase. A subtle candidate must
therefore be a non-cap public position on the surface side of the same theme's
vivid reference. The public L/D labels are never inverted or reinterpreted.

Subtle references are resolved only after all family generation, surface-track
alignment, and isolated-peak alignment have finished. They select existing
emitted colors and cannot alter a seed, generated anchor, harmony rest, scale
position, or HEX value.

Primary subtle rules are:

- `auto` starts from L4 when that position precedes the Light vivid reference;
  otherwise it uses the nearest preceding public position. Dark auto mirrors
  the Light surface contrast against absolute black;
- `reference-match` treats `referenceHex` as calibration evidence and selects
  the eligible emitted position with the smallest Delta E OK. The reference
  color is never inserted into the scale;
- `locked` selects one explicit eligible non-cap public position.

When one Primary theme has authored calibration and the opposite theme remains
automatic, the automatic theme mirrors the authored theme's contrast against
its own absolute surface. If no distinct surface-side position exists because
vivid is already at position 1, subtle reuses position 1 and emits a review
diagnostic instead of recoloring the scale or silently choosing a cap.

After the Primary subtle positions are known, every automatic support family,
including `n.black.*`, selects its own eligible emitted position by matching
the Primary's perceptual distance from the local absolute surface. Surface
contrast and ordinal proximity are deterministic tie-breakers. This allows a
luminous Yellow and an achromatic Black to use different public positions while
remaining equivalent at the surface. It is a functional pointer difference,
not a second tonal curve.

Locked export materializes both functional references for every family and
theme. A `reference-match` source also retains its normalized `referenceHex` as
provenance, but replay uses the locked tone and never performs a new match.

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
vivid reference's index in the canonical public grid. The offset is ordinal, not
arithmetic: from L28, `+1` resolves to L30; from L55, `+1` resolves to L60.
Offsets that leave the chromatic range return no color instead of silently
clamping to an absolute cap.

The same sign does not have the same physical-lightness meaning in both
themes. Increasing the slot index makes a Light color physically darker and a
Dark color physically lighter. A future semantic mapping may therefore choose
different offset signs for Light and Dark. The current Rest/Hover/Pressed/Focus
display is an experiment for evaluating slot distance, DeltaE, and contrast;
it is not yet a preset or component-state contract.

Vivid state projection selects colors that already exist in the emitted scale. It
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
4. Munsell sector identity, Brown identity, immutable pure gray, and
   seeded-neutral chroma guards;
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
authored variants add one color file each. Format V5 artifacts identify
`@kiskadee/tonal-scale@0.5.0`.

The locked source retains the primary id and seed, policies, overrides,
profile, rest positions, fully resolved functional references, and contract
identifiers. The manifest centralizes asset hashes. Each color asset contains
`munsellSector`, `appearance`, `variant`, `colorKind`, `seedHex`, `seedOrigin`,
policies, generated anchors, harmony-rest colors, per-theme
`functionalReferences`, and complete Light and Dark tone maps. Each vivid or
subtle reference records its tone, emitted hex, and source. A
`reference-match` also keeps the normalized reference hex as provenance. The
diagnostics identify the `fixed-reference` seed model and
`kiskadee-munsell-reference-v2` set alongside cross-hue balance,
classification, harmony metrics, reference matching, surface-relative
selection, Dark support chroma moderation, and scale diagnostics. Dark
moderation details are diagnostic-only; primitive color assets expose the
resulting color bytes without embedding generation or review machinery.
Seeded-neutral diagnostics additionally identify the applied neutral-trajectory
contract, effective seed hue and chroma, adjusted and gamut-mapped tones,
restored tones, maximum chroma increase and reduction, maximum hue drift, and
the minimum applied strength. Those diagnostics describe how `n.black.v2`
through `n.black.v4` were generated without turning their primitive assets into
replay recipes.

Verification regenerates the complete bundle and compares canonical JSON byte
for byte. Missing, extra, non-canonical, or modified files invalidate it
atomically.

## Versioning And External Boundary

Family variant, package version, artifact format, grid contract, harmony
contract, and tonal profile are independent version axes. The V5 format and
Munsell harmony contract do not alter the `kiskadee-tonal-v1` low-level grid or
the canonical Balanced barrier.

The `kiskadee-munsell-rest-v1` system has not yet crossed its explicit visual
approval and systemic-golden milestone. Corrections before that milestone
refine the draft V1 behavior. After the golden is approved, any byte-changing
harmony algorithm requires a new harmony contract or generator version.

Generator `0.3.3` removes the rejected achromatic whole-curve calibration and
adds sparse per-family, per-theme state-anchor authoring without changing
format V3, the harmony V1 recipe, or the low-level tonal grid. Black once again
matches the frozen low-level scale byte for byte. The approved physical-light
and isolated-peak calibrations remain active for chromatic support families.

Generator `0.3.4` makes automatic state-anchor resolution policy-aware.
Primary, `source-exact`, and `adaptive` themes follow their own generated
anchors; `harmonized` themes continue to follow the shared harmony rest.
Bundles generated before `0.3.4` must be regenerated because atomic
verification includes the generator version and resolved state references.

Generator `0.3.5` makes automatic achromatic Dark state anchors mirror the
resolved Light contrast against the opposite absolute cap. The scale and exact
Black seed remain unchanged; only the exported functional pointer changes.
Explicit per-theme state-anchor rules still win. Bundles generated before
`0.3.5` must be regenerated because their Black Dark state reference and
generator version differ.

Generator `0.4.0` replaces the ambiguous state anchor with explicit vivid and
subtle functional references and moves the artifact contract to format V4.
Vivid preserves the approved V3 pointer behavior. Subtle adds post-generation
surface-relative selection and optional reference matching without changing
any low-level or multi-family scale bytes. V3 sources are rejected explicitly;
locked V4 sources contain every resolved family reference so replay never
depends on re-matching external evidence.

Generator `0.4.1` adds the `kiskadee-primary-relative-dark-v1` support-family
guard. For Dark `adaptive` and `harmonized` chromatic support families, D40
through D70 may not exceed the Primary chroma at equivalent physical
lightness by more than 15%, with a minimum tolerance of `0.005` and a
quantization tolerance of `0.002`. Candidate selection may reduce excess
chroma but never increases guarded-range chroma over the baseline. Light
output, both Primary scales, Dark
`source-exact`, `n.black.*`, the grid, and low-level goldens remain unchanged.
The diagnostics record evaluated and adjusted tones, baseline and remaining
excess, maximum reduction, maximum guarded-range increase, and whether the
effective seed changed. The candidate must receive explicit visual approval
before its bytes are promoted to preset assets.

Generator `0.5.0` moves the artifact contract to format V5 and separates the
Black baseline from authored neutral variants. `n.black.v1` becomes the
immutable zero-chroma scale with canonical reference `#000000`.
`n.black.v2` through `n.black.v4` each require their own explicit seed and use
the seeded-neutral chroma trajectory defined above. V4 recipes are rejected
instead of being reinterpreted because a former `n.black.v1` override or tinted
canonical seed would have a different identity under V5. This change remains
above the frozen low-level generator: the public grid, Balanced hashes,
chromatic Primary, chromatic family output, and tonal profiles do not change.

Generator `0.6.0` adds the independent `kiskadee.single-tonal-family` format
for color domains that do not belong to the Munsell multi-family system. It
generates one source-exact Light/Dark family, functional references,
diagnostics, canonical integrity, and deterministic replay. The addition does
not change the low-level scale algorithm, grid, profiles, or Balanced goldens.
The standalone format is documented in
[standalone-tonal-family.md](standalone-tonal-family.md).

Generator `0.7.0` calibrates the Yellow-Red Orange/Brown appearance distance by
weighting lightness by `2/3`. The sector boundaries and fixed prototypes remain
unchanged; lighter muted Browns no longer become Orange solely because their
tone lies closer to the Orange prototype. This changes the multifamily generator
identity to `0.7.0`; the independent standalone artifact generator remains
`0.6.0` because neither its bytes nor its verifier contract changed.

Format V5 remains package-local until its neutral scales receive explicit
visual approval. Preset Shared Viewer links, approved assets, and preset
evidence therefore intentionally remain on their last approved generator
version during this gate. The preset-documentation version audit is expected
to report that temporary mismatch; promotion and documentation synchronization
are a separate follow-up after approval.

This package produces Layer 1 artifacts only. It does not write presets,
external types, semantic aliases, or component state mappings. Exporting
functional references does not automatically authorize a preset to adopt the
preview's experimental state offsets. A preset must promote reviewed
positions, choose any semantic mapping for `n.black.v1` through
`n.black.v4`, and author its own component formula. Fluent and Material
evidence motivates the ability to preserve tinted neutral identities, but this
package does not encode either Design System's semantic roles or asset
provenance.
