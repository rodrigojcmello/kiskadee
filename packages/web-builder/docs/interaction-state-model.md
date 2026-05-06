# Interaction State Model

Kiskadee represents interaction states through three related but distinct channels:

1. Native and semantic state exposed by the platform.
2. Optional headless `data-*` helpers for semantic/component state.
3. Compact projected state classes emitted and consumed by the Kiskadee styling system.

This distinction keeps headless primitives useful outside Kiskadee styling while preserving compact,
optimized selectors for generated CSS and showcase/static previews.

## Terminology

- **Native state** is owned by the browser or accessibility semantics, such as `:hover`,
  `:active`, `:focus-visible`, `:read-only`, native `disabled`, and ARIA state.
- **Headless semantic helpers** are optional `data-*` attributes on headless primitives for state
  that is useful to consumers and is not always expressible as one native pseudo on the styled
  element, such as `data-filled`, wrapper-level `data-focused`, or `data-selected`.
- **Projected state classes** are the compact Kiskadee runtime/generated classes from
  `stateActivator`, such as `.-h`, `.-f`, `.-s`, and `.-a`.
- **Forced state** is one use of projected state classes: a showcase or snapshot can opt into a
  state class to simulate an interaction state without relying on browser pseudos.

Do not treat every projected state as showcase-only. Styled runtime components can also project real
runtime state into these classes when a parent, child, or wrapper needs to receive state-driven CSS.

## Ownership

- `@kiskadee/react-headless` owns semantics, accessibility, native attributes, ARIA attributes, and
  any intentionally public `data-*` state helpers.
- `@kiskadee/react-components` owns Kiskadee visual integration and is responsible for applying
  `stateActivator` classes to styled elements.
- `@kiskadee/web-builder` owns style-key parsing and selector generation for native and projected
  state selectors.

Headless components should not emit `stateActivator` classes. Those classes are an internal,
optimized styling vocabulary for Kiskadee generated CSS and styled runtime components.

## `data-*` vs. `stateActivator`

Use `data-*` when the state is semantic/component information that a headless consumer can reasonably
depend on. Examples:

- TextField can expose `data-filled` because filled is content state, not a browser interaction
  pseudo.
- TextField can expose wrapper-level `data-focused` when the compound field needs to identify that
  focus is inside the field rather than on one specific wrapper.
- Select or Tabs can expose selected/focused helpers when the rendered element is a custom ARIA
  primitive and the state is useful outside Kiskadee styling.

Use `stateActivator` classes when the state is part of Kiskadee's optimized styling pipeline.
Examples:

- Button projects `selected`, `disabled`, or forced visual status classes in the styled component,
  while the headless button keeps native button semantics.
- Tabs projects `.-s.-a` for selected styling while still using `aria-selected` for accessibility.
- TextField can combine `data-focused`/`data-filled` structural selectors with `.-f.-a` projected
  selectors so real component state and preview/forced state share the same visual path.

Generated style-key CSS should target native pseudos and projected classes, not headless `data-*`
helpers. Structural Sass may use `data-*` helpers when those helpers are part of a component's
headless/structural contract.

## Projected State Classes

Projected classes come from `stateActivator` in `@kiskadee/core`:

- `-h`: hover
- `-p`: pressed
- `-s`: selected
- `-f`: focus
- `-d`: disabled
- `-r`: read-only
- `-a`: activator gate for projected state selectors
- `-i`: interactive anchor for native parent-to-child selectors
- `-e`: shadow/elevation effect activator, not an interaction state

The activator gate prevents projected state selectors from applying accidentally. A forced hover
selector uses both the state class and the activator class:

```css
/* Native branch */
.myClass:hover {
  /* ... */
}

/* Projected/forced branch */
.myClass.-h.-a {
  /* ... */
}
```

## Style Key Conventions

### Inline Keys (`--`)

Inline keys apply state to the element itself.

```txt
property--state__value
```

Examples:

```txt
textColor--hover__...
borderColor--selected:hover__...
```

Inline native selectors use native pseudos when available and do not include `-a`:

```css
.abc:hover {
  color: red;
}
```

Inline projected selectors include all projected state classes plus `-a`:

```css
.abc.-h.-a {
  color: red;
}

.abc.-s.-h.-a {
  color: red;
}
```

### Reference Keys (`==`)

Reference keys apply child styles from parent state.

```txt
property==state__value
```

The state lives on the parent and the generated class belongs to the child:

```txt
background==hover__...
```

Native parent selectors use the interactive anchor `-i`, native pseudos, and any non-native state
markers:

```css
.-i:hover .abc {
  background: red;
}

.-i:hover.-s .abc {
  background: red;
}
```

Projected parent selectors use the activator gate `-a` plus projected state classes:

```css
.-a.-h .abc {
  background: red;
}

.-a.-s.-h .abc {
  background: red;
}
```

## Generation Rules

- Rest state emits a base class selector with no state suffix.
- Native branches use pseudos from `InteractionStateCssPseudoSelector` when available.
- Native inline branches never append `-a`; `-a` gates only projected selectors.
- Native reference branches use `-i` as the parent interactive anchor; they do not use `-a`.
- Non-native state markers, such as selected, can be added to native branches when combined with a
  native pseudo.
- Projected branches include all projected state classes and are gated by `-a`.
- Disabled can always emit a projected `-d` + `-a` variant, even when general forced state emission is
  disabled.

## Forced State Emission

Forced state emission exists primarily for showcase and static snapshots. It lets a consumer display
a component in a state such as hover or focus without relying on browser interaction.

- Flag: `ENABLE_FORCED_INTERACTION_STATES`
- Location: `packages/web-builder/src/run-build.ts`
- Default: `true`

The flag controls extra projected selector emission. It does not make `stateActivator` a showcase-only
concept; the styled runtime can also use the same compact classes to project real component state.

## Component Guidance

- Keep headless primitives free of Kiskadee-specific `stateActivator` classes.
- Add headless `data-*` helpers only when they are semantic, useful outside Kiskadee styling, and
  intentionally part of the headless DOM contract.
- Keep Kiskadee projected class composition inside `@kiskadee/react-components`.
- Prefer shared runtime helpers for resolving projected state classes so Button, Tabs, TextField, and
  future components do not drift.
- In structural Sass, combine `data-*` helpers and projected classes only when both channels are
  intentionally supported, such as real compound state plus preview/forced state.

