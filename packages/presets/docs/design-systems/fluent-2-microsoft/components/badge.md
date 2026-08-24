# Fluent 2 Microsoft Badge Evidence

This file records source evidence and Kiskadee adaptations for the Badge authored in
`packages/presets/src/presets/fluent-2-microsoft/components/badge.schema.ts`.

## Sources

- [Fluent 2 Badge usage](https://fluent2.microsoft.design/components/web/react/core/badge/usage)
- [Fluent React Badge public contract](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-badge/library/src/components/Badge/Badge.types.ts)
- [Fluent React Badge styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-badge/library/src/components/Badge/useBadgeStyles.styles.ts)
- [Fluent 2 color tokens](https://fluent2.microsoft.design/color-tokens/)
- [Preset tonal evidence](../colors/fluent-tonal-scale-evidence.md)

## Semantic boundary

Fluent documents Badge as a compact, passive status or description attached to another object.
Kiskadee preserves that boundary: Badge has no activation, selection, removal, focus, or inherited
host-interaction state. Dynamic text or count changes are data updates and remain in the Rest visual
state.

Fluent exposes `filled`, `tint`, `outline`, and `ghost` appearances. Kiskadee maps them to its
emphasis axis as follows:

| Fluent appearance | Kiskadee emphasis | Status |
| --- | --- | --- |
| Filled | `high` | Official adapted |
| Tint | `medium` | Official adapted and Kiskadee default |
| Outline | `low` | Official adapted |
| Ghost | `lowest` | Official adapted |

Fluent exposes Brand, Danger, Important, Informative, Severe, Subtle, Success, and Warning colors.
Kiskadee normalizes those names to `primary`, `destructive`, `important`, `informative`, `severe`,
`neutral`, `positive`, and `warning`. The normalization is **Official adapted**; the public intent
names follow Kiskadee's cross-component vocabulary.

## Size and shape

The six Fluent sizes are mapped to Kiskadee scales without inventing component-local size names:

| Fluent size | Kiskadee scale | Nominal size | Status |
| --- | --- | --- | --- |
| Tiny | `s:sm:3` | 6 px | Official adapted |
| Extra-small | `s:sm:2` | 10 px | Official adapted |
| Small | `s:sm:1` | 16 px | Official adapted |
| Medium | `s:md:1` | 20 px | Official adapted |
| Large | `s:lg:1` | 24 px | Official adapted |
| Extra-large | `s:lg:2` | 32 px | Official adapted |

The existing global icon-size catalog uses different values for some identically named scale IDs.
Badge dimensions therefore remain component scale values; `e3.iconSize` selects the nearest
appropriate icon viewport from the global icon-size catalog rather than redefining glyph geometry.
`Badge.Dot` uses the Tiny scale and renders the `e5` dot surface without text or icon content.

Kiskadee supports `pill` and `rounded` roots. Pill is the default. The exact root padding, icon gap,
and count gap are authored independently by Badge elements and consumed by Structural CSS; they are
not inferred from glyph or text dimensions.

## Color mapping

All colors use the preset's approved tonal families. No source literal is copied into the schema.
The first implementation treats on-vivid palettes as independently authored Kiskadee adaptations:
they preserve contrast on a vivid ancestor without claiming that Fluent exposes a surface-context
axis for Badge.

Rest is the only allowed state. Filled uses a vivid intent surface with a contrasting foreground;
Tint uses a low intent surface; Outline uses a transparent surface with an intent stroke; Ghost uses
a transparent surface and intent foreground. Neutral uses the approved Fluent tinted Neutral family.
Primary, Positive, Warning, Destructive, and the remaining Fluent semantic colors use the approved
Blue, Green, Marigold/Orange, Cranberry, and Berry-derived families documented by the preset tonal
evidence. `informative`, `severe`, and `important` are Kiskadee intent-name adaptations over those
existing approved families; no new primitive asset is introduced.

## Kiskadee extensions

- `onVivid` palette authorship is a Kiskadee extension.
- `Badge.Count` is an explicit auxiliary count slot in one passive composition; it does not create
  a nested Badge root.
- The disabled-host rule is a Kiskadee contract: a Badge remains visible and in Rest when its host is
  disabled. This preserves information but may leave a vivid Badge over muted host chrome; the known
  gap is documented in the normative Badge definition.

