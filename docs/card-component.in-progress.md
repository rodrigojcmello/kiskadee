# Card Component In-Progress

## Current Direction

`Card` starts as the first Kiskadee surface component with a static container and a native button
action variant.

## Public Contract

- Public styled React exports: `Card` and `CardAction`.
- Public headless React exports: `Card` and `CardAction`.
- `Card` renders a `div` and does not add interactive semantics by default.
- `CardAction` renders a native `button`.
- `CardAction` supports `controlState`, `defaultControlState`, `onControlStateChange`,
  `interactionLocked`, and `disabled`.
- `CardAction` uses `aria-pressed` when it represents the selected control state.
- `interactionLocked` blocks activation attempts without applying `disabled`, `readOnly`, or their
  visual states.
- Card v1 visual props are `intent`, `emphasis`, `status`, and `radius`.
- Card v1 supports `radius="rounded"` and `radius="square"` only. `pill` is intentionally outside
  the Card contract.
- Card v1 does not expose `shadow`.

## Schema Contract

- Component key: `components.card`.
- Element map:
  - `e1`: card root, visual surface, and state scope owner.
- Allowed `e1` schema properties:
  - `decorations.borderStyle`;
  - `scales.paddingTop`;
  - `scales.paddingRight`;
  - `scales.paddingBottom`;
  - `scales.paddingLeft`;
  - `scales.borderWidth`;
  - `scales.borderRadius.rounded`;
  - `scales.borderRadius.square`;
  - `palettes.boxColor`;
  - `palettes.borderColor`.
- `scales.borderRadius.pill` is invalid for Card.
- Card v1 starts with `neutral.medium`.
- The selected visual is encoded as the schema `selected` branch under `neutral.medium`; it is not
  an automatic mutation to `emphasis="high"`.

## Implementation Notes

- First preset target: Material 3 Google.
- Material 3 Google currently defines light Card palettes only.
- `CardAction` projects `selected` in the headless layer so uncontrolled selected state still
  activates generated selected CSS.
- `CardAction` uses native button keyboard behavior instead of custom key handling.
- `Card` static does not receive a role, tab index, or keyboard handlers by default.
- The styled resolver maps global `radius="pill"` to Card `rounded`, so global Material radius does
  not leak an invalid Card radius.
- The `/card` Showcase includes static, action, selected, disabled, interaction-locked, rounded, and
  square examples.

## Deferred

- Child emphasis is manual in v1. Automatic contextual emphasis remains deferred.
- Subtle selected visuals such as border-only, colored shadow, or a corner marker remain deferred.
- Shadow is intentionally not copied from Button. KIS-45 tracks the global shadow effect/refactor.
- Link-card semantics are outside Card v1.
- Dark theme Card palettes are outside Card v1.

## Validation

- 2026-06-14: `pnpm --filter @kiskadee/web-builder build`
- 2026-06-14: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-14: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-14: `pnpm --filter @kiskadee/showcase build`
- 2026-06-14: `git diff --check`
- 2026-06-14: Browser validation on `/card` with Material Design 3 by Google confirmed:
  `CardAction` toggles selected, selected uses `aria-pressed=true`, `interactionLocked` blocks
  activation without applying `disabled`, disabled remains native, rounded radius is `12px`, square
  radius is `0px`, and Card class maps do not expose a pill radius bucket.
