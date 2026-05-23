# Fluent Switch polish

Status: in progress.

Date: 2026-05-09.

## Objective

Polish the `Switch` implementation for the `fluent-2-microsoft` preset, keeping the schema readable
and focused while matching the Fluent 2 visual reference more closely.

The current pass is intentionally item-by-item. Use this file to track decisions, progress, and
validation while the component is being tuned.

## Current context

- The Fluent Switch schema lives in
  `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`.
- The preset entrypoint is
  `packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts`.
- The Switch uses `standard.base.neutral.medium` as the current minimal shape.
- The small Switch size was removed from the Fluent preset to reduce visual-tuning noise.
- `switch.standard.e2` now uses compensated padding emission in web-builder:
  - `borderWidthEmission: 'mirrored'`;
  - `paddingEmission: 'compensated'`.
- The radius model does not add a public `global` value. Missing `radius` means "use the resolved
  default", and the resolved default is `component radius > global radius > runtime fallback`.
- `fluent-2-microsoft` keeps `global.radius = 'rounded'`, but declares
  `components.switch.options.radius = 'pill'` so Switch follows the official Fluent pill shape by
  default.
- The showcase registry was regenerated after removing the small Switch size.
- Latest element-map decision: keep the current `e1` as the headless/structural root because it
  owns label/control semantics, root `className`, and state projection. Its schema contract should
  remain non-visual and name-only; no generated scales, palettes, effects, padding, or margin should
  be attached to this layer.
- The old `e2` native input is now treated as an internal semantic control target.
  `HeadlessSwitch.Root` renders it internally and receives customization through `inputProps` and
  `inputRef`.
- The public Switch element map has been cleaned up: the hidden native input is not part of the
  public `e<n>` map, track is `e2`, thumb is `e3`, label is `e4`, and state/icon is `e5`.
- The native input hiding rule has been copied into
  `packages/headless/react/src/switch/HeadlessSwitch.structural.scss` as internal `x1`
  (`k-swt-x1`). `react-headless` now builds Sass like `react-components`, and
  `HeadlessSwitch.tsx` imports the generated structural CSS.
- Root spacing decision: do not use root padding or margin to create external visual spacing around
  the component. Spacing around a component belongs to the parent layout/composition unless it is
  intrinsic to a real visual or interactive surface.
- Schema element readability decision: every declared schema element now requires a human-readable
  `name` as the first property in the element object. The `e<n>` key remains the stable technical
  artifact/runtime identity; `name` is the validated human label.
- Fluent Switch color-variable experiment: keep universal color names as `white`, `transparent`,
  and `black`, but still resolve them from official scales whenever possible. Other extracted token
  colors should use the token name plus tone, such as `redLike50` or `destructive50`.
- Component intent vs control state decision: Switch on/off colors are control-state colors inside
  one public `neutral.medium` presentation. Do not add a `primary` Switch intent only because the
  selected/on state uses global `primary`; use Layer 2 `primary` directly for activation until a
  true public Switch intent exists. Fluent Switch now maps `switch.neutral` to the global neutral
  scale, uses Layer 3 `switch.neutral` for neutral/off/disabled colors, and uses Layer 2 `primary`
  directly for selected/on activation.

## Pending checklist

- [x] Define the Switch radius policy.
  Decision: keep `RadiusMode` as `rounded | pill | square`; do not add a public `global` value.
  Fluent Switch declares `components.switch.options.radius = 'pill'`, so its default matches the
  official pill shape while the preset global radius can remain `rounded`.

- [x] Redefine the `e1` model.
  Decision: keep `e1` as the current headless/structural root, but make the schema contract
  name-only. `e1` remains the state scope owner and root class target, while visual styling belongs
  to `e2`, `e3`, `e4`, and `e5`.

- [x] Finish the old `e2` cleanup.
  Decision: the native input is internal to `HeadlessSwitch.Root` and is not a public headless
  compound part or visual schema surface. The public Switch element map is now `e1` root,
  `e2` track, `e3` thumb, `e4` label, and `e5` state/icon.

- [x] Add `name` fields to Switch elements.
  Decision: `name` is mandatory for declared schema elements. Fluent Switch now declares
  `e2 = track`, `e3 = thumb`, and `e4 = label`; `e5` remains `state` when that element is declared.
  The rule was promoted to the core element contracts and documented in the schema rules.

- [x] Investigate `white = [0, 0, 100, 1]`.
  Decision: `white` may remain a named variable because white is not intent-specific, but its value
  should still come from the official Fluent neutral scale. Fluent Switch now resolves `white` as
  `c('default', 'l', 'switch.neutral', 0)` and resolves transparent as
  `withAlpha(c('default', 'l', 'switch.neutral', 100), 0)`.

- [ ] Investigate `#616161` on the thumb.
  Check whether it maps to an existing Fluent neutral token. Prefer `c('default', 'l', ...)` when a
  palette match exists.

- [ ] Investigate all raw hex colors in the Fluent Switch.
  Current raw values include `#616161`, `#575757`, `#424242`, `#D1D1D1`, and `#242424`.

- [ ] Validate whether track `paddingTop` and `paddingBottom` are needed.
  The track already centers the thumb with structural flex alignment, but vertical padding may still
  affect the internal geometry together with border compensation.

- [ ] Confirm final thumb geometry.
  Current visual tuning changed the thumb to `14x14` and track horizontal padding to `3px`; verify
  unchecked/checked alignment against the reference after compensated border emission.

- [ ] Revalidate compensated padding emission visually.
  Confirm that `switch.standard.e2` now behaves like Button-style padding, where the schema padding
  represents the visual total and border width is subtracted by generated CSS.

- [ ] Confirm the single-size scope.
  The Fluent Switch currently keeps only `s:md:1`; decide whether this remains the right scope for
  the polishing pass.

- [ ] Review `switchDataAttributeProjections` in `HeadlessSwitch.tsx`.
  The current implementation still projects state through raw attributes. Check whether this should
  use the `stateActivator` pattern instead, so Switch follows the same state-projection model as the
  rest of the headless/styled component pipeline.

## Validation log

- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`: passed after adding
  `switch.options.radius`.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after setting Fluent Switch
  default radius to `pill`.
- `pnpm --filter @kiskadee/web-builder run build`: passed after adding compensated Switch padding
  emission and again after exporting Switch default radius metadata.
- `pnpm --filter @kiskadee/web-builder run sync`: passed after artifact regeneration.
- `pnpm --filter @kiskadee/web-builder run generate`: passed after showcase registry generation.
- `pnpm --filter @kiskadee/showcase build`: passed after regenerated artifacts.
- `git diff --check`: passed after the current text/code edits.
- `docs/definitions/new-component-starting-definition.md` updated with the rule that schema elements
  should not be merely decorative/structural and that component root spacing should not encode
  parent-layout spacing.
- `packages/core/src/components/switch.elements.zod.ts` updated so Switch `e1` accepts only `name`.
- `packages/headless/react/src/switch/HeadlessSwitch.tsx` updated so `Switch.Root` renders the
  native input internally and accepts `inputProps` / `inputRef`.
- `packages/components/react/src/Switch/Switch.tsx` updated to stop rendering
  `HeadlessSwitch.Input` directly.
- `packages/core/src/components/switch.elements.zod.ts` no longer exposes the old hidden native input
  as public `e2`; the visual track now owns `e2`.
- `packages/headless/react/src/switch/HeadlessSwitch.structural.scss` added with the internal native
  input hiding rule under `k-swt-x1`.
- `packages/headless/react/scripts/build-styles.ts` added, and `packages/headless/react/scripts/build.ts`
  now builds styles alongside JavaScript and declarations.
- `packages/headless/react/package.json` updated with `build:styles`, CSS side effects, and the Sass
  build dependencies used by the new style build path.
- `packages/components/react/src/Switch/Switch.structural.scss` no longer owns the hidden native
  input rule; that rule moved to the headless Switch structural CSS.
- `docs/technical-debt/shared-react-package-build-scripts.md` added to track the duplication between
  `components/react` and `headless/react` JS/CSS build scripts.
- Switch public element map renumbered after internalizing the native input: `e2` is now track,
  `e3` thumb, `e4` label, and `e5` state/icon across core, headless, React class names, structural
  CSS, web-builder policy, and presets.
- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`: passed after narrowing Switch `e1` to
  name-only.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after narrowing Switch `e1` to
  name-only.
- `pnpm exec tsc -p packages/headless/react/tsconfig.json --noEmit`: passed after moving the native
  input into `HeadlessSwitch.Root`.
- `pnpm --filter @kiskadee/react-components run build`: passed after the headless/styled Switch
  refactor.
- `pnpm --filter @kiskadee/web-builder run build`: passed after narrowing Switch `e2` to name-only.
- `pnpm --filter @kiskadee/showcase build`: passed after the headless/styled Switch refactor and
  artifact generation.
- `packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.colors.ts` now maps
  `switch.neutral` to global `neutral`.
- `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts` now uses Layer 3
  `switch.neutral` for neutral/off/disabled colors and Layer 2 `primary` for selected/on activation.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after applying the Switch
  Layer 2/3 color pattern.
- `pnpm exec biome check packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.colors.ts packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts`:
  passed after applying the Switch Layer 2/3 color pattern.
- `pnpm --filter @kiskadee/web-builder run build`: passed after applying the Switch Layer 2/3 color
  pattern.
- `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts` updated so `white`
  resolves from `switch.neutral` tone `0` instead of a local literal.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after resolving `white` from
  `switch.neutral` tone `0`.
- `pnpm exec biome check packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`:
  passed after resolving `white` from `switch.neutral` tone `0`.
- `git diff --check`: passed after resolving `white` from `switch.neutral` tone `0`.
- `pnpm install --ignore-scripts`: passed after adding the headless Sass build dependencies.
- `pnpm --filter @kiskadee/react-headless run build`: passed and emitted
  `dist/switch/HeadlessSwitch.structural.css`.
- `pnpm --filter @kiskadee/react-components run build`: passed after moving the hidden native input
  CSS rule to `react-headless`.
- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`: passed after the headless Sass build
  wiring.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after the headless Sass build
  wiring.
- `pnpm --filter @kiskadee/showcase build`: passed after the headless Sass build wiring.
- `packages/core/src/schema.ts`, button validation, and element Zod schemas now require `name` on
  declared schema elements.
- Existing preset schemas were updated so declared elements put `name` first.
- `SCHEMA-BUILD-RUNTIME-RULES.md` documents the mandatory element `name` rule.
- `docs/definitions/new-component-starting-definition.md` now includes the required schema `name`
  in the element-map authoring checklist.
- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit`: passed after making element `name`
  mandatory.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after adding preset element
  names.
- `pnpm --filter @kiskadee/web-builder run build`: passed after the schema readability change.
- `pnpm exec biome check ...`: passed for touched TypeScript schema/contract files after formatting.
- `git diff --check`: passed after the schema/docs edits.
- Fluent Switch no longer receives local `white` / `transparent` literals from the preset entrypoint.
  `white` is a named local literal in
  `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`, and transparent is
  resolved from the Fluent neutral scale with `withAlpha`.
- `rg -n "white|transparent|\\[0, 0, 100, 1\\]|\\[0, 0, 0, 0\\]|#FFF|#0000"
  packages/presets/src/presets/fluent-2-microsoft`: only schema transparent usage and color-scale
  definitions remain.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after moving transparent to the
  neutral scale and keeping white as a local named literal.
- `pnpm exec biome check packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts
  packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`: passed.
- `pnpm --filter @kiskadee/web-builder run build`: passed after the white/transparent cleanup.
- `git diff --check`: passed after the white/transparent cleanup.
- Fluent Switch now applies the layer 2/3 color pattern: `componentIntents.switch.neutral` maps to
  global `neutral`, off/rest/disabled values use `switch.neutral`, and selected/on activation uses
  Layer 2 `primary` directly.
- Fluent Switch token color variables now follow the token-plus-tone naming experiment:
  `neutral6`, `neutral25`, `neutral70`, `primary60`, `primary70`, and `primary80`.
- `pnpm exec tsc -p packages/presets/tsconfig.json --noEmit`: passed after renaming extracted
  Switch color variables.
- `pnpm exec biome check packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`:
  passed after renaming extracted Switch color variables.
- `pnpm --filter @kiskadee/web-builder run build`: passed after renaming extracted Switch color
  variables.
- `git diff --check`: passed after renaming extracted Switch color variables.
- `packages/presets/README-PRESETS.md` documents that component intents are public semantic
  alternatives, not names for internal control-state color roles.
- `docs/definitions/new-component-starting-definition.md` now records that binary selected/on colors
  can use global `primary` inside the default `neutral.medium` presentation without exposing a
  separate `primary` component intent.
