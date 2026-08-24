# New Component Starting Definition

Status: living definition.

Use this document before starting a new Kiskadee component. Its purpose is to keep the first
implementation focused, reviewable, and easy to tune. Add to this definition whenever a new
component teaches us a durable rule.

## Goal

A new component should start with the smallest honest contract that can represent the intended
component well. Early implementation work should favor visual fidelity, artifact correctness, and
clear schema shape over broad option coverage.

This definition is cross-package because a new component can touch `packages/headless/react`,
`packages/components/react`, `packages/presets`, `packages/web-builder`, and `packages/showcase`.
Package-specific implementation details should stay local when they are only local, but the starting
recipe belongs here.

## Required Starting Decisions

Before implementation starts, decide and record:

- whether the component is truly new or should be a variant of an existing component;
- the canonical component name;
- the element map and each element's meaning;
- the accessible headless contract that must exist before styling;
- which themes are in scope;
- whether radius modes are in scope;
- which interaction and control states are required for the first usable version;
- which preset is the visual reference for the first implementation;
- which showcase scenarios are required for validation.

The initial styled schema should start from the default Kiskadee shape:

```ts
variant: 'standard';
mode: 'base';
intent: 'neutral';
emphasis: 'medium';
```

This default shape is a starting grammar, not a requirement to design every possible option before
the component exists.

## Headless First

Create or update the headless primitive before styling when the component owns interaction,
accessibility, native form behavior, keyboard behavior, or semantic state.

The headless layer should own:

- roles, ARIA attributes, and native semantics;
- focus and keyboard behavior;
- controlled and uncontrolled state contracts when relevant;
- event composition;
- state projection hooks or helpers that can be reused by styled components.

The styled React component in `packages/components/react` should compose the headless primitive and
own generated class consumption, structural CSS, visual layout, and design-system presentation.

## Styled React Package

When the component belongs in `@kiskadee/react-components`, keep these package-local expectations in
scope:

- React component internals should follow the canonical package architecture in
  [`component-architecture.md`](../../packages/components/react/docs/definitions/component-architecture.md);
- public exports must stay stable from `src/index.ts`;
- runtime components should consume generated classes and CSS variables instead of inventing token
  values;
- generated artifacts come from schema and web-builder, while React components compose those
  artifacts;
- `className` should merge into the root slot without replacing generated classes;
- per-slot `classNames` should remain explicit and typed;
- root IDs, input IDs, labels, and accessibility props must have a clear ownership model;
- public props for `variant`, `mode`, `intent`, `emphasis`, size, radius, and motion should only be
  exposed when the component actually supports those options.

Use this default file layout unless the component has a concrete reason to split extra runtime
helpers:

```txt
src/<Component>/
  <Component>.tsx
  <Component>.types.ts
  <Component>.class-names.ts
  <Component>.structural.scss
  index.ts
```

## Theme Scope

Start new components with light theme only unless the task explicitly requires dark theme.

Rationale:

- A brand-new component usually needs fine visual tuning more than broad theme coverage.
- Light-only schema keeps the first preset less noisy and easier to review.
- Dark theme can be added later once the component's structure, state model, and generated artifacts
  are stable.

Do not add dark palettes mechanically. Add dark theme only when there is a clear reference, a real
consumer need, and enough confidence that the component's element map will not immediately change.

## Radius Scope

Do not assume every new component needs `rounded`, `pill`, and `square`.

Before adding radius modes, decide whether:

- the design-system reference actually supports radius variation;
- the component can change radius without breaking its meaning or geometry;
- square mode is visually and structurally valid;
- pill mode is a meaningful option or simply identical to rounded for that component.

If radius variation is not an intentional part of the component, keep a single radius behavior and
document why the extra modes were deferred.

## Intent And Emphasis

The first color branch should be `neutral.medium`.

Treat this as a default, not as a complete design matrix:

- a component starts with the single component intent `neutral`;
- a component starts with the single emphasis level `medium`;
- extra Layer 3 component intents should describe product or component meaning, not raw color
  families;
- extra Layer 3 component intents should not be added only to name internal state colors;
- raw semantic colors such as `redLike` or `greenLike` are preset mappings, not public component
  intent names;
- extra emphasis levels such as `highest`, `high`, `low`, and `lowest` should be added only when
  the design has real visual hierarchy or a real no-own-surface treatment for them.

For binary controls, selected/on and unchecked/off are control states inside the same intent. A
default Switch should remain `neutral.medium`; it can still use Layer 2 global `primary` directly
for selected/on activation without exposing a separate Layer 3 `primary` component intent.

Badge is an intentional exception with a metadata vocabulary: `informative`, `positive`, `warning`,
`severe`, `destructive`, and `important` communicate product meaning rather than raw color names.
Chip remains narrower with `neutral` and `primary`; its selection is still an interaction state,
not a separate intent.

Other intents and emphasis buckets belong in the follow-up decision pass, not in the default
component birth.

## Element Map

Every new component must define a canonical element map before schema authoring starts.

For each element, document:

- its short key, such as `e1`, `e2`, or `e3`;
- its required schema `name`, written as the first property inside the element object;
- its semantic role;
- whether it is required or optional;
- whether it owns layout, generated visuals, text, native semantics, or state projection;
- which generated properties it is allowed to consume.

The short key is the technical slot identity used by artifacts and runtime APIs. The required
`name` is the human-readable layer label used while authoring and reviewing schema. Keep it short
and local to the component, for example `track`, `thumb`, `label`, `control`, or `button-text`.
Do not replace generated artifact keys or state-projection targets with `name`; those stay on
`e1`, `e2`, and later slots.

Avoid adding placeholder elements just because a future design might need them. Optional elements
are useful only when their expected purpose is already clear.

Do not create a styled schema contract for an element that is merely decorative, structural, or
present only to keep a numbered slot alive. A DOM wrapper can still be a valid headless or structural
slot when it owns native semantics, state projection, root `className`, or component composition.
When that happens, keep the schema contract narrow and non-visual, such as `name` only, instead of
adding generated style attributes by default.

Avoid using the component root to encode external visual spacing around the real component. Root
padding or margin can make a component carry layout decisions that should belong to its parent,
container, or surrounding composition. Add root spacing attributes only when the root itself is a
real visual or interactive surface and the spacing is part of that surface's intrinsic geometry.

## State Model

Define the state model explicitly.

At minimum, decide which of these states are required:

- `rest`;
- `hover`;
- `pressed`;
- `focus`;
- `disabled`;
- `pending`;
- `readOnly`;
- `selected`;
- `filled`.

Treat `hover` as an interaction affordance, not as decorative surface styling. On pointer devices
that support hover, the hover visual state is the signal that tells users an element can be
interactive or clickable. Static components should not project hover unless they own an explicit
interaction or inspection behavior.

Native pseudo states are gated by the native interaction scope class `-n`
(`stateActivator.nativeInteraction`). Add `-n` only to elements that own native interaction states
such as `:hover`, `:active`, or `:focus-visible`. Keep static surfaces without `-n`, even when they
share generated visual classes with an interactive companion.

Pending is a terminal projected state with no native pseudo. A component that projects pending must
remove its native interaction gate so omitted pending deltas continue to resolve from Rest instead
of leaking Hover or Pressed values.

For persistent binary controls, prefer the existing `selected` control state for checked/on visuals.
Do not encode persistent state as `pressed`; pressed is an interaction state.

For public component APIs, use `controlState`, `defaultControlState`, and `onControlStateChange` for
persistent binary state. This keeps the Kiskadee contract cross-platform; platform-native names such
as web `checked` are adapter details. The schema/style branch still remains `selected` because it
describes the visual state consumed when `controlState` is active.

Any component that accepts `controlState`, `defaultControlState`, or `onControlStateChange` must
also evaluate whether it needs `interactionLocked`. When present, `interactionLocked` blocks new
activation attempts without applying `disabled`, `readOnly`, or their visual states.

## Cursor Policy

Do not use `cursor: pointer` only because a component is clickable. Kiskadee keeps generic controls
on the default cursor so web output stays aligned with the cross-platform interaction model. Reserve
`cursor: pointer` for true link semantics, such as an `a` element with navigation intent.

For the durable rule, see [`cursor-policy.md`](./cursor-policy.md).

## Generated Class Consumption

A styled component should consume generated artifacts consistently:

- resolve the correct component branch from `classesMap`;
- normalize scale keys before reading `s`, `w`, `rr`, `rp`, or `rs` buckets;
- choose intent and emphasis classes from generated color buckets;
- project state through shared activator classes when generated CSS expects them;
- add `stateActivator.nativeInteraction` only to native interaction state owners;
- consume generated CSS variables directly in structural CSS when they are part of the contract;
- avoid local token fallbacks that hide missing generated values.

## Structural Sass

Before editing structural Sass/CSS in `packages/components/react`, read `STRUCTURAL-CSS.md`.

For new styled components:

- use `*.structural.scss` for structural source files;
- import the compiled `*.structural.css` from the component entry;
- use compact component-scoped structural class names;
- document variant or variant/mode branch letters near the structural CSS when branches exist;
- keep structural CSS focused on layout, geometry, DOM composition, motion plumbing, and rendering
  workarounds;
- do not encode semantic colors, tokenized spacing, or visual state values in Sass.

## Preset Scope

Use one reference preset as the first fidelity target.

The first preset should establish:

- the element map;
- the state coverage;
- the minimum scale/radius scope;
- the generated artifact shape;
- the showcase scenarios.

Additional presets should be added after the first preset has been validated end to end.

## Showcase Validation

A new component is not ready just because schema and runtime compile.

The first showcase pass should include the smallest set of scenarios needed to verify the contract:

- default interactive state;
- core visual states;
- disabled state;
- selected/checked state when relevant;
- selected-disabled state when relevant;
- label or text cases when the component supports visible text;
- no-visible-label or accessibility-only cases when relevant;
- size and radius controls only if those options are intentionally supported.

If a scenario reveals a schema or builder limitation, fix the actual contract or record a technical
debt item. Avoid hiding the limitation with local showcase CSS.

## Validation

Match validation to the blast radius:

- run formatting/checks for touched source files;
- run `pnpm --filter @kiskadee/react-components build` when React component source or structural
  Sass changes;
- run web-builder validation when class-map shape, schema consumption, or generated artifacts are
  involved;
- run `pnpm --filter @kiskadee/showcase build` when the component is exposed in the showcase;
- do not add or modify unit tests unless explicitly requested.

## What Next?

After the `standard.base.neutral.medium` version works end to end, decide which optional axes
deserve to exist.

Ask these questions before adding more surface area:

- Does the component need sizes beyond medium?
- Does the component need component intents beyond `neutral`?
- Does the component need emphasis levels beyond `medium`?
- Does the component need variants beyond `standard`?
- Does the component need modes beyond `base`?
- Does the component need motion or transition behavior?
- Can CSS own that motion, or does React need to coordinate measurement, layout, or state?
- Should the API offer both lightweight static and runtime-motion components?
- Which generated attributes should each element support?
- Which logic belongs in the headless primitive?
- Which logic belongs in the styled React component?
- Should any headless logic be extracted into a reusable hook, like `useStateProjection`?

For motion decisions, use `static` and `motion` as the default vocabulary. `static` means the
lightweight path without a dedicated animation engine; it may still use CSS transitions or direct
runtime measurement. `motion` means a runtime animation or gesture path, usually justified by
interruptible movement, spring behavior, drag, or other behavior CSS transitions cannot own well.
When both paths become public, prefer `Component` for the lightweight static path and
`ComponentMotion` for the explicit runtime-motion path. A lazy orchestrator may exist as a helper for
dynamic switching, but it should not be the canonical component contract. See
`packages/components/react/docs/definitions/motion-strategy.md`.

When extending a component after the first version, align the supported attributes per element before
changing the schema. Each `e<n>` slot should expose only the attributes that match its real job.
Avoid leaving element schemas broad or inherited by accident. For example, a headless root that
groups a label and an internal control may still be the correct state scope owner, but it should not
automatically own `boxWidth`, margin, padding, effects, or visual palettes. A hidden native input is
usually an internal semantic target; if it is represented in the schema at all, keep that contract
narrow and non-visual unless it becomes a real public surface.

When adding variants or modes, keep element names coherent across branches. For example, if `e2` is
the track in one Switch branch, another Switch branch should not use `e2` for unrelated content.

If a proposed variant needs a very different structure or a different element vocabulary, consider a
new component instead of a variant. Examples:

- `checkbox` should not be forced into `switch`;
- `navbar` should not be forced into `tabs`.

Variants should share enough component identity that a user can understand them as the same public
component with different presentations.

## Documentation Updates

When a new component changes a durable rule, update this document.

Use component-specific docs for local details, but promote repeated lessons here so the next
component starts from a clearer recipe.
