# Pending

`pending` is the interaction state for an action that was accepted and is still being processed.
It is distinct from `disabled`, `interactionLocked`, and progress presentation.

## Semantics

- `disabled` means an action is unavailable because a rule or precondition is not satisfied.
- `pending` means an available action was activated and its result is not complete yet.
- `interactionLocked` is the lower-level gate that blocks activation without adding visual or
  accessible meaning.
- `Progress` represents measurable completion. It is content/structure, not an interaction state.

`pending` is a global Kiskadee visual state. A component may author a sparse pending delta even when
its runtime does not yet expose operational pending behavior. `status="pending"` is the forced visual
projection for inspection and static previews; it must not invent async behavior.

## State Rules

- Pending is a terminal projected state with no native CSS pseudo.
- Transient native interaction branches must not leak through pending.
- Pending wins over Rest, Hover, Focus, and Pressed for properties it declares.
- Disabled wins when disabled and pending are both requested.
- Pending remains a sparse delta over Rest; omitted properties keep their Rest value.
- Pending must not be implemented as root opacity when a component contains feedback that needs to
  remain legible, such as a spinner or progress indicator.

## Button Contract

Button is the first component with operational pending behavior:

- `pending` implies `interactionLocked`.
- The consumer owns the async lifecycle and explicitly sets and clears `pending`.
- Pending blocks pointer, keyboard, click, and form-submit activation without using native
  `disabled` or `pointer-events: none`.
- Focus remains available and is preserved when the button enters pending.
- The button exposes `aria-busy="true"` and `aria-disabled="true"`.
- A real disabled state takes precedence and uses the existing disabled contract.
- `status="pending"` remains visual-only and does not set ARIA or block activation.

Pending content is compositional. A button can keep its label, replace it, use any icon through
`Button.Icon`, and optionally render `Button.Progress`. None of those children activates pending
implicitly.

## Progress Relationship

- Pending can exist without Progress.
- Standalone Progress can exist without pending.
- `Button.Progress` is allowed only while the Button is operationally pending or visually forced to
  pending.
- `Button.Progress` does not set pending on its parent.
- A progress indicator inside a Button is decorative. Announce measurable progress through a
  standalone Progress or external status when the percentage must reach assistive technology.

## Adoption

The schema and Web Builder understand pending globally. Components can adopt operational pending
behavior independently once their activation, focus, native semantics, and visual ownership are
defined. Until then, their support is limited to the forced visual `status` channel.
