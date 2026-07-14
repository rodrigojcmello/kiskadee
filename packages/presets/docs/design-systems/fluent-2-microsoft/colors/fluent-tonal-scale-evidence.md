# Fluent 2 Color Evidence And Kiskadee Tonal Mapping

This directory preserves the official Fluent color ramps inspected in the
Microsoft Fluent 2 Web Community Figma file and the first Kiskadee tonal system
generated from that evidence. It prepares a future preset integration; it does
not change the current `fluent-2-microsoft` preset schema.

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
| Neutral `Grey-14` | `n.black.v1` | `#21242d` | Official Light neutral foreground rest and a structural dark neutral |
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
- exact Light and Dark `n.black.v1`, preserving `Grey-14` as the neutral scale
  reference;
- automatic harmony rest, resolved and locked by generator `0.3.0` to L50/D40.

### Shared viewer

[Open the Fluent candidate in the local Kiskadee Tonal Scale](http://localhost:3001/?recipe=%7B%22formatVersion%22%3A3%2C%22gridContract%22%3A%22kiskadee-tonal-v1%22%2C%22harmonyContract%22%3A%22kiskadee-munsell-rest-v1%22%2C%22tonalProfile%22%3A%22muted-darks%22%2C%22primary%22%3A%7B%22seedHex%22%3A%22%230064b4%22%2C%22appearance%22%3A%22auto%22%2C%22variant%22%3A%22v1%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%22tonalAnchors%22%3A%7B%22rest%22%3A%7B%22mode%22%3A%22auto%22%7D%7D%2C%22overrides%22%3A%5B%7B%22id%22%3A%22r.red.v1%22%2C%22seedHex%22%3A%22%23c50f1f%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22yr.orange.v1%22%2C%22seedHex%22%3A%22%23f7630c%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22y.yellow.v1%22%2C%22seedHex%22%3A%22%23eaa300%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22g.green.v1%22%2C%22seedHex%22%3A%22%23107c10%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22p.purple.v1%22%2C%22seedHex%22%3A%22%23c239b3%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22adaptive%22%7D%7D%2C%7B%22id%22%3A%22n.black.v1%22%2C%22seedHex%22%3A%22%2321242d%22%2C%22policies%22%3A%7B%22light%22%3A%22source-exact%22%2C%22dark%22%3A%22source-exact%22%7D%7D%5D%7D).

The link encodes the complete editable recipe and can be saved as a browser
bookmark. It requires the local `@kiskadee/tonal-scale` application on port
`3001`.

The verified canonical export is under [`generated/`](./generated/). It contains
twelve primitive family assets plus source, manifest, and diagnostics. These
files are evidence candidates only and must not be copied into the preset until
the visual scale and mapping are explicitly approved.

## Semantic De-para

The following table maps the exact upstream values used by the inspected
semantic aliases to their closest generated Kiskadee positions.

| Fluent role | Official Light value | Kiskadee Light | Official Dark value | Kiskadee Dark |
| --- | --- | --- | --- | --- |
| Brand background rest | Brand-80 `#0064b4` | L50 `#0064b4` | Brand-70 `#0055a4` | D35 `#005ba4` |
| Neutral background rest | White `#ffffff` | L0 `#ffffff` | Grey-16 `#262932` | D9 `#262a33` |
| Neutral foreground rest | Grey-14 `#21242d` | L85 `#21242d` | White `#ffffff` | D100 `#ffffff` |
| Danger | Cranberry Primary `#c50f1f` | L45 `#c50f1f` | Cranberry Tint 30 `#dc626d` | D65 `#ee4f4b` |
| Warning | Orange Primary `#f7630c` | L24 `#f7630c` | Orange Tint 20 `#f98845` | D75 `#e68962` |
| Success | Green Primary `#107c10` | L45 `#107c10` | Green Tint 30 `#54b054` | D75 `#67b661` |
| Available | Light green Primary `#13a10e` | `g.green.v1` L30 `#3f9b3b` | Light green Primary `#13a10e` | `g.green.v1` D65 `#469d42` |
| Away | Marigold Primary `#eaa300` | L18 `#eaa300` | Marigold Primary `#eaa300` | D80 `#d1af7c` |
| Out of office | Berry Primary `#c239b3` | L35 `#c239b3` | Berry Tint 20 `#d161c4` | D65 `#ce5cbf` |

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

## Deferred Integration

No preset schema, semantic alias, component, Core contract, or generated Web
Builder artifact is changed by this evidence package. The next phase may choose
one component and replace hardcoded primitive references with the approved
family assets and semantic positions documented here.
