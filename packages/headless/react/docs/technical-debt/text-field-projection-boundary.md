# TextField Projection Boundary

TextField still has a transitional projection boundary between
`@kiskadee/react-headless` and `@kiskadee/react-components`.

## Current State

The headless TextField computes real semantic state and uses the state
projection helper, while the styled React package still passes
`TEXT_FIELD_STATE_PROJECTION` through `HeadlessTextField.Root`.

This keeps the component working, but it lets a styled-package visual projection
preset cross into the headless package.

## Desired Boundary

The headless package should own semantic state only:

- hover;
- field-owned pressing, excluding independent controls and portalled content;
- focus;
- focus-visible;
- filled;
- disabled;
- read-only;
- slot props and data attributes that are useful without Kiskadee styling.

The styled package should own Kiskadee class projection:

- generated state activator classes;
- component element class composition;
- package-specific visual projection defaults.

TextField currently projects semantic Hover and Pressed rather than enabling native interaction
pseudos on its root. The projected branches govern both generated paint/effects and the structural
bottom indicator, preventing an internal action's ancestral `:active` match from pressing the field.

## Preservation Rules

The migration must preserve TextField's current focus split:

- simple focus projects focused state;
- highlighted/native focus-visible projects both focused and focus-visible
  state.

In current class terms, styled TextField maps simple focus to `-f -a` and
focus-visible to `-f -k -a`.

Do not collapse this into one focus state while moving the projection boundary.
