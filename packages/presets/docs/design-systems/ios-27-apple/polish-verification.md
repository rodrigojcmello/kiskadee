# iOS 27 Preset Polish Verification

Verified on 2026-09-07 against the working tree based on
`b66cbfe80b350ca447fd0167c2e7fdeed340a5d2`.

## Scope And Coverage

Fluent 2 Microsoft supplies the existing-component baseline; the linked iOS 27 Figma file and
Apple documentation supply appearance evidence. Material is a later task. Changes configure
existing preset capabilities; no Core, Builder, Headless or component runtime implementation
was changed. The existing Showcase iOS typography-profile selection was updated to consume the
new shared profiles, and normal generation refreshed its registries.

The generated iOS registry publishes 11 components. All declare Light, Dark and Darker and both
`onSubtle`/`onVivid` contexts. This metadata does not by itself prove runtime consumption; the
Slider limitation below was reproduced in the browser and traced separately.

| Component | Delivered definition | Evidence |
| --- | --- | --- |
| Card | Opaque source-backed nesting, elevated Dark/base Darker, canonical canvases, explicit descendant contexts | [Card](components/card.md) |
| Text | Eighteen normalized profiles covering eleven default Apple text roles and explicit reusable adaptations; neutral/chromatic foregrounds | [Text](components/text.md) |
| Icon | Existing size catalog, neutral/primary paints, all themes/contexts, existing SF Symbols recommendation and explicit Web fallback | [Icon](components/icon.md) |
| Separator | Shared contour references and line geometry | [Separator](components/separator.md) |
| Button | Conventional Apple styles, complete themes/contexts, sparse states and terminal Disabled resets | [Button](components/button.md) |
| Switch | iOS 27 Idle 64x28 track and 38x24 thumb, source paints, existing scale/intent adaptations | [Switch](components/switch.md) |
| Slider | iOS 27 Idle 6px rail and 38x24 thumb, source fills, both contextual palettes | [Slider](components/slider.md) |
| Badge | Passive indicator with attention source role and documented semantic/size/emphasis extensions | [Badge](components/badge.md) |
| Progress | Conventional linear track/fill, semantic extensions and existing indeterminate presentation | [Progress](components/progress.md) |
| Dropdown | Source geometry/typography, section hierarchy and checkmark selection; opaque surface adaptation | [Dropdown](components/dropdown.md) |
| BottomSheet | Source action geometry/typography and existing page-navigation composition; opaque surface adaptation | [BottomSheet](components/bottom-sheet.md) |

Fluent currently publishes the same set plus Chip. A standalone Apple Action/Toggle Chip
equivalent was not established; search-field tokens have a different contract. Tabs and
TextField are not published by either preset. These are coverage decisions, not missing runtime
features introduced by this work. See [Chip boundary](components/chip.md).

## Tonal And Foundation Decisions

- Approved `@kiskadee/tonal-scale@0.7.0` format V5 assets and all source-color evidence remain
  unchanged. The generated bundle's original `review` diagnostic remains intact.
- Authored schemas contain no literal HEX colors. Source-backed tone indexes, functional
  references, family-relative offsets and alpha adaptations consume the existing assets.
- Source default Dynamic Type metrics include tracking; Callout 16/21/-0.31 maps to the existing
  normalized `subtitle-small` profile. No new typography bucket was added.
- Shared foregrounds, contours and separators follow existing contracts. Card publishes content
  context independently from its own paint. Strong canvas offsets are explicit extensions.
- Darker uses Apple's Dark Base gray stack. Its canonical catalog omits Neutral Medium so the
  existing Showcase preference chooses the black Neutral Low canvas; the Medium palette remains
  available for explicit composition.
- Liquid Glass, scene-relative materials, pressed glass deformation, exact disabled group
  compositing and an Apple circular progress spinner remain deferred. Their absence is explicit
  in component evidence; no opaque effect claims to implement them.

## Automated And Static Validation

Node 24.16.0 was used. The repository's PNPM dependencies were restored with pinned PNPM 10.32.1
and the existing frozen lockfile; no dependency or lockfile change is part of this work.

```sh
node node_modules/vitest/vitest.mjs run \
  packages/presets/src/presets/ios-27-apple \
  packages/presets/src/typography.schema.test.ts \
  packages/presets/src/icon-sizes.schema.test.ts \
  packages/presets/src/dropdown.schema.test.ts

node node_modules/vitest/vitest.mjs run \
  packages/presets/src/separator.schema.test.ts -t 'iOS|three theme|references'
```

- 83 tests passed across eight files in the first command.
- Five relevant Separator tests passed; five unrelated tests were skipped in the focused run.
- Scoped strict TypeScript checking passed for the root iOS schema and the four new regression
  suites using `--noEmit --module nodenext --target esnext --allowImportingTsExtensions
  --skipLibCheck --strict`.
- `node ./scripts/build-sync-generate.ts`, run from `packages/web-builder`, completed generation
  and Showcase synchronization successfully using the existing pipeline.
- Biome checked the changed preset TypeScript, related shared tests and Showcase profile mapping.
- Final diff whitespace and local documentation links were checked. Generated registries list the
  intended components; no tonal assets or unrelated preset sources changed.

The initial broader Separator run exposed four existing Fluent expectations that compare literal
colors with current contour references. The implementation at HEAD already emits those references.
Those unrelated tests were left unchanged. The initially stale iOS Dropdown checkmark expectation
was updated from 10px to the source-derived 8px spacing.

Regression tests cover resolved contracts, source geometry and paint, intent-family remapping,
canonical neutral-text contrast, Card selected-content transitions, onVivid Button readability,
Badge medium/low contrast, Switch thumb/rail separation and Disabled precedence. Contrast tests
apply to their stated combinations; source Accent colors and all low-emphasis text are not
claimed to meet a universal text-contrast target.

The interaction-state audit ran Focus/Hover/Pressed/Disabled over Button, Switch, Slider, Card,
Dropdown, BottomSheet, Badge and Progress. No Focus/Hover/Pressed values equal Rest. The remaining
Rest-equal Disabled entries are intentional resets: 36 in Button after the borderless revision, six in Dropdown and six in
BottomSheet. Their selected-state precedence is documented per component. The optional Brand
onVivid helper has an equivalent Lowest reset, verified by a direct helper regression test.

## Initial Polish Rendered Verification

Actual Showcase routes were opened in the Codex browser at `http://localhost:3000`, with a
1280x720 desktop viewport. Screenshots were inspected during the session. This is representative
rendered coverage, not an assertion that every size/state/theme combination received a screenshot
or that mobile/native rendering was tested.

Fluent baseline inspection covered Card (Light/Dark/Darker), Button, Switch, Slider, Badge,
Progress, open Dropdown and open BottomSheet. Its existing polish informed coverage and
composition; its component recipes were not treated as Apple visual authority.

| iOS route | Rendered checks and outcome |
| --- | --- |
| `/card` | Light, Dark and black-base Darker; nested subtle/vivid compositions; selected CardAction changed surface and kept its content readable. |
| `/button` | Light and Darker; simultaneous subtle/vivid comparisons; expanded state matrix, source size geometry and outlined/filled appearances. |
| `/switch` | Light subtle/vivid and Dark vivid; interactive toggle; computed 64x28 track, 38x24 thumb and white vivid-context label confirmed. |
| `/slider` | Dark subtle and Light vivid; ArrowRight changed value 55 to 60. Source-shaped default example rendered, but the page radius selector and runtime context limitations below prevent full fidelity. |
| `/badge` | Light subtle and Darker vivid; passive metadata and composition with filled/outlined Buttons inspected. |
| `/progress` | Darker subtle determinate and vivid indeterminate; internal labels, neutral/semantic fills and ongoing-work state rendered. Page header limitation below remains. |
| `/dropdown` | Light sectioned menu, icon/shortcut/destructive row; Dark vivid parent with independent opaque menu surface and disabled item inspected. |
| `/bottom-sheet` | Light open root, Share page and Back; Darker vivid parent with readable opaque sheet, action pills and scrim. |
| `/typography` | Light/Dark neutral hierarchy, simultaneous contexts, chromatic examples and emitted shared profile metrics including Callout. |
| `/icons` | Light size/intent matrix and gallery; Darker vivid gallery correctly used light icons. Fixed matrix background limitation below remains. |
| `/separator` | Darker subtle and Light vivid; horizontal, vertical and nested layout lines remained subordinate to content. |

## Preexisting Limits Outside Preset Configuration

### Slider context consumption

`packages/components/react/src/components/Slider/Slider.tsx` calls its class resolver without
Surface Context. `Slider.class-names.ts` does not accept/repass it; the shared resolver therefore
defaults to `onSubtle`. The generated iOS `c.v` palette exists, but the runtime chooses `c.s`.
This was reproduced by the black label/blue fill on a vivid canvas and by direct resolver output.
Consequently, the iOS Slider onVivid definition is validated at schema/artifact level but its
runtime presentation remains limited. Changing its source colors would conceal the ownership
problem and damage the valid subtle appearance.

### Slider radius control

`packages/showcase/app/slider/SliderPage.tsx` reads `sliderMeta.scale` and tests that map using
`rounded/pill/square`. Its keys are size IDs (`s:sm:1`, `s:md:1`), so every radius option becomes
disabled and the effect selects Square. The basic example, which uses the component default,
shows the authored rounded thumb. Repair requires a consumer change outside the preset.

### Local Showcase presentation

`Slider.module.scss` and `Progress.module.scss` use fixed black alpha for summaries, while their
plain HTML page headings bypass the preset's adaptive foreground. Dark/Darker or vivid canvases
therefore expose unreadable page headings despite correctly styled component content (apart
from the separate Slider context issue). Some supporting captions in Typography also retain local
presentation rather than the shared Text profiles.

`packages/showcase/app/icons/Icons.module.scss` keeps matrix cells at white 88%; the dark-surface
rule leaves their background override empty. On a vivid/dark surface the correctly light Icon
paint becomes difficult to see in that fixed light matrix. Gallery Cards demonstrate the
matching inherited foreground and background.

These runtime/Showcase files are unchanged from HEAD. They are recorded as observable limitations,
not silently worked around in the iOS schema. The preset polish is complete within the requested
configuration boundary; complete visual parity of these consumer scenarios needs a separate
runtime/Showcase change.

## Borderless Button Revision (2026-09-07)

The user approved Medium as the soft intent-family fill and Low as the former neutral
Medium fill without an outline. High and Lowest retain their previous roles. This applies
to all four intents, Light/Dark/Darker, both surface contexts and optional Brand packs.
On vivid surfaces, Low retains the former Medium neutral overlay; its composited appearance
therefore follows the surrounding surface. See [Button](components/button.md) for the formulas.

Validation: 14 focused Button/control tests passed, strict TypeScript checking passed, and
the full preset generation and Showcase sync completed on Node 24. The Brand foreground
uses the existing family L85 tone to support families whose vivid anchor is near the end
of the tonal grid. No tonal assets or Builder/runtime behavior changed.

The updated /button comparison was inspected in Light, Dark and Darker. Computed styles
confirmed transparent borders and intent-specific Medium fills for all four intents,
including the onVivid matrix. The Disabled audit reports 36 intentional Rest-equal resets:
onSubtle Low/Lowest and onVivid Lowest across intents and themes.

## Brand Pack Darker Publication Fix (2026-09-07)

The optional auth/social extension now explicitly declares and projects `default.darker`,
reusing Dark for the container, text and icon. A regression test builds both real packs in
a temporary directory and checks the theme keys, Darker CSS and class-map hashes, and
complete intent/emphasis matrices in both surface contexts. It failed before the fix and
passed afterward. All 22 focused Button/control and Brand Pack artifact tests passed;
strict preset TypeScript checking and full generation/Showcase sync also passed.
The regenerated manifests contain Darker for both packs. Browser confirmation of the
Brand Buttons page was unavailable because navigation and subsequent browser inspection
timed out; no rendered Brand Pack validation is claimed for this fix.
