# Kiskadee Tonal Scale v1

Status: canonical low-level definition. `Balanced` is frozen; `Muted Darks`
is an isolated tonal profile that must not alter it.

`@kiskadee/tonal-scale` generates a coordinated Light and Dark tonal scale
from one sRGB seed. This document defines the low-level scale contract
implemented by `generateKiskadeeScale`. The higher-level multi-family contract,
harmonization rules, and package-owned artifact format are defined separately
in [tonal-system.md](./tonal-system.md).

The public L/D grid, Balanced geometry, emitted colors, and diagnostics
described here remain canonical when the low-level generator is composed into
a tonal system. System generation may choose a derived seed according to an
explicit seed policy, but it must not mutate the Balanced scale algorithm or
reinterpret its positions.

## Terminology

Kiskadee has two independent choices:

- the **theme** is `light` or `dark` and determines the L or D orientation,
  caps, lightness distribution, and contrast guard;
- the **tonal profile** is `balanced` or `muted-darks` and determines only the
  chroma treatment applied to the already generated theme scale.

In this document, "profile" without a qualifier means tonal profile. Light and
Dark are themes, not alternate tonal profiles.

## Coordinate Model

Kiskadee separates the internal physical coordinate from theme-relative public
positions:

- `K` is the internal continuous coordinate from white at K0 to black at K100.
- `L` identifies a public position in the Light theme.
- `D` identifies a public position in the Dark theme.

K is a generation and diagnostic concept, not a public theme palette. L and D
are the scales that consumers inspect and will eventually export. Their numbers
describe distance from the theme background, so both themes progress from
position 0 to position 100:

| Theme | Position 0 | Position 100 |
| --- | --- | --- |
| Light | L0 = `#ffffff` | L100 = `#000000` |
| Dark | D0 = `#000000` | D100 = `#ffffff` |

Exact inversion remains only a rejected baseline for comparison. Kiskadee v1
does not derive the public D scale by reversing or uniformly remapping the
public L scale. The approved Balanced Light theme remains unchanged. Dark samples
the same seed-derived hue/chroma trajectory with its own functional luminance
and contrast distribution.

## Public Grid

Light and dark each materialize the same 36 theme-relative positions:

```txt
0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
85, 90, 95, 99, 100
```

Therefore the relevant public ends are:

```txt
Light: L90, L95, L99, L100
Dark:  D0, D1, D2, D3, D4, D5 ... D10
```

L96, L97, L98, D96, D97, and D98 do not exist as public slots. L99 is the
darkest chromatic Light color and L100 is absolute black. Internal K
coordinates such as K91 through K98 remain evaluable when the Dark theme
needs dense early samples; internal existence does not make them public L or D
slots.

D0 is the absolute `#000000` cap and carries no seed hue or chroma. D1 is the
first chromatic Dark position and must remain emitted-distinct from D0.
Its near-black separation is deliberately subtle: D1 establishes the family
immediately above absolute black rather than matching the larger functional
steps used later in the ramp.

## Input And Exact Anchors

The generator accepts one `seedHex`, a requested theme, and a tonal profile. It
accepts `rgb`, `#rgb`, `rrggbb`, or `#rrggbb` hexadecimal sRGB notation and
normalizes the seed to lowercase `#rrggbb`. Invalid input fails explicitly and
never falls back to another color.

Each theme selects its own nearest feasible public position. The selected
position must emit the normalized input hex byte for byte. Light and dark
anchors can therefore have different numbers, such as L20 and D75, while both
preserve the same input color. White and black resolve directly to the
appropriate theme caps.

A public position is feasible only when the remaining emitted eight-bit sRGB
colors can preserve caps, strict monotonicity, uniqueness, and the theme's
contrast guard. If quantization makes the nominally nearest position
impossible, the generator uses the closest feasible position and reports the
relocation reason.

## Balanced Canonical Barrier

`balanced` is the approved Kiskadee v1 tonal profile. Its emitted output is
canonical and must not change as a side effect of adding another profile,
refactoring, formatting, or improving diagnostics.

The source-controlled golden barrier in `src/balanced-v1.golden.ts` has two
layers:

- exact Light and Dark scales, including anchor positions, for `#0f6cbd`,
  `#8e44ad`, `#ffb300`, `#ffab00`, and `#808080`;
- SHA-256 hashes of the complete RGB `11³` matrix for each theme, serialized
  in channel order with every seed, anchor, position, and emitted hex.

The approved matrix hashes are:

```txt
Light: da9448b7165806c6f19c1b885fab0e726c4a7636500342f9cd8496572c882286
Dark:  0c552c49683a49e138c3670034da129be207343b0730abce2737b8de3f8b146c
```

These values are approval locks, not snapshots to refresh during routine work.
Changing a golden scale or either hash means changing the canonical Balanced
contract and requires explicit product approval.

## Light Theme

The approved light nominal OKL lightness knots are frozen from the former
Balanced experiment for the `#0f6cbd` reference blue. The previously approved
L0 through L95 and L100 values remain unchanged. L99 is the only new public
light knot and has nominal OKL lightness `3.99942`, between L95 and black.

Light progresses monotonically from white to black. L35 through L95 must each
reach at least `3:1` contrast against white. L35 is the first guarded position;
it is not forced to equal exactly `3:1` and can exceed the threshold when the
nominal curve or exact anchor requires it.

Dark-theme decisions do not change any Light nominal target,
anchor-selection rule, emitted color, contrast guard, or continuity behavior.
The approved Light theme remains the Milestone 1 reference.

## Dark Theme

Dark progresses monotonically from black to white and uses the same
seed-derived hue/chroma trajectory as Light. Its lightness distribution is
theme-specific and is not an exact inversion of the Light theme.

1. D0 is the absolute `#000000` cap.
2. D1 is the first chromatic near-black position. Its distinction from D0 is
   required but intentionally subtle.
3. D2 through D30 form a functional dark-surface ramp with nominal targets
   derived from relative-luminance and contrast progression. This range must
   progress monotonically from D1 toward D35 without plateaus or emitted
   duplicates; it is not copied from inverted Light slots.
4. D35 is the first guarded position and must reach at least `3:1` contrast
   against black. D35 through D95 retain that minimum.
5. D100 is the absolute `#ffffff` cap.

Before exact-anchor and emitted-spacing constraints are resolved, the early
Dark contrast target is:

```txt
contrastAgainstBlack(d) = 1 + 2 * (d / 35) ^ 1.1
```

The target contrast is converted back to OKL lightness on the family's emitted
sRGB hue/chroma trajectory. D1 through D10 use this target directly. From D10
through D35, a smoothstep weight `s² * (3 - 2s)`, where
`s = clamp((d - 10) / 25)`, reconnects the contrast ramp to the existing
D35-connected distribution without introducing a hard bend. The exponent is a
hue-agnostic Kiskadee v1 tuning value, not a color-family exception.

The D35 guard is a black-contrast qualification, not a foreground-selection
crossover. Passing `3:1` against black does not mean that black has greater
contrast than white and does not prescribe the semantic foreground color.
Foreground choice remains a property of the actual semantic
foreground/background pair.

## Shared Color Generation

Both themes use OKLCH for lightness, chroma, and hue. A single continuous
chroma function is derived from the exact seed. Colors outside sRGB are fitted
by reducing chroma while preserving target lightness and hue as far as the
target gamut permits. Themes alter where this trajectory is sampled;
they do not introduce hue-specific branches or recolor the seed.

Light keeps its frozen sampling contract. Only the Dark theme owns the
functional D2 through D30 luminance/contrast mapping described above.

Generation resolves constraints in this order:

1. theme-relative absolute caps;
2. exact input anchor;
3. monotonic OKL lightness in the theme direction;
4. theme contrast guard;
5. best attainable separation between emitted neighbors;
6. minimum deviation from the theme nominal curve.

## Tonal Profiles

### Balanced

`balanced` is the default and canonical profile. It emits the approved theme
scales without a profile-specific post-process. The canonical barrier above
protects it byte for byte.

### Muted Darks

`muted-darks` is a candidate derived from Balanced. It runs only after the full
Balanced geometry has been resolved. It may reduce OKL chroma only for colors
whose physical OKL lightness is below the exact seed lightness. The rule is
physical, not numeric: it applies to the dark side of both the L and D scales,
regardless of the public slot number.

Muted Darks must preserve from Balanced:

- the exact absolute caps;
- the exact seed and its L or D anchor position;
- every target lightness and the resulting monotonic direction;
- the seed-derived requested hue;
- Light and Dark contrast guards;
- public positions and uniqueness.

The initial envelope uses these profile constants:

```txt
referenceLightness: 20
minimumChromaRatio: 0.25
gamma: 0.8
```

The ratio is `1` at the seed and moves smoothly toward the dark side. For a
seed above OKL lightness 20, it reaches `0.25` at that reference point and then
approaches zero at black. For a seed at or below the reference point, the same
smooth function is compressed between the seed and black. Neutral inputs do
not acquire chroma.

Eight-bit sRGB conversion can change emitted lightness, chroma, and contrast
even when the requested OKL lightness is fixed. Therefore a candidate that
leaves its Balanced lightness cell, breaks a theme contrast guard, leaves the
canonical D0-D35 black-contrast cell, or would emit more chroma than Balanced
restores only as much chroma toward its Balanced endpoint as needed to satisfy
all constraints. A complete restoration is legal and means preserving a
canonical invariant took precedence over visible attenuation at that position.
Diagnostics report the final emitted chroma reduction and any
constraint-driven restoration separately from gamut fitting.

The profile is inspired by the reduced chroma of physically dark tones in
[Microsoft Fluent 2 Web](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-4937&t=VKTTOhGXjS8MYP2E-11).
This is directional evidence only: Kiskadee does not copy Fluent's exact blue,
slot count, or curve.

The rejected lab used the display name `Balanced` for an experimental
`Auto Soft Dark + 3:1 Vivid` profile. That historical profile is archived under
`docs/rejected/legacy-engine/` and is not the current contract. Current
`balanced` means the frozen approved output; the separate `muted-darks` id owns
the new dark-chroma behavior.

## Emitted Curve Continuity

Continuity is evaluated from emitted eight-bit sRGB colors, not only from the
pre-gamut OKLCH targets. Diagnostics measure adjacent Delta E in OKLab and
changes in emitted chroma slope around each exact anchor. Absolute caps are
excluded from local curve-rhythm metrics.

When a saturated seed at an sRGB gamut cusp produces a detectable isolated
discontinuity, the generator may apply bounded local fairing to theme sample
lightnesses. Caps and the exact seed remain immutable. A repair is accepted only
when it improves emitted continuity while preserving monotonicity, uniqueness,
valid sRGB output, the theme contrast guard, and attainable spacing. All
nominal deviations remain visible in diagnostics.

`#ffb300` and `#ffab00` remain regression references for saturated yellow gamut
cusps. `#0f6cbd`, `#fa8072`, and `#ff5722` remain comparison references for
families that must not acquire isolated anchor peaks or plateaus.

## Diagnostics

Light and dark diagnostics are independent and must report:

- exact L or D anchor and any relocation;
- absolute D0 cap and emitted distinction between D0 and D1;
- strictly increasing emitted contrast against black from D0 through D35 and
  any adjacent reversal;
- monotonicity and emitted duplicates;
- minimum adjacent OKL lightness delta;
- actual L35 contrast against white and D35 contrast against black;
- L35-L95 contrast failures against white or D35-D95 failures against black,
  without treating either guard as foreground selection;
- gamut chroma reduction;
- active tonal profile, profile chroma reduction, constraint-driven chroma
  restoration, and whether the exact anchor was protected;
- nominal-lightness deviation;
- emitted Delta E, chroma prominence, and any fairing decision;
- any relaxed spacing or unsatisfied invariant.

Generation must never hide a relaxation.

## Composition And Integration Boundary

The approved `balanced` profile and its golden barrier remain the immutable
foundation of every higher-level workflow. `muted-darks` is orthogonal to seed
policy and must remain an isolated tonal-profile transformation. Neither
multi-family generation, harmonization, artifact serialization, nor UI work may
change Balanced output.

Format V5's Black rules live in the higher-level tonal-system compositor and
do not redefine `generateKiskadeeScale`. The compositor owns one immutable
zero-chroma `n.black.v1` scale and may shape only chroma for independently
seeded `n.black.v2` through `n.black.v4` neutral variants. Their canonical
lightness inputs, caps, exact anchors, and deterministic revalidation remain
subject to this low-level contract, while their variant-specific chroma
trajectory remains defined in [tonal-system.md](./tonal-system.md). The
Balanced golden hashes above therefore remain unchanged by the V5 artifact
format.

Package-owned artifact generation is part of the tonal-system contract and is
no longer deferred. Those artifacts describe primitive color families; they
are not preset artifacts and are not compatible with the current preset schema
by implication.

Preset integration, preset type changes, semantic color mapping, and preset
migration remain explicitly outside this package's current boundary. They
require a future integration plan and must not change this low-level contract
implicitly.

The local single-scale CLI continues to accept `balanced` or `muted-darks` for
direct scale inspection:

```txt
pnpm generate <hex> [light|dark|both] [balanced|muted-darks]
```

The omitted theme defaults to `both`; the omitted tonal profile defaults to
`balanced`. The CLI rejects unknown themes or profiles explicitly and includes
the active profile in each scale header.
