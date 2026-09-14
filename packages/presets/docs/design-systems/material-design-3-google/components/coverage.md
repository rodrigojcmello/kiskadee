# Material component coverage - KIS-110

Updated 2026-09-13. Scope: bring Material to the practical component coverage of Fluent 2 using
existing Kiskadee contracts. This is preset authorship, not a new platform capability.

## Decisions and boundaries

- Keep the eight approved Balanced assets and their provenance byte-for-byte. No new seed,
  primary-derived neutral, secondary brand family or third black is introduced.
- Material geometry and interaction evidence take precedence where available. Fluent is the
  user-authorized fallback for gaps in intent, emphasis, surface-context and theme matrices.
- Default and dynamic publish Light/Dark. Dynamic currently reuses the same authored mapping;
  the name does not imply live operating-system color extraction. Fluent's Darker mode is not
  invented for Material merely to make theme counts identical.
- Existing Material Tabs and TextField are retained in addition to Fluent's component set.
- Global typography, Material Symbols, ripple, shadow and focus geometry stay Material-owned.
- No changes to Core schema, runtime, structural CSS or Showcase controls are needed.

## Component inventory

| Component | Recipe source and adaptation |
| --- | --- |
| Button | [Material states and Kiskadee intent/emphasis formula](button.md) |
| Card | [Material surface variants and Fluent context fallback](card.md) |
| Switch | [Material geometry and current palette migration](switch.md) |
| Slider | [Material slider reference and existing Kiskadee anatomy](slider.md) |
| Badge | [Material notification badge and Fluent composition coverage](badge.md) |
| Chip | [Material chip reference and Fluent interaction matrix](chip.md) |
| Progress | [Material progress reference and Fluent semantic coverage](progress.md) |
| BottomSheet | [Material sheet geometry and theme/context completion](bottom-sheet.md) |
| Dropdown | [Material menus and theme/context completion](dropdown.md) |
| Tabs | [Existing Material variants and surface-context corrections](tabs.md) |
| TextField | [Existing Material modes and palette hygiene](text-field.md) |
| Separator | [Material Divider and shared contour catalog](separator.md) |
| Icon / Text | Existing Kiskadee anatomy and foreground catalogs, described below |

## Text, Icon and shared paint

Sources: [Material color roles](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)
and [Material Symbols](https://developers.google.com/fonts/docs/material_symbols).
Material pairs container roles with contrasting content roles. Kiskadee adapts that behavior
through its existing onSubtle/onVivid contract, without adopting the entire Material color-role API.

The foreground catalog provides neutral and the six promoted chromatic families: blue, red,
green, purple, pink and yellow. Standard/deep are existing Kiskadee profile names reused from
Fluent. Pink represents the approved magenta asset; orange is not fabricated or promoted merely
to duplicate Fluent's family list.

Standard foregrounds use vivid references (six positions lighter for chromatic Dark content);
deep foregrounds use L65/D85. Low and lowest visibility are 68% and 38%; pending is 70% and disabled
38%. Vivid-surface foregrounds use the pure white cap. These coordinates and visibility levels are
**Kiskadee adaptations**, not exact Material token claims. Icon uses neutral/primary with matching
context behavior and the existing size catalog. Text and Icon remain passive components.

Focus uses the primary family in both themes. Ripple tone uses current neutral on subtle surfaces
and pure white on vivid surfaces. Separator paint is shared through the existing contour catalog.
All physical black/white/transparent values come from the canonical grayscale asset.

## Legacy cleanup

The literal purple Switch colors and old ripple ink bypassed the approved tonal palette. They are
replaced by family references/caps. The unused Material CorePalette generator, its private tests
and its sole library dependency are retired; the existing Kiskadee export is the only promotion
path. Compatibility aliases in Layer 2 remain where old consumers require them and do not add
another primitive family.

## Validation boundary

Focused preset tests cover palette propagation, state/context coverage and retained asset parity.
The standard build/sync/generate pipeline verifies published brand packs and consumer registries.
The user performs final visual homologation; successful schema/build checks do not claim pixel
fidelity with every Figma component or approval of every visual choice.

Verified on 2026-09-13:

- 60 focused Material tests and six palette-auditor regression cases passed, including
  asset/manifest parity, state/context behavior and filled-surface contrast.
- `node packages/web-builder/scripts/build-sync-generate.ts` completed and synchronized Showcase.
- Biome passed for the 34 changed/new TypeScript files. The eight generated assets were preserved
  verbatim instead of reformatted.
- The earlier whole-preset claim of zero ordinary duplicates was invalid: the auditor compared
  direct paint with scope-reference objects without unwrapping them. The corrected auditor and
  tests verify zero Slider Hover/Focus/Pressed duplicates. TextField inverse Focus resets are
  documented in its evidence and tested against an actual Hover delta. The unchanged onSubtle
  TextField recipes are not certified as sparse by this correction. Selected compound resets in
  Switch, Dropdown and Tabs retain their existing documentation.
- Package typechecking retains four pre-existing Fluent errors; Material files have no type errors.


## Shared purple segment — 2026-09-13

The user approved the purple/neutral candidate before promotion. All fourteen component factories
now materialize purple with the existing formulas. A recursive comparison found no changes to
previously present default/dynamic schema values. Layer 2 swaps primary and neutral aliases only.
The generated registry, manifest, Light/Dark class maps, tokens and brand packs include purple.
Core/Material focused tests pass; four unrelated existing Fluent type errors remain.
The generator editor was browser-tested for adding/naming entries, neutral opt-in, strategy,
URL reload and removal of associated entries. Material purple cards were rendered in Showcase.
