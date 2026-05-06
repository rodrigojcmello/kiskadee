# Control State Effects

Kiskadee treats `controlState`, for example `selected`, and interaction effects, for example
stateful `borderRadius`, as separate opt-in concerns.

- `controlState` is a semantic toggle state that is activated by the runtime, such as
  `controlState={true}` on React components.
- Effects are optional, component-level features and must only be applied when the consumer
  explicitly opts in, such as `radiusEffect={true}` or `shadow={true}`.

This distinction matters because some Design Systems, such as Material Design 3, author
selected-specific interaction effects like animated corners under `effects.borderRadius.selected`.
Those effects must not automatically activate just because `controlState` is on.

Rule: interaction keys under `selected:*` remain effects and stay inside the element `e` buckets in
`core.kiskadee.json`. They must never be moved into the control-state field (`l`).

Practical implication for consumers: if a DS wants selected + animated corners, the component must be
rendered with both `controlState={true}` and `radiusEffect={true}`.
