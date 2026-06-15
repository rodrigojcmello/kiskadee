# Cursor Policy

## Decision

Kiskadee components must not use `cursor: pointer` only because they are clickable.

The hand cursor is a web convention that primarily belongs to links. Kiskadee is a
cross-platform design-system framework, so generic controls should not rely on a
browser-specific cursor convention to communicate interactivity.

## Rule

- Do not apply `cursor: pointer` to buttons, switches, tabs, card actions, menu items, or other
  generic clickable controls.
- Use `cursor: pointer` only for native link semantics, such as an `a` element with navigation
  intent, or a component that intentionally renders as a link.
- On pointer devices that support hover, the hover visual state is the primary affordance that tells
  users an element can be interactive or clickable. Do not rely on the hand cursor for that signal.
- Interactive components should communicate affordance through their state model, such as hover,
  pressed, focus, selected, disabled, motion, and activation feedback.
- Static components must not gain an interactive cursor. If they also do not own interaction, they
  should not project interactive visual states such as hover.
- If a component can be rendered inside an ancestor that sets `cursor: pointer`, the component root
  may set `cursor: default` to neutralize inherited link affordance.
- `cursor: text` remains appropriate for editable text surfaces.
- `cursor: not-allowed` for disabled or read-only states is a separate unavailable-state policy and
  may be used when the component already mirrors unavailable semantics visually.

## Interaction State Scope

Generated native interaction selectors must be scoped by `-n`, exposed in code as
`stateActivator.nativeInteraction`.

```css
/* Native interaction state: requires native interaction scope. */
.token.-n:hover { ... }

/* Projected interaction state: requires explicit activator. */
.token.-h.-a { ... }
```

- `-n` means the element or state owner is allowed to react to native pseudo states such as `:hover`,
  `:active`, and `:focus-visible`.
- `-a` means a projected state is being explicitly activated by runtime classes.
- `-i` keeps its existing interaction/ref meaning and must not be reused as the native-state scope.
- Interactive components should add `-n` to the state owner that receives native pseudo states.
- Static components must not receive `-n`; carrying generated state classes in the visual bucket must
  not make them hoverable, pressable, focusable, or selectable by accident.
- `disabled` and `readOnly` remain projected unavailable states. They do not depend on `-n`.

## Component Work

When creating or reviewing a component, treat cursor behavior as part of the component contract:

- decide whether the component is static, interactive, editable, link-like, disabled, or read-only;
- keep clickable controls on the default cursor unless they render true link semantics;
- avoid using cursor changes as the only signal that an element can be activated;
- use hover styling only when the component or element owns an interaction affordance;
- add `-n` only when the component or element owns native interaction states;
- document any component-specific cursor inheritance guard in the component's definition.
