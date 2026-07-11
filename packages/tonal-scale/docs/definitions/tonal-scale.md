# Kiskadee Tonal Scale v1

Status: canonical definition for Milestone 1.

`@kiskadee/tonal-scale` generates a coordinated light and dark tonal system
from one exact sRGB source color. This document defines the contract that the
generator and its validation UI must implement before preset integration is
considered.

## Coordinate Model

Kiskadee separates the internal physical coordinate from theme-relative public
positions:

- `K` is the internal continuous coordinate from white at K0 to black at K100.
- `L` identifies a public position in the light profile.
- `D` identifies a public position in the dark profile.

K is a generation and diagnostic concept, not a public theme palette. L and D
are the scales that consumers inspect and will eventually export. Their numbers
describe distance from the theme background, so both profiles progress from
position 0 to position 100:

| Profile | Position 0 | Position 100 |
| --- | --- | --- |
| Light | L0 = `#ffffff` | L100 = `#000000` |
| Dark | D0 = `#000000` | D100 = `#ffffff` |

Exact inversion remains only a rejected baseline for comparison. Kiskadee v1
does not derive the public D profile by reversing or uniformly remapping the
public L profile. The approved Light profile remains unchanged. Dark samples
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
darkest chromatic light-profile color and L100 is absolute black. Internal K
coordinates such as K91 through K98 remain evaluable when the dark profile
needs dense early samples; internal existence does not make them public L or D
slots.

D0 is the absolute `#000000` cap and carries no seed hue or chroma. D1 is the
first chromatic dark-profile position and must remain emitted-distinct from D0.
Its near-black separation is deliberately subtle: D1 establishes the family
immediately above absolute black rather than matching the larger functional
steps used later in the ramp.

## Input And Exact Anchors

The generator accepts one `seedHex` and a requested theme profile. It accepts
`rgb`, `#rgb`, `rrggbb`, or `#rrggbb` hexadecimal sRGB notation and normalizes
the seed to lowercase `#rrggbb`. Invalid input fails explicitly and never falls
back to another color.

Each profile selects its own nearest feasible public position. The selected
position must emit the normalized input hex byte for byte. Light and dark
anchors can therefore have different numbers, such as L20 and D75, while both
preserve the same input color. White and black resolve directly to the
appropriate profile caps.

A public position is feasible only when the remaining emitted eight-bit sRGB
colors can preserve caps, strict monotonicity, uniqueness, and the profile's
contrast guard. If quantization makes the nominally nearest position
impossible, the generator uses the closest feasible position and reports the
relocation reason.

## Light Profile

The approved light nominal OKL lightness knots are frozen from the former
Balanced experiment for the `#0f6cbd` reference blue. The previously approved
L0 through L95 and L100 values remain unchanged. L99 is the only new public
light knot and has nominal OKL lightness `3.99942`, between L95 and black.

Light progresses monotonically from white to black. L35 through L95 must each
reach at least `3:1` contrast against white. L35 is the first guarded position;
it is not forced to equal exactly `3:1` and can exceed the threshold when the
nominal curve or exact anchor requires it.

Dark-profile decisions do not change any Light nominal target,
anchor-selection rule, emitted color, contrast guard, or continuity behavior.
The approved Light profile remains the Milestone 1 reference.

## Dark Profile

Dark progresses monotonically from black to white and uses the same
seed-derived hue/chroma trajectory as Light. Its lightness distribution is
theme-specific and is not an exact inversion of the Light profile.

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

Both profiles use OKLCH for lightness, chroma, and hue. A single continuous
chroma function is derived from the exact seed. Colors outside sRGB are fitted
by reducing chroma while preserving target lightness and hue as far as the
target gamut permits. Theme profiles alter where this trajectory is sampled;
they do not introduce hue-specific branches or recolor the seed.

Light keeps its frozen sampling contract. Only the Dark profile owns the
functional D2 through D30 luminance/contrast mapping described above.

Generation resolves constraints in this order:

1. theme-relative absolute caps;
2. exact input anchor;
3. monotonic OKL lightness in the profile direction;
4. profile contrast guard;
5. best attainable separation between emitted neighbors;
6. minimum deviation from the profile nominal curve.

## Emitted Curve Continuity

Continuity is evaluated from emitted eight-bit sRGB colors, not only from the
pre-gamut OKLCH targets. Diagnostics measure adjacent Delta E in OKLab and
changes in emitted chroma slope around each exact anchor. Absolute caps are
excluded from local curve-rhythm metrics.

When a saturated seed at an sRGB gamut cusp produces a detectable isolated
discontinuity, the generator may apply bounded local fairing to profile sample
lightnesses. Caps and the exact seed remain immutable. A repair is accepted only
when it improves emitted continuity while preserving monotonicity, uniqueness,
valid sRGB output, the profile contrast guard, and attainable spacing. All
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
- nominal-lightness deviation;
- emitted Delta E, chroma prominence, and any fairing decision;
- any relaxed spacing or unsatisfied invariant.

Generation must never hide a relaxation.

## Milestone Boundary

Milestone 1 contains only the `standard` Kiskadee v1 variant. A future chroma
attenuation option for physically dark colors remains deferred until the L/D
profiles are visually approved.

Export formats, public package APIs, preset integration, preset type changes,
and preset migration are explicitly deferred. The package remains a private
generator and validation application. The local `generate` CLI prints L and D
scales for inspection only; it does not write preset artifacts.
