# iOS 27 Apple Source Evidence

This directory records source evidence and preset-level decisions for
`packages/presets/src/presets/ios-27-apple/`.

## Primary Sources

- [macOS 26 Community — Push Buttons](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=121-11922)
  - file key: `37jpyRzTWznKjRhFSF3GD3`; section `121:11922`, component set `121:11923`;
  - inspected 2026-09-08: compact geometry and active-window Light Idle/Clicked layers;
  - Dark rendering and over-glass materials are **Not inspected** for this change.

- [iOS and iPadOS 27 Community](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
  - file key: `GeO2lMY65IAFczDmjs6oei`;
  - Buttons page: `507:24673`;
  - Button Content Area component set: `40:58696`;
  - Light Button examples: `2539:14600`;
  - Dark Button examples: `2666:16141`;
  - Colors page: `0:1746`;
  - default color section: `5707:28659`;
  - standard Backgrounds swatches: `5532:7801`;
  - Grouped Backgrounds swatches: `5532:8370`;
  - local variable collection: `Colors`, with `Light` and `Dark` modes.
- [Apple SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Human Interface Guidelines: SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)
- [Apple Human Interface Guidelines: Typography](https://developer.apple.com/design/human-interface-guidelines/typography)

## Source Notes

- Apple follows the accepted [one identity, platform adaptations contract](../../definitions/visual-identity-and-platform-adaptations.md). The identifier stays `ios-27-apple`; macOS evidence adds compact geometry and interaction feedback without replacing iOS Rest colors.

- The Figma file exposes a centralized `Colors` collection with 62 color variables and one
  non-color mode variable. Apple supplies appearance-aware system colors, not complete multi-stop
  ramps.
- The non-glass Button Content Area and Liquid Glass Buttons are separate component sets. This
  distinction lets the preset implement the conventional Button without implying Liquid Glass
  support.
- Source colors are preserved separately from Kiskadee's generated scales so an official value can
  remain traceable even when its nearest canonical tone is not an exact match.

## Source Coverage

| Source area | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Central color variables | `Colors`, nodes `0:1746` and `5707:28659` | Official exact | All 12 Accents, 8 Grays, and 42 semantic Light/Dark colors are preserved in JSON. |
| Button Content Area | component set `40:58696` | Official adapted | Styles, enabled/disabled, destructive, content forms, and three sizes inspected. |
| Light Button examples | node `2539:14600` | Official adapted | Conventional Light appearances inspected. |
| Dark Button examples | node `2666:16141` | Official adapted | Conventional Dark appearances inspected. |
| Liquid Glass Button Text | component set `5473:21667` | Deferred | Confirmed upstream capability; no current schema/material implementation. |
| Liquid Glass Button Symbol | component set `5522:11866` | Deferred | Confirmed upstream capability; no current schema/material implementation. |
| Backgrounds and Card surface catalog | nodes `5532:7801`, `5532:8370`, plus opaque application nodes | Official adapted | Opaque background variables are consolidated into Card Neutral Low/Medium; Accent Blue provides the Kiskadee Primary High vivid canvas. |
| Liquid Glass and material containers | Alert, Action Sheet, Color Picker, Material, and Activity View nodes | Deferred | Translucency, blur, and scene-relative material are not flattened into opaque Card colors. |
| Default typography | `224:56261`, page `0:2194` | Official adapted | Dynamic Type default role metrics, weight, and tracking mapped to reusable profiles; web system-font substitution remains explicit. |
| Switch | page `507:24690`, set `29:56814` | Official adapted | Idle track/thumb geometry and source semantic paints; glass transient deformation deferred. |
| Slider | page `507:24685`, `520:49524`, Dark `5430:2055` | Official adapted | Idle rail, thumb, fills and tick evidence revalidated against iOS 27. |
| Progress | `5433:20247`, `5433:20646`, set `9:55875` | Official adapted | Conventional linear track/fill source; semantic colors and linear indeterminate presentation are extensions. |
| Badge | Apple HIG tab bars; Tab Bar page `507:24689` inspected | Official adapted | Attention/count badge role; geometry and broader intent/emphasis matrix explicitly identified as extensions. |
| Menus and action sheets | Menus page `507:24676`, `5580:104363`, `5446:10266` | Official adapted | Source geometry, typography and selection anatomy mapped to existing Dropdown/BottomSheet. Opaque surfaces are explicit extensions. |
| Foregrounds, Icon and Separator | Labels, Separators and Accents in the centralized color collection | Official adapted | Shared foreground/contour profiles use approved tonal counterparts; semantic icon recommendation remains SF Symbols. |

## Preset-Wide Color And Token Provenance

- [`colors/figma-color-variables.json`](colors/figma-color-variables.json) preserves the official
  Apple Accent and Gray source values.
- [`colors/figma-to-kiskadee.json`](colors/figma-to-kiskadee.json) records the perceptual de-para
  from the approved Accent and Gray values to the promoted V5 Kiskadee tones.
- [`colors/figma-to-kiskadee.candidate.json`](colors/figma-to-kiskadee.candidate.json) records the
  complete current comparison mapping for all 62 Figma color variables and currently matches the
  approved bundle.
- [`colors/generated/`](colors/generated/) is the reproducible
  `@kiskadee/tonal-scale@0.7.0` format V5 bundle referenced by the Shared Viewer.
- Thirteen source-backed assets are approved and promoted into the preset: Blue, Mint, Teal, Cyan,
  Green, Apple Gray, Purple, Indigo, Red, Pink, Yellow, Orange, and Apple Brown. Generated
  `n.black.v2` is published as the preset's only `primitive.black.v1`; the generator's mandatory
  pure `n.black.v1` remains evidence-only.
- Apple Brown occupies `yr.brown.v1`; `yr.orange.v2` no longer exists. Lime (`gy.lime.v1`) and
  Magenta (`rp.magenta.v1`) are the only source-unbacked evidence companions.
- The generated bundle's diagnostic status remains `review`. Asset promotion is an explicit preset
  decision and does not rewrite the generator's original diagnostic provenance.

## Supported And Deferred Capabilities

- **Official exact**: source color-variable values and conventional Button size geometry within the
  fields supported by the Kiskadee schema.
- **Official adapted**: Apple Accent/Gray colors mapped through canonical tonal assets; conventional
  Button styles represented as Kiskadee emphases.
- **Kiskadee extension**: complete intent, emphasis, and interaction-state coverage generated by one
  shared Button formula where Apple does not publish equivalents; optional authentication and
  social Brand Packs projected through the same Button recipe.
- **Deferred**: Liquid Glass material, textured backgrounds, material/effect paints, and their
  glass-specific control treatments.
- **Not inspected**: a standalone Apple equivalent for the existing Fluent Action/Toggle Chip;
  see [Chip boundary](components/chip.md). Components outside the published coverage are not
  implicitly supported.

## Preset Decisions

- Generated assets are exposed through the preset's existing primitive color taxonomy; Munsell
  generator IDs remain provenance rather than schema-facing color names.
- Button formulas consume `subtle` and `vivid` functional references with ordinal offsets. They
  resolve to static HEX values while the schema is authored or built; consumer platforms do not
  run color-selection logic.
- Third-party Brand Pack colors remain outside the Apple primitive catalog and normal Button
  artifacts. They are loaded only through an explicit `BrandPackBoundary`.
- The Card canonical catalog is an **Official adapted** projection of Apple's opaque Elevated
  backgrounds plus a **Kiskadee extension** that exposes Accent Blue as Primary High for descendants
  using `onVivid`. It is not presented as an Apple component named Card.
- Apple Primary, Secondary, and Tertiary backgrounds express nesting, not a monotonic emphasis
  scale. The preset publishes only distinct surfaces that preserve Kiskadee's Low/Medium/High
  meaning; complete upstream values remain in the color evidence.
- Liquid Glass is documented but emits no approximation. Adding it later requires a separate
  material-capability contract rather than literal textured colors in the current Button schema.
- The Web Dropdown surface is an opaque **Kiskadee extension** documented separately from Liquid
  Glass and native Apple menu materials. See [Dropdown evidence](components/dropdown.md).

## Typography Evidence

The default iOS 27 Dynamic Type source at `224:56261` was inspected for font sizes, line
heights, weights and tracking. These values now populate `global.typography.profiles`, including
headings and supporting text. Button, Switch, Slider, Badge, menus and sheet actions consume the
shared profiles instead of maintaining component-local text recipes. Text exposes the existing
foreground-profile contract across neutral and chromatic families.

The source uses SF Pro; the Web preset selects an Apple system stack without embedding SF Pro.
This is **Official adapted** and can resolve to another platform font outside Apple systems.
The Showcase's existing iOS profile-selection configuration now consumes the published heading,
body and label profiles. See [Text evidence](components/text.md) for the complete mapping.

## Interface Icon Evidence

Apple identifies SF Symbols as the symbol family designed to integrate with San Francisco and
Apple-platform text. Kiskadee therefore recommends semantic family `sf-symbols` with variant
`regular`. This is **Official adapted** at the preset boundary: the recommendation preserves
Apple's platform family and regular weight intent, but the Web package does not redistribute or
claim to implement SF Symbols.

The optional Web catalog declares `sf-symbols.regular -> iconoir.regular` as an explicit
**Kiskadee extension**.
It is a portability fallback, not an Apple-equivalent family, and the UI must identify it as
`Iconoir (fallback for SF Symbols)`. Native integrations can register a real `sf-symbols`
implementation under the same recommended ID without changing the preset.

## Component Evidence

- [Card and surface composition](components/card.md)
- [Text and typography](components/text.md)
- [Icon](components/icon.md)
- [Separator](components/separator.md)
- [Button](components/button.md)
- [Switch](components/switch.md)
- [Slider](components/slider.md)
- [Badge](components/badge.md)
- [Progress](components/progress.md)
- [Dropdown and Menu](components/dropdown.md)
- [BottomSheet](components/bottom-sheet.md)
- [Chip coverage boundary](components/chip.md)

## Color Evidence

- [iOS 27 color variables and tonal promotion](colors/ios-27-color-evidence.md)

## Current Polish Scope And Decisions

The current preset-only polish uses Fluent Microsoft as a coverage and consumption reference;
Apple evidence remains the authority for iOS appearance. Material is excluded from this stage.
[The verification ledger](polish-verification.md) records coverage, tests and rendered checks.

- Light and Dark colors continue using the approved V5/0.7.0 assets unchanged.
- Darker expresses Apple Dark Base; normal Dark uses Elevated Card backgrounds.
- Text and Icon now consume explicit foreground profiles across all three themes and both
  surface contexts. Source default Dynamic Type metrics were inspected at `224:56261`.
- Contours centralize opaque/nonopaque separator paint for optional Card borders and lines.
- Card's own surface and the context it publishes to descendants are configured independently;
  Selected surfaces explicitly switch content to onVivid.
- Menu and sheet source shadow geometry uses the existing `s:lg:4` global slot (0/8/48/0,
  canonical black at 25% alpha); no new shadow capability or literal schema paint is introduced.
- Strong blue canvases use family-relative offsets, documented as Kiskadee extensions, rather
  than treating an Accent source color as a universal text background.
- Implementation order is foundations, Card/context, text/icons/separators, controls/indicators,
  and menu/sheet compositions. No Builder, Core, Headless or component runtime capability changes.
- The existing Showcase typography selection for iOS is updated to consume the published profiles;
  the app does not reauthor their values.

## Approved Button Hierarchy Revision (2026-09-07)

The user-approved Kiskadee mapping uses a soft tonal-family fill for Medium in every
intent, moves the former neutral Medium fill to Low, and removes the Low outline.
High and Lowest retain their roles. This is a source-informed preset extension rather
than a claim that Apple defines Kiskadee's four emphasis levels. Original source color
evidence remains preserved; implementation uses only the existing tonal scale.
See [Button](components/button.md) for theme, surface-context and Brand formulas.

## Control Cursor Preference

**Kiskadee extension**: the preset explicitly selects `pointer` with `web` scope. This is
a framework convention, not a cursor value extracted from the upstream design kit. Native
targets retain their platform cursor. See [cursor policy](../../definitions/cursor-policy.md).

## Kiskadee density adaptation

Density selection is a **Kiskadee extension**, not an upstream operating-system rule. The preset
reuses its existing fixed recipes through a global compact/spacious mapping and explicit component
exceptions. A single-density component keeps its medium reference; no unsupported recipe is
synthesized. Explicit public `size` selections remain independent of viewport width. See the
[adaptive density contract](../../../../../docs/definitions/adaptive-density.md).

## Regular density (2026-09-10)

Kiskadee adaptation: global compact/regular/spacious maps to sm/md/lg without renaming recipes.
Slider retains sm/md geometry and maps regular and spacious to md. Dropdown and BottomSheet
publish only regular=md. Progress retains its existing compact/spacious override.
No new Apple source dimensions are inferred by this selection policy.
