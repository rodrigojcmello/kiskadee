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
- `Card` v1 visual props are `intent`, `emphasis`, and `radius`.
- `CardAction` v1 visual props are `intent`, `emphasis`, `status`, and `radius`.
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
- `Card` static does not receive `stateActivator.nativeInteraction` (`-n`), so generated native
  pseudo states do not activate hover, pressed, or focus visuals on static surfaces.
- `CardAction` receives `stateActivator.nativeInteraction` (`-n`) on the root state owner, allowing
  native hover, pressed, and focus visuals when those branches exist in schema.
- `Card` and `CardAction` share generated visual classes, but only `CardAction` enables native
  pseudo-state activation.
- `CardAction` must stay on the default cursor. `cursor: pointer` is reserved for true link semantics.
- The styled resolver maps global `radius="pill"` to Card `rounded`, so global Material radius does
  not leak an invalid Card radius.
- The `/card` Showcase includes static, action, selected, disabled, and interaction-locked examples.
  Radius is controlled through a route control select instead of duplicate radius-only examples.
- The `/card` Showcase now experiments with a real Button visually placed over each card example.
  For `CardAction`, the Button is rendered as a positioned sibling, not a descendant, because
  `CardAction` itself is a native button and nested buttons would be invalid HTML.

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
- 2026-06-15: `pnpm --filter @kiskadee/web-builder build`
- 2026-06-15: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-15: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-15: `pnpm --filter @kiskadee/showcase build`
- 2026-06-15: generated CSS audit confirmed 112 CSS files with no generated native pseudo selector
  missing `-n`; projected selectors such as `.-h.-a`, `.-p.-a`, and `.-f.-a` remain present.
- 2026-06-15: Browser validation confirmed `Card` static renders as `div` without `-n`, `CardAction`
  renders as `button` with `-i -n`, `CardAction` selected toggles `aria-pressed=true` and `-s -a`,
  `interactionLocked` blocks selection, and Button, Switch, Tabs, and TextField state owners render
  with `-n` and default cursor.
- 2026-06-15: Browser CUA did not populate `:hover` in this session, so native hover behavior was
  validated through generated selector shape instead of a live pointer hover assertion.
- 2026-06-15: `/card` Showcase radius examples were consolidated into a `Radius` select control
  with `rounded` and `square` options; `pill` remains outside the Card Showcase surface.
- 2026-06-15: Added Button-on-card visual experiment to every `/card` example. Buttons are
  positioned as overlays so CardAction examples avoid invalid nested button markup.
