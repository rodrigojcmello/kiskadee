# Fluent 2 Color Evidence And Kiskadee Tonal Mapping

This directory preserves the official Fluent color ramps inspected in the
Microsoft Fluent 2 Web Community Figma file and the Kiskadee tonal system
generated from that evidence. Generator `0.5.0` and its V5 achromatic contract
are approved and promoted into the `fluent-2-microsoft` preset. The historical
V4 decisions remain documented below so the previous provenance is not
rewritten.

## Sources

- [Brand ramp](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-4937)
  - node: `9738:4937`
- [Neutral ramp](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-4957)
  - node: `9738:4957`
- [Dark neutral reference](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-5044)
  - node: `9738:5044`
- [Badge status colors](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9202-10100)
  - node: `9202:10100`
- [Presence status colors](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9329-16467)
  - node: `9329:16467`
- [Field validation](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9159-203)
  and [Input validation](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9119-3825)
- [Message Bar statuses](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9361-23385)
  and [Persona availability](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9398-26991)

The Figma file centralizes color in three local variable collections:

- ` Brand`: sixteen values from `Brand-10` through `Brand-160`;
- ` Global`: primitive Neutral and Shared color ramps;
- `Mode`: Light/Dark semantic aliases that resolve to Brand or Global values.

Shared color families have twelve official stops: five shades, `Primary`, and
six tints. [`figma-color-scales.json`](./figma-color-scales.json) preserves the
complete ramps used by the inspected sources rather than reconstructing colors
from screenshots.

## Upstream Family Selection

The semantic aliases, rather than the nearest natural-language color name,
determine the Fluent seed used by Kiskadee.

| Fluent evidence | Kiskadee family | Seed | Reason |
| --- | --- | --- | --- |
| Brand `Brand-80` | `b.blue.v1` | `#0064b4` | Official Light brand background rest |
| Canonical grayscale | `n.black.v1` | `#000000` | Kiskadee-owned, immutable zero-chroma scale with absolute white and black caps |
| Neutral `Grey-14` | `n.black.v2` | `#21242d` | Official Fluent tinted neutral; its authored blue-gray identity no longer replaces the canonical grayscale |
| Cranberry `Primary` | `r.red.v1` | `#c50f1f` | Fluent danger aliases use Cranberry, not the available Red ramp |
| Orange `Primary` | `yr.orange.v1` | `#f7630c` | Fluent warning aliases use Orange |
| Marigold `Primary` | `y.yellow.v1` | `#eaa300` | Fluent away aliases use Marigold, not the available Yellow ramp |
| Green `Primary` | `g.green.v1` | `#107c10` | Fluent success aliases use Green |
| Light green `Primary` | `g.green.v1` semantic mapping | `#13a10e` | Evidence-only upstream ramp; Availability uses a lighter position of the single Green primitive |
| Berry `Primary` | `p.purple.v1` | `#c239b3` | Fluent out-of-office aliases use Berry; OKLCH hue `332.77` classifies it in Munsell P |

Red, Yellow, Pink, and Magenta also exist as complete Fluent Shared ramps, but
the inspected semantic aliases do not use them for danger, away, or
out-of-office. Their Primary values remain recorded as alternatives in the
source JSON without being presented as component evidence.

## Kiskadee Recipe

[`tonal-system.recipe.json`](./tonal-system.recipe.json) is the editable URL
recipe. The generated system uses:

- `muted-darks`, the Fluent-oriented tonal profile;
- exact Light seeds for the official authored families;
- adaptive Dark chromatic policies, because Fluent selects different upstream
  stops by theme;
- immutable `n.black.v1` from canonical `#000000`, providing a pure grayscale
  foundation independently of Fluent;
- exact Light and Dark `n.black.v2`, preserving Fluent `Grey-14` as an authored
  tinted-neutral reference from one seed;
- automatic harmony rest, currently resolved by generator `0.5.0` to L50/D40;
- automatic per-family Light and Dark `vivid`/`subtle` functional references.

### Shared viewer — candidate generator 0.5.0

[Open the Fluent candidate in the local Kiskadee Tonal Scale](http://localhost:3001/?recipe=%7B%22formatVersion%22%3A5%2C%22gridContract%22%3A%22kiskadee-tonal-v1%22%2C%22harmonyContract%22%3A%22kiskadee-munsell-rest-v1%22%2C%22tonalProfile%22%3A%22muted-darks%22%2C%22primary%22%3A%7B%22seedHex%22%3A%22%230064b4%22%2C%22appearance%22%3A%22auto%22%2C%22variant%22%3A%22v1%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%22tonalAnchors%22%3A%7B%22rest%22%3A%7B%22mode%22%3A%22auto%22%7D%7D%2C%22functionalReferences%22%3A%5B%5D%2C%22overrides%22%3A%5B%7B%22id%22%3A%22r.red.v1%22%2C%22seedHex%22%3A%22%23c50f1f%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v1%22%2C%22seedHex%22%3A%22%23f7630c%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22y.yellow.v1%22%2C%22seedHex%22%3A%22%23eaa300%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22g.green.v1%22%2C%22seedHex%22%3A%22%23107c10%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22p.purple.v1%22%2C%22seedHex%22%3A%22%23c239b3%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22n.black.v2%22%2C%22seedHex%22%3A%22%2321242d%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22source-exact%22%7D%7D%5D%7D).

The link encodes the complete editable format V5 recipe and can be saved as a
browser bookmark. It resolves the latest generated scales and functional
references without changing the stored Fluent evidence. It requires the local
`@kiskadee/tonal-scale` application on port `3001`.

The Shared Viewer currently evaluates this recipe with generator `0.5.0`. It
generates thirteen primitive families: the twelve mandatory V5 families plus
authored `n.black.v2`. The eleven chromatic family scales and references are
unchanged from the approved `0.4.1` export. V5 changes only the achromatic
architecture:

| Candidate family | Role | Light subtle | Light vivid | Dark subtle | Dark vivid |
| --- | --- | --- | --- | --- | --- |
| `n.black.v1` | Immutable pure grayscale | L4 `#ededed` | L99 `#010101` | D4 `#191919` | D99 `#fbfbfb` |
| `n.black.v2` | Fluent tinted neutral from `Grey-14 #21242d` | L4 `#e9edfa` | L85 `#21242d` | D4 `#151821` | D90 `#d2d6e3` |

`n.black.v2` also preserves its exact seed at generated anchors L85 and D7.
Its Dark trajectory currently reports one review diagnostic: D35 is partially
restored toward the low-level curve to preserve the canonical continuity
invariant. This is visible evidence for review, not a hidden repair or an
invalid scale.

The `0.5.0` bundle, de-para, and Fluent primitive assets are the promoted V5
baseline. The upstream Neutral ramp maps to `n.black.v2`; `n.black.v1` remains
the universal pure grayscale and must not be presented as Fluent `Grey-14`.

### Approved generator 0.5.0 system

The verified canonical V5 export is under [`generated/`](./generated/). It
contains thirteen primitive family assets plus source, manifest, and
diagnostics. Eight identities are promoted into the preset:

- source-backed `b.blue.v1`, `n.black.v2`, `r.red.v1`, `yr.orange.v1`,
  `y.yellow.v1`, `g.green.v1`, and `p.purple.v1`;
- Kiskadee-owned `n.black.v1`, the immutable pure-grayscale foundation.

The five harmony-derived chromatic companions remain evidence-only candidates.
This promotion is **Official adapted** for Fluent `n.black.v2` and the other
source-backed families. Using `n.black.v1` for absolute grayscale caps is a
**Kiskadee extension**.

The two achromatic families have separate responsibilities:

- `n.black.v2` preserves Fluent `Grey-14 #21242d` and owns every non-absolute
  Fluent Neutral surface, including `Neutral/Background/3/Rest` and
  `Neutral/Background/4/Rest`;
- `n.black.v1` is not a second Fluent Neutral family. It provides pure
  grayscale, absolute white/black caps, and the absolute-black Darker surface.

Multiple upstream Neutral aliases therefore resolve to different positions of
the same `n.black.v2` scale. Alias numbering never creates another primitive
variant.

### Historical generator 0.4.1 system

The following V4 notes preserve the reasoning behind the preceding approved
export. The active generated directory and promoted preset assets now use
`0.5.0`.

Generator `0.4.1` retains the approved surface-track chroma alignment. In
particular, Green L4 is `#e2f3e0`, preventing the Positive Medium Button from
dominating Blue and Cranberry near a light surface. It also retains the
isolated-peak alignment that keeps Indigo from becoming the most prominent
mid-track family.

It additionally applies the canonical Primary-relative Dark moderation to
chromatic support families using `adaptive` or `harmonized`. Cranberry Dark
vivid D40 moves from `#c50f1f` to `#b6302f`, removing the excessive red chroma
observed beside the approved Fluent Blue. Berry receives the same
hue-independent guarantee. Every Light scale and the complete Primary Blue
family remain byte-identical to the `0.4.0` export; no Button- or intent-specific
compensation was introduced.

V4 replaces the former single state checkpoint with two per-family functional
references. Preset runtime assets store only their positions; the generated
JSON keeps the corresponding HEX and provenance for integrity and review.

| Promoted family | Light subtle | Light vivid | Dark subtle | Dark vivid |
| --- | --- | --- | --- | --- |
| Blue | L4 `#e1efff` | L50 `#0064b4` | D4 `#0b1929` | D40 `#0064b4` |
| Black | L4 `#ebedf3` | L85 `#21242d` | D4 `#17181b` | D90 `#d3d6df` |
| Cranberry | L4 `#ffe7e4` | L45 `#c50f1f` | D3 `#260d0b` | D40 `#b6302f` |
| Orange | L4 `#ffe8df` | L24 `#f7630c` | D4 `#28140c` | D40 `#a5430f` |
| Marigold | L4 `#faebd7` | L18 `#eaa300` | D4 `#1f170c` | D40 `#805a15` |
| Green | L4 `#e2f3e0` | L45 `#107c10` | D4 `#0b1b0a` | D40 `#087209` |
| Berry | L4 `#fbe6f6` | L35 `#c239b3` | D3 `#210e1f` | D40 `#9a348e` |

Black demonstrates why the references are per family. Its Light vivid position
preserves the exact Fluent neutral seed, while Dark uses a contrast-mirrored
light neutral instead of repeating a black action on a black surface. The exact
seed still exists at D7; it is not used as the Dark vivid action reference.

## Semantic De-para

The following table maps the exact upstream values used by the inspected
semantic aliases to their closest generated Kiskadee positions.

| Fluent role | Official Light value | Kiskadee Light | Official Dark value | Kiskadee Dark |
| --- | --- | --- | --- | --- |
| Brand background rest | Brand-80 `#0064b4` | L50 `#0064b4` | Brand-70 `#0055a4` | D35 `#005ba4` |
| Neutral background rest | White `#ffffff` | `n.black.v1` L0 `#ffffff` | Grey-16 `#262932` | `n.black.v2` D9 `#262a33` |
| Neutral foreground rest | Grey-14 `#21242d` | `n.black.v2` L85 `#21242d` | White `#ffffff` | `n.black.v1` D100 `#ffffff` |
| Danger | Cranberry Primary `#c50f1f` | L45 `#c50f1f` | Cranberry Tint 30 `#dc626d` | D65 `#df5f57` |
| Warning | Orange Primary `#f7630c` | L24 `#f7630c` | Orange Tint 20 `#f98845` | D75 `#e68962` |
| Success | Green Primary `#107c10` | L45 `#107c10` | Green Tint 30 `#54b054` | D75 `#67b661` |
| Available | Light green Primary `#13a10e` | `g.green.v1` L30 `#3f9b3b` | Light green Primary `#13a10e` | `g.green.v1` D65 `#469d42` |
| Away | Marigold Primary `#eaa300` | L18 `#eaa300` | Marigold Primary `#eaa300` | D80 `#d1af7c` |
| Out of office | Berry Primary `#c239b3` | L35 `#c239b3` | Berry Tint 20 `#d161c4` | D70 `#ce6cc0` |

This table is a future semantic integration guide, not a declaration that the
system-wide state anchor must equal every Fluent role. For example, the primary
generated anchor is L50/D40, while fidelity to Fluent's Dark brand background
points to D35.

## Primitive Ramp De-para

[`figma-to-kiskadee.json`](./figma-to-kiskadee.json) maps every stop in all eight
captured upstream ramps to both themes of its generated Kiskadee family.
Green and Light green are both evaluated against `g.green.v1`; Light green is
preserved as source evidence without creating another primitive asset.

The mapping uses nearest-neighbor `Delta E OK` in OKLab. Light and Dark are
evaluated independently. Duplicate target positions are allowed because the
upstream Neutral ramp has 51 values while the Kiskadee public grid is smaller.
Every entry retains:

- the upstream token and exact hex;
- the closest L and D positions;
- the generated hex at those positions;
- perceptual distance;
- whether the match is exact.

Consequently, the mapping exposes adaptation cost instead of implying that the
official Fluent and Kiskadee ramps are identical.

## Decision: One Green Primitive

The source ramps are distinct, but they are not distinct color identities. The
official seeds differ mostly in lightness and chroma:

- Green `#107c10`: OKLCH `L51.04 C0.1654 h142.67`;
- Light green `#13a10e`: OKLCH `L61.62 C0.2040 h142.40`;
- hue difference: only `0.27°`.

Once both families are normalized at the same Kiskadee harmony rest, their
remaining difference is negligible:

- Light L50 rest Delta E OK: `0.0028`;
- Dark D40 rest Delta E OK: `0.0047`;
- mean same-slot Dark difference across the complete scale: `0.0032`.

This is expected behavior, not a scale-generation defect. The generator removes
the upstream lightness offset while preserving a practically identical hue.
Therefore `g.green.v2` does not justify another primitive family and was removed
from the approved candidate. The official Light green ramp remains source
evidence, while Fluent `Available` maps to L30/D65 of `g.green.v1`. Success and
Available can now differ by semantic position without pretending they have
different primitive color identities.

## Integration Status

The first integration is the Fluent Button documented in
[`../components/button.md`](../components/button.md). It promotes the Blue,
Black, Cranberry, and Green generated scales. Primary High anchors the shared
tonal recipe to each family's `vivid` reference, while Medium begins at each
family's `subtle` reference. Primary, Neutral, Destructive, and Positive reuse
the same ordinal surface-state recipe without intent-specific tonal compensation.
Neutral High has one component-level foreground exception: its physically light
Dark/Darker `vivid` surfaces use the absolute-black D0 cap instead of white.
In the Kiskadee on-vivid extension, Light Medium instead shares one neutral
White overlay across intents and uses each family's `subtle +4` foreground to
carry identity; Dark and Darker retain the role-aware Medium surface candidate.

The preset-wide color foundation also promotes the other five explicitly
authored Fluent chromatic families at Layer 1. Layer 2 maps Blue to `primary`,
the Fluent tinted neutral `n.black.v2` to `neutral`, Cranberry to `redLike`,
Green to `greenLike`, Marigold to `yellowLike.v1`, and Orange to
`yellowLike.v2`. Pure grayscale `n.black.v1` remains available for absolute
caps and the Darker surface. Berry remains available as the Purple primitive
because its official role is Out of office, not a generic Kiskadee `secondary`
semantic.

The checked-in bundle, mapping, and promoted assets use generator `0.5.0`.
Card maps its source-backed Neutral surfaces through `n.black.v2`, while
absolute white/black remain `n.black.v1` caps. Dark chroma moderation is owned
by the tonal system and applies hue-independently to eligible support families;
no Destructive-, Positive-, Neutral-, Button-, or Card-only compensation was
introduced. Components beyond Button and Card remain deferred.
