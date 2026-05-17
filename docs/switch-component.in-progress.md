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
- The user clarified that semantic focus and Kiskadee visual focus are separate channels:
  `data-focused` can be valid headless state, while `-f` activates the complete Kiskadee visual
  focus state.

## Current Diagnosis

Switch currently projects Kiskadee visual focus too broadly:

- `packages/headless/react/src/components/switch/HeadlessSwitch.tsx` stores `focused=true` on every input
  `onFocus`, including pointer clicks.
- `packages/components/react/src/Switch/Switch.class-names.ts` maps `focused` to
  `stateActivator.focus` (`-f`) through `SWITCH_STATE_PROJECTION`.
- `packages/components/react/src/Switch/Switch.structural.scss` draws the track outline from
  `.k-swt-e1-a.-f.-a .k-swt-e2-a`.
- Button differs because the real interactive root can rely on `.k-foc:focus-visible`; its forced
  `-f -a` path is useful for snapshots/forced states rather than normal pointer focus.

Important nuance: a semantic focus flag is not itself wrong. A headless component can validly expose
`data-focused` or another public signal that says "this compound control contains focus." The problem
is using that semantic `focused` state to activate Kiskadee's compact `-f` projected-state class.

In Kiskadee, `-f` means the visual focus state is active. It feeds generated focus styles and
structural focus treatments such as the outline. It should behave like the visual focus channel,
not like a generic "the control has DOM focus" flag.

## `useStateProjection` Review Notes

`useStateProjection` currently lives in `@kiskadee/react-headless` and is used for two different
jobs:

- semantic headless data attributes such as `data-focused`, `data-checked`, or `data-filled`;
- styled Kiskadee projected classes such as `-f`, `-s`, `-d`, and `-a`, supplied by
  `@kiskadee/react-components` through `stateProjection`.

The helper itself does not import `@kiskadee/core` or hardcode `stateActivator`, but placing the
projection execution inside the headless component lets styled-package classes be applied by the
headless primitive. That makes the package boundary blurry.

The current hook also treats every truthy state as active unless a projection rule provides `when`.
With the current Switch state shape, `focused: true` has no way to distinguish semantic focus from
visual focus-visible. The state model needs either a separate visual-focus state or a different
projection boundary before `focused` can safely remain semantic while `-f` stays visual.

## Canonical Docs Updated

- `packages/web-builder/docs/definitions/interaction-state-model.md` now explicitly documents that
  headless `data-focused` can mean "contains DOM focus", while `.-f.-a` means "activate Kiskadee's
  visual focus state now."
- The same doc now states that components must not derive `.-f` from every truthy semantic focus
  flag, and should model semantic focus and visual focus separately when both are needed.

## Candidate Paths

### Minimal structural fix

Draw the outline from the hidden native input's `:focus-visible`, while preserving forced showcase
snapshots that apply `-f -a` without real DOM focus.

This is local to styled structural CSS and should be the first path if the requested behavioral
change is only "outline appears only for keyboard focus".

Risk: generated focus color/state classes may still activate on pointer focus because semantic
`focused` still maps to visual `-f`.

### Full focus-visible contract

Separate semantic focus from visual focus in the Switch state model. Keep semantic `data-focused`
for real focus if needed, but map `stateActivator.focus` only when the visual focus condition is
active, likely matching the input's `:focus-visible` behavior.

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

- [x] Decide whether the current task should apply the minimal structural fix or the full
  focus-visible contract. Chosen path: Switch-first full focus-visible contract plus projection
  boundary cleanup for Switch only.
- [x] Promote the `data-focused` vs. `-f` distinction into canonical docs before migrating projection
  ownership.
- [x] Review whether `useStateProjection` should stay in `@kiskadee/react-headless` or whether
  projected-class composition belongs in `@kiskadee/react-components`. Switch now keeps semantic
  `data-*` helpers in headless and applies Kiskadee projected classes in styled React.
- [x] If implementing the full contract, update `packages/headless/react/src/components/switch/HeadlessSwitch.tsx`
  and the styled Switch projection contract, then verify generated focus selectors still behave as
  intended.
- [x] Preserve showcase/static forced focus examples such as `className="-f -a"` without making real
  pointer focus show the outline.
- [x] After implementation, update this handoff with files changed, validations run, and any durable
  decisions that were promoted into canonical docs.
- [ ] Migrate TextField projected-class composition out of `HeadlessTextField`; tracked separately in
  `docs/component-textfield.in-progress.md`.

## Implementation Notes

- `HeadlessSwitch` no longer accepts or executes `stateProjection`. It still owns semantic state and
  exposes `data-checked`, `data-focused`, `data-disabled`, `data-readonly`, and `data-required` on
  root/track slots.
- Styled `Switch` now owns Kiskadee projected-class composition through
  `packages/components/react/src/state-projection/useStateProjection.ts`.
- Styled `Switch` derives `-f` from a visual `focusVisible` state, not from headless semantic
  `focused`. Pointer focus can still set `data-focused`, but it does not activate `-f` or the
  structural outline.
- Keyboard focus sets `focusVisible` when the input matches `:focus-visible`; keyboard interaction
  while the input is already focused also keeps the visual focus channel active.
- External forced classes such as `className="-f -a"` still land on the Switch root through the
  styled component class composition path.

## Relevant Files

- `packages/headless/react/src/components/switch/HeadlessSwitch.tsx`
- `packages/headless/react/src/index.ts`
- `packages/headless/react/src/components/switch/HeadlessSwitch.structural.scss`
- `packages/components/react/src/state-projection/useStateProjection.ts`
- `packages/components/react/src/Switch/Switch.class-names.ts`
- `packages/components/react/src/Switch/Switch.tsx`
- `packages/components/react/src/Switch/Switch.types.ts`
- `packages/components/react/src/Switch/Switch.structural.scss`
- `packages/components/react/src/styles/style.kiskadee.scss`
- `packages/web-builder/docs/definitions/interaction-state-model.md`
- `packages/showcase/app/switch/SwitchPage.tsx`

## Validation Notes

- `git diff --check -- AGENTS.md docs/switch-component.in-progress.md docs/component-textfield.in-progress.md packages/web-builder/docs/definitions/interaction-state-model.md packages/headless/react/src/index.ts packages/headless/react/src/components/switch/HeadlessSwitch.tsx packages/components/react/src/state-projection/useStateProjection.ts packages/components/react/src/Switch/Switch.class-names.ts packages/components/react/src/Switch/Switch.tsx packages/components/react/src/Switch/Switch.types.ts`
  passed.
- `pnpm --filter @kiskadee/react-components run build` passed. The script also built
  `@kiskadee/react-headless` first.

Future broader validation, only if showcase/generated artifacts are touched:

- `pnpm --filter @kiskadee/react-components run build`
- `pnpm --filter @kiskadee/web-builder run build`
- `pnpm --filter @kiskadee/web-builder run sync`
- `pnpm --filter @kiskadee/showcase build` when generated showcase artifacts or visible behavior are affected
