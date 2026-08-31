# Fluent 2 Text Evidence

This file records the source evidence and schema decisions for the Fluent 2 foreground profiles
consumed by `components/text.schema.ts`.

## Sources

- Official documentation:
  [Fluent 2 color tokens](https://fluent2.microsoft.design/color-tokens)
- Exact captured Neutral ramp and nearest Kiskadee positions:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)
- Approved generated tinted-neutral asset:
  [`n.black.v2.json`](../colors/generated/colors/n.black.v2.json)
- Approved pure-grayscale absolute caps:
  [`n.black.v1.json`](../colors/generated/colors/n.black.v1.json)
- Existing component foreground evidence used to calibrate chromatic Text:
  [`button.md`](./button.md) and [`badge.md`](./badge.md)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| `colorNeutralForeground1` through `colorNeutralForeground4` | Light and Dark neutral text aliases | Official exact |
| `colorNeutralForegroundOnBrand` | White foreground over brand surfaces | Official exact |
| Three-level Text hierarchy | Foreground 1 and 3 plus a quieter framework level | Official adapted / Kiskadee extension |
| Three-level `onVivid` hierarchy | Official white anchor plus Kiskadee alpha projection | Kiskadee extension |
| Blue, Cranberry, Green, Berry, Orange, and Marigold | Approved Fluent primitive families already used by Button and Badge | Official source / Kiskadee Text extension |
| Three-level chromatic hierarchy | Shared Text formula derived from existing component foreground anchors | Kiskadee extension |
| Darker theme | Reuses the Dark foreground track | Kiskadee extension |
| Hover, Pressed, Selected, Disabled | Not part of standalone Text v1 | Deferred |

## Color And Token Provenance

### Neutral Foreground Mapping

Fluent publishes four neutral foreground aliases, but it does not define them as a generic
`high | medium | low | lowest` Text API. Their complete de-para remains recorded as source evidence:

| Fluent alias | Fluent Light | Nearest Kiskadee Light | Fluent Dark | Nearest Kiskadee Dark | Status |
| --- | --- | --- | --- | --- | --- |
| Foreground 1 | Grey-14 `#21242d` | L85 `#21242d` | White `#ffffff` | D100 `#ffffff` | Official adapted |
| Foreground 2 | Grey-26 `#3e424c` | L65 `#434650` | Grey-84 `#d1d6e2` | D90 `#d2d6e3` | Official adapted |
| Foreground 3 | Grey-38 `#5d616b` | L50 `#5d616b` | Grey-68 `#a9adb9` | D80 `#b0b4c0` | Source evidence only |
| Foreground 4 | Grey-44 `#6c707b` | L40 `#6f737e` | Grey-60 `#9599a4` | D70 `#8d919c` | Source evidence only |

Standalone Text intentionally publishes a smaller hierarchy:

| Text emphasis | Light | Dark and Darker | Provenance |
| --- | --- | --- | --- |
| `medium` | Foreground 1 via L85 `#21242d` | Foreground 1 via D100 `#ffffff` | Official adapted; normal Fluent text |
| `low` | Foreground 3 via L50 `#5d616b` | Foreground 3 via D80 `#b0b4c0` | Official adapted; secondary text |
| `lowest` | L10 `#cdd1de` | D35 `#555965` | Kiskadee extension; deliberately quieter than Foreground 4 |

Foreground 2 remains source evidence but is intentionally skipped by standalone Text. With only
three public strengths, mapping `low` directly to Foreground 2 left it too close to normal
`medium`; Foreground 3 preserves a clearer hierarchy without changing the meaning of either level.

`high` is not emitted. Fluent has no stronger regular neutral foreground above Foreground 1, and an
absolute-black Light-only level would encourage inconsistent use while collapsing to the same white
as `medium` in Dark. Any future stronger acromatic level remains part of the same `neutral` profile;
it must not be moved to a chromatic or differently named intent.

The generated HEX differences are explicit tonal adaptations, not claims that every Kiskadee stop
is identical to the Fluent primitive. Darker reuses the Dark track because Fluent publishes Light
and Dark but no third Darker token set.

### On-vivid Extension

Fluent supplies white `colorNeutralForegroundOnBrand` as a source-backed normal-text anchor over a
brand surface, but it does not publish the lower levels of Kiskadee's Text hierarchy. Kiskadee
projects the three public levels over vivid surfaces with one documented alpha formula:

| Text emphasis | White alpha | Resolved HEX |
| --- | ---: | --- |
| `medium` | 100% | `#ffffff` |
| `low` | 68% | `#ffffffad` |
| `lowest` | 24% | `#ffffff3d` |

The authoring locator is always `cap(primitive.black.v1, light)`, with optional 68% or 24% alpha.
The resolver selects the correct inverted-scale endpoint, so every theme produces physical white
without a literal or track-relative tone. The 68% and 24% projections are **Kiskadee extensions**.

`lowest` is intentionally designed for small, auxiliary text that should recede. Its lower contrast
is a deliberate product tradeoff, not an accidental approximation of the Fluent alias. Consumers
must not silently promote it to normal body copy or critical instructions.

### Chromatic Foreground Extension

Standalone Text exposes colors by visual family rather than by action meaning. Fluent's approved
primitive catalog therefore maps directly to `blue`, `red`, `green`, `purple`, `orange`, and
`yellow`. The schema does not rename these families to `primary`, `destructive`, `positive`,
`novelty`, or `warning`; those remain component-specific semantics in Button and Badge.

The first shared chromatic formula uses the same source-backed anchors across every family:

| Context | Theme | `medium` | `low` | `lowest` |
| --- | --- | --- | --- | --- |
| `onSubtle` | Light | Primitive `vivid`, 100% | Same anchor, 68% | Same anchor, 24% |
| `onSubtle` | Dark/Darker | Primitive `vivid +8`, 100% | Same anchor, 68% | Same anchor, 24% |
| `onVivid` | All | Light-track `subtle +4`, 100% | Same anchor, 76% | Same anchor, 40% |

The Light value is each primitive family's promoted `vivid` reference, so the family keeps its
identity even when an anchor moves in a later approved tonal asset. Dark/Darker uses `vivid +8`,
choosing the passive text D80 rather than Button's action-oriented D75. On vivid surfaces, Text
advances the Light-track reference to `subtle +4`: this preserves a light contrasting foreground
while carrying more of each family's chroma than the earlier `subtle +2` calibration. The stronger
76% and 40% descendants keep that family identity visible instead of letting the host surface
dominate through transparency. This shared recipe is a **Kiskadee extension**: Fluent does not
publish a generic three-level colored Text API.

The resolved normal anchors are:

| Foreground | `onSubtle` Light | `onSubtle` Dark/Darker | `onVivid` all themes |
| --- | --- | --- | --- |
| `blue` | `#0064b4` | `#79b9ff` | `#c1deff` |
| `red` | `#c50f1f` | `#ff958b` | `#ffcdc8` |
| `green` | `#107c10` | `#7ec879` | `#c3e7c0` |
| `purple` | `#c239b3` | `#eb94dd` | `#f6ccee` |
| `orange` | `#f7630c` | `#f49d79` | `#ffcfbc` |
| `yellow` | `#eaa300` | `#d1af7c` | `#f3d6ac` |

On subtle surfaces, `low` appends 68% alpha (`ad`) and `lowest` appends 24% alpha (`3d`) to each
resolved anchor. On vivid surfaces, those descendants use 76% (`c2`) and 40% (`66`). Every schema
value is authored as a functional-reference locator and resolved by the strict preset resolver; no
literal color, fixed tone, or component-semantic alias is introduced.

Core also recognizes `teal`, `cyan`, `pink`, and `brown` as possible Text foreground names, but
this Fluent preset does not publish them. Its similarly named harmony-derived candidates are still
unapproved review inputs, so synthesizing those Text capabilities would overstate source coverage.
All black, gray, and white foregrounds remain inside `neutral`; `black` is not a separate Text
family.

## Schema And Build Decision

Each reusable recipe is authored once at `global.foregrounds.profiles`. Text `e1` maps its local
visual family names to those profiles:

```ts
foreground: {
  neutral: 'neutral',
  blue: 'blue',
  red: 'red',
  green: 'green',
  purple: 'purple',
  orange: 'orange',
  yellow: 'yellow'
}
```

Every profile is Rest-only and complete for Light, Dark, and Darker in both Surface Contexts. The
Web Builder lowers them to ordinary Text `textColor` palettes and emits `c.s` and `c.v` class-map
branches. No Fluent-specific runtime lookup, foreground bucket, or semantic CSS variable is
introduced.

Standalone Text uses `medium | low | lowest` as foreground strength and defaults to
`neutral.medium`. It intentionally excludes `high` and `highest`; own-surface emphasis semantics for
Button and Card remain unchanged. Existing text slots inside those components continue using their
own recipes in this phase.

## Validation

The initial integration was verified through:

- Core contract tests for profile IDs, unknown references, three-emphasis coverage, rejection of
  `high` and `highest`, Rest-only state maps, and the `foreground`/`textColor` conflict;
- Fluent schema tests for the complete Light, Dark, and Darker matrix in both Surface Contexts and
  for neutral plus all six chromatic families, resolved without schema literals;
- Web Builder tests for profile lowering, CSS `color` emission, independent `t` and `c.s`/`c.v`
  branches, and manifest Surface Context discovery after expansion;
- React Text tests for defaults, all three emphases, Provider inheritance, explicit override,
  named chromatic selection, unsupported-family inheritance, `inherit`, SSR, a missing Text
  artifact, missing `onVivid`, and a pending preset/theme artifact;
- synchronized Web Builder output plus React and Showcase production builds;
- rendered `/typography` checks of the neutral and chromatic matrices in the active Dark theme at
  desktop and 390 px mobile widths; schema tests cover the exact Light, Dark, and Darker recipes.
