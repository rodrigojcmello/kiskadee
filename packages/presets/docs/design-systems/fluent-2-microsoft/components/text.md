# Fluent 2 Text Evidence

This file records the global foreground recipes in `fluent-2-microsoft.foregrounds.ts`
and their publication by `components/text.schema.ts`.

## Sources

- Official documentation:
  [Fluent 2 color tokens](https://fluent2.microsoft.design/color-tokens)
- Exact captured Neutral ramp and nearest Kiskadee positions:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)
- Current achromatic mapping and approval:
  [neutral surface calibration](neutral-surface-calibration.md) and
  [tonal evidence](../colors/fluent-tonal-scale-evidence.md)
- Approved pure-grayscale asset and absolute caps:
  [`n.black.v1.json`](../colors/generated/colors/n.black.v1.json)
- Existing component foreground evidence used to calibrate chromatic Text:
  [`button.md`](./button.md) and [`badge.md`](./badge.md)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Neutral Foreground 1 through 4; Foreground OnBrand | Existing captured Light/Dark token evidence and approved achromatic primitive asset | Official adapted |
| Four foreground strengths | High/Medium retain the previous Medium/Low; Low fills the gap before Lowest | Kiskadee extension |
| Neutral Standard | One achromatic profile, including component-owned optional state coordinates | Kiskadee extension |
| Chromatic Standard and Deep | Blue, Cranberry, Green, Berry, Orange, Marigold; both surface contexts | Kiskadee extension |
| Darker and Teams | Dark track reused for Darker; primary Blue resolves the selected segment identity | Kiskadee extension |

## Color And Token Provenance

Fluent's source aliases do not define a generic `high | medium | low | lowest` API.
The complete upstream de-para remains in the linked tonal evidence. The current approved
achromatic calibration uses `primitive.black.v1`, shared by Microsoft and Teams.
No new primitive asset is introduced by this four-strength migration.

| Neutral onSubtle strength | Strict reference locator, Light | Resolved Light | Strict reference locator, Dark/Darker | Resolved Dark/Darker |
| --- | --- | --- | --- | --- |
| `high` | `reference(neutral, vivid +0)` | L85 `#252525` | `reference(neutral, vivid +3)` | D100 `#ffffff` |
| `medium` | `reference(neutral, vivid -7)` | L50 `#616161` | `reference(neutral, vivid -2)` | D80 `#b4b4b4` |
| `low` | `reference(neutral, vivid -14)` | L24 `#9b9b9b` | `reference(neutral, vivid -6)` | D60 `#828282` |
| `lowest` | `reference(neutral, vivid -21)` | L10 `#d1d1d1` | `reference(neutral, vivid -11)` | D35 `#5a5a5a` |

High is the old Medium; Medium is the old Low; Lowest is unchanged. The new Low is an
explicit preset-authored intermediate, selected on the approved public tonal grid. These
functional offsets remain family-relative; the listed L/D values describe their present
resolution rather than independent exact-tone decisions.

Neutral onVivid uses `cap(primitive.black.v1, light)` at 100%, 68%, **46%**, and 24%
for High/Medium/Low/Lowest. The new 46% coordinate is the arithmetic midpoint of the
previous 68% and 24% alpha anchors. This is an authoring formula, never browser sampling.

### Chromatic Standard

| Context | Theme | High anchor | Medium | Low | Lowest |
| --- | --- | --- | ---: | ---: | ---: |
| onSubtle | Light | family `vivid` | 68% | 46% | 24% |
| onSubtle | Dark/Darker | family `vivid +8` | 68% | 46% | 24% |
| onVivid | Light | family Light-track `subtle +8` | 76% | 58% | 40% |
| onVivid | Dark/Darker | family Light-track `subtle -2` | 76% | 58% | 40% |

Blue follows semantic Primary, so Teams resolves its approved Indigo identity. All other
families retain their approved primitive role. The new Low uses the midpoint alpha,
46% onSubtle and 58% onVivid, without moving the source anchor or generating new assets.

### Deep Profile Extension

Deep is an independent **chromatic** profile. Neutral publishes only Standard; there is no
neutral Deep recipe or alias. The six approved chromatic families keep Deep:

| Context | Theme | High anchor | Medium | Low | Lowest |
| --- | --- | --- | ---: | ---: | ---: |
| onSubtle | Light | family L65 | 68% | 46% | 24% |
| onSubtle | Dark/Darker | family D75 | 68% | 46% | 24% |
| onVivid | All | family Light-track `subtle +2` | 76% | 58% | 40% |

The onSubtle anchor retains `exactColor(..., 'global.foreground.deep')`, calibrated from
the approved Button label evidence. The onVivid anchor remains a strict functional
reference. New Low descendants are **Kiskadee extensions**, as is the complete Deep API.

### Stateful Global Coordinates

Standalone Text projects only Rest. Optional global states remain available to component
slots through `fg` and `fg.parentState` and resolve before CSS publication.

- Standard onSubtle High retains the previous normal coordinate's Hover/Pressed and 70%
  Pending relationship. Chromatic Deep High retains 70% Pending.
- Neutral Standard onSubtle Medium also publishes Pending at 70% of its own Rest, and
  disabled L20 at 82% in Light / solid D35 in Dark and Darker.
- Neutral Standard onSubtle Lowest preserves disabled solid L16 in Light / D35 in Dark.
- Neutral Standard onVivid High retains Pending at 70%; High, Medium and Lowest preserve
  the component disabled physical-white cap at 40%.

The preserved disabled stops use evidence-backed exact locators registered under
`global.foreground.states`. They do not create another neutral Rest hierarchy.

Removing Neutral Deep deliberately changes consumers that previously depended on its
absolute-black cap, L65/D75 lower gray, or neutral Light-track `subtle +4`. Button and
Switch now select the corresponding Standard strength. Those intentional differences
are not hidden by a duplicate profile, alias, or component-local replacement recipe.

## Schema Mapping

`components.text.options.emphasis` is explicitly `high`. Omitted Text emphasis uses that
preset-owned default; an explicit public emphasis overrides it. Typography profiles retain
font metrics only. Button/Switch/TextField recipes select their own foreground coordinates
and do not consume Text's default.

`text.e1.foreground` publishes `neutral` -> `neutral.standard`, plus Standard and `-deep`
aliases for Blue, Red, Green, Purple, Orange and Yellow. Every published profile is complete
for four strengths in Light, Dark and Darker, both contexts and both segments. Unsupported
harmony-derived Teal/Lime/Indigo/Magenta/Brown candidates are not promoted by this change.

Button surface emphasis is independent from foreground strength. An ordinary Medium
chromatic Button still selects its Deep **High** coordinate, preserving the previous Deep
Medium color. TextField surfaced validation content similarly moves to Deep High.
The neutral passive TextField icon onVivid now selects Standard Medium, preserving 68% white.

## Validation

Focused preset tests cover the four-strength matrix, new intermediate references, absence
of Neutral Deep, explicit Text default, valid component coordinate targets/states and
preserved TextField validation contrast. The productive color-policy test continues to
reject schema color literals and require registered exact-tone evidence. Artifact generation
and rendered Showcase validation exercise the complete handoff separately.
