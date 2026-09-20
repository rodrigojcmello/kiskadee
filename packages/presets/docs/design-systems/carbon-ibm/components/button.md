# Carbon Button Evidence

This records the source decisions for `components/button.schema.ts` in the Carbon preset.

## Sources

- [Preview Button guidelines](https://preview.carbondesignsystem.com/building-blocks/core/components/button/guidelines), inspected 2026-09-20; marked Stable, updated 2026-09-09.
- [Preview color tokens](https://preview.carbondesignsystem.com/building-blocks/foundations/color/tokens).
- [Preview interaction color rules](https://preview.carbondesignsystem.com/building-blocks/foundations/color/overview).
- [Official Button styles](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/button/_button.scss) and [geometry](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/button/_vars.scss).
- User-provided [Carbon v11 Figma](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/-v11--Carbon-Design-System--Community-?node-id=58-2763): file key `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`. The local capture is [figma-theme-tokens.json](../colors/figma-theme-tokens.json); this document does not claim a component-frame inspection at that entry node.

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Primary, Secondary, Tertiary, Ghost and Danger | Official code, documented tokens and three mapped themes | Official adapted |
| Productive typography, square geometry, trailing icons | Documentation and official Sass | Official adapted |
| Four-intent/four-emphasis matrix, pending, arbitrary selected actions, onVivid | Existing Kiskadee component contract | Kiskadee extension |
| Future Carbon v12 visual expression | Announcement only; not a released component recipe | Deferred |

## Official Contract

Primary uses blue; Secondary uses a filled gray. Tertiary has a transparent resting surface and
colored outline, becoming filled with inverse text on interaction. In the dark themes the ordinary
Tertiary outline and interaction fill are neutral light colors, not blue. Danger has solid, outlined
and ghost forms. Carbon has no separate positive-action or medium-emphasis Button variant.

Productive text is IBM Plex Sans Regular, 14/18 with 0.16px tracking. Button corners are square.
The 24, 32, 40, 48, 64 and 80px heights map to the existing six Kiskadee size recipes. Padding is
authored as visual spacing and the existing Builder compensates its 1px border. Large extended
sizes retain top-aligned content. Icons are 16px and trailing by default.

## Color And Token Provenance

All published colors go through `CarbonIbmColorResolver`. Token values use the per-theme
`source.tokens` exact registry; physical white and transparent use cap locators. The complete
primitive alias, source value, generated value and distance are in
[token-mapping.json](../colors/token-mapping.json). Representative mappings are:

| Source token | Light source -> generated | Dark source -> generated | Lookup / slot |
| --- | --- | --- | --- |
| button-primary | #0f62fe -> #0f62fe, L40 | #0f62fe -> #0f62fe, D50 | exact source.tokens, button.primary / e1 high Rest |
| button-primary-hover | #0050e6 -> #004fde, L50 | #0050e6 -> #0053e7, D40 | exact source.tokens, e1 high Hover |
| button-primary-active | #002d9c -> #003192, L70 | #002d9c -> #003395, D18 | exact source.tokens, e1 high Pressed |
| button-secondary | #393939 -> #3d3d3d, L70 | #6f6f6f -> #727272, D50 | exact source.tokens, button.neutral / e1 high Rest |
| button-secondary-hover | #474747 -> #464646, L65 | #5e5e5e -> #626262, D40 | exact source.tokens, e1 high Hover |
| button-secondary-active | #6f6f6f -> #737373, L40 | #393939 -> #383838, D16 | exact source.tokens, e1 high Pressed |
| button-tertiary | #0f62fe -> #0f62fe, L40 | #ffffff -> #ffffff | exact/cap, e1 low border and e2 Rest |
| button-tertiary-active | #002d9c -> #003192, L70 | #c6c6c6 -> #c5c5c5, D85 | exact source.tokens, source family preserved for e1 low Pressed |
| button-danger-primary | #da1e28 -> #da1e28, L40 | #da1e28 -> #d82129, D50 | exact source.tokens, button.destructive / e1 high Rest |
| button-danger-hover | #b81922 -> #b80018, L50 | #b81922 -> #b60017, D35 | exact source.tokens, e1 interaction |
| button-danger-active | #750e13 -> #78000c, L70 | #750e13 -> #78000b, D16 | exact source.tokens, e1 interaction |
| text-on-color | #ffffff -> #ffffff | #ffffff -> #ffffff | cap light, e2/e3 solid foreground |

Darker shares the listed dark Button base values, but uses its independently mapped disabled and
danger-secondary tokens. The Figma and current palette implementation give danger-hover #b81922;
the preview token table displays #b81921. The one-channel discrepancy is retained as source
provenance, not another palette. This preset uses the captured Figma token and official primitive.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status |
| --- | --- | --- |
| Primary High / Neutral High | Primary / Secondary | Official adapted |
| Primary Low / Lowest | Tertiary / Ghost | Official adapted |
| Destructive High / Low / Lowest | Danger / Danger Tertiary / Danger Ghost | Official adapted |
| Neutral Low / Lowest | Neutral extension of outline / ghost treatment | Kiskadee extension |
| Positive, all Medium, all onVivid | Existing Kiskadee intent and emphasis vocabulary | Kiskadee extension |

## Shared Formula And States

- Medium chromatic surfaces follow their own family's `subtle` reference: Rest +0, Hover +1,
  Selected +2, selected Hover +3, Pressed +4. Neutral Medium uses the equivalent layer tokens.
  Light chromatic Medium labels use `vivid +3` so they remain readable on these tinted surfaces.
- Positive solid actions use the green family's Light `vivid`: Rest +0, Hover +1, Selected +2,
  Pressed +4. Their dark lower-emphasis foreground uses support-success for readable contrast.
- General selected actions are a Kiskadee extension inspired by Carbon's one-step selection and
  two-step activation separation. Primary solid Selected uses source Blue70 (link-secondary);
  Neutral uses source Gray70 (text-secondary). Destructive and Positive use their own family's
  Light vivid +2. Selected does not universally alias Pressed.
- onVivid is an explicit Kiskadee inversion, independent of the surrounding neutral theme. High
  surfaces use physical white at 100/95/80/90 percent for Rest/Hover/Pressed/Selected. Medium uses
  physical black at 16/24/40/32 percent to preserve white-label contrast on the blue canvas.
  Low fills with white on interaction. High and active Low labels use the intent's Light
  `vivid +3`; neutral uses Light text-primary. Ghost overlays use black at 12/32/24 percent
  for Hover/Pressed/Selected. These are measured composition extensions, not upstream tokens.
- Primary and Positive ghost Selected/Pressed labels use `vivid +4` in Light and `vivid +8`
  in Dark/Darker; Positive Hover uses the same label. This preserves contrast over the source
  gray interaction overlays while keeping the semantic family.
- Pending uses 70 percent surface/label strength and 60 percent outline strength. Icon pending
  deltas are omitted so progress artwork remains at Rest strength. This is a Kiskadee extension.
- Text and icon interaction deltas reference e1, the state owner. Tertiary keeps a focus surface
  because the official treatment fills it; other focus palettes remain sparse and use the global
  focus ring. Disabled uses Carbon's explicit terminal tokens.
- Neutral High Dark has the same background token for Rest and Disabled upstream. Its explicit
  Disabled background is retained to reset Selected/Hover/Pressed; the disabled text still changes.
- Low and Lowest retain Rest-equal transparent Pending/Disabled backgrounds to clear a simultaneous
  Selected fill. Their terminal text and outgoing content context then match the unfilled surface.
- Content surface outputs cover Rest/Selected/Pending/Disabled. The existing contract does not
  express transient Hover/Pressed/Focus outputs: native labels/icons have their explicit inverse
  palettes, while arbitrary nested components cannot inherit that transient inversion. This
  capability is deferred rather than added to Core in this preset update.
- Medium and low-onVivid fields have selected-state submaps only where the selected treatment or
  activation differs. No redundant general Hover/Focus values are added to make a visual matrix.

## Schema Mapping And Adaptations

`e1` owns the surface/outline; `e2` label; `e3` icon; `e4` optional icon region; `e5` disclosure;
`e6` connected-group separator; `e7` badge spacing. e4/e5/e7 completeness is a Kiskadee extension.
The group separator follows button-separator in ordinary contexts and a white 40 percent cap on
vivid surfaces. Optional icon regions follow the layer tokens. Normal buttons have no shadow or
Fluent-style bottom stroke. Rounded/pill options remain optional framework geometry; square is the
preset default. The framework edge layout centers its label track and therefore does not reproduce
Carbon's asymmetric label/icon positioning exactly; no new layout API is introduced.

## Validation

Factories resolve all four intents and four emphases across Light, Dark and Darker, with both
surface contexts. Focused typechecking reports no Button-file errors; repository-wide unrelated
errors are reported by the main task. Generated-artifact and browser validation belong to the
coordinated preset completion pass.

A one-off resolved-color audit covered all four intents, four emphases, three themes, both
contexts, and five active states on canonical neutral Low / Primary Highest canvases. All
framework-extension pairings exceed 4.5:1. The retained Dark danger-secondary source token maps
to 4.47:1 on generated neutral Low (Low/Lowest Rest and Lowest Focus); this small source-mapping
deviation is recorded rather than represented as a universal contrast guarantee. Pending and
Disabled are intentionally attenuated and are excluded from that active-state claim.
