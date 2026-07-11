# Rejected: Exact Public Dark Inversion

Status: rejected for Kiskadee Tonal Scale v1.

## Proposal

Generate one sparse public K scale and present its exact colors in reverse order
for dark interfaces, without changing labels, samples, or lightness
distribution.

## Why It Was Rejected

The approach made K labels ambiguous in theme-relative use and exposed
light-only tail positions such as K96 through K98 merely to populate the start
of the dark presentation. It also inherited the light profile's asymmetric
sampling density: early dark surface positions were either missing or too
quantized, while the transition to near-white colors remained poorly placed.

Exact inversion also assigns early Dark positions incidentally, although they
have different responsibilities. D1 must be a deliberately subtle near-black
chromatic position, while D2 through D30 require a functional
luminance/contrast ramp for dark surfaces. Reversing Light samples cannot
express those roles without changing the approved Light profile.

An exact reverse also provides no independent functional boundary equivalent to
the light profile's `3:1` guard against white. For the `#0f6cbd` reference, the
exactly inverted position corresponding to D35 remained below `3:1` against
black.

The required `3:1` checkpoint at D35 is not the point where black becomes the
highest-contrast foreground. It is only the first public position contractually
qualified to reach the minimum black-contrast guard.

## Adopted Direction

K remains an internal continuous physical coordinate, while public positions
use L and D names. The approved Light profile remains unchanged. Dark uses D0
as absolute black, D1 as a deliberately subtle near-black chromatic position,
and D2 through D30 as an independent functional ramp based on relative
luminance and contrast progression. D35 is the first position required to
reach `3:1` against black, and D35 through D95 retain that guard. Dark shares
the seed-derived hue/chroma trajectory with Light, but not its public lightness
distribution.

This is one coordinated tonal system with two theme-relative profiles, not one
sparse palette displayed twice.
