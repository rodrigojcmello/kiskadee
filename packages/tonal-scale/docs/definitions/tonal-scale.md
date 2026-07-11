# Kiskadee Tonal Scale v1

Status: canonical definition for Milestone 1.

`@kiskadee/tonal-scale` generates one Kiskadee tonal scale from one exact source
color. This document defines the contract that the generator and its validation
UI must implement before any preset integration is considered.

## Public Grid

Kiskadee v1 has 35 public slots:

```txt
K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, K10,
K12, K14, K16, K18, K20, K22, K24, K26, K28, K30,
K35, K40, K45, K50, K55, K60, K65, K70, K75, K80,
K85, K90, K95, K100
```

`K0` and `K100` are neutral absolute caps. The other 33 slots are chromatic
positions. The dense beginning of the grid is intentional: after theme
orientation is applied, it provides the most resolution near the surface side
of either a light or dark scale.

## Theme Orientation

The slot labels and grid do not change between themes. Theme orientation changes
the physical direction of lightness:

| Theme | K0 | K1 through K95 | K100 |
| --- | --- | --- | --- |
| `light` | `#ffffff` | monotonically lighter to darker | `#000000` |
| `dark` | `#000000` | monotonically darker to lighter | `#ffffff` |

The dark curve is derived by inverting the light theme's nominal OKL lightness
targets. It is not a second distribution and does not rename or reorder slots.
The absolute caps are structural conveniences shared by every color family; they
do not carry the seed hue.

## Input And Exact Anchor

The generator accepts exactly one `seedHex` for one color family. It accepts
`rgb`, `#rgb`, `rrggbb`, or `#rrggbb` hexadecimal sRGB notation and normalizes
the seed to lowercase `#rrggbb`. Invalid input fails explicitly and must not
fall back to a default color.

For each theme, the generator first evaluates the chromatic slot whose nominal
OKL lightness is closest to the seed. A slot is legal only when the emitted
eight-bit sRGB colors can still satisfy strict monotonicity, uniqueness, and the
vivid contrast guard around the exact input. If quantization makes the nearest
slot impossible, the generator uses the closest feasible slot and reports both
positions and the relocation reason. The selected slot is the exact anchor: its
emitted hex must be byte-for-byte equal to the normalized seed. White and black
resolve directly to the matching absolute cap.

The anchor can occupy a different slot in light and dark because the nominal
lightness direction changes. Surrounding generated colors adapt to the fixed
anchor; the seed is never silently moved or recolored to repair the curve.

## Nominal Curve And Invariants

The light theme's nominal OKL lightness targets are frozen from the former
Balanced experiment for the `#0f6cbd` reference blue. The dark targets are
`100 - lightTarget` for the same slot. These nominal values guide generation; the
exact anchor can require a measured local deviation.

Generation resolves constraints in this order:

1. absolute caps;
2. exact input anchor;
3. monotonic OKL lightness in the active theme direction;
4. best attainable separation between adjacent slots;
5. minimum deviation from the nominal lightness curve.

The generator uses OKLCH for lightness, chroma, and hue. Colors outside sRGB are
fitted by reducing chroma while preserving target lightness and hue as far as
the target gamut permits. The standard target curve is continuous around its
anchor and has a broad chroma apex. An exact highly saturated anchor can sit on
an sRGB gamut cusp where neighboring lightnesses cannot reproduce the same
chroma. Emitted-curve continuity is governed by the decision below. The input
color is never recolored to repair a discontinuity.

### Emitted Curve Continuity

Decision status: implemented in the Milestone 1 generator.

Continuity is evaluated from the emitted eight-bit sRGB sequence, not only from
the pre-gamut OKLCH target curve. Diagnostics must measure adjacent Delta E in
OKLab and changes in the emitted chroma slope around the exact anchor. Absolute
caps are excluded from local curve-rhythm metrics because they are structural
endpoints rather than chromatic samples.

When an exact seed at an sRGB gamut cusp produces a detectable discontinuity,
the generator may apply a bounded local fairing after the first gamut-fitted
render:

1. absolute caps and the exact input anchor remain immutable;
2. the first repair variable is the target lightness of generated neighbors;
3. the adjustment uses the smallest practical window around the anchor and
   tapers back into the untouched nominal curve; both sides are evaluated as a
   coupled window because moving either side also changes its outer transition;
4. a repair is accepted only when it improves emitted continuity while
   preserving monotonicity, uniqueness, valid sRGB output, the vivid contrast
   guard, and the best attainable adjacent separation;
5. every resulting nominal-lightness deviation remains measured and visible;
6. when no bounded repair satisfies all acceptance criteria, the original scale
   remains intact and diagnostics report `Review`.

Activation is metric-based and hue-agnostic. `#ffb300` and `#ffab00` are
regression references for saturated gamut-cusp behavior, not special-case
branches. `#0f6cbd` and `#ff5722` remain comparison references that protect
already satisfactory families from unnecessary changes.

The activation model distinguishes a severe asymmetric discontinuity from a
balanced but visually concentrated gamut cusp. Both paths use the same bounded
search and acceptance rules. The balanced path is attempted only when its two
anchor-adjacent steps are already relatively even, and it must measurably reduce
chroma concentration without damaging that Delta E rhythm.

This decision does not authorize seed desaturation, seed recoloring,
anchor relocation solely for visual smoothing, hue-specific conditions, a
global chroma-curve rewrite, or hue drift during gamut fitting. Changing the
global gamut-mapping method requires a separate decision.

For Milestone 1, `K35` through `K95` retain the expressive `3:1` contrast guard:
against white in the light theme and against black in the dark theme. Contrast
is measured from sRGB relative luminance. A diagnostic must report any relaxed
spacing, anchor relocation, nominal-curve deviation, gamut reduction, emitted
chroma prominence, or unsatisfied invariant; generation must not hide a
relaxation.

## Milestone Boundary

Milestone 1 contains only the `standard` Kiskadee v1 variant. `Soft Dark` is
blocked until the standard scale is functionally complete and visually approved.
Its proposed chroma attenuation is not part of this canonical contract yet.

Export formats, public package APIs, preset integration, preset type changes,
and preset migration are explicitly deferred until after that approval. The
package remains a private generator and validation application during Milestone
1. The local `generate` CLI prints a scale for inspection only; it does not
define or write a preset artifact.
