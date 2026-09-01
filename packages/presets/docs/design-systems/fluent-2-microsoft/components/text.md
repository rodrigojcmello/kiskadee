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
| Chromatic `deep` hierarchy | Existing Fluent Button label anchors projected across every approved chromatic family | Kiskadee extension |
| Darker theme | Reuses the Dark foreground track | Kiskadee extension |
| Hover, Pressed, Pending, Disabled | Optional global coordinates consumed by component slots; not projected by standalone Text | Kiskadee extension |

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

`high` is not emitted by standalone Text. Fluent has no stronger regular neutral foreground above
Foreground 1, and an absolute-black Light-only Text level would encourage inconsistent use while
collapsing to the same white as `medium` in Dark. The stronger acromatic choice therefore remains
inside the same family as `neutral.deep`: its Light `onSubtle.medium` coordinate is absolute black,
while Dark and Darker use physical white. It is published for atomic component-slot references and
is not exposed as a separate standalone Text alias in this phase.

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
| `onVivid` | Light | Light-track `subtle +8`, 100% | Same anchor, 76% | Same anchor, 40% |
| `onVivid` | Dark/Darker | Light-track `subtle -2`, 100% | Same anchor, 76% | Same anchor, 40% |

The Light value is each primitive family's promoted `vivid` reference, so the family keeps its
identity even when an anchor moves in a later approved tonal asset. Dark/Darker uses `vivid +8`,
choosing the passive text D80 rather than Button's action-oriented D75. On vivid surfaces, Standard
uses the stronger family-relative projection previously evaluated as Deep: Light uses `subtle +8`,
while Dark and Darker use `subtle -2`. The 76% and 40% descendants preserve the same
family-relative hierarchy. This shared recipe is a **Kiskadee extension**: Fluent does not
publish a generic three-level colored Text API.

The resolved normal anchors are:

| Foreground | `onSubtle` Light | `onSubtle` Dark/Darker | `onVivid` Light | `onVivid` Dark/Darker |
| --- | --- | --- | --- | --- |
| `blue` | `#0064b4` | `#79b9ff` | `#94c7ff` | `#f1f7ff` |
| `red` | `#c50f1f` | `#ff958b` | `#ffa89f` | `#fff4f2` |
| `green` | `#107c10` | `#7ec879` | `#91d78c` | `#f0faef` |
| `purple` | `#c239b3` | `#eb94dd` | `#fe99ee` | `#fef2fc` |
| `orange` | `#f7630c` | `#f49d79` | `#ffaa89` | `#fff4ef` |
| `yellow` | `#eaa300` | `#d1af7c` | `#f6b545` | `#fdf5ea` |

On subtle surfaces, `low` appends 68% alpha (`ad`) and `lowest` appends 24% alpha (`3d`) to each
resolved anchor. On vivid surfaces, those descendants use 76% (`c2`) and 40% (`66`). Every schema
value is authored as a functional-reference locator and resolved by the strict preset resolver; no
literal color, fixed tone, or component-semantic alias is introduced.

Core also recognizes `teal`, `cyan`, `pink`, and `brown` as possible Text foreground names, but
this Fluent preset does not publish them. Its similarly named harmony-derived candidates are still
unapproved review inputs, so synthesizing those Text capabilities would overstate source coverage.
All black, gray, and white foregrounds remain inside `neutral`; `black` is not a separate Text
family.

### Deep Profile Extension

`deep` is an optional complete profile within a color family, not an opacity modifier or a fourth
Text emphasis. Kiskadee publishes it for all six approved chromatic families: `blue`, `red`,
`green`, `purple`, `orange`, and `yellow`. The Text Showcase compares both choices, and Button now
consumes selected Deep coordinates without coupling its own emphasis names to Text strengths.

The shared formula is calibrated from the already approved Button label recipes. Button consumes
the resulting global coordinates at schema-build time; it does not perform a runtime profile
lookup:

| Context | Theme | `medium` anchor | `low` | `lowest` |
| --- | --- | --- | ---: | ---: |
| `onSubtle` | Light | Family primitive L65 | 68% | 24% |
| `onSubtle` | Dark/Darker | Family primitive D75 | 68% | 24% |
| `onVivid` | Light/Dark/Darker | Family Light-track `subtle +2` | 76% | 40% |

The `onVivid` branch uses the lighter family-relative `subtle +2` anchor previously evaluated as
Standard, consistently across all themes. The resolved `medium` anchors are:

| Family | `onSubtle` Light | `onSubtle` Dark/Darker | `onVivid` Light | `onVivid` Dark/Darker |
| --- | --- | --- | --- | --- |
| `blue.deep` | `#0d477e` | `#61a7f3` | `#d3e7ff` | `#d3e7ff` |
| `red.deep` | `#811819` | `#f67c73` | `#ffdbd7` | `#ffdbd7` |
| `green.deep` | `#155513` | `#67b661` | `#d4edd2` | `#d4edd2` |
| `purple.deep` | `#6b2762` | `#dd80cf` | `#f8daf2` | `#f8daf2` |
| `orange.deep` | `#6f3217` | `#e68962` | `#ffdccf` | `#ffdccf` |
| `yellow.deep` | `#5a4117` | `#c19c65` | `#f6e2c4` | `#f6e2c4` |

For each anchor, `low` applies the same profile-specific alpha as Standard: 68% on subtle and 76%
on vivid. `lowest` applies 24% on subtle and 40% on vivid.

L65 and D75 are authored with strict exact-tone locators carrying the
`global.foreground.deep` evidence ID. The `onVivid` branch uses a strict functional-reference
locator, so a future approved movement of the primitive `subtle` anchor propagates without a
hardcoded absolute position. The resolved HEX values above are evidence expectations, never schema
literals.

This is a **Kiskadee extension** informed by existing Fluent component evidence. It does not claim
that Fluent publishes a global Standard/Deep Text API. Button is the first component migrated to
consume the catalog; Badge, Card, and Chip remain unchanged.

### Stateful Global Coordinates

Global foreground profiles always require `rest` and may additionally publish `hover`, `pressed`,
`pending`, and `disabled` at a coordinate. These states do not make standalone Text interactive:
Text profile expansion deliberately takes only `rest`. They exist so a component-owned text slot
can reuse an exact foreground without reopening primitive or tonal-scale selection.

The Fluent catalog promotes the following state relationships:

| Coordinate family | Published state relationship | Provenance |
| --- | --- | --- |
| Chromatic Standard, Light `onSubtle.medium` | Rest at `vivid`; Hover at `vivid +1`; Pressed at `vivid +3`; Pending at 70% of Rest | Official Button rhythm adapted to a global foreground coordinate |
| Neutral Standard, Light `onSubtle.medium` | Foreground 1 Rest; nearby approved Hover and Pressed stops; Pending at 70% | Official adapted / Kiskadee state projection |
| Standard `onVivid.medium` | Physical white for Neutral; chromatic Standard remains family-relative | Official white anchor plus Kiskadee extension |
| Chromatic Deep `medium` | Pending at 70% of the same Deep Rest coordinate | Kiskadee extension |
| Neutral Deep, Light `onSubtle` | Absolute-black `medium`; L65 `low`; disabled L20 at 82% for filled controls and solid L16 for borderless controls | Existing Fluent Button foreground evidence promoted globally |
| Neutral Deep, Dark/Darker `onSubtle` | Physical-white `medium`; D75 `low`; disabled D35 | Existing Fluent Button foreground evidence promoted globally |
| Neutral Deep, all-theme `onVivid.medium` | Light-track `subtle +4`; disabled physical white at 40% | Existing on-vivid Button evidence promoted globally |

Schema authors select one coordinate directly with `fg(...)`, or use `fg.parentState(...)` when a
child slot must react to the state of its component ancestor. For example:

```ts
fg('red.deep.light.onSubtle.medium')
fg.parentState('red.deep.light.onSubtle.medium.pending')
```

The explicit source theme is intentional: a Button in a Dark application theme can still create a
physically light local surface and consume the Light foreground track. The consuming palette
supplies the segment. Web Builder validates the complete coordinate, resolves it to HEX, and lowers
`parentState` to the existing parent-state selector mechanism. No `fg:` token reaches CSS or the
browser.

Button emphasis and foreground strength are independent axes. Button Medium, Low, and Lowest may
all point to `red.deep.light.onSubtle.medium`; the repeated word `medium` describes the selected
global foreground coordinate, not the Button's own prominence.

## Schema And Build Decision

Each reusable family is authored once at `global.foregrounds.profiles`. Every family publishes a
complete `standard` profile and may publish a complete `deep` profile. Text `e1` maps its local
visual names to structured family-profile references:

```ts
foreground: {
  neutral: { family: 'neutral', profile: 'standard' },
  blue: { family: 'blue', profile: 'standard' },
  'blue-deep': { family: 'blue', profile: 'deep' },
  red: { family: 'red', profile: 'standard' },
  'red-deep': { family: 'red', profile: 'deep' },
  green: { family: 'green', profile: 'standard' },
  'green-deep': { family: 'green', profile: 'deep' },
  purple: { family: 'purple', profile: 'standard' },
  'purple-deep': { family: 'purple', profile: 'deep' },
  orange: { family: 'orange', profile: 'standard' },
  'orange-deep': { family: 'orange', profile: 'deep' },
  yellow: { family: 'yellow', profile: 'standard' },
  'yellow-deep': { family: 'yellow', profile: 'deep' }
}
```

Every Text-referenced profile is complete for Light, Dark, and Darker in both Surface Contexts.
Profiles may contain the optional states documented above, but the Web Builder lowers only their
`rest` value into ordinary standalone Text `textColor` palettes. Standard and Deep Text aliases
still emit the existing `c.s` and `c.v` class-map branches. Atomic component-slot references are
resolved before Style Keys and reuse that same chromatic pipeline. No Fluent-specific runtime
lookup, foreground bucket, or semantic CSS variable is introduced.

Standalone Text uses `medium | low | lowest` as foreground strength and defaults to
`neutral.medium`. It intentionally excludes `high` and `highest`; own-surface emphasis semantics for
Button now consumes atomic foreground coordinates for its canonical `e2`, `e3`, and `e4` text
slots. Badge, Card, Chip, and Brand Pack projections retain their previous component-owned recipes
in this phase.

## Validation

The initial integration was verified through:

- Core contract tests for profile IDs, atomic-coordinate parsing and serialization, unknown axes,
  three-emphasis coverage, rejection of `high` and `highest`, required Rest plus optional supported
  states, Text-only Rest projection, and the `foreground`/`textColor` conflict;
- Fluent schema tests for the complete Light, Dark, and Darker matrix in both Surface Contexts,
  neutral plus all six Standard and six independent Deep chromatic profiles,
  resolved without schema literals;
- Web Builder tests for profile lowering, CSS `color` emission, independent `t` and `c.s`/`c.v`
  branches, and manifest Surface Context discovery after expansion;
- React Text tests for defaults, all three emphases, Provider inheritance, explicit override,
  named chromatic selection, unsupported-family inheritance, `inherit`, SSR, a missing Text
  artifact, missing `onVivid`, and a pending preset/theme artifact;
- synchronized Web Builder output plus React and Showcase production builds;
- rendered `/typography` checks of the neutral and chromatic matrices in the active Dark theme at
  desktop and 390 px mobile widths; schema tests cover the exact Light, Dark, and Darker recipes.
