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

`Balanced` is currently the only commercial profile with input preservation enabled. `Striking` and
`Sophisticated` remain useful comparison profiles and should not inherit this behavior until they are
recalibrated intentionally.

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
8. If the profile opts into input preservation, the finished chromatic scale is re-interpolated
   through the exact input hex as a real local anchor. `Balanced` also applies a vivid-boundary
   buffer when a non-vivid-safe input would otherwise be preserved at the last pre-vivid slot.
9. If the profile opts into preserved-anchor continuity, the pre-vivid input anchor may rewind until
   the post-anchor OKL lightness slope is not abruptly steeper than the pre-anchor slope.
10. If the profile opts into node continuity, structural seams are smoothed and vivid tones are
   clamped again.
11. If the profile opts into chroma shape smoothing, sharp local chroma peaks and narrow dominant
    chroma plateaus around the preserved input are softened without changing the input hex.
12. The input fit is resolved only after the scale is complete.

Contrast is still measured with WCAG relative luminance against the configured foreground. OKLCH is
the generation and interpolation space; it does not replace the contrast formula.

## Balanced Input Preservation

`Balanced` now treats the input hex as something that should survive in the emitted scale by
default. This is deliberately scoped to `Balanced` while the lab tests the behavior.

The rule does not return to the old contrast-derived anchor model. The input still does not choose
the profile's structural base tone. Instead, `Balanced` first resolves the functional scale, then
chooses a legal chromatic slot for the exact input color and interpolates the surrounding curve
through that point.

Current structural anchors for this experiment:

- `K1`: first chromatic light endpoint in `Kiskadee Official (33)`;
- `K10`: current light-zone boundary;
- `K35`: vivid boundary with the active `3:1` white-text contrast target;
- `K95`: final chromatic dark endpoint;
- the exact input hex at the nearest legal chromatic fit.

`K0` and `K100` remain absolute white and black caps. They are visible in the scale, but they are not
used as chromatic anchors.

The legal-fit guards are intentionally simple:

- if the input is lighter than the generated `K10` boundary, it must be preserved inside `K1..K10`;
- if the input does not pass the vivid `3:1` white-text target, it cannot be preserved at `K35` or
  darker;
- if that non-vivid-safe input would otherwise land on the last pre-vivid slot, `Balanced` rewinds
  the preserved input by one emitted slot so the last pre-vivid slot can remain a bridge into `K35`;
- after the input anchor is inserted, `K35..K95` is clamped again so the vivid contract remains true.

This means a luminous brand color such as cyan or yellow can survive exactly, but it will usually
land at `K10` for now. Testing `K16` as a wider light-zone boundary remains a valid future
experiment.

The exact input can locally win over the minimum lightness-step experiment. That trade-off is
intentional: preserving the source color is now part of `Balanced`'s contract, while the `1.5` OKL
lightness spacing remains a visual guard that may need revision after this preservation model is
tested.

## Balanced Vivid Boundary Buffer

`Balanced` now protects the transition into vivid when the preserved input sits immediately before
`K35`.

The failure case is specific but important: a saturated input can fail the `3:1` white-text vivid
target, be legally barred from `K35`, and still have its nearest legal fit at `K30`. If `K30` keeps
the exact input while `K35` must become contrast-safe, the transition can form a visible chroma and
lightness peak at `K30`.

Current buffer rule:

- applies only to `Balanced`;
- applies only when the input fails the active vivid contrast target;
- applies only when the nearest legal input fit is the last pre-vivid emitted slot;
- rewinds the exact input by `1` emitted slot, so `K30` can become a generated bridge in
  `Kiskadee Official (33)`;
- keeps the vivid contract unchanged: `K35..K95` must still pass `3:1` against white.

When this buffer is active, the `K35` structural anchor is resolved as the lightest version of the
generated vivid-start color that still passes the active `3:1` target. That keeps the bridge from
being pulled toward an unnecessarily dark `K35` while still preserving the functional vivid
contract.

## Balanced Preserved Anchor Continuity Guard

`Balanced` now also treats the preserved input as a local lightness-continuity node when that input
is preserved in the pre-vivid middle range.

The vivid-boundary buffer can move a non-vivid-safe input away from the last pre-vivid slot, but a
single rewind is not always enough. Orange exposed the failure: preserving `#ff9800` at `K28` kept
the exact input, but the OKL lightness delta immediately after the anchor was much larger than the
delta before it. Visually, the curve still changed rhythm too abruptly.

Current preserved-anchor continuity rule:

- applies only to `Balanced`;
- applies only when the preserved input sits after the light-zone boundary and before the vivid
  boundary;
- measurement: emitted-step OKL lightness delta;
- sample size: average `2` deltas before the preserved input and `2` deltas after it;
- limit: the post-anchor average may not exceed the pre-anchor average by more than `3x + 0.25`
  OKL lightness points;
- near vivid-boundary limit: if the input fails the active vivid contrast target and the preserved
  input is within `2` emitted slots before the vivid start, the post-anchor average may not exceed
  the pre-anchor average by more than `2.4x + 0.25` OKL lightness points;
- adjacent vivid-boundary limit: if the next emitted slot after the preserved input is the vivid
  start, the post-anchor average may not exceed the pre-anchor average by more than `1.75x + 0.25`
  OKL lightness points;
- max additional rewinds: `2` emitted slots.

When the post-anchor slope fails that limit, the exact input rewinds by one emitted slot and the
scale is regenerated through the new anchor. The guard then checks the new slope again. This turns a
hard transition such as `K28 -> K30 -> K35` into a longer bridge such as `K26 -> K28 -> K30 -> K35`.
For `#00bcd4`, the near vivid-boundary limit moves the preserved input from `K28` to `K26`, letting
`K28` and `K30` become bridge material before the `3:1` `K35` vivid start. The adjacent
vivid-boundary limit handles a related case: if an input is contrast-safe enough to sit at `K30`,
but `K30 -> K35` becomes much steeper than the pre-anchor rhythm, the input can still rewind to
`K28` so `K30` becomes bridge material.

This rule is intentionally directional for now: it protects the exit from a pre-vivid preserved
input into the vivid boundary. It does not yet rebalance every possible anchor shape in both
directions.

## Balanced Node Continuity Guard

`Balanced` now also guards the structural seams at `K10` and `K35`.

This is a maximum-delta rule, not a minimum-spacing rule. The existing minimum lightness step avoids
foggy adjacent colors when deltas are too small. The node continuity guard avoids abrupt walls when a
zone boundary has a much larger OKL lightness delta than its local neighbors.

Current rule:

- nodes: `K10` and `K35`;
- measurement: emitted-step OKL lightness delta;
- default limit: the node seam may not exceed the larger neighboring delta by more than
  `1.25x + 0.25` OKL lightness points;
- preserved-input entry limit: when the previous emitted slot is the exact preserved input and the
  node is `K10`, the entry seam is judged from the previous light-zone delta instead of the larger
  bridge-side delta, using `1.25x + 0.25`;
- preserved-input exit limit: when the node itself is the exact preserved input and the node is
  `K35`, the exit seam is judged from the entry delta instead of the larger dark-side delta, using
  `1.25x + 0.25`;
- max iterations: `5`.

For a normal entry seam such as `K30 -> K35`, the guard compares that delta with `K28 -> K30` and
`K35 -> K40`. The `K10` preserved-input entry exception exists because `K10` separates two rhythms:
the fine `K1..K10` light zone and the wider `K10..K35` bridge. If the input is preserved at `K9`,
letting `K10 -> K12` set the reference makes `K9 -> K10` too permissive. For `#dce775`, this
exception keeps the exact input at `K9` while reducing `K9 -> K10` from roughly `3.16` to `1.64`
OKL lightness points.
The `K35` preserved-input exit exception handles the mirrored problem after chroma-shape smoothing:
if `K35` is the exact input, `K35 -> K40` must not borrow the wider dark-side rhythm from
`K40 -> K45`. For `#ff1744`, this reduces `K35 -> K40` from roughly `3.75` to `1.75` OKL lightness
points.

When a seam fails, the guard adjusts the nearest adjustable color and re-interpolates the adjacent
segment so the excess is distributed instead of being hidden in one slot. The exact input anchor is
kept unchanged. After each redistribution, `K35..K95` is clamped again to preserve the active
`3:1` vivid contract.

Node continuity runs both before and after the chroma-shape guard. The first pass smooths the
preserved-input scale before chroma shoulders are added. The second pass catches new lightness seams
created by chroma-shape rules, such as a vivid-start shoulder that slightly lowers `K30` to gain
sRGB chroma.

The guard is intentionally scoped to `Balanced` while this model is tested. `Striking` and
`Sophisticated` remain comparison profiles until they are recalibrated deliberately.

## Balanced Chroma Shape Guard

`Balanced` also guards the preserved input anchor against becoming a visibly dominant OKL chroma
feature.

This is primarily a local chroma rule. It does not change the exact input color and it does not
regenerate the whole scale. Its job is to avoid a visible "summit", narrow high-chroma plateau, or
broken chroma tangent where the preserved input is much easier to identify than the surrounding
emitted slots. The vivid-start shoulder may also lower a pre-vivid shoulder by a small OKL lightness
amount when sRGB gamut cannot provide the requested chroma at the original lightness.

Current peak rule:

- anchor: the preserved input slot;
- measurement: OKL chroma;
- peak criterion: the anchor must be higher than both immediate neighbors, and the smaller of the two
  chroma drops must exceed `0.012`;
- near vivid-boundary peak criterion: if the preserved input is within `2` emitted slots before the
  vivid start, the smaller chroma drop threshold is `0.008`;
- allowed drop around the anchor: `max(0.008, anchorChroma * 0.04)`;
- near vivid-boundary allowed drop: `max(0.004, anchorChroma * 0.025)`;
- radius: try radius `1` first, then radius `2` only if the peak remains.
- near vivid-boundary radius: complete radius `2` when a peak is detected, even if radius `1`
  already softened the immediate neighbors.

Radius is counted by emitted slots, not numeric tone distance. If the preserved input is `K35`, then
radius `1` means `K30, K35, K40`, while radius `2` means `K28, K30, K35, K40, K45`.

When the peak guard triggers, it raises only neighbors whose chroma is below the local target. It
never lowers the preserved input, never lets neighbors exceed the anchor chroma, and does not change
OKL lightness intentionally. The goal is to turn a sharp chroma summit into a small shoulder or
plateau, similar to the natural behavior currently seen in the reference blue.

The near-boundary threshold exists because small chroma peaks are more visible when the preserved
input is close to the vivid transition. When the lightness rhythm is already healthy, the correct
adjustment is to raise nearby chroma, not to move the input to `K30`. When the rhythm is not
healthy, as with `#00bcd4` before the near vivid-boundary continuity limit, the lightness guard owns
the rewind first and the chroma guard only smooths the resulting local shape.

Near the vivid boundary, radius `1` still adjusts both immediate neighbors. Extra radius is
directional: it expands toward the vivid side so `K35` can join the chroma shoulder, but it does not
pull lighter pre-vivid slots such as `K24` into the same stronger chroma plateau. After that
adjustment, `K35..K95` are clamped again so raising vivid-side chroma cannot break the active
`3:1` contrast contract.

The same guard also detects narrow dominant chroma plateaus. This covers cases where the preserved
input is not a single-point peak because the next structural point has almost the same chroma, such
as a saturated red where `K30` and `K35` form a short top shelf. The plateau rule activates when:

- the preserved input belongs to a contiguous plateau of at most `3` emitted slots;
- neighboring plateau slots are within `0.012` OKL chroma of the preserved input;
- the smaller drop from the plateau to its two shoulders is greater than `0.009` OKL chroma.

When this happens, the guard raises the plateau shoulders toward a controlled drop of
`max(0.016, plateauChroma * 0.08)`. Radius `1` adjusts the immediate shoulders on both sides. Radius
`2` may extend on the vivid side, but it does not pull an extra lighter pre-vivid slot into the
plateau. This keeps the exact input color intact while making a red-like top read as a broader
shoulder instead of an obvious brand-color marker.

`Balanced` also has a preserved-vivid-start shoulder rule for cases where the exact input lands at
`K35`. This is stricter than the generic peak and plateau rules because `K35` is both the preserved
input and the vivid boundary. The rule:

- applies only when the preserved input is the vivid start;
- uses a controlled shoulder drop of `max(0.006, anchorChroma * 0.024)`;
- reaches radius `2`;
- allows the pre-vivid shoulder to lower OKL lightness by up to `0.75` points if that is needed to
  reach more sRGB chroma.

For `#ff1744`, this keeps the exact input at `K35` while raising the local shoulders: `K30` moves to
roughly `0.2374` OKL chroma and `K40` to roughly `0.2412`, so `K35` is less isolated as the only
high-chroma point.

Finally, `Balanced` has a light-zone chroma tangent rule for luminous inputs preserved before `K10`.
This handles cases that are not technically local peaks. If the preserved light-zone input is the end
of a steep incoming chroma ramp, the following slots can rise above the preserved input before
easing back toward `K35`. The current rule:

- applies only when the preserved input is at or before `K10`;
- samples the previous `2` emitted chroma deltas;
- requires an average incoming chroma increase of at least `0.012`;
- lifts the forward shoulder by `55%` of that incoming delta, eased by emitted progress toward
  `K35` with gamma `1.2`.

For `#fff59d`, this lets `K6` and the following light-to-middle slots form a shallow chroma shoulder
instead of making `K5` the visible tip of a one-point spike.

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

## Commercial Dark Endpoints

The commercial profiles no longer share the old near-black dark endpoint:

- `Striking - Auto Linear + 3:1 Vivid` uses `darkFloorLightness: 26`;
- `Balanced - Auto Soft Dark + 3:1 Vivid` uses `darkFloorLightness: 20`;
- `Sophisticated - Auto Mid Peak + 3:1 Vivid` uses `darkFloorLightness: 20`.

All three use `darkLightnessGamma: 0.95`.

This keeps `K95` as the final chromatic dark color instead of letting it collapse toward near-black.
Very low OKL lightness values leave little sRGB gamut for chroma, so tones below roughly `OKL L 20`
can look like a foggy sequence of almost-black colors even when their lightness deltas are still
large. The absolute black role belongs to `K100`; `K95` should remain visibly colored.

`Balanced` and `Sophisticated` stay close to the final dark slot of the Fluent 2 blue reference,
which is dark but still distinguishable from black. `Striking` uses a higher floor because its
commercial intent is to keep as much visible chroma as the sRGB gamut allows across the scale.

`Balanced` also uses a dark-side chroma target of `darkMinRatio: 0.25`. The goal is to start the
chroma decline from the profile base tone and make `K95` read closer to Fluent's subtle dark blue:
still chromatic, but no longer pushed to the saturated edge of the sRGB gamut.

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
