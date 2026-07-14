# Kiskadee Munsell Family Taxonomy v2

Status: canonical package-level definition.

Kiskadee uses the ten Munsell hue sectors as its stable Layer 1 classification
axis and natural color names as its human-facing appearance axis. The
implementation is a Kiskadee projection into OKLCH; it is not a general-purpose
converter for Munsell notation or physical color chips.

## Public Families

Every public family id follows `<sector>.<appearance>.<variant>`. The lowercase
sector prefix is the official Munsell abbreviation used as a technical
namespace; the natural appearance is the readable Layer 1 color name; and the
variant identifies another authored version of that same appearance.

| Munsell sector | Appearance | Base family id |
| --- | --- | --- |
| R | Red | `r.red.v1` |
| YR | Orange | `yr.orange.v1` |
| YR | Brown | `yr.brown.v1` |
| Y | Yellow | `y.yellow.v1` |
| GY | Lime | `gy.lime.v1` |
| G | Green | `g.green.v1` |
| BG | Teal | `bg.teal.v1` |
| B | Blue | `b.blue.v1` |
| PB | Indigo | `pb.indigo.v1` |
| P | Purple | `p.purple.v1` |
| RP | Magenta | `rp.magenta.v1` |
| N | Black | `n.black.v1` |

The complete sector names `red`, `yellow-red`, `yellow`, `green-yellow`,
`green`, `blue-green`, `blue`, `purple-blue`, `purple`, and `red-purple`
remain internal classification values and diagnostic terminology. They are not
public family ids.

`n.black` is the separate achromatic or near-achromatic family. It contains the
Design System's authored gray trajectory and may be subtly tinted, but it is
never a chromatic harmony reference. `N` is the Kiskadee namespace for that
axis, not a promise that every authored Black seed has exactly zero chroma.
`neutral` is not a Layer 1 family name.

Every complete system contains these family ids:

```txt
r.red.v1
yr.orange.v1
yr.brown.v1
y.yellow.v1
gy.lime.v1
g.green.v1
bg.teal.v1
b.blue.v1
pb.indigo.v1
p.purple.v1
rp.magenta.v1
n.black.v1
```

`v1` is the base variant of one appearance. Orange and Brown share YR but are
separate appearances, so both begin at `v1`. A second Blue is `b.blue.v2`; a
second Brown is `yr.brown.v2`. Optional `v2` through `v4` ids require explicit
seeds. New appearances are intentionally deferred until the current set proves
insufficient in real Design System integration.

## OKLCH Projection

The `munsell-oklch-v1` projection freezes these hue centers:

| Sector | OKLCH hue |
| --- | ---: |
| red | 24deg |
| yellow-red | 60deg |
| yellow | 90deg |
| green-yellow | 116deg |
| green | 145deg |
| blue-green | 198deg |
| blue | 250deg |
| purple-blue | 276deg |
| purple | 322deg |
| red-purple | 351deg |

Sector boundaries are the circular midpoints between adjacent centers except
for Red/Yellow-Red. That boundary is explicitly calibrated to `34deg`, near the
midpoint between the canonical Red `#d13438` and Orange `#ca5010` reference
hues and rounded toward Orange so `30deg` remains inside Red's safe core. An
interval includes its start and excludes its end, including the wrap between
red-purple and red. Therefore `34deg` belongs to Yellow-Red and `#f4511e`
resolves to `yr.orange.v1`, preserving `r.red.v1` as a distinct companion
family rather than consuming it with a visibly Orange primary.

The inner 15% through 85% of each interval is its safe generation region.
Authored and fixed-reference colors in the outer bands remain valid when they
classify in the correct sector. The active fixed-reference harmony does not
move or clamp those source seeds, because doing so would introduce another
variable into harmony calibration.

The deferred primary-derived strategy uses the safe region for generated
companion sources, including sector-relative projection, deterministic edge
insets, and explicit clamp diagnostics. Its current status and re-entry
criteria are documented in
[`primary-derived-family-seeds.md`](../proposals/primary-derived-family-seeds.md).

The red, yellow-red, yellow, and purple-blue centers are perceptually
calibrated so common product colors classify recognizably and remain coherent
if the deferred cross-sector projection returns. In particular, the explicit
red/yellow-red boundary keeps Orange and red-biased Orange in Yellow-Red, the
yellow center favors golden Yellow over olive Green-Yellow, and saturated
electric blues remain on the blue side of the blue/purple-blue boundary. These
values are part of the Kiskadee projection rather than claims about a universal
Munsell-to-OKLCH conversion.

`munsell-oklch-v1` is still before its systemic-golden milestone. Calibrating
the Red/Yellow-Red boundary therefore refines the not-yet-frozen V1 projection
instead of creating a misleading `munsell-oklch-v2` projection. Once that milestone is approved,
future byte- or identity-changing boundary adjustments require a new projection
version.

A chromatic primary with OKL chroma below `0.005` fails because its hue is not
reliable. Chroma from `0.005` through `0.02` is classifiable but requires review.

## Primary Appearance And Variants

The primary sector is classified automatically from the normalized primary
hex. Its appearance defaults to the canonical natural name for that sector and
its variant defaults to `v1`. Within Yellow-Red, the seed is compared
perceptually with the frozen Orange `#ca5010` and Brown `#8e562e` prototypes;
the closer appearance proposes `orange` or `brown`. Authors may correct the
appearance within the classified sector and select `v1` through `v4`. Export
locks the resolved three-axis family id.

The prototypes are perceptual comparison references, not exceptions to the
frozen sector boundaries. Sector classification always runs first. The
calibrated red/yellow-red boundary classifies the Orange prototype `#ca5010`
inside yellow-red without requiring a special-case identity override.

Brown uses the fixed `yr.brown.v1` reference and the same shared Light and
Dark rest positions as every other family. Its target gamut utilization is
initially `0.6` of the Orange appearance. Functional harmony still outranks
keeping the rest color visibly dark, so a very light rest may appear tan while
physically darker positions retain the Brown character.

`n.black.v1` uses the fixed reference `#20252b` and is not derived from the
primary. Authored black seeds above OKL chroma `0.04` require review; values
above `0.08` fail.

## Identity Invariants

- A chromatic family source and its harmonized output must classify inside its
  declared sector.
- Primary-derived companion sources must stay in the safe generation region
  when that deferred strategy is enabled; fixed references are not clamped.
- Hue fitting cannot be used to satisfy harmony; lightness and relative chroma
  are the adjustable dimensions.
- Brown remains Yellow-Red and cannot be replaced by an Orange-like seed.
- The same recipe, contracts, and generator version must emit identical bytes.

Adjacent primary and support families also have a collision guard at their
emitted rest colors. The public angular identity target is at least `12deg`; a
`DeltaE` of `0.05` is the perceptual safety threshold for cases where gamut
fitting compresses hue separation. A pair is considered collided only when it
falls below both thresholds.

The preventive harmony band is wider than the public target. When a harmonized
fixed-reference support seed is adjacent to and less than `13.5deg` from the
exact primary, its working hue moves away from the primary toward its declared
sector to target `13.5deg`. The extra `1.5deg` protects the emitted `12deg`
minimum from sRGB quantization and gamut fitting. The primary is immutable, and
this restoration never changes a `source-exact` or `adaptive` family. A
non-harmonized collision is reported for review rather than silently rewriting
the authored color.

This support-only restoration belongs to the multi-family harmony layer. It
does not change sector centers for other boundaries, the public L/D grid, or
the low-level `generateKiskadeeScale` algorithm and its canonical colors.

![Kiskadee color family taxonomy](../assets/color-family-taxonomy-wheel.svg)
