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

## Component Work

When creating or reviewing a component, treat cursor behavior as part of the component contract:

- decide whether the component is static, interactive, editable, link-like, disabled, or read-only;
- keep clickable controls on the default cursor unless they render true link semantics;
- avoid using cursor changes as the only signal that an element can be activated;
- use hover styling only when the component or element owns an interaction affordance;
- document any component-specific cursor inheritance guard in the component's definition.
