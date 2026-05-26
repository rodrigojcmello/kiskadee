# Switch Component In-Progress

## Scope

This handoff tracks cross-project Switch component work. It lives in the repository root `docs/`
because the current Switch demand spans the headless primitive, styled React component, generated
artifacts, showcase behavior, and possibly web-builder state semantics.

Durable definitions should not stay only in this file. Promote stable decisions into the nearest
owning project docs root:

- `packages/headless/react/.../docs/definitions/` for headless Switch behavior and state ownership.
- `packages/components/react/.../docs/definitions/` for styled React structural CSS behavior.
- `packages/web-builder/docs/definitions/` for generated selector/state-emission contracts.
- `packages/presets/docs/definitions/` for semantic color or preset authoring rules.

## Window Context

- Chat title is not available to the agent in the current Codex context.
- Demand slug: `switch-component`.
- Current user goal: diagnose and then adjust Switch focus outline so it appears only for
  keyboard-derived focus, matching Button behavior.
- The user asked to replace the generic `docs/in-progress.md` workflow with named
  `<demand>.in-progress.md` handoffs so multiple agents can work in parallel without colliding over
  the same active-context file.
- The user clarified that semantic focus and Kiskadee focus activators are separate channels:
  `data-focused` can be valid headless state, while `-f` is the compact Kiskadee focused-state
  marker. The new `-k` qualifier identifies highlighted / keyboard-visible focus.
- The latest direction is to remove the `data-*`/projected-state split for Kiskadee-owned headless
  components and use the compact `stateActivator` vocabulary directly in headless runtime state.
- Focus needs two levels in that vocabulary: `-f` for simple focused state and a new complementary
  `-k` qualifier for keyboard-visible / highlighted focus. Highlighted focus should be represented
  as `-f.-k.-a`, not as a replacement for `-f`.

## Current Status

- Switch and SwitchMotion are now separate public component boundaries. `Switch` is the canonical
  lightweight static component and no longer accepts a `motion` prop; `SwitchMotion` owns the
  runtime animation and drag path.
- CSS isolation uses separate structural branches, not public schema variants. For Switch,
  `a = static` and `b = motion`; both paths may duplicate structural Sass so their selectors do not
  depend on cascade order or root gates to undo each other.
- Structural selector cleanup now relies on branch-specific element modifier classes such as
  `k-swt-e1a-a` and `k-swt-e1b-b` without repeating the root class in the same selector. Generic
  state activators still stay root-scoped. The static branch keeps RTL movement through root-owned
  `--k-swt-dx`; the motion branch dropped that CSS variable because runtime motion owns direction.
- Latest verification: `@kiskadee/react-components` build, showcase build, and browser check on
  `/switch` confirming static branch `a`, motion branch `b`, no `.k-swt-m` dependency, runtime thumb
  transform ownership, and LTR drag-to-off behavior.
- Follow-up adjustment: the motion drag path now projects a temporary visual control state in the
  styled Switch shell during drag when the thumb reaches either extremity. This keeps track/selected
  visuals responsive before pointer release without calling persistent `onControlStateChange` while
  the gesture is active. Persistent state still commits on release.
- Follow-up adjustment: the motion thumb now treats scale/geometry changes as position rebasing.
  When `thumbTranslation` or inline direction changes without a control-state change, the motion
  value is set directly to the new selected/off target so the thumb stays anchored after a Scale
  change, including after drag.
- Follow-up adjustment: the drag path keeps the post-drag click suppression active for a short
  explicit window. A zero-timeout window can clear before the browser dispatches the synthetic
  label/input click after drag release, causing a duplicate toggle and mismatched state visuals.
- KIS-14 direction: Switch thumb-size reduction is an off/rest effect, not an alternate selected
  size. `switch.e3.scales.boxWidth` and `boxHeight` remain the normal and selected/on thumb size.
  A future `effects.thumbSize.rest` contract should use the same responsive numeric shape as
  `scales`, not percentages or ratios, and may specify width, height, or both. Height-only effects
  must keep width intact and preserve vertical alignment. This is intended for circular-thumb
  Switch designs; enabling it on iOS 26-style rounded-rectangle thumbs may look odd and that is an
  expected result. Static `Switch` and `SwitchMotion` must both consume the same effect contract.

## Original Diagnosis

Switch projected the old, overloaded Kiskadee focus marker too broadly:

- `packages/headless/react/src/components/switch/HeadlessSwitch.tsx` stores `focused=true` on every input
  `onFocus`, including pointer clicks.
- `packages/components/react/src/Switch/Switch.class-names.ts` mapped focus-visible state to
  `stateActivator.focus` (`-f`) through `SWITCH_STATE_PROJECTION`.
- `packages/components/react/src/Switch/Switch.structural.scss` draws the track outline from
  `.k-swt-e1-a.-f.-a .k-swt-e2-a`.
- Button differs because the real interactive root can rely on `.k-foc:focus-visible`; its forced
  highlighted focus path now uses `-f -k -a` for snapshots/static focus examples.

Important nuance: a semantic focus flag is not itself wrong. A headless component can validly expose
`data-focused` or another public signal that says "this compound control contains focus." The problem
is using that semantic `focused` state to activate a focus marker that also owns outline-visible
treatments.

The superseding contract splits that meaning: `-f` remains focused state, while `-k` qualifies that
focus as keyboard-visible / outline-worthy.

## Superseding Focus Activator Direction

The earlier diagnosis treated `-f` as the whole visual focus channel. The revised direction is more
precise:

- `-f` means the component is focused.
- `-k` is a complementary qualifier for keyboard-visible or highlighted focus.
- `-a` remains the projected-state activator gate.
- A simple pointer focus should produce `-f.-a` when the component runtime needs to expose focus
  state.
- A keyboard-visible / outline-worthy focus should produce `-f.-k.-a`.

This matches the original Button motivation: compact classes can force or document interaction
states that cannot be reliably forced through native pseudo selectors in static showcase states. In
that model, `-f` remains the focus state and `-k` refines it when the focus should be visually
highlighted.

`-k` should not be treated as a standalone interaction state like hover or selected. It is a focus
qualifier, meaningful with `-f`.

### Expected Selector Meaning

- `.-f.-a`: focused state is active.
- `.-f.-k.-a`: focused state is active and should render keyboard-visible / highlighted focus
  treatments such as outline.
- Generated schema `focus` selectors remain simple focus (`.-f.-a`). Highlighted focus
  (`.-f.-k.-a`) is currently component-authored structural behavior.
- Switch structural outline moved from `.-f.-a` to `.-f.-k.-a` because `-f` is now simple focus.
- Button forced outline examples should use `.-f.-k.-a`.
- TextField review outcome: label/filled/focus composition remains simple `-f`, while shell outline
  and underline highlight affordance require `-f.-k`.

### Runtime Direction

For Switch, Stage 3 implemented the direction where `HeadlessSwitch` owns interaction-state class
composition directly:

- Switch `data-*` state attributes were removed because they only duplicated Kiskadee state markers
  and were not kept as a public headless DOM contract;
- styled Switch no longer runs `useStateProjection` for Switch-specific state classes;
- `HeadlessSwitch` applies state activators on the root state owner:
  - controlState -> `-s`
  - focused -> `-f`
  - focus-visible / keyboard-highlighted -> `-k` in addition to `-f`
  - disabled -> `-d`
  - read-only -> `-r`
  - active projected state owner -> `-a`
  - native interaction anchor -> `-i`

This reduces duplicate runtime paths and keeps one state vocabulary for Kiskadee-owned components.
The tradeoff is that `@kiskadee/react-headless` becomes a Kiskadee state-runtime package rather than
a fully styling-agnostic headless package.

Follow-up decision: because headless now emits `projectedStateActivator`, Kiskadee-owned headless
components should use the cross-platform Kiskadee public contract. For Switch, persistent binary
state is exposed as `controlState`, `defaultControlState`, and `onControlStateChange`; web
`checked` is only the internal input adapter detail. Forced visual states use `status`, matching
Button, and `status="focus"` means highlighted outline-visible focus (`-f -k -a`).

The canonical docs now allow Kiskadee-owned headless primitives to emit compact activators directly
when that removes a duplicate styled-component projection layer. `data-*` remains valid only for
semantic public headless DOM contracts, not as a second copy of Kiskadee state.

## `useStateProjection` Review Notes

`useStateProjection` exists as a generic state projection helper, but Switch no longer uses it. The
older Switch path mixed two jobs:

- semantic headless data attributes such as `data-focused`, `data-checked`, or `data-filled`;
- styled Kiskadee projected classes such as `-f`, `-s`, `-d`, and `-a`, supplied by
  `@kiskadee/react-components` through `stateProjection`.

The helper itself does not import `@kiskadee/core` or hardcode `stateActivator`, but placing the
projection execution inside the headless component lets styled-package classes be applied by the
headless primitive. That makes the package boundary blurry.

The helper treats every truthy state as active unless a projection rule provides `when`. With the
older Switch state shape, `focused: true` had no way to distinguish simple focus from highlighted
keyboard-visible focus. The new Switch runtime avoids that ambiguity by tracking `focused` and
`focusVisible` separately, then emitting `-f` and `-k` directly from headless state.

## Canonical Docs Updated

- `packages/web-builder/docs/definitions/interaction-state-model.md` now explicitly documents that
  headless `data-focused` can mean "contains DOM focus", while Kiskadee activators represent the
  compact runtime state vocabulary.
- The same doc now states that `.-f.-a` means simple focused state and `.-f.-k.-a` means highlighted
  keyboard-visible / outline-worthy focus.
- Stage 1 of the `-k` migration updated the same canonical doc with the new focus contract:
  `.-f.-a` means simple focused state, while `.-f.-k.-a` means highlighted keyboard-visible /
  outline-worthy focus.
- Stage 2 added `stateActivator.focusVisible = '-k'` in `@kiskadee/core`, without adding a new
  `InteractionState`.
- Stage 4 removed the production `ENABLE_FORCED_INTERACTION_STATES` flag from web-builder. Projected
  state selector branches are now documented as normal runtime CSS output rather than showcase-only
  forced-state output.
- `packages/presets/docs/definitions/component-intents.md` now records that `rest` is an
  interaction state, not an off/disabled value. For binary controls, base `rest` means off +
  resting interaction, while `selected.rest` means on + resting interaction.
- `packages/web-builder/docs/definitions/interaction-state-model.md` now records that child slots
  reacting to a selected root should use reference values under `selected` so generated CSS targets
  the child from the selected state scope owner.

## Preset Reference Capture

### iOS 26 Switch Reference

The Apple iOS 26 / iPadOS 26 Community reference captured earlier reported:

- Track: `64 x 28`.
- Thumb: `39 x 24`.
- Track padding: `2` on each side.
- Thumb travel: `21` px, from `x=2` to `x=23`.
- Track ratio: `64 / 28 = 2.286`.
- Thumb ratio: `39 / 24 = 1.625`.

### macOS 26 Switch Reference

The macOS 26 Community node to inspect is:

- File: `37jpyRzTWznKjRhFSF3GD3`.
- Node: `478:932`.
- URL:
  `https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=478-932&t=a8BBh5Uy52nM66rg-4`.

Captured on 2026-05-19 after Figma MCP credits were available. The inspected `Examples` section has
30 Switch instances: 5 sizes across 3 states (`Idle`, `Clicked`, `Disabeld` in the source file) and
2 selections (`Off`, `On`), all with `Active Window=True`.

| Track | Track ratio | Thumb | Thumb ratio | Off x/y | On x/y | Travel | Padding |
| --- | ---: | --- | ---: | --- | --- | ---: | --- |
| `36 x 16` | `2.250` | `21 x 13` | `1.615` | `1.5 / 1.5` | `13.5 / 1.5` | `12` | `1.5` |
| `44 x 20` | `2.200` | `26 x 16` | `1.625` | `2 / 2` | `16 / 2` | `14` | `2` |
| `54 x 24` | `2.250` | `32 x 20` | `1.600` | `2 / 2` | `20 / 2` | `18` | `2` |
| `64 x 28` | `2.286` | `38 x 24` | `1.583` | `2 / 2` | `24 / 2` | `22` | `2` |
| `80 x 36` | `2.222` | `47 x 30` | `1.567` | `3 / 3` | `30 / 3` | `27` | `3` |

Comparison with the iOS 26 Switch reference:

- macOS has a `64 x 28` track size, so the external/track size matches the iOS `64 x 28` track.
- The matching macOS `64 x 28` size does not have the same thumb as iOS:
  - iOS thumb: `39 x 24`, ratio `1.625`, travel `21`.
  - macOS thumb: `38 x 24`, ratio `1.583`, travel `22`.
- Therefore the shared size is only the external track box. The thumb geometry and movement differ.
- macOS proportions vary by size for both track and thumb. Do not model macOS as a simple scale of
  the iOS Switch.
- Final medium decision: `ios-26-apple` uses the macOS/Figma `64 x 28` geometry as the canonical
  `s:md:1` size because it matches the surrounding scale pattern better than the iOS Figma thumb
  width and the iPad screenshot estimate. The chosen medium is track `64 x 28`, thumb `38 x 24`,
  padding `2`, travel `22`.
- The remaining distinct macOS sizes complement the scale around that medium size:
  - `s:sm:3`: macOS `36 x 16`, thumb `21 x 13`, padding `1.5`.
  - `s:sm:2`: macOS `44 x 20`, thumb `26 x 16`, padding `2`.
  - `s:sm:1`: macOS `54 x 24`, thumb `32 x 20`, padding `2`.
  - `s:md:1`: canonical medium `64 x 28`, thumb `38 x 24`, padding `2`.
  - `s:lg:1`: macOS `80 x 36`, thumb `47 x 30`, padding `3`.
- The iOS Figma `39 x 24` thumb and the iPad screenshot estimate are treated as cross-source
  inconsistencies rather than the canonical Kiskadee medium geometry.
- This only changes size scales; palettes are not size-specific in the current schema model.
- Showcase decision: the Switch page must derive visible scale options from the selected design
  system manifest. Unsupported sizes are hidden rather than shown disabled, and changing the Switch
  scale runs `playWowTransition()` so geometry changes animate through the showcase-only `k-wow`
  macro transition.
- Showcase radius decision: changing the Switch radius selector also runs `playWowTransition()`,
  because radius is a showcase geometry change just like scale and needs the same `k-wow` macro
  transition to make rounded/pill/square comparisons readable.
- Showcase artifact-loading decision: JSON artifacts loaded by the client use `cache: 'no-store'`
  so a live showcase session does not combine a fresh manifest with a stale class-name map after
  schema/build artifact changes.

AX label/icon notes from the macOS file:

- The Switch instances include `Show AX Label=true`.
- On selection uses a vertical bar icon named `|`, sized `2 x 10`.
- Off selection uses a circle icon named `O`, sized `6 x 6`.
- Kiskadee Switch does not currently support these on/off icons; keep them as a known visual gap.

## Historical Candidate Paths

Chosen path: Switch-first compact runtime in `HeadlessSwitch`, with styled Switch projection removed.

### Minimal structural fix

Draw the outline from the hidden native input's `:focus-visible`, while preserving forced showcase
snapshots that apply `-f -a` without real DOM focus.

This is local to styled structural CSS and should be the first path if the requested behavioral
change is only "outline appears only for keyboard focus".

Risk: generated focus color/state classes may still activate on pointer focus because semantic
`focused` still maps to visual `-f`.

### Full focus-visible contract

Separate simple focus from highlighted focus in the Switch state model. Emit `-f` for simple focus
and add `-k` only when the input is keyboard-visible / highlighted, likely matching the input's
`:focus-visible` behavior.

This aligns all generated focus visuals with keyboard focus, not only the outline.

Risk: broader behavior/API change across headless state projection, styled class projection,
showcase forced-state examples, and generated artifact expectations.

### Projection boundary cleanup

Review whether `useStateProjection` should remain in `@kiskadee/react-headless`. A stricter package
boundary would keep semantic state/data helpers in headless and move Kiskadee projected-class
composition into `@kiskadee/react-components`.

Risk: this is larger than the Switch outline bug because styled components currently rely on the
headless `stateProjection` prop to receive internal states such as `focused` and `filled`.

## Pending Work

- [x] Add the new focus qualifier to the Kiskadee state vocabulary. `stateActivator.focusVisible`
  now exports `-k` for keyboard-visible / highlighted focus, used together with `-f`.
- [x] Decide builder semantics for schema `focus` selectors. Current decision: generated schema
  `focus` selectors remain simple focus (`.-f.-a`), while highlighted / outline-worthy focus is a
  structural component concern expressed as `.-f.-k.-a` where needed.
- [x] Move Switch state-activator composition into `HeadlessSwitch` and remove Switch `data-*`
  state duplication if no public consumer requires those attributes.
- [x] Remove styled Switch `useStateProjection` once `HeadlessSwitch` owns `-s`, `-f`, `-k`, `-d`,
  `-r`, `-a`, and `-i` composition.
- [x] Update Switch structural outline to require highlighted focus, likely
  `.k-swt-e1-a.-f.-k.-a .k-swt-e2-a`.
- [x] Update Button forced focus documentation/examples to use `-f.-k.-a` for outline-visible focus.
- [x] Review TextField before migrating: simple focused field state remains `-f`, while shell
  outline and underline highlight behavior now require the additional `-k` qualifier.
- [x] Promote the `-k` decision into canonical docs after the implementation direction is confirmed.
- [x] Decide whether the current task should apply the minimal structural fix or the full
  focus-visible contract. Chosen path: Switch-first full focus-visible contract plus projection
  boundary cleanup for Switch only.
- [x] Promote the `data-focused` vs. `-f` distinction into canonical docs before migrating projection
  ownership.
- [x] Review whether `useStateProjection` should stay in `@kiskadee/react-headless` or whether
  projected-class composition belongs in `@kiskadee/react-components`. Superseded Switch decision:
  Kiskadee-owned `HeadlessSwitch` now owns compact state activators directly, and styled Switch does
  not run a second projection layer.
- [x] If implementing the full contract, update `packages/headless/react/src/components/switch/HeadlessSwitch.tsx`
  and the styled Switch state contract, then verify generated focus selectors still behave as
  intended.
- [x] Preserve the simple focus versus highlighted focus distinction without asking showcase
  consumers to pass raw activator classes. Superseded implementation detail: outline-visible focus
  was first proven with `-f -k -a`; the public Switch API now uses `status="focus"`.
- [x] After implementation, update this handoff with files changed, validations run, and any durable
  decisions that were promoted into canonical docs.
- [ ] Migrate TextField projected-class composition out of `HeadlessTextField`; tracked separately in
  `docs/component-textfield.in-progress.md`.

## Implementation Notes

Stage 3 made Switch the first pilot for the single compact state runtime:

- `HeadlessSwitch` now imports `stateActivator` from `@kiskadee/core` and composes Kiskadee state
  classes directly on `e1`, the Switch state scope owner.
- `HeadlessSwitch` no longer emits Switch state `data-*` attributes. No public Switch headless DOM
  contract was kept for `data-checked`, `data-focused`, `data-disabled`, `data-readonly`, or
  `data-required` in this pass.
- `e1` always receives `-i` as the interaction anchor. It receives `-a` only when at least one
  projected state is active.
- Runtime state mapping is now:
  - controlState -> `-s`
  - focused -> `-f`
  - focus-visible / keyboard-highlighted -> `-k` in addition to `-f`
  - disabled -> `-d`
  - read-only -> `-r`
- Styled `Switch` does not import the control-state hook, `useStateProjection`,
  `SWITCH_STATE_PROJECTION`, or `SwitchProjectedStateName`. `HeadlessSwitch` owns
  `controlState/defaultControlState/onControlStateChange` and maps the web input `checked` field
  internally.
- Switch structural outline now requires `.k-swt-e1-a.-f.-k.-a .k-swt-e2-a`, so pointer focus can
  expose simple `-f` without showing the outline.
- External root `className` remains an escape hatch, but showcase/static Switch states should use
  `status` and `controlState` instead of raw activator classes.
- Web-builder production output now always emits projected selector branches. The removed
  `ENABLE_FORCED_INTERACTION_STATES` flag is documented as historical terminology because projected
  state selectors are required by runtime components, not just showcase snapshots.
- Button `status="focus"` now emits highlighted focus (`-f -k -a`) so showcase/static focus examples
  keep the outline. The global `.k-foc` outline selector and ripple clip-path workaround both require
  `.-f.-k.-a` for forced focus.
- TextField now exposes `focusVisible` in its internal state projection path, so styled TextField can
  emit `-f -k -a` for highlighted focus while keeping simple focused layout at `-f -a`.
- TextField structural Sass keeps floating label promotion and empty/focused geometry on `.-f.-a`,
  but moves shell outline and underline emphasis selectors to `.-f.-k.-a`.
- TextField projected-class composition is still executed by `HeadlessTextField` through the
  `stateProjection` prop. The broader boundary migration is still tracked separately in
  `docs/component-textfield.in-progress.md`.
- `ios-26-apple` now uses the `64 x 28` / `38 x 24` geometry as the canonical `s:md:1` Switch size
  and fills the rest of the scale with distinct macOS Switch sizes. The iOS Figma `39 x 24` thumb is
  treated as cross-source inconsistency.
- `ios-26-apple` schema authoring now follows the Material 3 preset organization pattern: the root
  schema owns preset metadata/globals and composes component factories from `components/*.schema.ts`.
- `ios-26-apple` Switch schema now avoids web-only pill-radius hacks. Invariant values use scalar
  schema values (`borderWidth: 0`, `rounded: 6`, `square: 0`), while `pill` uses the exact
  half-height radius for each track/thumb size.
- `fluent-2-microsoft` now follows the same portable numeric-value rule for Switch. The track
  border width is scalar, Switch `rounded` uses `4px` so the circular `14 x 14` thumb remains a
  visibly rounded non-pill variant, and Switch `pill` uses exact half-height geometry for the known
  Fluent track/thumb dimensions. The root Button radius maps were also reduced to scalar values
  where every scale repeated the same number.
- Switch now supports schema-driven activation motion through
  `components.switch.options.activationMotion`. The semantic values are `standard` and `slow`; web
  maps them to a Switch-local motion variable instead of changing global interaction duration.
  `ios-26-apple` uses `standard`, while `fluent-2-microsoft` uses `slow` because its compact
  circular thumb felt too abrupt with the standard activation timing.
- `activationMotion` is intentionally not exposed as a public `Switch` prop. Schema options do not
  automatically become per-instance React overrides; each option needs an explicit API decision.
  The current Switch alignment keeps `variant`, `mode`, and `radius` overrideable, while
  `activationMotion` remains a preset-level fidelity decision read from the generated global
  artifact.
- React Switch now treats `rounded` thumb radius as local structural geometry. The track still uses
  its generated `rounded` radius class, but the thumb applies a Switch-local modifier that derives
  radius from inherited generated variables: `--k-bdr - max(--k-pdt, --k-pdb)`. `pill` and `square`
  still use explicit generated radius classes for the thumb. This is a component-local consumption
  rule, not a web-builder or global emission-policy change. The structural selector is the direct
  element modifier `.k-swt-e3a-a`, and it intentionally uses contract variables without local
  `var()` fallbacks so missing generated values remain visible as bugs.
- Switch style-emission policy was reviewed and documented in the web-builder docs. The only
  Switch-specific overrides today are on `switch.standard.e2` / track:
  `borderWidthEmission: mirrored` and `paddingEmission: compensated`. `borderRadius` is important
  to Switch geometry, but it uses the builder default `mirrored` emission rather than a
  Switch-specific override.
- Fluent 2 Microsoft Switch has a temporary `neutral.high` emphasis bucket for visual testing. The
  unchecked/off rest track remains white, the checked/on rest track is green (`#107C10`), the
  unchecked/off thumb is red (`#C50F1F`), and the checked/on thumb remains white. The bucket
  intentionally avoids custom hover/focus/pressed values. These colors are placeholder values and
  should be revisited before treating the palette as final. The showcase Switch page exposes an
  `Emphasis` select derived from the selected design system manifest, so presets without `high` do
  not show a misleading option.
- Material 3 Google Switch was refreshed from the Material 3 Design Kit Community Switch component
  set (`Peqe9lNMsuQHLIUZsiTZNg`, node `54446:25289`). The Figma set exposes one external Switch
  size (`52 x 32`), not multiple size variants. Kiskadee now keeps only `s:md:1` for this preset,
  uses the captured `24 x 24` selected/default thumb size, and documents unsupported Figma details
  such as the `16 x 16` off thumb, `28 x 28` pressed thumb, `40 x 40` state layer, `48 x 48` target,
  focus indicator, and icons.
- Switch should move from a single public API with internal renderer paths to separate public
  component boundaries: `Switch` for the default lightweight CSS-transition path and `SwitchMotion`
  for the runtime animation/gesture path.
- `motion` remains valid Kiskadee vocabulary, but it is a design-system concept, not a dependency
  name. It means a dedicated runtime animation or gesture path; it does not canonically bind
  Kiskadee to `motion/react`.
- A lazy orchestrator can render `Switch` first and lazy-load `SwitchMotion` when dynamic selection
  is needed. This should be treated as a helper for showcase/demos/advanced consumers, not as the
  canonical component contract.
- Styled `SwitchMotion` resolves `controlState` with `useControlState` from
  `@kiskadee/react-headless` and passes a controlled `controlState` back into `HeadlessSwitch.Root`.
  This keeps click and keyboard behavior in the native input/headless layer while allowing the
  motion thumb runtime to call the same setter on drag release.
- `SwitchMotion` enables drag as part of the runtime-motion path. Drag is blocked through the same
  `disabled` and `readOnly` guards as click/keyboard state changes.
- The previous lazy-renderer shape used the structural gate `k-swt-m` only after the lazy module had
  loaded. That shape is now superseded by branch-owned structural CSS: static uses branch `a`, and
  motion uses branch `b`.
- In the motion branch, structural CSS lets the runtime own thumb `transform` and removes the static
  transform transition from the thumb. Generated visual transitions still apply to colors, radius,
  shadows, and related CSS variables.
- `activationMotion` remains a schema/preset timing profile and does not select the animation
  engine. In the motion path, it affects non-transform visual CSS transitions and also maps to an
  internal runtime spring profile for horizontal thumb displacement.
- `packages/components/react/docs/definitions/motion-strategy.md` now documents the broader
  static-vs-motion vocabulary. `docs/definitions/new-component-starting-definition.md` points to it
  so future components start lightweight and only add runtime motion when behavior requires it.

## Relevant Files

- `packages/headless/react/src/components/switch/HeadlessSwitch.tsx`
- `packages/headless/react/package.json`
- `packages/headless/react/src/index.ts`
- `packages/headless/react/src/components/switch/HeadlessSwitch.structural.scss`
- `packages/components/react/src/state-projection/useStateProjection.ts`
- `packages/components/react/src/Switch/Switch.class-names.ts`
- `packages/components/react/src/Switch/Switch.tsx`
- `packages/components/react/src/Switch/SwitchMotion.tsx`
- `packages/components/react/src/Switch/Switch.types.ts`
- `packages/components/react/src/Switch/Switch.structural.scss`
- `packages/components/react/src/Switch/SwitchMotion.structural.scss`
- `packages/components/react/src/contexts/KiskadeeContext.tsx`
- `packages/components/react/docs/definitions/schema-option-overrides.md`
- `packages/components/react/docs/definitions/switch/switch-geometry.md`
- `packages/components/react/src/styles/style.kiskadee.scss`
- `packages/components/react/src/Button/ButtonWithRipple.scss`
- `packages/components/react/src/Button/useButtonBase.ts`
- `packages/headless/react/src/components/text-field/HeadlessTextField.tsx`
- `packages/components/react/src/TextField/TextField.class-names.ts`
- `packages/components/react/src/TextField/floating-notched/TextField.floating-notched.structural.scss`
- `packages/components/react/src/TextField/floating-inside/TextField.floating-inside.structural.scss`
- `packages/components/react/src/TextField/standard-outline/TextField.standard-outline.structural.scss`
- `packages/components/react/src/TextField/standard-underline/TextField.standard-underline.structural.scss`
- `packages/components/react/src/TextField/standard-borderless/TextField.standard-borderless.structural.scss`
- `packages/web-builder/docs/definitions/interaction-state-model.md`
- `packages/web-builder/docs/definitions/pipeline.md`
- `packages/web-builder/docs/definitions/style-emission-policy.md`
- `packages/web-builder/docs/definitions/component-style-emission-overrides.md`
- `packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`
- `packages/core/src/components/switch.options.zod.ts`
- `packages/core/src/components/switch.ts`
- `packages/core/src/components/switch.zod.ts`
- `packages/web-builder/src/run-build.ts`
- `packages/presets/src/presets/ios-26-apple/ios-26-apple.schema.ts`
- `packages/presets/src/presets/ios-26-apple/components/button.schema.ts`
- `packages/presets/src/presets/ios-26-apple/components/switch.schema.ts`
- `packages/presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts`
- `packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`
- `packages/presets/docs/definitions/interaction-feedback.md`
- `packages/presets/docs/definitions/preset-schema-organization.md`
- `packages/showcase/app/switch/SwitchPage.tsx`
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- `packages/showcase/utils/build-artifacts.client.ts`
- `pnpm-lock.yaml`
