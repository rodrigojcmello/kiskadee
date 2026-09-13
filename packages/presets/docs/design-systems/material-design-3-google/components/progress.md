# Material Design 3 Google Progress Evidence

## Sources

- [Material 3 Progress indicators](https://m3.material.io/components/progress-indicators/overview),
  consulted for linear/circular determinate and indeterminate progress behavior.
- [Material 3 Design Kit](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=57994-696)
  - file key: `Peqe9lNMsuQHLIUZsiTZNg`; inspected section: `57994:696` (Buttons).
  - A Progress component node was not located in this inspection. Progress-specific Figma
    appearance is **Not inspected**.
- Local fallback: [Fluent 2 Progress evidence](../../fluent-2-microsoft/components/progress.md),
  authorized for semantic intent and surrounding-surface completion.
- [Approved Material tonal assets](../colors/README.md).

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Linear progress and determinate/indeterminate behavior | Material 3 overview | Linear contract | Official adapted |
| Circular indicator | Material 3 overview | Confirmed upstream capability | Deferred |
| Semantic success, warning and error colors | Local Fluent fallback | Intent family mapping | Official adapted |
| Dark, dynamic and `onVivid` completion | Local fallback and Core contexts | Full Kiskadee matrix | Kiskadee extension |
| Progress component Figma appearance | No component node found | No component node | Not inspected |

## Local Evidence

No local screenshot was captured. The available Figma inspection covered the Buttons section only;
Progress-specific visual evidence remains **Not inspected**.

## Official Contract

Material uses progress indicators to communicate ongoing completion. This recipe publishes the
linear track and indicator paint only; determinate versus indeterminate motion remains runtime
behavior. Core's Progress contract is intentionally Rest-only and has one canonical emphasis,
`medium`. No hover, focus, pressed, selected or disabled palette is invented for progress.

Circular progress and expressive waveform or motion details remain deferred until the Core contract
and a component-specific source review support them.

## Kiskadee Mapping

| Intent | Tonal family | Relationship |
| --- | --- | --- |
| `neutral` | Existing tinted neutral | Default framework-neutral indicator and track |
| `primary` | Approved blue primary | Material default/brand progress |
| `positive` | Approved green family | Success completion |
| `warning` | Approved yellow family | Cautionary completion |
| `destructive` | Approved red family | Error or failed completion |

Layer 3 roles map to existing families only. No orange promotion, extra seed or new progress
emphasis is introduced.

## Shared Formula

The neutral track is `progress.neutral.medium` in every segment, theme and context. On `onSubtle`,
the track uses the role's subtle family at `+1`; indicators use each intent's vivid family. On
Dark `onSubtle`, chromatic indicators use vivid `+6` to preserve a measurable contrast margin over
the dark track; neutral retains vivid `+0` because its authored neutral vivid endpoint is already
the readable choice. On `onVivid`, the track uses the canonical physical white cap at 18% alpha,
and indicators use each intent's Light-track subtle family at `+1`.

These offsets and the physical track alpha are Kiskadee adaptations informed by the Fluent
ProgressBar fallback. They preserve the semantic family across contexts without copying a raw
Material or Fluent hex value into the schema.

## Schema Mapping

- `e1`: semantic Progress root.
- `e2`: neutral track with 2 px (`s:md:1`) and 4 px (`s:lg:1`) heights and pill radius.
- `e3`: intent indicator with pill radius and one `medium.rest` profile for each intent.

Density maps compact to `s:md:1` and spacious to `s:lg:1`. The schema publishes both `default` and
`dynamic` segments, Light/Dark themes and `onSubtle`/`onVivid` contexts.

## Color And Token Provenance

All colors resolve through `PresetColorGetter` references to `progress.<intent>` and the canonical
`primitive.black.v1` cap. The approved authored seeds are documented in [Material tonal assets](../colors/README.md):
blue `#0B57D0`, red `#B3261E`, green `#146C2E`, tinted neutral `#03233C`, plus existing yellow,
purple and pink support families. The schema contains no literal color.

## Kiskadee Extensions

- `neutral.medium` supplies a framework-neutral track and indicator.
- `onVivid` uses the physical white track cap and Light-track intent indicators.
- Dark chromatic `onSubtle` indicators use vivid `+6` to preserve contrast.

## Deferred Or Unsupported

- Circular progress, custom waveform, motion and thickness variants beyond the two Core scales are
  deferred. No approximation is emitted.
- Progress has no interaction-color states; determinate/indeterminate behavior remains runtime.

## Validation

Focused tests cover all segments, themes and surface contexts, neutral track coverage, all five
indicator intents, Rest-only medium output, family independence, the physical `onVivid` track and
the dark indicator-to-track contrast floor. Biome and the preset typecheck are run directly from
repository tool paths when dependencies are available. Visual homologation against a
Progress-specific Figma node is **Not inspected** and remains user-owned.

## Open Gaps

Progress-specific Figma nodes and screenshot evidence remain unavailable. The user owns final visual
homologation against Material's current component kit.

Neutral seed updated on 2026-09-13 through the approved Chromatic offset primary-derived recipe;
see [current tonal provenance](../colors/README.md). Component formulas remain unchanged.
