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

Fluent exposes `filled`, `tint`, `outline`, and `ghost` appearances. Kiskadee preserves Filled and
Tint directly, replaces Outline with a quieter metadata treatment, and does not author Ghost in
this preset:

| Fluent appearance | Kiskadee emphasis | Status |
| --- | --- | --- |
| Filled | `high` | Official adapted |
| Tint | `medium` | Official adapted and Kiskadee text default |
| Outline | — | Deferred; no outline Badge is emitted |
| — | `low` | Kiskadee extension using a quieter Neutral surface and intent foreground |
| Ghost | `lowest` | Deferred; the Core vocabulary remains valid but Fluent authors no value |

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

| Fluent size | Kiskadee scale | Text minimum | Dot/Mark viewport | Contained glyph | Text profile | Text metrics |
| --- | --- | --- | --- | --- | --- | --- |
| Tiny | `s:sm:3` | 8 px | 6 px | 6 px | `caption-tiny-strong` | Semibold 6/6 px |
| Extra-small | `s:sm:2` | 12 px | 10 px | 6 px | `caption-extra-small-strong` | Semibold 8/8 px |
| Small | `s:sm:1` | 16 px | 16 px | 10 px | `caption-small-strong` | Semibold 10/14 px |
| Medium | `s:md:1` | 20 px | 20 px | 12 px | `caption-medium-strong` | Semibold 12/16 px |
| Large | `s:lg:1` | 24 px | 24 px | 16 px | `caption-medium-strong` | Semibold 12/16 px |
| Extra-large | `s:lg:2` | 32 px | 32 px | 20 px | `caption-medium-strong` | Semibold 12/16 px |

Fluent supplies 6/10 px Tiny/Extra-small surfaces with 4/4 px and 6/6 px text. Kiskadee preserves
those dimensions for Dot and Mark but raises only the textual surface and profiles to 8/12 px and
6/6 px / 8/8 px. This is a Kiskadee legibility adaptation, not an official Fluent value.
The two adapted textual surfaces also author 2 px and 3 px inline padding respectively. This keeps
short text from touching the edge while leaving Dot and Mark geometry unchanged.

Text Badge authors only its nominal height. Web structure consumes that token as both the minimum
block size and minimum inline size, so a short count forms a circle while `12`, `99+`, and short
text can grow into a pill. The textual surface does not author `boxWidth`; typography, vertical
padding, and content must fit inside the nominal height. The Fluent Badge surface authors no border;
the optional separation ring is an independent external layer. Root-font changes and browser zoom
may still enlarge content without clipping. Dot and Mark continue authoring equal width and height
because they own fixed icon-only viewports.

Text Badge supports `square`, `rounded`, and `pill`; `pill` is the default. Dot and Mark are always
`pill`. The framework does not introduce a separate `circular` radius term. Shape remains a
secondary compatibility capability; `pill` is the recommended and primary Badge presentation.

Dot, contained Mark, and full-bleed Mark support all six scales. Their viewports and contained
glyphs select existing `global.iconSizes`; Badge does not redefine any global icon measurement.
Contained glyphs resolve to 6/6/10/12/16/20 px inside the six circular surfaces, while full-bleed
artwork continues to fill the complete 6/10/16/20/24/32 px viewport. A detailed contained glyph is
recommended at `s:sm:1` or larger; the two smaller scales remain valid compact capabilities.

The Showcase retains all six scales in its runtime control and technical Mark matrix. Its primary
anatomy examples deliberately highlight Dot at `s:sm:3` through `s:sm:1`, and text/number at
`s:sm:2` through `s:md:1`, instead of presenting every supported extreme as a usage
recommendation. The 20 px `s:md:1` example is also the documented counter-growth size for `3`,
`12`, and `99+`.

## Badge anatomy adaptations

- Text/number Badge owns its surface and content.
- Dot is always a filled intent surface and has no content.
- Contained Mark uses the Dot surface plus one consumer-provided icon.
- Full-bleed Mark has no authored semantic surface, border, or padding. Its single
  consumer-provided artwork fills the viewport and may be bi-color. With separation disabled, its
  transparent regions continue to expose the host.
- Mark never accepts text or numbers. Badge never combines icon and label.
- An optional separation treatment belongs to Badge and visually separates an overlaid Badge from
  its host. Text Badge, Dot, and contained Mark receive only the external ring. Full-bleed Mark also
  receives an opaque backing behind the artwork, allowing transparent negative-space glyphs from
  the inspected vectors to resolve against a controlled surface instead of exposing an arbitrary
  host image. The backing and ring colors, 1 px/2 px width, and radius are Schema-owned.
  Structural CSS keeps the separation layer equal to the Badge viewport and paints the ring as an
  external zero-blur spread, so the ring neither participates in layout nor reduces the visible
  intent surface. Text Badge rings follow `square`, `rounded`, or `pill`, while Dot and Mark rings
  remain `pill`.

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

Tint resolves each intent from its own `subtle` reference with a shared theme-relative offset:
`subtle +4` in Light and `subtle +14` in Dark/Darker. Low instead uses the absolute-black cap from
`primitive.black.v1` at 8% alpha for every theme and intent. The authored value is `#00000014`;
over the canonical Neutral Low surface it composites to `#ebebeb` in Light and approximately
`#23272f` in Dark/Darker, while Medium remains unchanged. Low keeps the intent-specific foreground
and authors no surface border. Its foreground starts at the same functional `vivid` reference used
by High, then moves only as far toward the contrast-safe side of the intent family as needed to
reach at least 4.5:1 against the composited canonical Low surface. Light resolves
Neutral/Primary/Attention at `vivid`, Novelty at `vivid +2`, Positive at `vivid +1`, and Warning at
`vivid +6`. Dark/Darker resolves Neutral at `vivid`, Primary/Novelty/Positive/Attention at
`vivid +8`, and the source-backed Warning exception at D80. This creates a quiet filled Badge with
a clearly identifiable intent rather than an Outline Badge. `lowest` is absent from all Fluent
Badge element palettes, including the separation element; no transparent fallback is emitted. The
absolute-white separation ring and full-bleed backing use `primitive.black.v1` L0 in Light and D100
in Dark.

The canonical `onVivid` canvas is Card Primary Highest: Light `#0064b4` and Dark/Darker `#005ba4`.
Repeating `onSubtle` colors on that canvas causes the Primary High surface to collapse into its
background, so Badge authors an independent inverse hierarchy from the approved Light tonal track
in every theme:

| Emphasis | Surface recipe | Minimum contrast against the canonical canvas |
| --- | --- | --- |
| `high` | each intent `subtle +7` | 3.52:1 Light; 4.04:1 Dark/Darker |
| `medium` | each intent `subtle +4` | 4.25:1 Light; 4.88:1 Dark/Darker |
| `low` | Neutral `subtle +2` | 4.78:1 Light; 5.49:1 Dark/Darker |

Text and contained-Mark foregrounds use each intent's Light L65 tone across the three emphases.
The minimum foreground-to-surface contrast is 5.70:1 for High, 6.63:1 for Medium, and 7.11:1 for
Low. Dot therefore retains its semantic family without requiring a ring, while text and contained
Marks remain legible. Full-bleed Mark artwork remains consumer-owned and keeps its existing active
theme `vivid` color channel; the optional separation backing remains the explicit treatment for
transparent negative space.

| Intent | Low foreground Light | Low foreground Dark/Darker | `onVivid` High | `onVivid` Medium | `onVivid` foreground |
| --- | --- | --- | --- | --- | --- |
| Neutral | `#21242d` | `#d2d6e3` | `#c6cbd7` | `#d6dbe7` | `#434650` |
| Primary | `#0064b4` | `#79b9ff` | `#a4cfff` | `#c1deff` | `#0d477e` |
| Novelty | `#a82d9a` | `#eb94dd` | `#faaded` | `#f6ccee` | `#6b2762` |
| Positive | `#09760a` | `#7ec879` | `#a1dd9c` | `#c3e7c0` | `#155513` |
| Warning | `#ae450c` | `#f49d79` | `#ffb89b` | `#ffcfbc` | `#6f3217` |
| Attention | `#c50f1f` | `#ff958b` | `#ffb5ad` | `#ffcdc8` | `#811819` |

| Source concept | Source value | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| Tint surface | Fluent Tint adapted to the Kiskadee tonal families | functional reference: each intent `subtle +4` Light / `subtle +14` Dark | `e1.boxColor` and `e5.boxColor`, `medium` | The recipe must follow each participating family instead of copying one raw tonal position. |
| Quiet Low surface | Kiskadee metadata adaptation | exact `primitive.black.v1` absolute-black cap at 8% alpha | `e1.boxColor` and `e5.boxColor`, every `onSubtle` intent `low` | All intents and themes share one neutral translucent surface while their foreground retains semantic identity; no border is authored. |
| Contrast-safe Low foreground | Kiskadee metadata adaptation | functional reference: each intent `vivid` plus the smallest documented contrast-safe offset; Dark Warning uses exact D80 from its source-backed D75 exception | `e2.textColor` and `e4.textColor`, `low` on `onSubtle` | Preserves the semantic family while maintaining at least 4.5:1 against the composited canonical Low surface. |
| Inverse vivid-context hierarchy | Kiskadee vivid-surface adaptation | Light-track functional references: intent `subtle +7` High, intent `subtle +4` Medium, Neutral `subtle +2` Low | `e1.boxColor` and `e5.boxColor`, every `onVivid` theme | Keeps every Badge surface distinct from the canonical Primary Highest canvas without making the optional ring a legibility requirement. |
| Vivid-context foreground | Kiskadee vivid-surface adaptation | exact Light L65 in each intent family | `e2.textColor` and `e4.textColor`, every `onVivid` emphasis and theme | Preserves intent hue and compact-text contrast across the inverse surface hierarchy. |
| Full-bleed negative-space separation | Transparent source artwork inspected over a light Figma stage | exact tone: Light L0 / Dark D100 | `e6.boxColor`, active only for full-bleed with `separation="ring"` | Absolute structural separation must not follow the artwork intent family or expose arbitrary host imagery. |
| External separation ring | Kiskadee extension | exact tone: Light L0 / Dark D100 | `e6.borderColor` | Uses the same approved absolute-white family as the backing while retaining independent Schema ownership. |

Badge consumes the nearest Surface Context but remains in Rest even when its host is Hover,
Pressed, Selected, or Disabled.

## Optional static shadow

The Fluent preset exposes one opt-in outer-shadow recipe only for `Badge.Dot` without a separation
ring. It reuses the preset's smallest global shadow profile (`s:sm:1`, Fluent Shadow 02), is
disabled by default, and remains constant in Rest. Text Badge and contained/full-bleed Mark do not
consume the recipe. It does not add Hover, Pressed, Focus, Selected, or Disabled states to Badge.

This recipe is a Kiskadee extension, not a claim that Fluent Badge normatively requires a shadow.
The motivation includes an observed recent iPad/iOS Badge treatment, but that observation is visual
inspiration rather than Apple source evidence. Presets remain free to omit the recipe.

## Kiskadee extensions

- `onVivid` palette authorship.
- `neutral` for non-urgent passive metadata.
- `novelty` as a Berry/Purple passive-metadata convention.
- `Badge.Mark`, including contained and full-bleed presentation.
- The optional Schema-authored separation ring and full-bleed backing.
- The optional, default-off smallest static shadow recipe for an unringed Dot.
- The disabled-host rule: Badge remains visible and in Rest when its host is disabled. This
  preserves information but may leave a vivid Badge over muted host chrome; the known gap remains
  documented in the normative Badge definition.
