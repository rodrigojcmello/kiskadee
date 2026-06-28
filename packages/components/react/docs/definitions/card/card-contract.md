# Card Contract

This document records the current styled React `Card` and `CardAction`
contract. It is the durable source for component behavior; implementation and
showcase code should follow this model.

## Scope

`@kiskadee/react-components` exports two Card components:

- `Card`: a static visual container that renders a `div`.
- `CardAction`: an interactive container that renders a native `button`.

`Card` is for grouping content. It does not add an interactive role and should
not be used as a clickable element by attaching ad hoc handlers to the static
container.

`CardAction` is for cases where the card itself is the action target. Because it
renders a native button, it owns keyboard activation, pointer activation, focus,
disabled behavior, and semantic button accessibility.

`CardAction` follows the Kiskadee cursor policy for generic controls: it uses the
default cursor, not `cursor: pointer`. Interactivity should be communicated by
hover, pressed, focus, disabled, and shadow states. Disabled CardAction
instances may use the unavailable-state cursor.

## Visual Props

Card visuals are selected through the normal Kiskadee component axes:

- `intent`: public semantic surface family, currently including `neutral` and
  `primary` in first-party presets that expose Card colors.
- `emphasis`: own-surface strength, such as `low`, `medium`, `high`, and
  `highest`.
- `radius`: local shape override. Current public values are `rounded` and
  `square`; `pill` is outside the current Card contract.
- `shadow`: static or stateful elevation, depending on component and schema
  support.
- `preserveBorderWithShadow`: local React composition prop that controls whether
  a Card keeps its border when a shadow is active.

`Card.shadow` accepts `boolean | ElementSizeValue`. A boolean chooses the
component default shadow behavior; an explicit size value selects a static
shadow level from the generated catalog.

`CardAction.shadow` is boolean because the interactive component follows the
component's stateful shadow recipe.

## Border And Shadow

Card borders and shadows are separate visual concerns.

By default, a preset may define both border and shadow styling. Consumers can
set `preserveBorderWithShadow={false}` when a raised Card should drop the
border and rely on elevation instead.

This border removal is a composition prop, not a schema axis. It exists because
border preservation is a local rendering choice for the Card instance, while the
schema still owns the generated border and shadow tokens.

## CardAction State

`CardAction` supports controlled and uncontrolled selected state:

- `controlState`
- `defaultControlState`
- `onControlStateChange`

When `CardAction` represents a selected card, it exposes the selected state
through `aria-pressed`.

Use selected state only when the card itself is the selectable item. Do not make
`CardAction` selected only because a child control inside the card is on. In
that composition, the child control owns the selected/checked state and the
parent card may still use hover, pressed, focus, and shadow feedback to
communicate that the card is clickable.

`interactionLocked` blocks activation without applying disabled or read-only
visual states. It is for temporary interaction gates, such as async work in
flight.

## Showcase Surface Usage

When Showcase examples need real Card surfaces, they should render real
`Card`/`CardAction` instances instead of local hardcoded surface wrappers.

For visual background pickers, the color source is the generated schema, not
CSS and not a local tonal-scale JSON:

```txt
packages/showcase/public/build/<design-system-key>/schema.json
components.card.elements.e1.palettes[segment][theme].boxColor[intent][emphasis].rest
```

`manifest.json` may be used to check whether a component supports the requested
intent, emphasis, and state. It is not the color source.

If two semantic Card combinations resolve to the same visible background, a
picker should show one visual option instead of duplicate swatches. For example,
in the current light theme, `neutral.low` and `primary.low` may both resolve to
the same white/base surface.
