# Switch / Checkbox planning

Status: Phase 6 implemented. Switch is ready for review; Checkbox planning remains deferred.

Date: 2026-05-09.

## Objective

Define the initial Kiskadee direction for a binary on/off control, starting with `Switch`, while
keeping room for a future `Checkbox`.

The main goal is to avoid repeating the older `Button` shape if the newer `TextField` and `Tabs`
patterns give us a better long-term structure.

## Current context

- `Button` was the first component and still uses a direct `components.button.elements` topology.
- `Tabs` is variant-driven and stores visual values under `components.tabs.variants.<variant>`.
- `TextField` is the newer reference for a two-level visual model:
  `components.textField.variants.<variant>.modes.<mode>.elements`.
- The schema/build pipeline can already traverse direct elements, variant elements, and
  variant/mode elements.
- Runtime should compose generated classes from existing schema artifacts; it should not invent
  design-system colors at render time.
- The color/state model already supports a selected/control state with selected-specific
  interaction sub-states such as `selected.rest`, `selected.hover`, `selected.pressed`, and
  `selected.focus`.

## Open design questions

1. What should be the canonical schema element map for `Switch`, and how much of it should be
   shared conceptually with a future `Checkbox`?
2. Which switch-specific options belong in `components.switch.options` versus element tokens?
3. Should the first implementation start with a headless `Switch`, a shared headless checkable
   foundation, or both?

## Working recommendation

Prefer separate public components for `Switch` and `Checkbox`, but share lower-level helpers where
that removes real duplication.

Rationale:

- Semantically, a switch communicates an immediate on/off setting, while a checkbox communicates
  checked/unchecked selection and can later support an indeterminate state.
- A headless component with two substantially different public structures would be harder to reason
  about than two focused headless components backed by shared state utilities.
- Separate public components keep schema element names obvious and avoid variant branches with many
  unused or differently-meaningful slots.
- Shared naming conventions can still keep the two components coherent without forcing one schema
  topology.

Accepted direction:

- `Switch` and `Checkbox` are separate public components.
- The first implementation targets `Switch`.
- `Checkbox` can reuse future shared headless helpers, but it should not be modeled as a Switch
  variant.
- Every new component should have both `variant` and `mode`, even if the first release has only one
  variant and one mode.
- Use `standard` as the shared baseline variant name.
- Use `base` as the shared baseline mode name.
- React/headless state API should use `checked`, `defaultChecked`, and `onCheckedChange`, not `on`.

## Tentative Switch schema shape

Use a variant-driven topology for `Switch`, even if the first release has one variant and one mode.
This keeps the new component aligned with the newer `TextField` direction and gives us a clean
place to add future visual presentations without migrating artifacts.

Tentative topology:

- `components.switch.options.variant`: default public family.
- `components.switch.variants.<variant>.options.mode`: default presentation.
- `components.switch.variants.<variant>.modes.<mode>.elements`: tokenized visual slots.

Variant/mode naming decision:

- Use `standard` as the shared baseline variant name.
- Use `base` as the shared baseline mode name.
- Initial Switch path is `components.switch.variants.standard.modes.base.elements`.

Concern:

- `standard` already reads well for a traditional TextField variant.
- Reusing `standard` for both variant and mode would be noisy.
- `default` is convenient but can become ambiguous with the existing `default` palette segment.
- `classic` is descriptive for visual tradition, but less neutral as a design-system primitive.

Tentative elements:

- `e1`: root label/control wrapper.
- `e2`: native input or semantic control target.
- `e3`: track/surface.
- `e4`: thumb/handle.
- `e5`: optional label text.
- `e6`: optional supporting state text or icon layer.

This is intentionally conservative. We can start rendering only the required slots and leave
optional slots out of the first visual component if they are not needed.

## Tentative Switch options

Options should express component-specific behavior or structural defaults, not concrete theme
values.

Candidates:

- `mode`: named presentation inside the active variant, initially `base`.
- `labelPosition`: `start` or `end`, if the styled component owns label placement.
- `thumbMotion`: `slide` or `none`, if motion needs a DS default.
- `stateText`: whether the visual component reserves room for on/off text.
- `icon`: whether the visual component renders an icon layer.

Avoid making concrete colors, sizes, or radii options. Those belong in element `palettes`, `scales`,
and `effects`.

## Tentative color/state model

Use `selected` as the canonical checked/on control state.

Recommended default:

- Off state: normal `rest`, `hover`, `pressed`, `focus`, `disabled`.
- On state: nested `selected.rest`, `selected.hover`, `selected.pressed`, `selected.focus`.
- Disabled on/off nuance can initially come from disabled visuals plus selected activator behavior;
  if this is insufficient, introduce a deliberate schema extension instead of encoding a workaround.
- Do not use `pressed` or `active` as the persistent on state. Those are interaction states, not
  control states.

For two-color switches:

- Prefer one component intent such as `neutral` or `primary`, with off colors in base states and on
  colors in selected states.
- Allow presets to use green/red-like source colors when a design system intentionally wants
  positive/negative switch semantics.

## API notes

For React/headless naming, prefer `checked`, `defaultChecked`, and `onCheckedChange` for the
semantic state API.

Rationale:

- It matches native checkbox-like form controls.
- It maps cleanly to `input.checked` and `aria-checked`.
- It supports both `Switch` and future `Checkbox` without inventing a second state vocabulary.
- Visual language can still call the true state "on" and false state "off".

Avoid `on` as the primary prop name because it is easy to confuse with React event props and does
not map as directly to native form semantics.

## Shared headless helper

Consider a reusable hook in `packages/headless/react` for binary controlled/uncontrolled state.

Possible responsibilities:

- Resolve controlled versus uncontrolled checked state.
- Expose `checked`, `setChecked`, and `toggle`.
- Call `onCheckedChange(nextChecked)` after state transitions.
- Respect disabled/read-only guards when the owning component needs them.

This should be similar in spirit to `useStateProjection`: small, reusable, and not visually tied to
one component.

## Technical debt

### Internal hook ownership in headless components

Context:

- `HeadlessSwitch` currently calls `useCheckedState` and `useStateProjection` internally.
- The original architectural intuition was that hooks like `useStateProjection` and the new
  `useCheckedState` might be called outside the headless component, with the resulting state/props
  passed into the component.
- This would keep headless components closer to pure semantic composition and let styled/runtime
  layers own more of the state-to-class projection.

Current decision:

- Keep the Phase 1 implementation as-is for now.
- Do not refactor `HeadlessSwitch` before Phase 2.

Review later:

- Decide whether headless components should own state projection internally or receive projected
  slot props from the styled layer.
- Decide whether `useCheckedState` should remain inside `HeadlessSwitch` or become a hook primarily
  used by composed/styled components.
- Revisit this before locking the styled `Switch` API in Phase 5, because that layer will depend on
  the final ownership boundary.

## Phased implementation plan

Keep each phase shippable and reviewable. Do not add unit tests unless explicitly requested.

### Phase 1 — Headless foundation

Goal: define behavior and accessibility before visual schema complexity.

Status: completed on 2026-05-08.

- Add `useCheckedState` as a small reusable hook for controlled/uncontrolled binary state.
- Add `HeadlessSwitch` in `packages/headless/react`.
- Use `checked`, `defaultChecked`, and `onCheckedChange`.
- Preserve keyboard, label, disabled, required, name, value, and form behavior.
- Keep visual slots minimal but compatible with future styled `Switch`.

Implemented files:

- `packages/headless/react/src/checked-state/useCheckedState.ts`
- `packages/headless/react/src/switch/HeadlessSwitch.tsx`
- `packages/headless/react/src/index.ts`
- `packages/headless/react/package.json`

Validation:

- `pnpm exec biome check --write packages/headless/react/src/checked-state/useCheckedState.ts packages/headless/react/src/switch/HeadlessSwitch.tsx packages/headless/react/src/index.ts packages/headless/react/package.json`
- `pnpm --filter @kiskadee/react-headless build`

Decision checkpoint:

- Headless implementation renders a native `input type="checkbox"` with `role="switch"`.
- Root renders a `label` associated to the generated or provided `inputId`.
- Current headless slots are `e1` root label, `e2` input, `e3` track, `e4` thumb, `e5` text label,
  and `e6` optional visual state/icon layer.
- Final slot names/classes should still be reviewed before Phase 5 locks the styled component.

### Phase 2 — Core schema contract

Goal: make `Switch` a first-class schema component with the new standard/base topology.

Status: completed on 2026-05-08.

- Add `switch` to core component names and schema maps.
- Add `switch.ts`, `switch.options.zod.ts`, `switch.elements.zod.ts`,
  `switch.contract.zod.ts`, and `switch.zod.ts`.
- Require `components.switch.variants.standard.modes.base.elements`.
- Reject top-level `components.switch.elements`.
- Model initial element contracts for root, input/control, track, thumb, optional label, and optional
  state/icon layer.

Implemented files:

- `packages/core/src/components/switch.ts`
- `packages/core/src/components/switch.options.zod.ts`
- `packages/core/src/components/switch.elements.zod.ts`
- `packages/core/src/components/switch.contract.zod.ts`
- `packages/core/src/components/switch.zod.ts`
- `packages/core/src/schema.ts`
- `packages/core/src/index.ts`
- `packages/core/src/utils/validateComponentContracts.ts`

Validation:

- `pnpm exec biome check --write packages/core/src/components/switch.ts packages/core/src/components/switch.options.zod.ts packages/core/src/components/switch.elements.zod.ts packages/core/src/components/switch.contract.zod.ts packages/core/src/components/switch.zod.ts packages/core/src/schema.ts packages/core/src/index.ts packages/core/src/utils/validateComponentContracts.ts`
- `pnpm exec tsc -p packages/core/tsconfig.build.json --noEmit`
- `node -e "import('./packages/core/src/components/switch.zod.ts').then(({validateSwitchComponentContract})=>{const valid={variants:{standard:{modes:{base:{elements:{}}}}}}; const invalid={elements:{}}; console.log('valid', JSON.stringify(validateSwitchComponentContract(valid))); console.log('invalid', JSON.stringify(validateSwitchComponentContract(invalid)));})"`

Decision checkpoint:

- `e2` represents the native input / semantic control target and intentionally allows only `name`
  and `effects` for now.
- `e5` and `e6` are included in the contract as optional V1 slots, so presets/components can omit
  them until needed.
- The contract rejects top-level `components.switch.elements` and requires
  `components.switch.variants.standard.modes.base.elements`.

### Phase 3 — Preset schema

Goal: provide one minimal Material-compatible visual identity for the generated artifacts.

Status: completed on 2026-05-08.

- Add Material 3 Google `switch` schema under `standard.base`.
- Encode off colors in base interaction states.
- Encode on colors in selected interaction states.
- Use schema scales for track/thumb dimensions and radius.
- Avoid hardcoded semantic decisions in runtime.

Implemented files:

- `packages/presets/src/presets/material-3-google/components/switch.schema.ts`
- `packages/presets/src/presets/material-3-google/material-3-google.colors.ts`
- `packages/presets/src/presets/material-3-google/material-3-google.schema.ts`

Validation:

- `pnpm exec biome check --write packages/presets/src/presets/material-3-google/components/switch.schema.ts packages/presets/src/presets/material-3-google/material-3-google.colors.ts packages/presets/src/presets/material-3-google/material-3-google.schema.ts`
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`
- `node -e "import('./packages/presets/src/presets/material-3-google/material-3-google.schema.ts').then(async ({schema})=>{const {validateSchemaComponentContracts}=await import('./packages/core/src/utils/validateComponentContracts.ts'); validateSchemaComponentContracts(schema); console.log(JSON.stringify(Object.keys(schema.components))); console.log(schema.components.switch.variants.standard.options.mode);})"`

Decision checkpoint:

- Baseline intent/emphasis is `neutral.medium`.
- Material `switch.neutral` maps to the global `primary` semantic for selected/on color, while off
  colors stay authored as base neutral states.
- Track and thumb use base states for unchecked/off and selected states for checked/on.
- Label text is neutral and currently only reacts to disabled state.

### Phase 4 — Build/artifact integration

Goal: make generated CSS and class maps understand `switch`.

Status: completed on 2026-05-08.

- Add `switch` to core/web-builder component type paths.
- Ensure variant/mode traversal produces `classesMap.switch.standard.base`.
- Update validation wiring for the new contract.
- Build the web-builder artifacts once schema exists.

Implemented files:

- `packages/web-builder/src/phase-7-publish-metadata/manifestTypes.ts`
- `packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts`
- `packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`

Validation:

- `pnpm exec biome check --write packages/web-builder/src/phase-7-publish-metadata/manifestTypes.ts packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`
- `pnpm --filter @kiskadee/web-builder build`
- `node -e "const fs=require('fs'); const p='packages/web-builder/build/material-design-3-google'; const core=JSON.parse(fs.readFileSync(p+'/core.kiskadee.json','utf8')); const palette=JSON.parse(fs.readFileSync(p+'/default.light.kiskadee.json','utf8')); const manifest=JSON.parse(fs.readFileSync(p+'/manifest.json','utf8')); const global=JSON.parse(fs.readFileSync(p+'/global.kiskadee.json','utf8')); console.log(JSON.stringify({ coreSwitch: core.switch, paletteSwitch: palette.switch, manifestSwitch: manifest.components.switch, globalSwitch: global.components.switch }, null, 2));"`

Validation note:

- `pnpm exec tsc -p packages/web-builder/tsconfig.json --noEmit` currently fails on pre-existing
  decoration transformer type errors:
  `transformBorderStyleKeyToCss.ts`, `transformTextAlignKeyToCss.ts`,
  `transformTextLineTypeKeyToCss.ts`, and `transformTextWeightKeyToCss.ts` use CSS enum values as
  types.

Decision checkpoint:

- Confirmed generated `core.kiskadee.json` has `switch.standard.base` with `e3`, `e4`, and `e5`.
- Confirmed generated `default.light.kiskadee.json` has palette classes under
  `switch.standard.base`.
- Confirmed manifest metadata includes `components.switch.scale` and
  `components.switch.state.neutral.medium.selected`.
- Confirmed global metadata includes `components.switch.options.variant = "standard"` and
  `components.switch.variants.standard.options.mode = "base"`.
- Confirmed selected-state CSS is emitted through the existing activator model, including forced
  selectors such as `.-a.-s` / `.-s.-h.-a` for showcase inspection.

### Phase 5 — Styled React Switch

Goal: compose generated classes, structural CSS, and headless behavior.

Status: completed on 2026-05-09.

- Add `packages/components/react/src/Switch`.
- Resolve classes by `variant=standard`, `mode=base`, `scale`, `intent`, `emphasis`, and `checked`.
- Add structural Sass for track/thumb layout and motion only.
- Use generated classes for colors, sizes, radius, decorations, and effects.
- Export `Switch` from the React components package.

Implemented files:

- `packages/components/react/src/Switch/Switch.class-names.ts`
- `packages/components/react/src/Switch/Switch.structural.scss`
- `packages/components/react/src/Switch/Switch.tsx`
- `packages/components/react/src/Switch/Switch.types.ts`
- `packages/components/react/src/Switch/index.ts`
- `packages/components/react/src/index.ts`

Validation:

- `pnpm exec biome check --write packages/components/react/src/Switch/Switch.class-names.ts packages/components/react/src/Switch/Switch.tsx packages/components/react/src/Switch/Switch.types.ts packages/components/react/src/Switch/index.ts packages/components/react/src/index.ts`
- `pnpm --filter @kiskadee/react-components build`

Decision checkpoint:

- Public styled props expose `checked`, `defaultChecked`, `onCheckedChange`, root `className`,
  per-slot `classNames`, `inputProps`, `label`, `state`, `scale`, `intent`, `emphasis`, `radius`,
  `variant`, `mode`, and `labelPosition`.
- The root `className` is merged into `e1` so it cannot replace generated structural/schema classes
  through the headless layer.
- Structural runtime variables for thumb translation are owned by the root scope and consumed
  without local `var()` fallbacks.
- Structural element mapping stays on `e1` root, `e2` native input, `e3` track, `e4` thumb, `e5`
  optional label, and `e6` optional state/icon layer.

### Phase 6 — Showcase and validation

Goal: inspect the full flow without expanding scope prematurely.

Status: completed on 2026-05-09.

- Add a Switch showcase route or section.
- Cover unchecked, checked, disabled, checked-disabled, hover/focus-visible inspection, and custom
  label scenarios.
- Run narrow builds: headless package, React components build, web-builder build, and showcase build
  when needed.
- Record any unresolved visual/schema issues in this handoff.

Implemented files:

- `packages/showcase/app/switch/page.tsx`
- `packages/showcase/app/switch/SwitchPage.tsx`
- `packages/showcase/app/switch/Switch.module.scss`
- `packages/showcase/app/page.tsx`
- `packages/showcase/components/ShowcaseSidebar/ShowcaseSidebar.tsx`
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- `packages/presets/src/presets/material-3-google/components/switch.schema.ts`

Validation:

- `pnpm exec biome check --write packages/presets/src/presets/material-3-google/components/switch.schema.ts packages/showcase/app/switch/page.tsx packages/showcase/app/switch/SwitchPage.tsx packages/showcase/app/switch/Switch.module.scss packages/showcase/components/ShowcaseSidebar/ShowcaseSidebar.tsx packages/showcase/app/page.tsx`
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`
- `pnpm --filter @kiskadee/showcase build:artifacts`
- `pnpm --filter @kiskadee/showcase build`
- Browser inspection at `http://localhost:3000/switch` using `material-design-3-google/default/light`.

Decision checkpoint:

- Showcase route covers interactive, unchecked, checked, hover, focus, checked-hover,
  checked-focus, disabled, checked-disabled, label-start, custom-label, and no-visible-label
  scenarios.
- Manifest metadata now exposes `switch` capabilities for `material-design-3-google` and
  `material-design-3-kiskadee`; systems without switch schema render an unavailable state instead
  of an unstyled control.
- Visual inspection found the Material switch label light-theme color was too light; the preset now
  uses `neutral 90` for light label text and disabled label text.
- Checkbox planning should start after this Switch review, not before.

## Condensed implementation outline

Suggested order once the direction is approved:

1. Build `useCheckedState` and `HeadlessSwitch`.
2. Add core switch types and strict zod contract.
3. Add Material preset switch schema with minimal `standard.base` elements.
4. Add web-builder/component class-map typing support for `switch`.
5. Add styled React `Switch` in `packages/components/react`.
6. Add showcase route/scenarios after artifacts build.

No unit tests should be added unless explicitly requested.

## Post-phase Fluent 2 Microsoft visual pass

Status: implemented on 2026-05-09.

Goal:

- Make the `fluent-2-microsoft` preset render a Switch closer to the Fluent 2 Web reference without
  adding new Switch API or label-placement features.

Implemented files:

- `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`
- `packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.colors.ts`
- `packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts`
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts`
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`

Decision checkpoint:

- `fluent-2-microsoft` now exposes `components.switch.variants.standard.modes.base.elements`.
- Default Switch geometry follows Fluent Web proportions: `s:md:1` track `40x20`, thumb `18x18`,
  and `s:sm:1` track `32x16`, thumb `14x14`.
- The Fluent Switch `neutral` intent resolves selected/on color through the existing Fluent primary
  blue palette.
- Off/unchecked, checked, hover, pressed, focus, disabled, and checked-disabled states are authored
  in the preset using the existing Switch state model.
- Web palette CSS now emits disabled rules after equal-specificity selected/interaction rules so a
  disabled checked switch can render disabled colors instead of being visually overridden by
  selected colors.

Validation:

- `pnpm exec biome check --write packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.colors.ts packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`
- `pnpm exec biome check --write packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.colors.ts packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`
- `pnpm --filter @kiskadee/web-builder run build`
- `pnpm --filter @kiskadee/web-builder run sync`
- `pnpm --filter @kiskadee/web-builder run generate`
- `pnpm --filter @kiskadee/showcase build`
- Browser inspection at `http://localhost:3000/switch` using `fluent-2-microsoft/default/light`.

Reference note:

- The linked Figma page could not be fully inspected through MCP because of the Figma Starter plan
  call limit, so the final visual pass used the provided screenshot plus the public Fluent React
  Switch implementation for geometry/state cues.
