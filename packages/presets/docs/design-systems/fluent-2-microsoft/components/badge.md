# Fluent 2 Microsoft Badge Evidence

This file records source evidence and Kiskadee adaptations for the Badge authored in
`packages/presets/src/presets/fluent-2-microsoft/components/badge.schema.ts`.

## Sources

- [Fluent 2 Badge usage](https://fluent2.microsoft.design/components/web/react/core/badge/usage)
- [Fluent React Badge public contract](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-badge/library/src/components/Badge/Badge.types.ts)
- [Fluent React Badge styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-badge/library/src/components/Badge/useBadgeStyles.styles.ts)
- [Fluent Figma Badge frame](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9329-22680)
  - node: `9329:22680`
- [Fluent Figma Badge set](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9202-10100)
  - node: `9202:10100`
- [Fluent Figma presence-mark inspiration](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9329-24127)
  - node: `9329:24127`
- [Preset tonal evidence](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Badge appearances and sizes | `9329:22680`, `9202:10100` | Filled, Tint, Outline, Ghost and six React sizes | Official adapted |
| Icon-only presence artwork | `9329:24127` | Eight 28 px source vectors | Kiskadee extension |
| Presence status semantics | Presence Badge documentation | Availability status vocabulary | Deferred |

## Semantic boundary

Fluent documents Badge as compact, passive status or description attached to another object.
Kiskadee narrows that boundary further: Badge is a dot, short text or number, or an icon-only mark.
Icon-plus-label compositions belong to Chip. Badge has no activation, selection, removal, focus,
live-region behavior, or inherited host-interaction state. Dynamic content remains in Rest.

Fluent exposes `filled`, `tint`, `outline`, and `ghost` appearances. Kiskadee maps them to its
emphasis axis:

| Fluent appearance | Kiskadee emphasis | Status |
| --- | --- | --- |
| Filled | `high` | Official adapted |
| Tint | `medium` | Official adapted and Kiskadee text default |
| Outline | `low` | Official adapted |
| Ghost | `lowest` | Official adapted |

The upstream React contract exposes Brand, Danger, Important, Informative, Severe, Subtle, Success,
and Warning. The inspected Figma Badge set provides four sizes and does not expose Severe, while the
React contract provides six sizes and does. Kiskadee does not mirror the entire upstream semantic
catalog. It exposes six passive metadata intents:

| Kiskadee intent | Tonal family | Source/adaptation |
| --- | --- | --- |
| `neutral` | Neutral/Black | Kiskadee convention for non-urgent counts and metadata |
| `primary` | Blue | Fluent Brand, official adapted |
| `novelty` | Berry/Purple | Kiskadee convention for new or novel functionality |
| `positive` | Green | Fluent Success, official adapted |
| `warning` | Orange | Fluent orange visual, renamed as a Kiskadee warning convention |
| `attention` | Cranberry/Red | Fluent Danger visual, renamed to remove destructive-action semantics |

`informative`, `severe`, `destructive`, and `important` are intentionally not Badge intents.
Orange remains available through `warning`; Kiskadee does not add a second Severe-orange role.
`neutral`, `novelty`, `warning`, and `attention` use Kiskadee semantic names and must not be
presented as literal Fluent intent aliases.

## Size and shape

The six React Badge sizes are mapped to Kiskadee scales without component-local names:

| Fluent size | Kiskadee scale | Text minimum | Dot/Mark viewport | Text profile | Text metrics |
| --- | --- | --- | --- | --- | --- |
| Tiny | `s:sm:3` | 8 px | 6 px | `caption-tiny-strong` | Semibold 6/6 px |
| Extra-small | `s:sm:2` | 12 px | 10 px | `caption-extra-small-strong` | Semibold 8/8 px |
| Small | `s:sm:1` | 16 px | 16 px | `caption-small-strong` | Semibold 10/14 px |
| Medium | `s:md:1` | 20 px | 20 px | `caption-medium-strong` | Semibold 12/16 px |
| Large | `s:lg:1` | 24 px | 24 px | `caption-medium-strong` | Semibold 12/16 px |
| Extra-large | `s:lg:2` | 32 px | 32 px | `caption-medium-strong` | Semibold 12/16 px |

Fluent supplies 6/10 px Tiny/Extra-small surfaces with 4/4 px and 6/6 px text. Kiskadee preserves
those dimensions for Dot and Mark but raises only the textual surface and profiles to 8/12 px and
6/6 px / 8/8 px. This is a Kiskadee legibility adaptation, not an official Fluent value.
The two adapted textual surfaces also author 2 px and 3 px inline padding respectively. This keeps
short text from touching the edge while leaving Dot and Mark geometry unchanged.

Text Badge authors only its nominal height. Web structure consumes that token as both the minimum
block size and minimum inline size, so a short count forms a circle while `12`, `99+`, and short
text can grow into a pill. The textual surface does not author `boxWidth`; typography, vertical
padding, and border must fit inside the nominal height. Root-font changes and browser zoom may
still enlarge content without clipping. Dot and Mark continue authoring equal width and height
because they own fixed icon-only viewports.

Text Badge supports `square`, `rounded`, and `pill`; `pill` is the default. Dot and Mark are always
`pill`. The framework does not introduce a separate `circular` radius term. Shape remains a
secondary compatibility capability; `pill` is the recommended and primary Badge presentation.

Dot, contained Mark, and full-bleed Mark support all six scales. Their glyph viewports are authored
through `global.iconSizes`, including the 6 px `s:sm:5` profile. A contained Mark uses a smaller
glyph within a circular surface; a full-bleed Mark lets the consumer-provided artwork fill the
entire viewport. At the smallest scales those viewports may converge.

## Badge anatomy adaptations

- Text/number Badge owns its surface and content.
- Dot is always a filled intent surface and has no content.
- Contained Mark uses the Dot surface plus one consumer-provided icon.
- Full-bleed Mark has no authored background, border, or padding. Its single consumer-provided
  artwork fills the viewport and may be bi-color.
- Mark never accepts text or numbers. Badge never combines icon and label.
- An optional separation ring belongs to Badge and visually separates an overlaid Badge from its
  host. The ring color, 1 px/2 px width, and radius are Schema-owned; Structural CSS owns only
  placement and negative inset. Text Badge rings follow `square`, `rounded`, or `pill`, while Dot
  and Mark rings remain `pill`.

The Mark model is inspired by the inspected Fluent presence examples, but it is not a claim of
support for Fluent's complete PresenceBadge status catalog. The eight inspected vectors are copied
only into Showcase fixtures and passed as consumer-provided full-bleed artwork. They are not
published by `@kiskadee/icons`, do not create canonical icon names, and do not introduce
`in-office`, `out-of-office`, or presence-status semantics into Kiskadee. Mark and the configurable
separation ring are Kiskadee extensions.

## Color mapping

All colors use approved tonal families; no source literal is copied into the schema. Rest is the
only state. Filled and family-colored full-bleed artwork resolve the active intent's functional
`vivid` reference instead of sharing one fixed L/D position. The exception is Fluent Warning in
Dark/Darker, whose inspected Orange Tint 20 maps to D75 `#e68962`; Light resolves Orange Primary
through the ordinary vivid reference at L24 `#f7630c`. Both warning surfaces use a dark neutral
foreground. This is authored per theme in the preset and is never inferred at runtime.

Tint keeps the existing subtle intent surface; Outline uses an absolute-white surface with an
intent stroke; Ghost stays transparent with intent foreground. The absolute-white surface and
separation ring use `primitive.black.v1` L0 in Light and D100 in Dark. Dark Tint and Ghost use the
light-side D80 semantic foreground over dark surfaces; Berry, the lowest-contrast mapped family in
that combination, reaches 5.09:1. Outline deliberately uses the darker D35 foreground against its
absolute-white surface. These contrast adjustments are Kiskadee adaptations rather than literal
Fluent token copies.

The on-vivid palettes are independently authored Kiskadee adaptations. Badge consumes the nearest
Surface Context but remains in Rest even when its host is Hover, Pressed, Selected, or Disabled.

## Optional static shadow

The Fluent preset exposes one opt-in outer-shadow recipe for Text Badge, Dot, contained Mark, and
full-bleed Mark. It reuses the preset's smallest global shadow profile (`s:sm:1`, Fluent Shadow 02),
is disabled by default, and remains constant in Rest. It does not add Hover, Pressed, Focus,
Selected, or Disabled states to Badge.

This recipe is a Kiskadee extension, not a claim that Fluent Badge normatively requires a shadow.
The motivation includes an observed recent iPad/iOS Badge treatment, but that observation is visual
inspiration rather than Apple source evidence. Presets remain free to omit the recipe.

## Kiskadee extensions

- `onVivid` palette authorship.
- `neutral` for non-urgent passive metadata.
- `novelty` as a Berry/Purple passive-metadata convention.
- `Badge.Mark`, including contained and full-bleed presentation.
- The optional Schema-authored separation ring.
- The optional, default-off smallest static shadow recipe.
- The disabled-host rule: Badge remains visible and in Rest when its host is disabled. This
  preserves information but may leave a vivid Badge over muted host chrome; the known gap remains
  documented in the normative Badge definition.
