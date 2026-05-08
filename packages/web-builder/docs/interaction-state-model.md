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
- **Projected state classes** are the compact Kiskadee runtime/generated state classes from
  `projectedStateActivator`, such as `.-h`, `.-f`, `.-s`, and `.-v`.
- **Selector/effect meta classes** are compact classes that modify selector behavior or opt into
  effects, such as `.-a`, `.-i`, and `.-e`.
- **Forced state** is one use of projected state classes: a showcase or snapshot can opt into a
  state class to simulate an interaction state without relying on browser pseudos.
- **State scope owner** is the element that carries a component state for styling. It is not
  necessarily the DOM element that receives the native event. For composed controls, it is usually
  the smallest stable ancestor that represents the component state and contains every child that
  needs to react to that state.

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
- TextField can project focus, filled, disabled, and read-only state on the field scope owner while
  child selectors react through that ancestor.

Generated style-key CSS should target native pseudos and projected classes, not headless `data-*`
helpers. Kiskadee structural Sass should prefer projected classes on the state scope owner. `data-*`
selectors are exceptional and should only be used when they are intentionally part of a component's
public structural contract.

## Projected State Classes

Projected classes come from `projectedStateActivator` in `@kiskadee/core`. The combined
`stateActivator` export keeps these state classes together with selector/effect meta classes for
existing runtime call sites:

- `-h`: hover
- `-p`: pressed
- `-s`: selected
- `-f`: focus
- `-d`: disabled
- `-r`: read-only
- `-v`: filled / has value
- `-a`: activator gate for projected state selectors
- `-i`: interactive anchor for native parent-to-child selectors
- `-e`: shadow/elevation effect activator, not an interaction state

The projected state keys are intentionally separate from the meta classes:

- Projected states describe component or interaction state: hover, pressed, selected, focus,
  disabled, read-only, and filled.
- Meta classes modify selector behavior or opt into effects: activator, interactive anchor, and
  shadow/elevation.

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

Style keys encode whether state belongs to the generated class itself or to a parent/scope owner.
This distinction is central to component hierarchy:

- Use direct/inline state when the element owns the state.
- Use reference state when the element depends on a parent or component scope state.
- A child element whose visual state changes because its parent component is hovered, focused,
  selected, disabled, read-only, filled, or otherwise active should use reference state.

### Inline Keys (`--`)

Inline keys apply state to the generated class itself. They are correct only when that element is the
state owner.

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

Do not use inline state for a child element that is merely reacting to a parent/component state. For
that case, author the schema value as a reference so the generated key uses `==`.

### Reference Keys (`==`)

Reference keys apply child styles from parent or component scope state.

```txt
property==state__value
```

The state lives on the state scope owner and the generated class belongs to the child:

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

In schema terms, a color value with `{ ref: ... }` means "this child style depends on a referenced
ancestor/scope state." That reference is what produces a `==` key and allows a component to project
state once on the state scope owner instead of duplicating state classes across every child.

## State Hierarchy

State placement follows the hierarchy of ownership, not the native event target:

- If an element owns the state and the style applies to itself, use inline state (`--`) and place the
  projected class on that element.
- If a child reacts to a parent/component state, use reference state (`==`) and place the projected
  class on the state scope owner.
- If a component is composed of multiple internal elements, default the state scope owner to `e1`
  unless a smaller stable wrapper owns the state without affecting unrelated siblings.
- If state belongs to a repeated item, such as one tab trigger or one select option, the item is the
  scope owner rather than the root collection.
- If an affected element is outside the scope owner's DOM subtree, such as a portal, the component
  needs an explicit projection strategy for that external scope.

Examples:

- Button hover/pressed/selected state belongs to the button root (`e1`). Label/icon styles that
  depend on that state should use reference keys and selectors from `e1`.
- TextField focus is received by the input, but the focused field state belongs to the field scope
  owner (`e1`) because label, shell, input, indicator, and message can all react to it.
- Tabs selected state belongs to each tab item/trigger scope, not to the global tabs root, because
  only one repeated item and its descendants should receive selected styling.

## Component Applications

The first migration pass established these component decisions:

### TextField

- The field root (`e1`) is the state scope owner.
- Focus can originate in the input (`e4`), but visual state is projected to `e1`.
- Filled, disabled, and read-only can remain exposed as headless semantic `data-*` helpers, but
  Kiskadee generated CSS and structural Sass should use projected classes on `e1`, such as
  `.-v.-a`, `.-d.-a`, and `.-r.-a`.
- Descendant slots that react to field state should use reference keys, not self-state classes.
- Native `:focus-visible` can remain on the input when the style belongs to the input itself.
- Hover should stay native when possible; `-i` on `e1` is the parent-to-child native hover anchor,
  not a signal to force hover through JavaScript.

### Button

- The button root (`e1`) is both the native interactive element and the state scope owner.
- Label/icon styles that react to root hover, pressed, selected, or disabled state should use
  reference keys from `e1`.
- Runtime hover and pressed styling should preserve native pseudos. Projected state classes are for
  forced, controlled, or non-native states.
- `useStateProjection` is not required unless a future Button behavior creates real composed state
  that originates outside the root.

### Tabs

- Selected state belongs to each tab trigger/item scope, not to the collection root.
- In the current styled Tabs structure, the trigger (`e2`) is the selected state scope owner.
- Label (`e3`) and icon (`e4`) selected styles should use reference keys such as
  `==selected:rest`.
- The trigger carries `-s`, `-a`, and `-i`; label and icon should not receive selected or activator
  classes directly.

### Hook Adoption

Use `useStateProjection` when real component state must be projected to a slot different from where
that state originates, or when a headless primitive needs to merge semantic attributes with an
external projection config.

Do not introduce the hook just to mirror native hover, active, or selected behavior when the schema
and runtime already have a clear state scope owner.

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
- Child classes should only receive their own projected state classes when the child owns that state.
  If the child reacts to a parent/component state, the generated selector should come from a reference
  key and target the child from the scope owner.

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
- Project component state on the state scope owner, usually `e1` for composed components.
- Use `e1`, `e2`, `e3`, and later slots as the stable slot names for any state projection target API.
- Prefer shared runtime helpers for resolving projected state classes so Button, Tabs, TextField, and
  future components do not drift.
- In structural Sass, prefer selectors from the state scope owner to descendants. Avoid adding
  duplicate `data-*` and projected selectors for the same Kiskadee-owned state unless a migration or
  public structural contract explicitly requires both.
