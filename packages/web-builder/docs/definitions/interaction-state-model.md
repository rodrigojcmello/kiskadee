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
  element, such as `data-filled`, wrapper-level `data-focused`, or `data-selected`. These helpers
  describe component facts. They should not duplicate Kiskadee-owned runtime state markers unless a
  component intentionally exposes a public headless DOM contract.
- **Projected state classes** are the compact Kiskadee runtime/generated state classes from
  `projectedStateActivator`, such as `.-h`, `.-f`, `.-s`, and `.-v`. These classes activate the
  Kiskadee styling channel for that state.
- **Selector/effect meta classes** are compact classes that modify selector behavior or opt into
  effects, such as `.-a`, `.-i`, `.-k`, and `.-e`.
- **Forced state** is one use of projected state classes: a showcase or snapshot can opt into a
  state class to simulate an interaction state without relying on browser pseudos.
- **Focus state** is the Kiskadee focused component state. It is represented by `.-f` and means the
  component currently owns focus or is being shown in a forced focused state.
- **Highlighted focus** is the keyboard-visible / outline-worthy focus refinement. It is represented
  by `.-k` alongside `.-f`; `.-k` is not a standalone interaction state.
- **State scope owner** is the element that carries a component state for styling. It is not
  necessarily the DOM element that receives the native event. For composed controls, it is usually
  the smallest stable ancestor that represents the component state and contains every child that
  needs to react to that state.

Do not treat every projected state as showcase-only. Styled runtime components can also project real
runtime state into these classes when a parent, child, or wrapper needs to receive state-driven CSS.

## Ownership

- `@kiskadee/react-headless` owns semantics, accessibility, native attributes, ARIA attributes, and
  interaction state for headless primitives. For Kiskadee-owned primitives, it can also own compact
  `stateActivator` runtime classes when that avoids a duplicate styled-component state projection
  layer.
- `@kiskadee/react-components` owns Kiskadee visual integration, generated/base class composition,
  and any state projection that is specific to styled component integration.
- `@kiskadee/web-builder` owns style-key parsing and selector generation for native and projected
  state selectors.

When a headless primitive emits `stateActivator` classes, it must use the shared Kiskadee vocabulary
directly. It must not execute styled-package projection presets or accept arbitrary Kiskadee class
configuration from `@kiskadee/react-components`.

Kiskadee-owned headless primitives are allowed to be biased toward cross-platform Kiskadee contracts
when they emit `stateActivator` classes. For persistent binary state, expose
`controlState`, `defaultControlState`, and `onControlStateChange` as the public API. Platform-native
terms such as web `checked` stay adapter details at the DOM/native bridge.

## `data-*` vs. `stateActivator`

Use `data-*` when the state is semantic/component information that a headless consumer can
reasonably depend on outside the Kiskadee styling contract. Examples:

- TextField can expose `data-filled` because filled is content state, not a browser interaction
  pseudo.
- TextField can expose wrapper-level `data-focused` when the compound field needs to identify that
  focus is inside the field rather than on one specific wrapper.
- Select or Tabs can expose selected/focused helpers when the rendered element is a custom ARIA
  primitive and the state is useful outside Kiskadee styling.
- Switch may expose `data-focused` only if that attribute is intentionally kept as a public headless
  DOM contract. If the attribute only duplicates Kiskadee-owned state classes, prefer the compact
  activator vocabulary instead.

Use `stateActivator` classes when the state is part of Kiskadee's optimized styling pipeline.
Examples:

- Button projects `selected`, `disabled`, or forced visual status classes in the styled component,
  while the headless button keeps native button semantics.
- Tabs projects `.-s.-a` for selected styling while still using `aria-selected` for accessibility.
- TextField can project focus, filled, disabled, and read-only state on the field scope owner while
  child selectors react through that ancestor.
- Switch projects `controlState` to `.-s.-a` for selected/on styling. The internal web input may
  still use `checked` and `aria-checked`, but those names are adapter details, not the Kiskadee
  component contract.
- Switch can map a generic focused flag to `.-f` when `.-f` means simple focus. It must only add
  `.-k` when the internal input is focus-visible or the component is explicitly forced into
  highlighted focus.

Generated style-key CSS should target native pseudos and projected classes, not headless `data-*`
helpers. Kiskadee structural Sass should prefer projected classes on the state scope owner. `data-*`
selectors are exceptional and should only be used when they are intentionally part of a component's
public structural contract.

For focus specifically, keep simple focus and highlighted focus separate:

- `data-focused` or equivalent headless state can mean "this component currently contains DOM focus."
- `:focus-visible` means the platform thinks visible focus indication is appropriate.
- `.-f.-a` means "activate Kiskadee focused state now."
- `.-f.-k.-a` means "activate focused state with highlighted keyboard-visible focus treatment now."
  It may be used for forced showcase states, static previews, or runtime state that mirrors
  focus-visible behavior.

Do not use `.-k` without `.-f`. If a component needs both pointer focus and keyboard-visible focus,
model both pieces explicitly: simple focus activates `.-f`, while highlighted focus activates
`.-f.-k`.

## Projected State Classes

Projected classes come from `projectedStateActivator` in `@kiskadee/core`. The combined
`stateActivator` export keeps these state classes together with selector/effect meta classes for
existing runtime call sites.

- `-h`: hover
- `-p`: pressed
- `-s`: selected
- `-f`: focus
- `-d`: disabled
- `-r`: read-only
- `-v`: filled / has value
- `-a`: activator gate for projected state selectors
- `-i`: interactive anchor for native parent-to-child selectors
- `-k`: highlighted focus qualifier, exported as `stateActivator.focusVisible`; use it with `-f`
  for keyboard-visible / outline-worthy focus
- `-e`: shadow/elevation effect activator, not an interaction state

The projected state keys are intentionally separate from the meta classes:

- Projected states describe component or interaction state: hover, pressed, selected, focus,
  disabled, read-only, and filled.
- Meta classes modify selector behavior, qualify focus, or opt into effects: activator, interactive
  anchor, highlighted focus qualifier, and shadow/elevation.

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

Highlighted focus is represented as a qualified projected focus branch:

```css
/* Simple forced focus */
.myClass.-f.-a {
  /* ... */
}

/* Keyboard-visible / outline-worthy forced focus */
.myClass.-f.-k.-a {
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

For binary controls, `selected` is usually owned by the component state scope
owner rather than by every child slot. A Switch track or thumb that changes when
the root is selected should use a reference value in the `selected` submap so
the generated selector targets the child from the selected root:

```ts
boxColor: {
  neutral: {
    high: {
      rest: offTrack,
      selected: {
        rest: { ref: onTrack }
      }
    }
  }
}
```

This keeps the meaning as "selected root + resting interaction changes the
child." A direct value under `selected.rest` means the generated class itself is
the selected state owner.

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

## Native Pseudo Eligibility

Native pseudo selectors are only safe when they describe the same element that owns the native
state.

For inline keys, the generated class is the state owner, so a native branch such as `.abc:hover` or
`.abc:focus-visible` can be correct when that class is applied to the native interactive element.

For reference keys, the native branch targets the state scope owner through `-i`:

```css
.-i:hover .abc {
  background: red;
}
```

That branch must only be emitted for native pseudos whose meaning is reliable on the scope owner.
If the pseudo can match ordinary wrappers or otherwise does not prove that the component state is
active, the reference key must use only the projected branch:

```css
.-a.-r .abc {
  border-color: gray;
}
```

`readOnly` is the motivating case. CSS `:read-only` is broad and can match common wrapper elements
that are not user-editable, even when the component's input is not actually read-only. A selector
such as `.-i:read-only .abc` can therefore leak read-only styling into a normal rest field.
Generated parent-reference read-only styles must rely on the projected `.-r.-a` state instead.

The same rule applies to any future state whose native pseudo is not a trustworthy signal on the
state scope owner. Do not add a native parent-reference branch just because the platform exposes a
pseudo selector with the same name.

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
- Filled, disabled, and read-only can remain exposed as headless semantic `data-*` helpers only if
  they remain public headless DOM contracts. Kiskadee generated CSS and structural Sass should use
  projected classes on `e1`, such as `.-v.-a`, `.-d.-a`, and `.-r.-a`.
- TextField tracks simple focus and highlighted focus separately. The styled projection maps
  `focused` to `.-f` and `focusVisible` to `.-k`, gated by `.-a`.
- Focused field layout/state uses simple `.-f.-a`. Floating-label promotion and empty/focused
  geometry should not require `.-k`.
- Shell outline and underline emphasis use highlighted focus selectors such as `.-f.-k.-a` because
  they are visible focus treatments, not the simple focused state.
- TextField caret color currently consumes `--k-focus-color` directly on the native input. That
  contract is independent from the shell outline selector and should not be used as evidence that
  every focused field style needs `.-k`.
- Current TextField still receives `TEXT_FIELD_STATE_PROJECTION` through `HeadlessTextField.Root`.
  Treat that as a transitional exception tracked by the TextField projection-boundary technical debt,
  not as a pattern to copy into new headless primitives.
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
- Forced focus examples that need to show the outline should use highlighted focus:
  `.-f.-k.-a`. Simple `.-f.-a` documents focused state without necessarily drawing an outline.
- Styled Button `status="focus"` represents the highlighted showcase/static focus state and emits
  both `-f` and `-k`, gated by `-a`.
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
that state originates and a generic projection helper is genuinely smaller or clearer than direct
class composition.

Headless primitives must not execute external styled-package projection config. They can either
compose shared `stateActivator` classes directly for Kiskadee-owned runtime state, or expose
semantic attributes through local helpers when those attributes are intentionally public.

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
- Production web-builder output always emits projected branches. They are part of the runtime
  styling contract for composed components, not optional showcase-only selectors.
- Schema `focus` style keys currently emit simple focus projected branches with `-f` and `-a`.
  Highlighted focus (`-f.-k.-a`) is a component-authored structural selector unless a future schema
  state explicitly models highlighted focus.
- Disabled and read-only also emit projected `-d` / `-r` + `-a` variants through the same projected
  selector channel.
- Child classes should only receive their own projected state classes when the child owns that state.
  If the child reacts to a parent/component state, the generated selector should come from a reference
  key and target the child from the scope owner.

## Projected State Selector Emission

Projected state selector emission was originally introduced for showcase and static snapshots. The
early mental model was "force a state with classes," so the builder used a flag named
`ENABLE_FORCED_INTERACTION_STATES` and lower-level transformer parameters named `forceState`.

That model is now too narrow. The same selectors are required by real runtime components whenever
state lives on a scope owner and generated styles need to reach descendants or non-native states:

- TextField projects focus, filled, disabled, and read-only state from the component root so shell,
  label, input, and support slots can stay visually coherent.
- Switch projects control state (`.-s.-a`), forced visual status, focus, highlighted focus, disabled,
  and read-only state from its root so track, thumb, and state slots react through one owner.
- Tabs and other composed controls project selected or custom state that has no reliable native
  pseudo on every reacting child.

Because of that, production builds no longer expose an `ENABLE_FORCED_INTERACTION_STATES` switch.
Projected selector branches are emitted as normal CSS artifacts. Public component props such as
`controlState` and `status` should activate those branches instead of requiring consumers to pass raw
state activator classes.

The `forceState` name may still appear in lower-level transformer APIs and tests as historical
terminology. Treat it as an implementation detail for comparing native-only output against projected
selector output, not as a design-system-level feature flag.

For focus, forced examples should choose the intended level:

- `.-f.-a` for simple focused state.
- `.-f.-k.-a` for highlighted keyboard-visible / outline-worthy focus.

## Component Guidance

- Keep Kiskadee-owned runtime state in one vocabulary. Prefer shared `stateActivator` classes over
  duplicating the same state through both `data-*` and compact classes.
- Add headless `data-*` helpers only when they are semantic, useful outside Kiskadee styling, and
  intentionally part of the public headless DOM contract.
- Do not let headless primitives execute styled-package projection presets. If the headless layer
  owns Kiskadee state classes, it should compose the shared vocabulary directly.
- Keep simple focus and highlighted focus separate: `focused` can map to `.-f`, while keyboard
  visible / outline-worthy focus maps to `.-f.-k`.
- Project component state on the state scope owner, usually `e1` for composed components.
- Use `e1`, `e2`, `e3`, and later slots as the stable slot names for any state projection target API.
- Prefer shared runtime helpers for resolving projected state classes so Button, Tabs, TextField, and
  future components do not drift.
- In structural Sass, prefer selectors from the state scope owner to descendants. Avoid adding
  duplicate `data-*` and projected selectors for the same Kiskadee-owned state unless a migration or
  public structural contract explicitly requires both.
