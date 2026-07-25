# Fluent 2 Card Evidence

This file records the source evidence and schema decisions for the Fluent 2 Card
mapping in `packages/presets/src/presets/fluent-2-microsoft/components/card.schema.ts`.

## Sources

- Card component set:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927&t=Uzju4AUhin0NMCn2-11)
- Theme sticker sheet:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-4934&t=Uzju4AUhin0NMCn2-11)
- Dark surface example:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-5044&t=Uzju4AUhin0NMCn2-11)
- Exact primitive de-para:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)
- Approved generated assets:
  [`b.blue.v1.json`](../colors/generated/colors/b.blue.v1.json) and
  [`n.black.v1.json`](../colors/generated/colors/n.black.v1.json)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Card component set | `9230:4927` | Filled, Filled alt, Outline, and Subtle treatments | Official adapted |
| Theme sticker sheet | `9738:4934` | Six surface aliases and their Light/Dark variable bindings | Official exact |
| Kiskadee tonal mapping | `figma-to-kiskadee.json` | Blue and Black Light/Dark nearest positions | Official adapted |
| Absolute-black Darker surface | Black primitive, outside the six sticker-sheet surfaces | L100/D0 exact primitive cap | Kiskadee extension |

## Canonical Surface Evidence

The inspected `9738:4934` node is named `Theme Sticker Sheet`. It does not label
its examples as a formal "canonical surfaces" API, but it deliberately composes
the same six surface aliases in Light and Dark. Kiskadee therefore treats this
set as the source-backed Fluent surface catalog for component documentation and
Showcase validation.

The outer sheet uses `Neutral/Background/2/Rest`. Its five inner regions use
`Neutral/Background/1/Rest`, `Brand/Background/2/Rest`,
`Neutral/Background/4/Rest`, `Neutral/Background/3/Rest`, and
`Brand/Background/1/Rest`.

The official aliases and HEX values below are exact Figma variable bindings.
The Kiskadee columns are the nearest positions in the approved generator
`0.4.1` Blue and Black assets. A non-zero Delta E is an explicit tonal
adaptation, not an assertion that the generated ramp reproduces the Fluent
primitive exactly.

| Fluent surface alias | Official Light | Kiskadee Light | Delta E OK | Official Dark | Kiskadee Dark | Delta E OK |
| --- | --- | --- | ---: | --- | --- | ---: |
| `Neutral/Background/1/Rest` | White `#ffffff` | `n.black.v1` L0 `#ffffff` | `0` | Grey-16 `#262932` | `n.black.v1` D9 `#262a33` | `0.003411` |
| `Neutral/Background/2/Rest` | Grey-98 `#f5faff` | `n.black.v1` L1 `#f9fbfe` | `0.006252` | Grey-12 `#1c1f28` | `n.black.v1` D6 `#1d2026` | `0.006395` |
| `Neutral/Background/3/Rest` | Grey-96 `#f0f5ff` | `n.black.v1` L2 `#f5f6fb` | `0.00918` | Grey-8 `#11141c` | `n.black.v1` D3 `#131416` | `0.012664` |
| `Neutral/Background/4/Rest` | Grey-94 `#ebf0fc` | `n.black.v1` L3 `#f0f2f7` | `0.011744` | Grey-4 `#070a11` | `n.black.v1` D1 `#060708` | `0.021706` |
| `Brand/Background/2/Rest` | Brand-160 `#d9f1ff` | `b.blue.v1` L4 `#e1efff` | `0.010752` | Brand-20 `#001241` | `b.blue.v1` D4 `#0b1929` | `0.056666` |
| `Brand/Background/1/Rest` | Brand-80 `#0064b4` | `b.blue.v1` L50 `#0064b4` | `0` | Brand-70 `#0055a4` | `b.blue.v1` D35 `#005ba4` | `0.017032` |

This mapping is alias-specific. The Blue generated `vivid` reference is
L50/D40, but the official Dark `Brand/Background/1/Rest` maps to D35.
Similarly, the Black family's functional references do not replace the
individual Neutral Background mappings above.

Absolute Black is part of Fluent's official Neutral primitive ramp but is not
one of the six surfaces shown by `9738:4934`. Kiskadee may expose it as the
Darker canonical surface through the exact `n.black.v1` L100/D0 cap
`#000000`; that use is a **Kiskadee extension**.

## Card Decisions

The inspected Card component set uses radius `4` and 1px inside strokes.

### Official Light State Colors

The following Figma colors are source evidence. The L positions and generated
HEX values are the active Kiskadee adaptations.

| Treatment | Rest | Hover | Pressed | Selected | Disabled |
| --- | --- | --- | --- | --- | --- |
| Filled | `#ffffff` -> L0 `#ffffff` | `#f0f5ff` -> L2 `#f5f6fb` | `#dbe0ec` -> L7 `#dde0e8` | `#e6ebf7` -> L5 `#e6e9f0` | `#ebf0fc` -> L3 `#f0f2f7` |
| Filled alt | `#f5faff` -> L1 `#f9fbfe` | `#ebf0fc` -> L3 `#f0f2f7` | `#d6dbe7` -> L8 `#d8dbe3` | `#e1e6f2` -> L6 `#e2e5ec` | `#ebf0fc` -> L3 `#f0f2f7` |
| Subtle | transparent | `#f0f5ff` -> L2 `#f5f6fb` | `#dbe0ec` -> L7 `#dde0e8` | `#e6ebf7` -> L5 `#e6e9f0` | `#ebf0fc` -> L3 `#f0f2f7` |

Outline has a transparent background and uses the following stroke sequence:

| State | Official stroke | Kiskadee stroke |
| --- | --- | --- |
| Rest | `#ccd1dd` | L10 `#ced1db` |
| Hover | `#c3c7d3` | L12 `#c7cbd5` |
| Pressed | `#afb3bf` | L18 `#afb2be` |
| Selected | `#b9bdc9` | L16 `#b6bac5` |
| Disabled | `#dbe0ec` | L7 `#dde0e8` |

The official Filled selected state also uses stroke `#b9bdc9`. Filled and
Filled alt use `Shadow 04` at Rest, Pressed, Selected, and Disabled and
`Shadow 08` at Hover and Draggable. The Light Draggable fill remains
`#ffffff`. Outline has no base shadow except while Draggable.

### Official Dark State Colors

The Dark Card states were inspected independently in the Figma component set.
They are not derived by reversing the Light sequence.

| Treatment | Rest | Hover | Pressed | Selected | Disabled |
| --- | --- | --- | --- | --- | --- |
| Filled | `#262932` -> D9 `#262a33` | `#393d47` -> D20 `#3b3e49` | `#1c1f28` -> D6 `#1d2026` | `#343842` -> D16 `#353843` | `#11141c` -> D3 `#131416` |
| Filled alt | `#1c1f28` -> D6 `#1d2026` | `#2f333c` -> D12 `#2d313b` | `#11141c` -> D3 `#131416` | `#2b2e37` -> D10 `#292c35` | `#11141c` -> D3 `#131416` |
| Subtle | transparent | `#343842` -> D16 `#353843` | `#2b2e37` -> D10 `#292c35` | `#2f333c` -> D12 `#2d313b` | `#11141c` -> D3 `#131416` |

Dark Outline remains transparent and uses:

| State | Official stroke | Kiskadee stroke | Emission decision |
| --- | --- | --- | --- |
| Rest | `#626671` | D45 `#646975` | Explicit Rest |
| Hover | `#717580` | D50 `#6d717d` | Explicit Hover |
| Pressed | `#676b76` | D45 `#646975` | Rest-equal after adaptation; omitted |
| Selected | `#6c707b` | D50 `#6d717d` | Explicit Selected |
| Disabled | `#3e424c` | D22 `#3e414d` | Explicit Disabled |

Focus is visually Rest-equal in both themes and is omitted from the palette.
The global focus ring remains the accessibility affordance.

## Kiskadee Mapping

The Card component set itself is neutral: the rows are component treatments, not
public Kiskadee intents. Kiskadee does not expose an `outline` Card axis; Card
must be described through `segment`, `intent`, and `emphasis`.

The Fluent Card treatments therefore map to Kiskadee as:

| Fluent Card treatment | Kiskadee bucket | Reason |
| --- | --- | --- |
| Filled | `neutral.low` | White/base Card surface. |
| Filled alt | `neutral.medium` | Light tonal Card surface. |
| Outline | `neutral.low` border behavior | Kiskadee has no `outline` axis; this is the same low/base bucket with the border visible. |
| Subtle | `neutral.lowest` | No own surface at rest. |

This is intentionally lossy for the Filled-vs-Outline split. A Fluent Filled
Card has no visible stroke, while Outline is transparent with a stroke. In the
current Kiskadee Card contract the closest representation is:

- use `neutral.low` for the base/outline family;
- keep the schema border on `neutral.low` so the outline reading is available;
- use `preserveBorderWithShadow={false}` when a raised Filled Card should rely
  on shadow instead of a visible border;
- use `neutral.lowest` for the no-surface/no-border rest treatment.

The complete implemented bucket matrix is:

| Intent and emphasis | Source relationship | Status |
| --- | --- | --- |
| `neutral.lowest` | Subtle | Official adapted |
| `neutral.low` | Filled background with Outline border behavior | Official adapted |
| `neutral.medium` | Filled alt | Official adapted |
| `neutral.high` | `Neutral/Background/3/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `neutral.highest` | `Neutral/Background/4/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `primary.lowest` | Transparent Primary treatment | Kiskadee extension |
| `primary.low` | Base Primary treatment | Kiskadee extension |
| `primary.medium` | `Brand/Background/2/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `primary.high` | `Brand/Background/1/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `primary.highest` | Not emitted | No seventh official surface alias exists in the inspected sticker sheet |

Primary Card buckets and the canonical High/Highest state progressions are
Kiskadee semantic surface adaptations. Their colors resolve through documented
tonal positions rather than schema HEX literals. The source-backed Rest aliases
remain distinct from the framework-authored interactive deltas.

Dark and Darker share the Dark bucket recipes. Darker changes only
`neutral.highest` Rest to the absolute-black D0 cap `#000000`, a Kiskadee
extension outside the six official sticker-sheet aliases.

The Card surface itself remains in `surfaceContext="default"`: its intent and
emphasis select which surface the Card emits. The Card does not become
`inverse` merely because it owns a strong or dark fill. Descendant components
choose their own context independently. A child placed on a strong Card
surface, such as the Primary vivid surface, may request
`surfaceContext="inverse"` when that component and preset declare support.
This keeps surface ownership with Card and contrast/polarity treatment with
the child instead of coupling Card appearance to every descendant.

Kiskadee exposes one Card shadow recipe for the root surface. The Fluent preset
emits only Rest as `Shadow 04` (`s:md:1`) and Hover as `Shadow 08`
(`s:lg:1`). Pressed, Focus, and Disabled omit redundant declarations and
inherit Rest through sparse-state semantics. The complete Fluent shadow scale
stays available through `fixedLevels` for Showcase and static Card examples.
