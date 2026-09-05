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
  [`b.blue.v1.json`](../colors/generated/colors/b.blue.v1.json),
  [`n.black.v1.json`](../colors/generated/colors/n.black.v1.json), and
  [`n.black.v2.json`](../colors/generated/colors/n.black.v2.json)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Card component set | `9230:4927` | Filled, Filled alt, Outline, and Subtle treatments | Official adapted |
| Theme sticker sheet | `9738:4934` | Six surface aliases and their Light/Dark variable bindings | Official exact |
| Kiskadee tonal mapping | `figma-to-kiskadee.json`, generator `0.5.0` | Blue, pure grayscale, and Fluent tinted-neutral Light/Dark positions | Official adapted |
| Absolute-black Darker surface | Black primitive, outside the six sticker-sheet surfaces | `cap(primitive.black.v1, dark)` | Kiskadee extension |
| Ambient surface boundary | Kiskadee Button Showcase review, 2026-08-29 | Rest separation for light and vivid Cards on `onSubtle` and `onVivid` parents | Kiskadee extension |

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
`0.5.0` Blue and achromatic assets. A non-zero Delta E is an explicit tonal
adaptation, not an assertion that the generated ramp reproduces the Fluent
primitive exactly.

| Fluent surface alias | Official Light | Kiskadee Light | Delta E OK | Official Dark | Kiskadee Dark | Delta E OK |
| --- | --- | --- | ---: | --- | --- | ---: |
| `Neutral/Background/1/Rest` | White `#ffffff` | `n.black.v1` L0 `#ffffff` | `0` | Grey-16 `#262932` | `n.black.v2` D9 `#262a33` | `0.003411` |
| `Neutral/Background/2/Rest` | Grey-98 `#f5faff` | `n.black.v2` L1 `#f9fbff` | `0.006035` | Grey-12 `#1c1f28` | `n.black.v2` D6 `#1d1f28` | `0.001777` |
| `Neutral/Background/3/Rest` | Grey-96 `#f0f5ff` | `n.black.v2` L2 `#f4f6fe` | `0.006273` | Grey-8 `#11141c` | `n.black.v2` D3 `#11131c` | `0.003815` |
| `Neutral/Background/4/Rest` | Grey-94 `#ebf0fc` | `n.black.v2` L3 `#eef2fc` | `0.006822` | Grey-4 `#070a11` | `n.black.v2` D2 `#0b0d15` | `0.016366` |
| `Brand/Background/2/Rest` | Brand-160 `#d9f1ff` | `b.blue.v1` L4 `#e1efff` | `0.010752` | Brand-20 `#001241` | `b.blue.v1` D4 `#0b1929` | `0.056666` |
| `Brand/Background/1/Rest` | Brand-80 `#0064b4` | `b.blue.v1` L50 `#0064b4` | `0` | Brand-70 `#0055a4` | `b.blue.v1` D35 `#005ba4` | `0.017032` |

This mapping is alias-specific. The Blue generated `vivid` reference is
L50/D40, but the official Dark `Brand/Background/1/Rest` maps to D35.
Similarly, the achromatic functional references do not replace the individual
Neutral Background mappings above.

`Neutral/Background/3/Rest` and `Neutral/Background/4/Rest` are distinct
semantic aliases, not distinct primitive color identities. Both belong to the
single Fluent tinted-neutral family `n.black.v2`; their different Card
appearances are expressed by positions within that family. Kiskadee does not
create `n.black.v3` or `n.black.v4` from those alias names.

The complete `n.black.v2` tonal scale and all six inspected sticker-sheet
aliases remain preserved as source evidence, but an alias does not
automatically become another public Card emphasis. In particular,
`Neutral/Background/3/Rest` and `Neutral/Background/4/Rest` are adjacent stops
with no sufficiently distinct Card role. The Card therefore publishes
Background 3 as its stronger neutral Rest surface and keeps Background 4 only
where the upstream component assigns it a concrete state, such as Disabled.
This avoids turning primitive-ramp density into duplicate component options.

Absolute Black is part of Fluent's official Neutral primitive ramp but is not
one of the six surfaces shown by `9738:4934`. Kiskadee may expose it as the
Darker canonical surface through the pure-grayscale `n.black.v1` L100/D0 cap
`#000000`; that use is a **Kiskadee extension**.

## Color And Token Provenance

The Light, Dark, and Darker surface/state matrices below form the closed `component.card` exact
catalog because Fluent selects these aliases independently rather than through one shared family
formula. Physical transparent boundaries and the 15% vivid-context boundary use `cap: light`.

The inspected Card component set uses radius `4` and 1px inside strokes.

### Official Light State Colors

The following Figma colors are source evidence. The L positions and generated
HEX values are the active Kiskadee adaptations.

| Treatment | Rest | Hover | Pressed | Selected | Disabled |
| --- | --- | --- | --- | --- | --- |
| Filled | `#ffffff` -> `n.black.v1` L0 `#ffffff` | `#f0f5ff` -> `n.black.v2` L2 `#f4f6fe` | `#dbe0ec` -> `n.black.v2` L7 `#dce0ed` | `#e6ebf7` -> `n.black.v2` L5 `#e4e9f5` | `#ebf0fc` -> `n.black.v2` L3 `#eef2fc` |
| Filled alt | `#f5faff` -> `n.black.v2` L1 `#f9fbff` | `#ebf0fc` -> `n.black.v2` L3 `#eef2fc` | `#d6dbe7` -> `n.black.v2` L8 `#d6dbe7` | `#e1e6f2` -> `n.black.v2` L6 `#e0e5f1` | `#ebf0fc` -> `n.black.v2` L3 `#eef2fc` |
| Subtle | transparent | `#f0f5ff` -> `n.black.v2` L2 `#f4f6fe` | `#dbe0ec` -> `n.black.v2` L7 `#dce0ed` | `#e6ebf7` -> `n.black.v2` L5 `#e4e9f5` | `#ebf0fc` -> `n.black.v2` L3 `#eef2fc` |

Outline has a transparent background and uses the following stroke sequence:

| State | Official stroke | Kiskadee stroke |
| --- | --- | --- |
| Rest | `#ccd1dd` | `n.black.v2` L10 `#cdd1de` |
| Hover | `#c3c7d3` | `n.black.v2` L12 `#c6cbd7` |
| Pressed | `#afb3bf` | `n.black.v2` L18 `#aeb2be` |
| Selected | `#b9bdc9` | `n.black.v2` L16 `#b6bac6` |
| Disabled | `#dbe0ec` | `n.black.v2` L7 `#dce0ed` |

The official Filled selected state also uses stroke `#b9bdc9`. Filled and
Filled alt use `Shadow 04` at Rest, Pressed, Selected, and Disabled and
`Shadow 08` at Hover and Draggable. The Light Draggable fill remains
`#ffffff`. Outline has no base shadow except while Draggable.

### Official Dark State Colors

The Dark Card states were inspected independently in the Figma component set.
They are not derived by reversing the Light sequence.

| Treatment | Rest | Hover | Pressed | Selected | Disabled |
| --- | --- | --- | --- | --- | --- |
| Filled | `#262932` -> `n.black.v2` D9 `#262a33` | `#393d47` -> `n.black.v2` D20 `#3b3e48` | `#1c1f28` -> `n.black.v2` D6 `#1d1f28` | `#343842` -> `n.black.v2` D16 `#353842` | `#11141c` -> `n.black.v2` D3 `#11131c` |
| Filled alt | `#1c1f28` -> `n.black.v2` D6 `#1d1f28` | `#2f333c` -> `n.black.v2` D12 `#2e313a` | `#11141c` -> `n.black.v2` D3 `#11131c` | `#2b2e37` -> `n.black.v2` D10 `#292c35` | `#11141c` -> `n.black.v2` D3 `#11131c` |
| Subtle | transparent | `#343842` -> `n.black.v2` D16 `#353842` | `#2b2e37` -> `n.black.v2` D10 `#292c35` | `#2f333c` -> `n.black.v2` D12 `#2e313a` | `#11141c` -> `n.black.v2` D3 `#11131c` |

Dark Outline remains transparent and uses:

| State | Official stroke | Kiskadee stroke | Emission decision |
| --- | --- | --- | --- |
| Rest | `#626671` | `n.black.v2` D45 `#656973` | Explicit Rest |
| Hover | `#717580` | `n.black.v2` D50 `#6d717c` | Explicit Hover |
| Pressed | `#676b76` | `n.black.v2` D45 `#656973` | Rest-equal after adaptation; omitted |
| Selected | `#6c707b` | `n.black.v2` D50 `#6d717c` | Explicit Selected |
| Disabled | `#3e424c` | `n.black.v2` D22 `#3e414b` | Explicit Disabled |

Focus is visually Rest-equal in both themes and is omitted from the palette.
The global focus ring remains the accessibility affordance.

### Kiskadee Ambient Surface Adaptation

### Independent static border (2026-09-05)

This user-approved **Kiskadee extension** supersedes the availability restriction in the
historical mapping below, without changing surfaces or interactive border deltas.
Every published combination now provides a Rest border recipe. Non-vivid-producing Cards
reuse their theme's existing Neutral/Primary Lowest border locator. Primary Highest reuses
the approved physical white cap at 15% alpha in both consumed contexts. No new source color
or tonal mapping is introduced.

`options.border` defaults are true only for Lowest onSubtle and Primary Highest onVivid.
The map is authored explicitly by segment, theme, context, intent and emphasis for readability;
replacing the former generated boolean map does not change any defaults or source recipes.
All other published defaults are false. Static Card can override the default independently
of shadow. CardAction keeps the previous Rest visibility and all existing state declarations;
the build represents an off Rest with a transparent atomic border class. Transparent RGB
channels are immaterial to paint. The historical onVivid behavior below describes defaults,
not the newly available manual recipes.

The inspected Fluent Card source does not define a complete Card-on-vivid matrix. Kiskadee adds an
explicit `onVivid` input palette so the Card can preserve its own surface identity while adapting
the Rest boundary to the surrounding semantic surface.

| Consumed context | `neutral.low` Card | `primary.highest` Card |
| --- | --- | --- |
| `onSubtle` | Existing source-backed neutral border | Transparent border; the vivid fill provides separation |
| `onVivid` | Transparent border; the light Card provides separation | Absolute white at 15% alpha; the two vivid surfaces need a subtle boundary |

The `onVivid` box recipes intentionally reuse the same Light, Dark, and Darker Card surfaces and
state deltas as `onSubtle`. Context does not turn a white/base Card into a vivid Card or vice versa.
Only the border recipe adapts:

- `primary.highest` uses `cap(primitive.black.v1, light, 15%)`, resolving to
  `#ffffff26` in every theme;
- every other `onVivid` Rest border uses the same physical light cap at 0% alpha;
- Hover, Pressed, Selected, and Disabled border deltas are intentionally un-authored in this
  extension, so the Rest boundary remains active while those states continue to be expressed by
  the existing box-color deltas.

This is a **Kiskadee extension**. The values resolve at schema build time through the approved pure
grayscale primitive. The React runtime does not inspect DOM color or calculate contrast.

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
- use `border={false}` on static Card when a raised Filled Card should rely
  on shadow instead of a visible border;
- use `neutral.lowest` for the no-surface/no-border rest treatment.

The complete implemented bucket matrix is:

| Intent and emphasis | Source relationship | Status |
| --- | --- | --- |
| `neutral.lowest` | Subtle | Official adapted |
| `neutral.low` | Filled background with Outline border behavior | Official adapted |
| `neutral.medium` | Filled alt | Official adapted |
| `neutral.high` | `Neutral/Background/3/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `neutral.highest` | Absolute Black, emitted only in Darker | Kiskadee extension |
| `primary.lowest` | Transparent Primary treatment | Kiskadee extension |
| `primary.low` | Base Primary treatment | Kiskadee extension |
| `primary.medium` | `Brand/Background/2/Rest` | Official adapted surface alias; interaction deltas are Kiskadee extensions |
| `primary.high` | Not emitted | Fluent has no distinct Primary surface between its subtle and vivid aliases |
| `primary.highest` | `Brand/Background/1/Rest` | Official adapted vivid/on-vivid surface alias; interaction deltas are Kiskadee extensions |

Primary Card buckets and the canonical Highest state progressions are Kiskadee
semantic surface adaptations. Their colors resolve through documented tonal
positions rather than schema HEX literals. The source-backed Rest aliases
remain distinct from the framework-authored interactive deltas.

Card emphasis is intentionally sparse. `primary.medium` represents the source's
subtle Brand surface and `primary.highest` represents its vivid/on-vivid Brand
surface. Fluent does not provide a distinct intermediate Brand surface with a
comparable role to `neutral.high`, so `primary.high` is omitted instead of
inventing another blue or assigning the vivid surface to a misleading bucket.
Another preset may publish `primary.high` when its source provides a real
intermediate surface.

For Dark and Darker, `primary.medium` intentionally uses D10 `#142d48` instead
of the nearest-neighbor D4 `#0b1929` recorded for
`Brand/Background/2/Rest`. The `muted-darks` D4 match preserves the official
surface lightness but loses too much blue chroma to retain the source's
dark-blue identity in a Card. This visual adaptation was approved for Light,
Dark, and Darker during the KIS-68 review and keeps the state progression local
to the approved `b.blue.v1` asset:

| State | Dark/Darker position | Generated HEX | Status |
| --- | --- | --- | --- |
| Rest | D10 | `#142d48` | Approved Kiskadee visual adaptation |
| Hover | D16 | `#143a61` | Kiskadee extension |
| Pressed | D8 | `#13273e` | Kiskadee extension |
| Selected | D12 | `#153251` | Kiskadee extension |
| Disabled | `n.black.v2` D3 | `#11131c` | Existing shared disabled treatment |

Light and Dark intentionally omit `neutral.highest` rather than exposing
`Neutral/Background/4/Rest` as a near-duplicate of `neutral.high`. Darker adds
`neutral.highest` with the absolute-black `n.black.v1` D0 cap `#000000`, a
visually distinct Kiskadee extension outside the six official sticker-sheet
aliases.

The Card consumes the ambient `surfaceContext`, while intent and emphasis select which surface the
Card owns. The Fluent schema publishes the same surface recipes under both input contexts and uses
the contextual branch only for the boundary adaptation described above.

The authored `contentSurfaceContext` map remains a separate output contract for descendants. It is
published for both input contexts:

- transparent `lowest` surfaces inherit the consumed context;
- Neutral Low, Medium, High, and Darker Highest produce `onSubtle`;
- Primary Low and Medium produce `onSubtle`;
- Primary Highest produces `onVivid`.

The p-react Card resolves this map and republishes the result with `SurfaceContextProvider`.
`canonicalSurfaces` remains the recommended surface catalog and is not used as a substitute for
runtime propagation.

`components.card.options.canonicalSurfaces` publishes the source-backed
surface catalog in its intended order for every theme:

1. `neutral.low` -> descendant context `onSubtle`;
2. `neutral.medium` -> descendant context `onSubtle`;
3. `primary.medium` -> descendant context `onSubtle`;
4. `neutral.high` -> descendant context `onSubtle`;
5. `primary.highest` -> descendant context `onVivid`;
6. `neutral.highest` -> descendant context `onSubtle`, only in Darker.

The Primary vivid Card is therefore explicitly associated with `onVivid` for
descendants without changing the Card's own palette. The Web Builder validates
these references and publishes their resolved Rest values in
`components/card.kiskadee.json`. Consumers use that artifact instead of
duplicating the order or inferring surface context from luminance.

This keeps surface ownership with Card and contrast/polarity treatment with the
child instead of coupling Card appearance to every descendant.

Kiskadee exposes one Card shadow recipe for the root surface. The Fluent preset
emits only Rest as `Shadow 04` (`s:md:1`) and Hover as `Shadow 08`
(`s:lg:1`). Pressed, Focus, and Disabled omit redundant declarations and
inherit Rest through sparse-state semantics. The complete Fluent shadow scale
stays available through `fixedLevels` for Showcase and static Card examples.

## Validation

- The focused Fluent Card schema test passes with the existing five assertions.
- `pnpm --filter @kiskadee/web-builder build` and
  `pnpm --filter @kiskadee/web-builder run build-sync-generate` complete successfully.
- The Hover, Pressed, and Disabled sparse-state audits report no Rest-equal deltas.
- `pnpm --filter @kiskadee/react-components build` and
  `pnpm --filter @kiskadee/showcase build` complete successfully.
- Generated Fluent CSS confirms the Rest matrix: neutral Low is `#cdd1de` on `onSubtle` and
  transparent on `onVivid`; Primary Highest is transparent on `onSubtle` and `#ffffff26` on
  `onVivid`.
- Switching the Showcase to `onVivid` emits no missing-surface-context warning for Card. Desktop
  and 390px mobile checks show no horizontal overflow or framework error overlay.
