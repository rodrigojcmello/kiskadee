# OKLCH Generation Engine

The commercial auto-fit profiles now use OKLCH as their chromatic generation space.

This is a deliberate foundation change, not a new per-tone exception. The goal is to avoid a scale
where light, middle, and dark slots each use unrelated rules. The active experiment keeps one color
space for the commercial chromatic curve and then applies functional constraints inside that same
space.

## Why HSL Was Replaced For Commercial Profiles

HSL lightness is easy to edit, but it is not perceptual lightness. Equal HSL lightness steps can
produce uneven contrast and uneven RGB movement, especially in luminous hues such as yellow, lime,
and cyan.

The failure that motivated this change appeared in the pre-vivid bridge. `K35` was adjusted to meet
the vivid contrast target, then `K12..K30` were interpolated toward that adjusted `K35` in HSL. For
luminous hues, this produced abrupt contrast movement before `K35`, even when the HSL lightness
delta looked regular.

OKLCH gives the lab a better foundation:

- `OKL L` is used as the lightness axis for generated chromatic slots;
- `OKL C` is used as the chroma axis for commercial profiles;
- OKLCH hue interpolation is used for chromatic bridges;
- generated colors are gamut-fitted back into sRGB by reducing chroma when needed.

## Profile Scope

The OKLCH engine is currently enabled only for the commercial auto-fit profiles:

- `Striking - Auto Linear + 3:1 Vivid`;
- `Balanced - Auto Soft Dark + 3:1 Vivid`;
- `Sophisticated - Auto Mid Peak + 3:1 Vivid`.

The two reference profiles intentionally remain functional comparison tools:

- `Fluent 2 Blue` remains the projected Microsoft reference scale.
- `Linear Lightness` remains the simplest HSL baseline.

This means profile differences are intentional. The reference profiles show useful north stars; the
commercial profiles are where the Kiskadee experiment is allowed to change foundations.

## Current OKLCH Pipeline

For a commercial auto-fit profile:

1. The input color is converted to OKLCH.
2. The chromatic scale is generated from the profile base tone using OKL lightness and OKL chroma.
3. Absolute `K0` and `K100` are emitted as neutral caps and are not used as chromatic endpoints.
4. The vivid contrast guard resolves `K35..K95` with emitted-slot progress and lowers OKL lightness
   only as needed to keep the active contrast target.
5. The pre-vivid bridge interpolates through OKLCH from the preserved bridge start to the adjusted
   vivid start.
6. The minimum lightness step uses OKL lightness, not HSL lightness.
7. If the input is luminous, the initial chroma ramp caps only the first light chromatic slots.
8. The input fit is resolved only after the scale is complete.

Contrast is still measured with WCAG relative luminance against the configured foreground. OKLCH is
the generation and interpolation space; it does not replace the contrast formula.

## Vivid Lightness Progress

The vivid range uses emitted-slot progress, not numeric tone distance. In `Kiskadee Official (33)`,
the vivid slots are read as `K35`, `K40`, `K45`, and so on through `K95`; each emitted slot is one
step even though the numeric tone labels jump by five.

The current commercial vivid rule also uses `lightnessProgressGamma: 1.1`. This is an experimental
ease-in for `K35..K95`: the first vivid step no longer drops as aggressively from `K35` to `K40`,
while the deeper vivid range still has room to separate. The contrast guard still clamps each slot
to the maximum OKL lightness that satisfies the active foreground contrast target.

## Minimum Lightness Step

The commercial profiles keep the same simple spacing policy, but the unit is now profile-dependent:

- in OKLCH commercial profiles, the rule measures OKL lightness;
- in HSL reference/baseline profiles, the rule would measure HSL lightness if enabled.

Current commercial thresholds:

- every chromatic target from the first non-cap slot through the last non-cap slot uses at least
  `1.5` OKL lightness points from the previous emitted slot.

Earlier tests used a stronger luminous lightness exception: `2` OKL lightness points through `K16`.
That avoided foggy light ramps, but very saturated yellow exposed the cost: the light tones dropped
too quickly while sRGB gamut fitting allowed chroma to jump abruptly between `K1`, `K2`, and `K3`.

## Luminous Initial Chroma Ramp

An input is treated as luminous when its contrast against white is less than or equal to `2.4:1`.
For those inputs, the commercial profiles now keep the same `1.5` OKL lightness spacing as every
other hue and instead cap the initial OKL chroma ramp.

Current luminous chroma-ramp experiment:

- active only for OKLCH commercial profiles;
- applies from the first chromatic slot through `K10`;
- caps chroma to `30%` of input OKL chroma at the first chromatic slot;
- eases toward `90%` of input OKL chroma by `K10`;
- uses `progressGamma: 0.55` so chroma returns early without recreating the abrupt `K1..K3` jump.

This is intentionally a chroma rule, not another lightness rule. The goal is to preserve the blue
and non-luminous behavior that already works while preventing luminous yellows from becoming
neon too early in the light range.

## Balanced Dark Endpoint

`Balanced - Auto Soft Dark + 3:1 Vivid` uses `darkFloorLightness: 20` and
`darkLightnessGamma: 0.95`.

This keeps `K95` as the final chromatic dark color instead of letting it collapse toward near-black.
Very low OKL lightness values leave little sRGB gamut for chroma, so tones below roughly `OKL L 20`
can look like a foggy sequence of almost-black colors even when their lightness deltas are still
large. The absolute black role belongs to `K100`; `K95` should remain visibly colored.

The current floor intentionally stays close to the final dark slot of the Fluent 2 blue reference,
which is dark but still distinguishable from black.

## UI Reading

The curve chart now uses an OKLCH plane:

- horizontal axis: OKL lightness;
- vertical axis: OKL chroma.

The comparison table still shows generated HSL because it is familiar for quick reading, but it also
shows generated OKLCH and `OKL L delta`. The OKL value is the one that should be used when judging
spacing in the commercial OKLCH profiles.

## Naming Caveat

Some UI controls still use older labels such as saturation and gamma. In the commercial OKLCH
profiles, those controls are now applied to OKL chroma and OKL lightness. The names remain for
continuity while the lab is experimental, but future UI cleanup should rename them once the OKLCH
contract stabilizes.
