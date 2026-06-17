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
- `Card` v1 visual props are `intent`, `emphasis`, `radius`, `shadow`, and
  `preserveBorderWithShadow`.
- `Card.shadow` accepts `boolean | ElementSizeValue`; string values select a fixed global shadow
  level such as `s:sm:1` or `s:lg:3`.
- `CardAction` v1 visual props are `intent`, `emphasis`, `status`, `radius`, `shadow`, and
  `preserveBorderWithShadow`.
- `CardAction.shadow` accepts `boolean`; when enabled it uses the component's stateful shadow
  recipe.
- `preserveBorderWithShadow` defaults to `true`; when `false` and shadow is active, the styled
  wrapper keeps border width and makes border color transparent.
- Card v1 supports `radius="rounded"` and `radius="square"` only. `pill` is intentionally outside
  the Card contract.

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
- Allowed component-level effect properties:
  - `effects.shadow.targetElement`;
  - `effects.shadow.states`;
  - `effects.shadow.fixedLevels`.
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
- `Card` static can opt into fixed global shadow levels using `shadow="s:sm:1"` through
  `shadow="s:lg:3"` when the selected preset exposes them.
- `CardAction` can opt into the stateful global shadow recipe with `shadow={true}`. Material Google
  maps rest/focus to `s:sm:1`, hover to `s:md:1`, and pressed/disabled to an explicit zero shadow.
- `preserveBorderWithShadow={false}` is a local runtime composition for Card and CardAction. It
  applies only when shadow has a generated class and uses a Card structural class to set
  `border-color: transparent` while preserving border width.
- `CardAction` must stay on the default cursor. `cursor: pointer` is reserved for true link semantics.
- The styled resolver maps global `radius="pill"` to Card `rounded`, so global Material radius does
  not leak an invalid Card radius.
- The `/card` Showcase includes static, action, selected, disabled, and interaction-locked examples.
  Radius and static shadow are controlled through route selects instead of duplicate examples.
- The `/card` Showcase derives static shadow options from the active Card class map, so presets only
  show fixed levels they actually expose.
- The `/card` Showcase includes a CardAction shadow toggle that applies the stateful recipe to all
  CardAction examples.
- The `/card` Showcase now experiments with a real Button visually placed over each card example.
  For `CardAction`, the Button is rendered as a positioned sibling, not a descendant, because
  `CardAction` itself is a native button and nested buttons would be invalid HTML.
- The `/card` Showcase resolves the overlay Button scale, intent, and emphasis from the active
  Button manifest. It prefers `s:md:1` and falls back to a supported visual state so presets with
  narrower Button catalogs do not render broken or undersized CTAs.

## Deferred

- Child emphasis is manual in v1. Automatic contextual emphasis remains deferred.
- Subtle selected visuals such as border-only, colored shadow, or a corner marker remain deferred.
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
- 2026-06-16: Implemented global shadow effect support for Card. `Card` static accepts fixed
  levels from `s:sm:1` through `s:lg:3`; `CardAction` accepts boolean stateful shadow.
- 2026-06-16: `pnpm --filter @kiskadee/web-builder build`
- 2026-06-16: `pnpm --filter @kiskadee/web-builder run build-sync-generate`
- 2026-06-16: `pnpm --filter @kiskadee/react-components run build`
- 2026-06-16: `pnpm --filter @kiskadee/showcase build`
- 2026-06-16: Browser validation on `/card` with Material Design 3 by Google confirmed static
  Card `shadow="s:lg:3"` computes Elevation 5, CardAction `shadow={true}` computes Elevation 1 at
  rest, disabled computes zero shadow, and loaded CSS exposes hover as Elevation 2 plus pressed as
  zero shadow.
- 2026-06-16: Added `preserveBorderWithShadow` to Card and CardAction. Browser validation confirmed
  `false` applies the `k-crd-b` structural class only when shadow is active, keeps border width,
  makes border color transparent, and does not add inline `borderColor`; with static shadow off,
  the schema border color remains visible.
- 2026-06-16: Added Card schemas to iOS 26 by Apple and Fluent 2 by Microsoft so `/card` can be used
  to test their shadow catalogs. iOS exposes `s:sm:1`, `s:md:1`, `s:lg:1`, `s:lg:2`, and `s:lg:3`;
  Fluent Microsoft exposes `s:md:1`.
- 2026-06-17: Fixed `/card` Showcase overlay Buttons to use a manifest-supported Button profile.
  Validation confirmed Fluent Microsoft CTAs now use `s:md:1` + `primary/high` instead of the
  unsupported `primary/medium` small button; iOS Apple CTAs use supported `s:md:1` and remain
  visible; Material Google keeps a positive text/button gap in the card examples.
