# Dark Theme Chroma Moderation

Status: implemented in generator `0.4.1`; pending explicit visual approval and
preset promotion.

## Context

Kiskadee expects chromatic colors used on Dark surfaces to remain identifiable
without becoming more visually dominant than their role requires. This is a
theme-level requirement and is not equivalent to making every Dark color
physically darker. In practice, the important correction is usually a
reduction of chroma or perceived salience while retaining the intended hue and
lightness relationship against the Dark surface.

Before generator `0.4.1`, the contracts covered only parts of this
requirement:

- `muted-darks` reduces chroma on the physically dark side of an effective
  seed, in either the Light or Dark scale, and protects the seed anchor;
- `adaptive` may relocate an authored seed to the shared harmony-rest slot but
  accepts the exact seed when its generated anchor already occupies that slot;
- `harmonized` targets the Primary's relative hue-gamut utilization rather than
  an absolute or perceptual Dark salience ceiling.

As a result, neither non-exact policy guaranteed a suitably calm Dark
functional track.

## Reproduction

The Fluent candidate uses Primary Blue `#0064b4`, Red source `#c50f1f`, Dark
harmony rest D40, and the `muted-darks` profile.

With Red Dark `adaptive`:

- the effective seed remains `#c50f1f` at D40;
- `sourceSeedPreserved` is `true`;
- D40 emits OKL chroma approximately `0.206`, compared with approximately
  `0.149` for Primary Blue.

With Red Dark `harmonized`:

- the source seed is not preserved;
- the effective seed becomes `#f82731` at D60;
- D40 becomes `#be1c24` with OKL chroma approximately `0.194`;
- D60 reaches OKL chroma approximately `0.238`, compared with approximately
  `0.145` for Primary Blue at the same public position;
- the generator reports `HARMONY_REVIEW` because the resulting vivid peak
  exceeds the target utilization.

The Harmonized result therefore proves that seed preservation is not the root
cause. Relative gamut utilization permits substantially different absolute
chroma across hues, and the protected effective anchor prevents
`muted-darks` from correcting the strongest part of the emitted Red track.

## Implemented Direction

Dark chroma moderation applies to chromatic themes whose policy permits the
source color to change:

- Dark `adaptive` no longer accepts an exact projected seed solely because
  its generated anchor already matches harmony rest. It may preserve the seed
  only when the resulting functional track also satisfies the Dark moderation
  guards.
- Dark `harmonized` satisfies the same moderation guards before its existing
  Primary-relative harmony result is accepted.
- Dark `source-exact` remains exempt because exact source preservation is its
  explicit contract. Excessive salience may be diagnosed, but the generator
  must not rewrite the source.
- `n.black.*` remains outside chromatic moderation.

The implementation separates two responsibilities:

1. a theme-aware, hue-independent Dark moderation envelope for chromatic
   support families using `adaptive` or `harmonized`;
2. a unilateral Primary-relative non-dominance guard for those support
   families, preventing either policy from substantially exceeding the
   resolved Primary's salience across the Dark functional track.

The second guard is not full harmonization. An `adaptive` family may retain its
authored character anywhere below the ceiling. A `harmonized` family continues
to target the Primary fingerprint in addition to satisfying the ceiling.

Generator `0.4.1` implements the internal
`kiskadee-primary-relative-dark-v1` contract during candidate selection. It
evaluates D40 through D70 and gives each support color this full-strength cap
at the Primary's equivalent physical lightness:

```ts
primaryChroma + Math.max(0.005, primaryChroma * 0.15)
```

Quantized output may retain at most `0.002` additional chroma. A replacement
candidate also may not increase chroma over its pre-moderation baseline in the
guarded range at equivalent physical lightness. The search prefers compliant
candidates and, when complete compliance is not possible without violating
higher-priority scale invariants, emits the smallest deterministic remaining
excess as a review instead of hiding it.

The implementation is deliberately support-only. It leaves both Primary
themes byte-identical so the canonical Blue reference cannot change as a side
effect. Light, Dark `source-exact`, and `n.black.*` are also excluded. Primary
Dark moderation remains a separate, deferred contract decision.

`tonal-system.diagnostics.json` records the contract, Primary reference,
evaluated and adjusted tones, limiting tone, baseline and final excess,
maximum chroma reduction, maximum guarded-range increase, and effective-seed
change. Consumer color assets
contain only the resulting scale bytes and functional references; they do not
expose this generation diagnostic.

## Constraints

The correction must:

- use the existing single source seed; no `darkSeedHex` or second Dark input;
- affect only Dark `adaptive` and Dark `harmonized` chromatic support results;
- never increase chroma over the pre-moderation baseline inside D40 through
  D70 at equivalent physical lightness;
- preserve hue identity, caps, public positions, monotonicity, uniqueness,
  gamut, and contrast, while exposing any remaining soft continuity review;
- leave Light output, Dark `source-exact`, `n.black.*`, and the frozen
  low-level `generateKiskadeeScale` goldens unchanged;
- leave the Primary byte-identical in both Light and Dark during this phase;
- evaluate the functional Dark range rather than correcting only harmony rest;
- expose evaluated and adjusted positions, reductions, and remaining excesses
  in diagnostics.

## Acceptance Evidence

Regression coverage must include:

- Fluent Blue `#0064b4` with Red `#c50f1f` under both Dark non-exact policies;
- adaptive seeds whose natural anchor already equals Dark harmony rest;
- harmonized families whose natural hue gamut permits materially more absolute
  chroma than the Primary;
- chromatic primaries from Red, Yellow, Green, Blue, and Purple sectors;
- confirmation that already balanced Orange and Green systems do not receive
  unnecessary reductions;
- byte-identical Light assets and unchanged low-level tonal-scale goldens.

Implementation and invariant coverage close the code gap. Promotion remains
blocked until the generated systems receive explicit visual approval in the
tonal-scale viewer; no preset asset should be regenerated from the candidate
before that approval.

Moderating an adaptive Primary Dark scale is explicitly deferred. It requires
a separate contract and an intentional before/after visual revalidation of the
Primary reference; it must not enter this support-family correction as an
effect of shared implementation machinery.
