# Material Design 3 Google Badge Evidence

## Sources

- [Material 3 Badges](https://m3.material.io/components/badges/overview), consulted for the
  component's notification and compact-content role.
- [Material 3 Design Kit](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=57994-696)
  - file key: `Peqe9lNMsuQHLIUZsiTZNg`; inspected section: `57994:696` (Buttons).
  - A Badge component node was not located in this inspection. Badge-specific Figma appearance
    is **Not inspected**.
- Local fallback: [Fluent 2 Badge evidence](../../fluent-2-microsoft/components/badge.md),
  authorized for the missing theme, surface-context, emphasis and composition matrix.
- [Approved Material tonal assets](../colors/README.md).

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Badge as a compact notification/count mark | Material 3 overview | Compact notification/count role | Official adapted |
| Small and large compact mark behavior | Material 3 overview | Small/large behavior | Official adapted |
| Theme, context and emphasis completion | Local Fluent recipe | Full Kiskadee matrix | Kiskadee extension |
| Badge component Figma appearance | No component node found | No component node | Not inspected |

## Local Evidence

No local screenshot was captured. The available Figma inspection covered the Buttons section only;
Badge-specific visual evidence remains **Not inspected**.

## Official Contract

Material describes Badge as a compact mark attached to another element for a notification or
short count. This recipe keeps Badge passive: text/number content, a dot, a contained consumer
icon, or a full-bleed consumer mark. Badge does not own activation, selection, removal, focus,
live-region behavior or host interaction state. Dynamic content remains in `rest`.

The Core contract has six elements and Rest-only color states. The additional emphasis and context
entries below complete the shared Kiskadee vocabulary; they do not claim that Material publishes
the same matrix.

## Kiskadee Mapping

| Intent | Material/Kiskadee role | Use |
| --- | --- | --- |
| `neutral` | Tinted neutral | Counts and metadata without semantic urgency |
| `primary` | Blue primary | Primary product metadata |
| `novelty` | Purple-like support family | New or novel information |
| `positive` | Green-like support family | Positive status |
| `warning` | Yellow-like support family | Cautionary status |
| `attention` | Red-like support family | Attention and urgent metadata |

The Layer 3 aliases above resolve through the existing approved families. The recipe does not
add a seed, promote orange, or create a second red/purple family.

| Emphasis | `onSubtle` | `onVivid` | Status |
| --- | --- | --- | --- |
| `high` | Vivid family surface | Light-track subtle family surface | Official adapted / Kiskadee context extension |
| `medium` | Subtle family surface | Light-track subtle family surface, one position lighter | Official adapted / Kiskadee context extension |
| `low` | Vivid family at 8% alpha | Physical white at 12% alpha | Kiskadee extension |
| `lowest` | Transparent | Physical white at 8% alpha | Kiskadee extension |

`onVivid` low and lowest content use physical white so a quiet Badge remains readable over a dark
or vivid host. Dark chromatic content on `onSubtle` uses the vivid family at offset `+6`; neutral
keeps its authored vivid reference. High dark chromatic fills keep white content, while a dark
neutral high fill uses black content. The full-bleed mark follows the same contrast-aware split:
Light `onVivid` uses the subtle family at `+1`, and Dark `onSubtle` chromatic marks use vivid `+6`.

## Schema Mapping

- `e1`: text/number surface and its compact height, padding and radius scales.
- `e2`: text/number content with Material label/body typography by scale.
- `e3`: full-bleed consumer mark; only `high.rest` is authored because artwork owns its own visual
  content and the host owns interaction.
- `e4`: contained consumer icon using the Badge text palette.
- `e5`: fixed dot surface with equal width and height.
- `e6`: optional external separation ring with a transparent box and a physical black/white
  border cap. It is a structural separation treatment, not a semantic intent border.

The six Core Badge scales are retained: `s:sm:3`, `s:sm:2`, `s:sm:1`, `s:md:1`, `s:lg:1` and
`s:lg:2`. Density maps compact to `s:md:1` and spacious to `s:lg:1`. Text and dot surfaces use
the same Rest-only palette; no transient states are invented for a passive component.

## Color And Token Provenance

All schema colors resolve with the existing `PresetColorGetter`. The recipe consumes
`badge.<intent>` roles and the canonical `primitive.black.v1` cap for transparent, black and white
endpoints. The current authored seeds are documented in [Material tonal assets](../colors/README.md):
blue `#0B57D0`, red `#B3261E`, green `#146C2E`, tinted neutral `#03233C`, plus the existing
yellow, purple and pink support families. The schema contains no literal color.

The numeric offsets are Kiskadee adaptations informed by the Fluent fallback. They preserve each
intent family and keep contrast decisions explicit at the component boundary. The contrast floor
checks cover dark chromatic medium content against its corresponding `onSubtle` surface; arbitrary
consumer backgrounds and consumer-provided full-bleed artwork remain outside the schema guarantee.

## Shared Formula

- The factory resolves every family color at schema authoring time through `PresetColorGetter`.
- `reference` locators follow the participating Badge intent family; `cap` locators supply physical
  white, black and transparent endpoints.
- Badge remains Rest-only even when its host is Hover, Focus, Pressed, Selected or Disabled.

## Kiskadee Extensions

- All six Badge intents, four emphases and both `onSubtle`/`onVivid` contexts.
- Dot, contained mark, full-bleed mark and optional separation ring composition.
- Contrast-aware inverse foregrounds for low/lowest `onVivid` and Dark chromatic `onSubtle`.

## Deferred Or Unsupported

- Badge activation, selection, removal, focus and live-region behavior are outside the passive Core
  contract. No approximation is emitted.
- Badge-specific Figma geometry, motion and source state matrices remain **Not inspected**.

## Validation

Focused tests cover both segments, Light/Dark, `onSubtle`/`onVivid`, all six intents, all four
emphases, family independence, full-bleed Rest-only output and the dark chromatic contrast floor.
Biome and the preset typecheck are run directly from the repository's installed tool paths when
dependencies are available. The broader preset typecheck may retain unrelated Fluent errors while
the repository integration is in progress. Visual homologation against a Badge-specific Figma node
is **Not inspected** and remains user-owned.

## Open Gaps

Badge-specific Figma nodes and screenshot evidence remain unavailable. The user owns final visual
homologation against Material's current component kit.

Neutral seed updated on 2026-09-13 through the approved Chromatic offset primary-derived recipe;
see [current tonal provenance](../colors/README.md). Component formulas remain unchanged.
