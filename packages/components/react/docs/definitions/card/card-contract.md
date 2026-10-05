# Card Contract

This document records the styled React `Card` and `CardAction` contract. It is the durable source
for component behavior; implementation and showcase code should follow this model. The
[surface ownership decision](../../../../../../docs/definitions/container-and-card-surfaces.md)
defines how their Rest backgrounds relate to Container.

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
hover, pressed, focus, pending, disabled, and shadow states. Disabled CardAction
instances may use the unavailable-state cursor.

Card and CardAction each keep one DOM root. Their Rest fill comes from the resolved Card artifact,
which incorporates the Container surface at build time. Neither renders a Container or loads its
artifact. A consumer can place a separate Container inside a static Card for a distinct internal
region.

Neither component adds content padding. Applications compose spacing through `Layout` or their
own content layout. CardAction resets native button padding to zero; this is browser normalization,
not a preset spacing value.

## Visual Props

Card visuals are selected through the normal Kiskadee component axes:

- `intent`: public semantic surface family, currently including `neutral` and
  `primary` in first-party presets that expose Card colors.
- `emphasis`: own-surface strength, such as `lowest`, `low`, `medium`, `high`,
  and `highest`.
- `radius`: local shape override. Current public values are `rounded` and
  `square`; `pill` is outside the current Card contract.
- `shadow`: static or stateful elevation, depending on component and schema
  support.
- `border`: Card or CardAction visibility override, independent of emphasis and shadow.
- `clipContent`: clips overflowing content to the component boundary. It adds no spacing. When the
  border is completely hidden, clipping also removes its geometry so a differently colored child
  region can reach the outer edge without a rim of the parent surface.

Static Card also accepts optional `neutralComplementary` and `primaryComplementary` surfaces when
the preset publishes them. The companion uses the base intent's border and frame. CardAction
continues to accept only intents with authored interactive state recipes.

`Card.shadow` accepts `boolean | ElementSizeValue`. A boolean chooses the
component default shadow behavior; an explicit size value selects a static
shadow level from the generated catalog.

`CardAction.shadow` is boolean because the interactive component follows the
component's stateful shadow recipe.

## Border And Shadow

Card borders and shadows are separate visual concerns.

On both Card and CardAction, omitted `border` follows `options.border.defaultMode` from the preset.
`"adaptive"` selects the preset's contextual boolean policy regardless of that default;
`true` enables the available recipe and `false` hides it. Adaptive decisions use segment,
theme, consumed surface context, base frame intent and emphasis. Shadow remains independent.

```tsx
<Card />
<Card border="adaptive" />
<Card border={false} />
<Card border />
<Card border={false} shadow />
<Card border shadow />
<CardAction border={false} shadow />
<CardAction border shadow />
```

The schema owns `options.border.defaultMode` and the contextual `options.border.adaptive`
map. Colors stay in palettes, width in scales and style in decorations. Builder publishes
Rest on/off classes and the adaptive decision in the palette-local `b` bucket, plus the
default mode in the Card artifact. React selects classes; it never computes contrast or
a border color. `border` cannot manufacture an unpublished stroke.

Neither component accepts `preserveBorderWithShadow`: replace suppression with `border={false}`.
For the preset default, omit `border`; to request the contextual policy explicitly, use
`border="adaptive"`. On CardAction, an adaptive false decision hides only the Rest border;
authored interaction deltas may still display a boundary. Explicit `border={false}` or the preset's
`defaultMode: never` suppresses border paint in every state. Shadow never changes that decision,
including states whose shadow recipe is off.

The former `flushContent` option is replaced by `clipContent` on both components. Content spacing
is always composed independently; clipping does not remove consumer-authored padding.

## CardAction State

`CardAction` supports controlled and uncontrolled selected state:

- `controlState`
- `defaultControlState`
- `onControlStateChange`

When `CardAction` represents a selected card, it exposes the selected state
through `aria-pressed`.

`status="pending"` is a terminal visual projection. On CardAction it remains
actionable and does not add busy, disabled, or other ARIA semantics; operational
pending behavior is currently owned only by Button.

Disabled takes precedence over Pending. Both terminal visual states suppress native interaction
styling and transient projected states. They also suspend the Selected visual marker while
preserving `controlState` and `aria-pressed`. The surface and descendant context use the authored
terminal output or Rest fallback together. Leaving the terminal state restores the Selected
appearance if the control is still selected. Focus indication remains independent of shadow.

Use selected state only when the card itself is the selectable item. Do not make
`CardAction` selected only because a child control inside the card is on. In
that composition, the child control owns the selected/checked state and the
parent card may still use hover, pressed, focus, and shadow feedback to
communicate that the card is clickable.

`interactionLocked` blocks activation without applying disabled or read-only
visual states. It is for temporary interaction gates, such as async work in
flight.

`interactionStateSource="bounds"` is an opt-in composition mode for cases where
another interactive control is visually layered over a `CardAction` while the
card remains the larger clickable surface. It keeps the normal button
semantics, click handling, selected state, `disabled`, and `interactionLocked`
contracts unchanged, but projects hover and pressed visual state while the
pointer is within the card bounds even if the browser hit-test lands on the
overlaid control. Use it only for these overlay compositions. The child control
still owns its own checked/selected state and interaction feedback.

Bounds mode observes the primary pointer and projects Pressed only while that pointer remains
inside the Card after starting a press there. Pressed suppresses Hover, including native hover
styling. Leaving the bounds clears Pressed until the same active pointer re-enters; releasing it,
cancelling it, leaving the window, or losing window focus ends the press. Pointer transitions to
another element in the same window do not clear the bounds state. Overlaid controls must be DOM
siblings rather than interactive descendants of the native button.

## Showcase Surface Usage

When Showcase examples need bounded Card surfaces, they should render `Card`/`CardAction`.
Continuous regions such as page bands and internal footers use `Container`; local CSS must not
invent their colors.

For visual background pickers, the color source is the generated schema, not
CSS and not a local tonal-scale JSON:

```txt
packages/showcase/public/build/<design-system-key>/schema.json
components.container.elements.e1.palettes[segment][theme][surfaceContext].boxColor[intent][emphasis].rest
```

`manifest.json` may be used to check whether a component supports the requested
intent, emphasis, and state. It is not the color source.

If two semantic Card combinations resolve to the same visible background, a
picker should show one visual option instead of duplicate swatches. For example,
in the current light theme, `neutral.low` and `primary.low` may both resolve to
the same white/base surface.
