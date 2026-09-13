# Material Design 3 Google Chip Evidence

## Sources

- [Material 3 Chips](https://m3.material.io/components/chips/overview), consulted for assist,
  filter, input and suggestion chip roles and their selectable/removable compositions.
- [Material 3 Design Kit](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=57994-696)
  - file key: `Peqe9lNMsuQHLIUZsiTZNg`; inspected section: `57994:696` (Buttons).
  - A Chip component node was not located in this inspection. Chip-specific Figma appearance is
    **Not inspected**.
- Local fallback: [Fluent 2 Chip/Tag evidence](../../fluent-2-microsoft/components/chip.md),
  authorized for the complete state, context and compound-control matrix.
- [Approved Material tonal assets](../colors/README.md).

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Assist, filter, input and suggestion chip roles | Material 3 overview | Four documented roles | Official adapted |
| Selectable and removable composition | Material 3 overview | Select/remove behavior | Official adapted |
| Theme, context, emphasis and state completion | Local Fluent Tag recipe | Full Kiskadee matrix | Kiskadee extension |
| Chip component Figma appearance | No component node found | No component node | Not inspected |

## Local Evidence

No local screenshot was captured. The available Figma inspection covered the Buttons section only;
Chip-specific visual evidence remains **Not inspected**.

## Official Contract

Material uses Chips for compact choices, filters, input values and suggestions. Kiskadee names the
shared entity/value component Chip and keeps its primary content and remove control as sibling
targets. `Chip.Select` owns selection; `Chip.Remove` owns removal. The schema supplies visual
states, while headless behavior owns ARIA, keyboard and value semantics.

The Core contract separates the primary surface (`e2`), label (`e3`), leading icon (`e4`), remove
surface (`e5`), remove icon (`e6`) and Badge relation spacing (`e7`). Both visual surfaces consume
the same intent/emphasis recipe, but the primary surface owns the interaction state progression.

## Kiskadee Mapping

| Intent | Tonal family | Use |
| --- | --- | --- |
| `neutral` | Existing tinted neutral | Ordinary entity, filter or input value |
| `primary` | Approved blue primary | Primary entity or selected filter |

No secondary seed, additional intent or new asset is introduced. The recipe publishes the complete
matrix for both `default` and `dynamic` segments, Light/Dark themes and both surface contexts.

| Emphasis | Presentation | Rest surface | Status |
| --- | --- | --- | --- |
| `high` | Vivid filled chip | Intent vivid family | Kiskadee extension of Material filled treatment |
| `medium` | Tinted chip | Intent subtle family | Official adapted |
| `low` | Outlined chip | Transparent with intent border | Official adapted |
| `lowest` | Quiet transparent chip | Transparent with the lowest intent border | Kiskadee extension |

Hover, Focus and Pressed deltas are authored on `e2` and `e5`; Selected promotes the surface to the
high family and Disabled uses physical or neutral disabled caps. High and medium borders publish a
sparse transparent Rest value. Low and lowest publish the outlined transient states and remove the
border on Selected Rest so the selected high surface does not carry two competing treatments.

Dark chromatic `onSubtle` content uses vivid `+6` for legibility. On vivid low and lowest content
uses physical white, while medium and high content use the Light-track family references that pair
with their Light-track subtle surfaces. This inverse treatment is a Kiskadee context adaptation,
not a claim that Material exposes the same serialized surface context.

## Surface context

`contentSurfaceContext` is authored for every segment, theme, input context and intent from the
coordinate the Chip actually paints. High and Selected use `onSubtle` when the authored fill is a
light subtle family (including every `onVivid` high fill and Dark neutral high at D95); strong dark
vivid fills use `onVivid` (Light high and Dark chromatic high on `onSubtle`). Medium is a filled
subtle treatment and publishes `onSubtle`, including its Light-track fill under `onVivid`. Low and
lowest Rest are transparent and publish `inherit`; their Selected descendants promote to the high
coordinate. Disabled preserves the consumed `surface` context so descendants follow the same
surrounding semantic surface. Omitted transient descendant context is inherited by the existing
context model rather than inferred from luminance.

## Schema Mapping

- `e1`: semantic Chip container.
- `e2`: primary surface, 24/32/40 px heights, horizontal padding, border and rounded/pill radius.
- `e3`: label using `label-medium`, `label-large` and `body-medium` by scale.
- `e4`: leading icon and logical gap.
- `e5`: remove surface with its own padding, border and radius; adjacent corners are a structural
  composition concern.
- `e6`: remove icon using the shared text palette.
- `e7`: relation spacing for a nested Badge.

Density maps compact to `s:md:1` and spacious to `s:lg:1`. The three published scales retain the
Core contract: `s:sm:1`, `s:md:1` and `s:lg:1`.

## Color And Token Provenance

All colors resolve with `PresetColorGetter` references to `chip.neutral` and `chip.primary`, plus
the canonical `primitive.black.v1` cap for physical light/dark, disabled and transparent values.
The approved authored seeds and support families are recorded in [Material tonal assets](../colors/README.md):
blue `#0B57D0`, tinted neutral `#03233C`, and existing yellow, purple and pink support families.
The schema contains no literal color.

State offsets and alpha values are Kiskadee adaptations guided by the Fluent fallback. They keep
intent families independent and preserve sparse-state precedence: Rest is the base, Selected owns
the persistent selection treatment, Disabled owns the disabled treatment, and transient states
are authored only where they visually differ from Rest.

## Shared Formula

- The factory resolves every family color at schema authoring time through `PresetColorGetter`.
- `reference` locators follow `chip.neutral` or `chip.primary`; `cap` locators supply physical
  white, black and transparent endpoints.
- Rest, transient, Selected and Disabled state precedence is authored explicitly on each visual
  surface; descendant context is serialized rather than inferred at runtime.

## Kiskadee Extensions

- Four emphases, both surface contexts and complete Light/Dark matrices for both segments.
- `contentSurfaceContext` propagation for selected and disabled descendants.
- Independent sibling primary/remove surfaces with composed adjacent corners.

## Deferred Or Unsupported

- Chip motion, focus-ring geometry and ARIA/value behavior remain runtime or headless concerns. No
  additional visual approximation is emitted here.
- Chip-specific Figma geometry and screenshot evidence remain **Not inspected**.

## Validation

Focused tests cover both segments, Light/Dark, both surface contexts, both intents, all four
emphases, transient and persistent states, sparse outlines, effective context composition and
composited selected-state contrast. Biome and the preset typecheck are run directly from repository tool
paths when dependencies are available. Visual homologation against a Chip-specific Figma node is
**Not inspected** and remains user-owned.

## Open Gaps

Chip-specific Figma nodes and screenshot evidence remain unavailable. The user owns final visual
homologation against Material's current component kit.

Neutral seed updated on 2026-09-13 through the approved Chromatic offset primary-derived recipe;
see [current tonal provenance](../colors/README.md). Component formulas remain unchanged.
