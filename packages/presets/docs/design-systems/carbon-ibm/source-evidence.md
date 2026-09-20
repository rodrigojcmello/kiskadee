# IBM Carbon Source Evidence

## Primary sources

- [Current Carbon preview](https://preview.carbondesignsystem.com/).
- [Carbon Next](https://preview.carbondesignsystem.com/carbon-next): v12 is upcoming; the preview
  identifies the current system as v11.0. A separate v12 preset is not created.
- [Stable Carbon documentation](https://carbondesignsystem.com/), consulted for missing details.
- User-provided [Carbon v11 Figma](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763),
  file key `MfGzFa79SfhHQ2mKpC3ss4`, inspected read-only on 2026-09-20.
  Color page `169:0`; Effects page `1879:3705`; complete Theme collection with White/G10/G90/G100.
- Previous file `52HHpBaYAUdDKqAdH5vw8Y` remains historical evidence; it is superseded by the
  user-provided file above for this modernization.

## Source coverage and decisions

| Area | Status | Mapping |
| --- | --- | --- |
| Carbon v11 current preview | Official adapted | Single Carbon identity, updated to schema version 11 |
| White, G90 and G100 | Official adapted | `light`, `dark`, `darker`; G10 through canonical Card surfaces |
| IBM Plex Sans / icons | Official adapted | Public font/icon catalogs, existing Carbon family |
| Theme tokens | Official adapted | Strict source-to-generated tonal mapping, no schema literals |
| V12 recommended Tile border / Toggle spacing | Official adapted | Existing 1px border support / 8px label gap |
| Family-relative intentions/emphases and vivid contexts | Kiskadee extension | Existing framework semantics completed from Carbon foundations |
| Generic activation feedback, optional shadow sizes | Kiskadee extension | Existing Kiskadee effects only |
| Unreleased v12 visual expression | Deferred | No speculative future recipes |

Source precedence: current preview specification, then inspectable source tokens and official
implementation, then stable documentation/Figma v11 for missing details. Concrete differences
are called out in component evidence; Fluent supplies coverage and schema organization, not values.

## Global profile mapping

- [Typography](components/text.md): productive IBM Plex Sans, regular 14/18 control labels,
  source spacing/tracking; IBM Plex Mono is available as the code font role.
- [Icons](components/icon.md): existing canonical Carbon mapping. Native 16/20/24/32 dimensions;
  other framework sizes are explicit scale adaptations.
- [Contours and Separators](components/separator.md): shared 1px contour vocabulary.
- Focus: source `focus` token, 2px ring with 1px outside offset. Offset is a Kiskadee adaptation
  because Carbon's common inset focus treatment varies by component.
- Radius: square default; opt-in rounded values are Kiskadee extensions.
- Density: existing compact/regular/spacious schema; component overrides choose Carbon sizes.
  No breakpoint or density API changes.
- Presence: source productive 240ms entrance / 150ms exit; 8px movement is a Kiskadee extension.
  Existing presence contract accepts only ease-in/ease-out, so exact Carbon cubic curves are
  deferred and represented by those directional easings.
- Shadow: inspected Figma `Shadows/Menu` has x 0, y 2, blur 6, spread 0, black 30%.
  `s:md:1` preserves it; smaller 0/1/2 and larger 0/4/8, black 20% are optional framework extensions.
  Border-like inner effects in the Figma file stay contour paint rather than being duplicated as shadows.

## Color and artifact provenance

See [tonal evidence](colors/carbon-tonal-scale-evidence.md), [recipe](colors/tonal-system.recipe.json),
[Shared Viewer](colors/generator-link.md), [resolved source tokens](colors/figma-theme-tokens.json),
and [exact mapping](colors/token-mapping.json). Layer 1 holds seven generated families; Layer 2
assigns global semantics; Layer 3 maps component intentions. No documentation JSON is imported by
production schemas. Existing legacy Light-only assets are superseded by the generated families.

## Component evidence

- [Card](components/card.md)
- [Separator](components/separator.md)
- [Text](components/text.md)
- [Icon](components/icon.md)
- [Button](components/button.md)
- [Switch](components/switch.md)
- [Badge](components/badge.md)
- [Chip](components/chip.md)
- [Dropdown](components/dropdown.md)
- [Bottom Sheet](components/bottom-sheet.md)
- [Slider](components/slider.md)
- [Progress](components/progress.md)

## Validation record

- Shared Core contracts, typography, tonal parity and persisted preset-selection migration:
  92 focused tests passed (four test files).
- Promoted tonal assets: SHA-256 manifest entries were verified against the source and generated
  files; all seven runtime assets passed the Carbon parity test.
- Web Builder: generation and synchronization passed for Carbon 11.0.0, publishing all twelve
  component artifacts and the Light, Dark, and Darker themes.
- Class maps: each of the twelve components publishes both `c.s` and `c.v` in Light, Dark and
  Darker. Builder and Showcase manifests contain the same component set as Fluent.
- Production Showcase build passed compilation, TypeScript and static generation (25 routes).
- Browser inspection used the production build at `http://127.0.0.1:3000`: Button, Card, Badge,
  Chip, Switch, Slider, Progress, Dropdown, BottomSheet, Separator, Icon and Typography/Text
  rendered with the Carbon selection. Light, Dark and Darker and both surface contexts were
  exercised across representative routes; this is not an exhaustive browser matrix.
- Interaction checks: Button native focus, Chip selection, Switch on/off, Dropdown opening and
  BottomSheet submenu navigation. Button and BottomSheet were also inspected at 390x844.
  No relevant console errors were reported in the final browser session.
- Resolved-color checks cover active Button recipes, 216 Chip medium combinations, 48 danger
  menu combinations, and global chromatic foregrounds on the documented surface set. Source
  contrast limitations remain explicit in component evidence; no universal contrast claim is made.
- Existing Showcase boundaries observed during inspection: the Icon matrix paints fixed white
  cells (`app/icons/Icons.module.scss`), so Dark matrix examples do not accurately represent the
  selected surface; the surrounding Icon gallery does. The Switch state gallery supplies
  `readOnly` (`app/switch/SwitchPage.tsx`), so those samples also display read-only styling;
  the interactive sample was used to validate normal on/off appearance. These existing demo
  issues were not changed in the preset-only update.
- Final screenshot comparison remains an inspection aid; it does not replace the source-token
  mapping and contract checks above.
