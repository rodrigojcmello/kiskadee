# Material Design 3 Button Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/material-3-google/components/button.schema.ts`.

## Sources

Interaction behavior was inspected on 2026-09-12 with Figma design context rather than
literal palette adoption. The separate geometry inspection is recorded below.

- [Material 3 Design Kit](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=57994-696)
  - File key: Peqe9lNMsuQHLIUZsiTZNg; section: 57994:696.
  - Filled: 57994:2227. Tonal: 58651:11237. Outlined: 58650:10213. Text: 58650:8094.
  - Selected tonal: 57994:2433 under 58653:17539.
- [Approved color provenance](../colors/README.md): the existing promoted assets are
  unchanged by the geometry and indicator completion.
- Local Fluent reference: fluent-2-microsoft/components/button-color-formula.ts.
  User authorized this preset as the fallback for missing context/theme/state behavior,
  and explicitly chose its per-emphasis Pressed appearance for persistent selection on
  2026-10-26. This selection policy is an adaptation despite available upstream Toggle recipes.
- Geometry inspection on 2026-10-26: user-supplied imported `Material 3 Design Kit (Community).fig`
  at `/Users/rodrigo/Projects/design/Material 3 Design Kit (Community).fig`, opened in OpenPencil
  document tab `3`, page `0:15`, Button component set `0:1045`.
  The IDs below belong to that local import; they are not original Figma node IDs.
  The imported copy's version was not independently established.
- [Official Material buttons specification](https://m3.material.io/components/buttons/specs).
- [Official Button overview](https://m3.material.io/components/buttons/overview) and
  [guidelines](https://m3.material.io/components/buttons/guidelines): the May 2025 Expressive
  update distinguishes default and toggle behaviors, with separate Pressed and Selected shapes.
- [Official Android common-button documentation](https://github.com/material-components/material-components-android/blob/master/docs/components/CommonButton.md)
  distinguishes the Expressive five-size update from the existing Small button.
- [Official Android button tokens](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/button/res/values/tokens.xml)
  provide a separate implementation cross-check for icon, spacing and typography roles.
- Historical [Material Web v0.192 Filled Button tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss)
  define a 40px container and 18px icon. That older recipe does not replace the imported
  Expressive geometry inspected for this change.

## Source Coverage

| Source area | Status | Coverage |
| --- | --- | --- |
| Filled, tonal, outlined and text state layers | Official adapted | Figma Light behavior inspected; map to approved Kiskadee families. |
| Toggle Selected appearance | Kiskadee extension | Official persistent selection was inspected, but the chosen recipe reuses Pressed at each emphasis instead of promoting every selection to a strong fill. |
| Neutral, destructive, positive extension matrix | Kiskadee extension | Same recipe with the corresponding intent family. |
| Dark, onVivid and pending completion | Kiskadee extension | Fluent-guided completion; no claim of direct Figma equivalence. |
| Round enabled inline sizes | Official adapted | Imported visual containers, labels, icons and gaps inspected on 2026-10-26; mapped to five Kiskadee sizes. |
| Stacked composition `e8/e9/e10` | Kiskadee extension | Preset coverage of the existing framework Button composition. No upstream stacked geometry is claimed. |
| Selection indicators `e11/e12` | Kiskadee extension | Preset coverage of existing inside/outside framework indicators. No upstream indicator anatomy is claimed. |
| Independent selection intent | Kiskadee extension | Existing Button intent recipes may paint a different selected intent through the shared framework API; no official Material cross-intent recipe is claimed. |
| Stateful corner effect, focus-ring and ripple fidelity audit | Not inspected | Existing effects retained; this geometry inspection does not validate their upstream equivalence. |

## Official Geometry And Kiskadee Mapping

The imported Round enabled Button has a 48px outer touch area for Extra Small and Small,
while its visible Content containers are 32px and 40px. The schema's `_boxHeight` records
the visible container reference, not that touch wrapper. Medium, Large and Extra Large
visible heights are 56px, 96px and 136px. The existing framework sizing contract remains
responsible for interactive layout; this change does not add touch-target behavior.

All identifiers in this table are local OpenPencil import IDs.

| Kiskadee size | Source size | Root / Content / StateLayer | Icon / Label | Visible height | Icon | Label size / line | Icon-label gap |
| --- | --- | --- | --- | ---: | ---: | --- | ---: |
| `s:sm:1` | Extra Small | `0:1235` / `0:1236` / `0:1237` | `0:12021` / `0:1238` | 32 | 20 | 14 / 20 | 4 |
| `s:md:1` | Small | `0:1214` / `0:1215` / `0:1216` | `0:12010` / `0:1217` | 40 | 20 | 14 / 20 | 8 |
| `s:lg:1` | Medium | `0:1193` / `0:1194` / `0:1195` | `0:11999` / `0:1196` | 56 | 24 | 16 / 24 | 8 |
| `s:lg:2` | Large | `0:1172` / `0:1173` / `0:1174` | `0:11988` / `0:1175` | 96 | 32 | 24 / 32 | 12 |
| `s:lg:3` | Extra Large | `0:1151` / `0:1152` / `0:1153` | `0:11977` / `0:1154` | 136 | 40 | 32 / 40 | 16 |

Status: **Official adapted**. Kiskadee maps these measurements to its existing scale keys,
typography profiles and icon-size catalog. `label-extra-large`, `label-display-small` and
`label-display-large` remain Kiskadee profile names for the inspected metrics, not upstream
type-token names. The Material icon catalog inserts 40px at `s:lg:4` and moves 48px to
`s:lg:5`; standalone Icon's public `s:lg:4` recipe remaps to that 48px entry, preserving
its resolved output.

The imported Extra Small gap is 4px. The separate Android token file exposes 8dp, while
[Compose ButtonDefaults](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Button.kt)
uses 4dp for `ExtraSmallIconSpacing` with an upstream correction TODO. This preset follows
the inspected import rather than treating those sources as identical versions.

The inline root authors vertical insets 6/10/16/32/48 and horizontal insets
12/16/24/48/64 per side, before the existing Builder border deduction. Border widths
1/1/1/2/3 follow the five-size Android outline tokens. Rounded and Pill radii are
16/20/28/48/68; Square remains zero. Stacked shares the border widths and fixed
Rounded/Square recipes, and does not publish Pill.
Disclosure uses the same icon scale and adjacent gap as the inline icon.

## Kiskadee Extensions

Stacked and selection indicators complete Material's coverage of capabilities already present
in the framework Button. Their requirement is functional parity between preset recipes;
their geometry is a Kiskadee decision, not an official Material Button variant.

`e8` supplies the stacked root geometry, `e9` its label metrics and gap, and `e10` its icon
scale. Colors and interaction behavior continue through the existing inline owners rather
than duplicating a second palette matrix. The default composition remains inline.

The Stacked corner restriction is a Kiskadee composition rule approved on 2026-10-26:
only Rounded and Square are supported. The framework resolves a global Pill default to the
authored Rounded recipe; an explicit Pill request receives the same normalization. No new
preset option is introduced. Horizontal Button and indicator Pill recipes remain available,
and the existing Stacked padding, fixed radii and nominal heights are unchanged.

| Size | Stacked icon | Label profile (line height) | Gap | Vertical inset per side | Horizontal inset per side | `_boxHeight` |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| `s:sm:1` | 24 | `label-medium` (16) | 4 | 4 | 12 | 52 |
| `s:md:1` | 24 | `label-medium` (16) | 8 | 8 | 16 | 64 |
| `s:lg:1` | 32 | `label-large` (20) | 8 | 12 | 24 | 84 |
| `s:lg:2` | 40 | `label-extra-large` (24) | 12 | 16 | 32 | 108 |
| `s:lg:3` | 48 | `label-extra-large` (24) | 16 | 24 | 48 | 136 |

Each reference height is `icon + label line + gap + top inset + bottom inset`, using the
existing Builder border compensation. It is not emitted as a new fixed-height layout.

`e11` and `e12` author inside and outside selection marks separately. Both use widths
30/30/36/48/60 across the five sizes, thickness 3 and vertical margin 2. Their mark radius
is 3 for rounded/pill and 0 for square. The indicator is existing framework selection
feedback; it does not introduce another semantic control or official Material anatomy.

`options.selectionEmphasis: lowest` is the preset default for every layout. `low` and `high`
request the authored indicator; `lowest` and `medium` omit it. Indicator activation has no
independent prop or layout scope. `options.indicatorPlacement: inside` remains the positioning
default and does not select an appearance by itself.

### Indicator Color Provenance

Status: **Kiskadee extension**. Both indicator placements use the existing approved assets
through the preset's legacy `c` / `c.ref` getter; no FRF migration, new primitive, seed or
foreground role is introduced. Their colors are independent of the Button intent. Inside
distinguishes High from the other emphases to contrast with each selected surface; the same
rule is authored for each declared segment, theme and surface context.

| Placement / context | Existing lookup | Kiskadee rationale |
| --- | --- | --- |
| Inside High, Light onSubtle | physical light cap: `c(segment, 'l', 'primitive.black.v1', 0)` | Contrasting mark on the dark filled container. |
| Inside High, Dark onSubtle | physical dark cap: `c(segment, 'l', 'primitive.black.v1', 100)` | Contrasting mark on the light filled container. |
| Inside High, onVivid, either theme | fixed inverse foreground: `c(segment, 'l', 'button.primary', 65)` | Reuses the existing inverse filled Button content position. |
| Inside Medium/Low/Lowest, Light onSubtle | fixed foreground: `c(segment, 'l', 'button.primary', 65)` | Primary signal over the participating soft or translucent Pressed surface. |
| Inside Medium/Low/Lowest, Dark onSubtle | fixed foreground: `c(segment, 'd', 'button.primary', 85)` | Light primary signal over the participating dark Pressed surface. |
| Inside Medium/Low/Lowest, onVivid, either theme | physical light cap: `c(segment, 'l', 'primitive.black.v1', 0)` | Contrasts with the vivid ambient surface under the translucent Pressed layer. |
| Outside, Light onSubtle | functional reference: `c.ref(segment, 'l', 'button.primary', 'vivid')` | Primary identity on the surrounding subtle surface. |
| Outside, Dark onSubtle | fixed foreground: `c(segment, 'd', 'button.primary', 85)` | Reuses the existing Dark Button foreground position. |
| Outside, onVivid, either theme | physical light cap: `c(segment, 'l', 'primitive.black.v1', 0)` | Contrasting mark on the surrounding vivid surface. |

These fixed positions are existing Kiskadee foreground choices, not extracted Material
indicator tokens. Palette entries contain only parent-owned `selected.rest` paint. Pending
and Disabled visibility suppression remains the existing React Button behavior; transient
Hover, Focus and Pressed do not require duplicate indicator colors.

## Official Behavior Observed

Filled uses on-primary white at 8% for Hover and 10% for Focus over its opaque primary.
The inspected Pressed variant has an 8% state layer plus spatial ripple.
Tonal uses on-secondary-container at 8%/10%; outline uses on-surface-variant;
text uses primary. Thus the state moves the surface toward its foreground:
a dark filled Light button lightens; a pale tonal Light button darkens.
Labels stay stable through these interactions. Disabled container uses on-surface 10%
and content 38% in the inspected kit.

The kit contains a distinct blue secondary/tonal family. Kiskadee intentionally replaces
that organization with the participating intent family: red on pale red, green on pale
green, primary on pale primary, neutral on pure grayscale, and secondary on its derived supporting family.

The former omission of a separate support intent is superseded on 2026-09-15. See
[the secondary color decision](../colors/secondary-color-decision.md) for why
emphasis handles hierarchy and why two similar hues do not establish an intuitive
semantic distinction. Button Neutral is now grayscale; the supporting color has its own
optional intent and remains subject to visual acceptance.

## Color lookup and shared formula

All colors resolve with the existing preset getter; no primitive assets or generator settings change.
The formula is independent of specific seed HEX values.

| Input | Lookup | Rationale |
| --- | --- | --- |
| Light onSubtle high | participating family vivid reference | Filled semantic identity. |
| Dark onSubtle high | vivid +6 chromatic; neutral vivid +0 | Light filled surface with dark text; neutral already has its vivid reference near the light endpoint. |
| Light onSubtle medium | participating family L7 | User-approved stronger tonal container, shared by all intents and segments. |
| Dark onSubtle medium | participating family subtle reference | Existing soft intent-colored container. |
| onSubtle non-high content | family L65 / D85 | Explicit Kiskadee foreground selection for contrast with soft and transparent surfaces. |
| onVivid high | pure light cap; family L65 text | Fluent-style inverse control for a strong background. |
| onVivid medium | Light subtle at 14/10/12/7% for Rest/Hover/Focus/Pressed | Fluent-guided translucent treatment that retains label contrast. |
| Low outline | content at 35%, or 40% onVivid | Family-aware Kiskadee outline; stable across transient states. |
| Disabled | physical on-surface cap at 10% container, 38% content, 12% outline | Shared across intents; light/dark polarity follows the surrounding surface. |

High/medium opaque state layers are composed in sRGB at build time.
Hover is 8%, Focus 10%, Pressed 12%. The 12% uniform Pressed layer is an explicit
static Kiskadee adaptation so the pressed palette remains visible without freezing
a spatial ripple. Existing ripple remains active. Low/lowest use foreground alpha
layers over a transparent Rest surface.

The existing Selected palette reuses Pressed from the same intent, emphasis, theme and ambient
context. That palette never promotes Medium, Low or Lowest to High. It authors only
this Rest delta; transient selected colors are not duplicated from another emphasis.
Foregrounds remain those of the participating emphasis, and Low retains its outline.
This supersedes the former High-filled selection and High Selected 4% layer.

Pending follows Fluent's per-slot treatment: opaque filled containers 60%, label 70%,
low outline 20%; onVivid medium uses 11%. Icon/disclosure keep Rest strength for
spinner legibility. Disabled overrides pending and selection through existing state precedence.

## State and composition ownership

e1 owns surface/border interaction states. e2 label, e3 icon and e5 disclosure retain
their emphasis foreground during selection. They use parent-state references for
pending (label only) and disabled colors; the indicator keeps its own Selected reference.
Stable foregrounds and borders omit redundant transient states. No Rest-equal Focus
palette reset is required. Focus surface treatment coexists with the existing external ring.

Content surface context is explicitly published for both themes, both input surfaces,
all five intents and emphases. Selection retains the context of that emphasis's Pressed
surface rather than unconditionally publishing the High context. Disabled returns to
the inherited surrounding context.

## Per-Emphasis Selection Policy (2026-10-26)

Status: **Kiskadee extension**, explicitly approved by the user. Material Expressive has
an official persistent Toggle selection, independent of transient Pressed. Its Filled,
Tonal and Outlined configurations use different selected roles; the official diagram
does not offer Text Toggle. The local kit also contains `Toggle button`,
`Toggle button - tonal` and `Toggle button - outline`, with Selected True/False and
independent Enabled/Hovered/Focused/Pressed variants. Local Round Small examples are
`0:892`/`0:997` (Filled selected/unselected), `0:3223`/`0:3328` (Tonal), and
`0:2802`/`0:2907` (Outlined). These are imported OpenPencil IDs, not Figma links.

Official references include the [separate pressed/checked shape selector](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/button/res/xml/m3expressive_button_shape_state_list.xml),
[Filled Toggle tokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilledButtonTokens.kt),
[Tonal Toggle tokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TonalButtonTokens.kt),
and [Outlined Toggle tokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/OutlinedButtonTokens.kt).
The source branches are current implementation references, not claims about a specific release.

Kiskadee deliberately preserves visual emphasis during selection: `selected.rest` uses
that emphasis's existing `pressed` surface for all five intents, all three published
segments, both themes and both contexts. The same approved primitive assets, legacy
`c` / `c.ref` lookups and Pressed layer percentages remain authoritative. No new seed,
tonal position or color literal is introduced for selection. Selected remains a persistent
semantic state; it is not implemented by leaving the Button in the Pressed interaction state.
Terminal availability and the optional corner effect retain their existing contracts.

### Selection Emphasis Scale

Status: **Kiskadee extension**, independent of official Material Toggle recipes. The new
`selectionEmphasis` option and platform prop consolidate four presentations of the same semantic
selection: `lowest` uses the existing per-emphasis Selected palette, `low` adds the indicator,
`medium` uses ordinary High paint, and `high` uses ordinary High paint with its indicator.
`lowest` is the default for horizontal and Stacked layouts. High is literal even if the base
emphasis is Highest. The base intent is preserved unless `selectionIntent` explicitly selects
another published Button intent.

The higher levels reuse High Rest/Hover/Focus/Pressed rather than High Selected. They do not
change the underlying Selected palette or introduce a palette axis, primitive, tonal position or
color literal. The selected semantic value remains active for accessibility and indicator paint,
while effects and the produced content context follow the effective visual recipe.

The existing `e11/e12` High colors also meet 3:1 over ordinary High states in 480 checked
inside/outside coordinates: all three segments, both themes, both contexts, all five intents and
Rest/Hover/Focus/Pressed. No color recipe change or indicator Rest entry is needed. The Showcase
uses the same selection-emphasis API for its four selection behaviors and meeting compositions.

### Independent Selection Intent

Status: **Kiskadee extension**. `selectionIntent` optionally selects the intent of the selected
recipe without adding more emphasis levels. The explicit platform prop takes precedence over
`options.selectionIntent`, then the Button's base intent. Material leaves this option omitted,
preserving current consumers. All published intent pairs are allowed; the framework does not
choose a Neutral, Primary, Positive or Destructive complement automatically.

The capability consumes the existing Selected recipe at the base emphasis for `lowest/low`, or
ordinary High paint for `medium/high`, in the effective selected intent. Content, indicator,
effects and produced Surface Context follow that same recipe. It changes no Material palette,
tonal asset, shape, type or dimension and is not attributed to the official Material Toggle
variants. Group frames retain the shared base Rest appearance, and selected members hide their
adjoining dividers regardless of their paint. Coverage and BrandPack requirements follow the
[shared selection contract](../../../../../core/docs/definitions/button-selection.md).

The Rich Text Editor inspection exposes Button intent and Selection intent beside both emphasis
controls, starting with a Neutral base and Primary selection. This is an unrestricted comparison
of the preset's existing system-intent recipes rather than evidence for a preferred Material pair.

## Validation

- Focused tests cover both segments, full matrix availability, family isolation,
  parent-state ownership and direction of the Light state layers.
- Enabled and selected Rest/Hover/Focus/Pressed text contrast is checked at 4.5:1
  on opaque filled surfaces, physical theme caps and the canonical primary vivid backdrop.
  This does not guarantee contrast on arbitrary consumer-supplied backgrounds.
  Pending and disabled are not asserted to meet the enabled threshold.
- Build/Showcase sync and sparse-state audits check published outputs.
- Visual homologation is user-owned; no upstream pixel-equivalence claim is made.
- The 2026-10-26 source inspection distinguishes touch wrappers from visual containers
  and records local imported IDs for each inline size. Geometry regression checks cover
  reference-height arithmetic and independent stacked/inline recipes.
- Browser checks on 2026-10-26 confirmed the five inline heights across text, icon and
  combined content, and all five stacked heights, within 0.25 CSS px of the references.
  The largest subpixel rounding difference observed was 0.015625px. The fifth stacked
  size was checked through the existing global size control and indicator sample.
- Geometry browser coverage before the Stacked corner restriction included all three radii,
  internal/external offsets, stable
  geometry across selection, Space/Enter and unavailable indicator suppression. After the
  per-emphasis selection change, automated palette checks cover all three segments,
  both themes/contexts and Selected Rest/Hover/Focus/Pressed (1,920 coordinates), requiring
  at least 3:1 indicator contrast on the canonical surfaces.
- A 390px RTL viewport preserved the meeting bar's horizontal scrolling and two-selection
  behavior without page overflow. The published inspection artifact contains both height
  maps; `_boxHeight` is absent from the generated styles.
- Selection-policy browser checks on 2026-10-26 used Opera: the four Medium examples
  rendered in one desktop row and adapted to a 390px viewport without page overflow.
  Follow changed to the High Rest fill; the other examples retained the Medium Pressed
  fill with persistent selection, with visible indicators in the final two samples.
  Space/Enter toggled selection and control heights stayed unchanged. Stable colors and
  indicator contrast were sampled in the Purple/Blue segments, Light/Dark themes and
  subtle/vivid contexts; these samples do not replace the complete automated palette matrix.

## Open Gaps

- The imported copy's original Figma node mapping and exact upstream version are not
  established; local IDs must not be reused as Figma links.
- The existing stateful border-radius effect uses fixed values across sizes, including
  square. Its fidelity, the external focus ring and the ripple remain **Not inspected**
  by this geometry change; no correction or official-equivalence claim is included.
- The 48px touch wrappers observed for the two smaller source buttons do not establish
  a new Kiskadee web touch-target contract.
- Showcase's Stacked Sizes list currently stops at Large 2. Large 3 is published and
  can be inspected through the global size control in the existing indicator sample;
  no Showcase feature is added by this preset-only completion.
- In the existing three-column Sizes layout at a 1440px viewport, the Large 3 combined
  example can compress its nominal 40px icon viewport horizontally (about 30.7px observed).
  Its height remains 40px and the Button remains 136px. This existing constrained-layout
  behavior is exposed for a separate framework/consumer decision, without a local override.
- The Small stacked inside mark reaches 1px into the label line box with the initial
  4px lower inset. No collision with the painted letters was observed in the Chat sample;
  this close clearance is retained for visual review rather than adding structural logic.
- Material does not publish inline Badge `e7`; existing Showcase examples continue to
  emit the corresponding unsupported-composition warning. Stacked Disclosure and inline
  Badge remain outside the existing stacked contract.

## Medium container refinement (2026-09-15)

Status: **Kiskadee extension**, approved by the user after comparing Google Sheets
Share/Upgrade and Gmail Compose/Upgrade screenshots. Screenshot samples indicate
stronger tonal fills, but are not asserted to be official CSS token values.
Light/onSubtle Medium now selects L7 through the existing intent getter: default
primary `#D0E2FF`, then-current tinted neutral `#C8E4FF` (superseded below). This explicit tonal selection also
applies to Purple and the destructive/positive intent families. It does not change
the shared subtle reference, primitive assets, generator, Dark or onVivid recipes.
Hover/Focus/Pressed retain their existing 8/10/12 percent foreground state layers
over the new base. Pending derives from that base; Selected and Disabled retain
their previous recipes. Contrast tests include Default and Purple.


## Neutral and Secondary separation (2026-09-15)

Status: **Kiskadee extension**, requested by the user. Button Neutral alone now resolves
`primitive.black.v1`; the preset's other neutral consumers retain their tinted mappings.
The optional Secondary intent uses `secondary.v1`: Blue V2 in Default, Purple V3 in Purple.
The same full state/theme/context/emphasis formula applies, including L7 Medium on
Light/onSubtle. This extends the prior four-intent recipe, without special per-segment CSS.
Source evidence and derivation rationale: [secondary decision](../colors/secondary-color-decision.md).

Current decision (2026-09-15): Neutral uses black.v1 across Material. The optional chromatic intent is named support for Button and Card. Tinted neutrals V2/V3 are removed; see colors/secondary-color-decision.md for the superseding mapping.


## Optional elevation recipe (2026-10-03)

Status: **Official adapted** for the [Material Web Elevated Button state levels](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-elevated-button.scss),
**Kiskadee extension** for applying this optional effect across Kiskadee intents/emphases.
Rest uses level 1 (`s:sm:1`), Hover uses level 2 (`s:md:1`), Pressed returns to level 1, and
Disabled removes elevation. The explicit Rest-equal Pressed entry resets simultaneous Hover;
it is not a duplicate added to complete the state matrix.

Focus omits a shadow delta: isolated Focus retains level 1 and Hover plus Focus retains Hover
with the external focus ring. Selected also adds no elevation delta. Pending explicitly removes
elevation as a Kiskadee terminal-state adaptation; the upstream token file does not define Pending.
The shared catalog now supplies both official layers per level, using its existing physical black
lookup and source alpha. See [global elevation evidence](../source-evidence.md#complete-shared-elevation-layers-2026-10-03).

This is an opt-in Elevated recipe, not a claim that every Button appearance is upstream Elevated.
The [official Filled Button tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss)
use different elevation levels; no automatic emphasis-to-elevation mapping is introduced.
