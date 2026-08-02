# Fluent 2 Microsoft Progress Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/fluent-2-microsoft/components/progress.schema.ts`.

## Sources

- Figma reference:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-5893&t=y1zSeA7dOM6aiDmx-11)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - static node: `9121:5771`
  - animated node: `9121:5796`
- Official documentation:
  [Fluent 2 Progress Bar usage](https://fluent2.microsoft.design/components/web/react/core/progressbar/usage)
- Official implementation:
  [ProgressBar types](https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-progress/library/src/components/ProgressBar/ProgressBar.types.ts)
  and
  [ProgressBar styles](https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-progress/library/src/components/ProgressBar/useProgressBarStyles.styles.ts)
- Tonal evidence:
  [Fluent 2 color evidence and Kiskadee mapping](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Static ProgressBar | `9121:5771` | Medium/Large, Default/Success/Warning/Error | Official adapted |
| Animated ProgressBar | `9121:5796` | Determinate/Indeterminate | Official adapted |
| Warning color | Static ProgressBar | Dark Orange `#da3b01` | Official adapted |
| Strong surrounding surface | No equivalent source | `onVivid` completion | Kiskadee extension |

## Official Contract

- Fluent exposes Medium and Large thicknesses, mapped to 2px and 4px.
- Fluent exposes Determinate and Indeterminate modes.
- Fluent exposes Default, Success, Warning, and Error semantic appearances.
- The track uses Neutral Background 6; Default uses Brand.
- The inspected source does not expose an emphasis axis for ProgressBar.
- Rounded geometry is canonical. Square shape exists upstream but remains deferred.

## Color And Token Provenance

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| Track | Neutral Background 6 | `e2.boxColor.neutral.medium`, L6/D12 |
| Default | Brand | `e3.boxColor.primary.medium`, L50/D60 |
| Success | Green | `e3.boxColor.positive.medium`, L45/D45 |
| Warning | Dark Orange `#da3b01` | `e3.boxColor.warning.medium`, Orange v1 L50/D55 |
| Error | Cranberry | `e3.boxColor.destructive.medium`, L45/D40 |
| Neutral extension | Fluent neutral ramp | `e3.boxColor.neutral.medium`, L85/D90 |

The Warning role remains mapped to the existing `primitive.orange.v1` asset. This is an explicit
adaptation of the source Dark Orange anchor; no `orange.v2` family, recipe, asset, or version is
created.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| `primary.medium` | Default / Brand | Official adapted | Canonical default semantic fill |
| `positive.medium` | Success / Green | Official adapted | Canonical success fill |
| `warning.medium` | Warning / Dark Orange | Official adapted | Existing Orange v1 tonal position |
| `destructive.medium` | Error / Cranberry | Official adapted | Canonical error fill |
| `neutral.medium` | No standalone semantic variant | Kiskadee extension | Framework-neutral fallback |
| `onVivid` | No equivalent source | Kiskadee extension | Light functional reference plus 8 |

Progress publishes only `medium`. Earlier generalized `highest`, `high`, `low`, and `lowest`
profiles were removed because they had no upstream semantic meaning and created multiple visual
answers for the same Progress intent.

## Kiskadee Extensions

- `neutral.medium` provides the framework's canonical neutral default.
- `onVivid` keeps Progress usable on strong surrounding surfaces. Its track uses absolute white at
  18% alpha and its indicator uses each Light functional `subtle` reference plus 8.
- Light, Dark, and Darker remain resolved separately by the preset tonal getter.

## Deferred Or Unsupported

- Square ProgressBar shape is deferred.
- Consumer-selectable Progress emphasis is intentionally unsupported.
- Progress has no hover, pressed, focus, selected, disabled, pending, or other interaction-color
  states.

## Schema Mapping

- `e1`: semantic root, name only.
- `e2`: track, 2px/4px scale, pill radius, and `neutral.medium.rest`.
- `e3`: indicator, pill radius, and one `medium.rest` profile per intent.
- `mode`: runtime behavior, never a palette state.

## Validation

- Schema contract requires exactly `medium` for every Progress intent.
- Track coverage is exactly `neutral.medium`; indicator coverage is five profiles per context.
- Every profile contains only `rest`.
- Generated class maps expose separate e2 track paint and e3 indicator paint.
- Generated metadata advertises only Medium/Large scales and medium Rest profiles.
- No literal colors or new Orange tonal family are authored in the Progress schema.

## Open Gaps

- Warning remains an explicit Orange v1 adaptation of Fluent Dark Orange until a future color
  review changes that decision.
