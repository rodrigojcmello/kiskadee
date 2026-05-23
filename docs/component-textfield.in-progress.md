# Component TextField In-Progress

## Scope

This handoff tracks the follow-up to migrate TextField projected-state composition out of
`@kiskadee/react-headless` and into `@kiskadee/react-components`.

## Context

- Switch is the first component being migrated so the headless primitive keeps semantic state and
  `data-*` helpers, while the styled component owns Kiskadee projected visual classes.
- TextField still uses `stateProjection` through `HeadlessTextField.Root`.
- The current goal is to avoid broad TextField churn while the Switch migration proves the pattern.
- During the Switch focus-visible migration, TextField gained a `focusVisible` projection state so
  shell outline and underline emphasis can use `-f -k -a` while label/layout focus remains `-f -a`.
- This is an intermediate alignment, not the final boundary cleanup. The styled package still passes
  `TEXT_FIELD_STATE_PROJECTION` into `HeadlessTextField.Root`, so the headless component still
  executes styled-package projected-class config.

## Pending Work

- [ ] Migrate TextField projected-class composition out of `HeadlessTextField`.
  Keep semantic headless helpers such as `data-focused` and `data-filled` in the headless package,
  but move Kiskadee `stateActivator` class composition such as `-f`, `-k`, `-v`, `-d`, `-r`, `-a`,
  and `-i` into `packages/components/react`.
- [ ] When doing that migration, preserve the current focus split: simple focus emits `-f -a`, while
  highlighted/native `:focus-visible` focus emits `-f -k -a`.

## Relevant Files

- `packages/headless/react/src/components/text-field/HeadlessTextField.tsx`
- `packages/components/react/src/TextField/TextField.runtime.tsx`
- `packages/components/react/src/TextField/TextField.class-names.ts`
- `packages/components/react/src/state-projection/useStateProjection.ts`
- `packages/web-builder/docs/definitions/interaction-state-model.md`
