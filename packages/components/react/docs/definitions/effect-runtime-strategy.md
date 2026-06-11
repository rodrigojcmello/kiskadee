# Effect Runtime Strategy

Kiskadee effects should be modular. A component should not pay runtime, DOM, or dependency cost for
an effect that is not present in the generated schema/class map.

This document defines the effect-specific runtime rules. For the broader styled React component
shape that hosts effects and features, see
[`component-architecture.md`](./component-architecture.md).

Some effects are pure styling concerns and can be consumed directly through generated classes. Other
effects require extra runtime behavior, auxiliary DOM, gesture coordination, or lazy-loaded code.
Those effects must stay isolated from the component's core path.

## Runtime Cost Rule

When an effect is absent, the component must render its cheapest core implementation.

The core path should avoid:

- extra DOM created only for the effect;
- effect-specific hooks;
- effect-specific runtime state;
- effect-specific dependencies;
- eager imports of effect implementation modules.

A small availability check against the resolved class map is acceptable. The check decides whether
the effect path is needed.

## Lazy Effect Rule

When an effect adds meaningful runtime cost, it should live behind a lazy module.

The public component may act as a lightweight gate:

- resolve the component's generated classes;
- check whether the effect bucket exists;
- render the core component when the effect is absent;
- lazy-load the effect implementation when the effect is present;
- use the core component as the lazy fallback.

This keeps preset-driven effects modular without adding public props only to protect runtime cost.

Pure CSS effects do not need this shape. For example, a shadow-like effect can stay as generated
classes when it does not require extra runtime behavior. A pointer activation-feedback effect is a
better fit for a lazy module because it owns event handling, runtime state, and auxiliary visuals.

## Static And Motion Paths

`static` and `motion` may consume the same public effect contract, but they should not be forced to
share the same runtime implementation.

If the static and motion paths differ in DOM ownership, measurement, transform ownership, drag,
gesture handling, or animation engine ownership, each path should have its own lazy effect module.

A shared lazy module should only be used when both paths truly share the same runtime structure.
Otherwise, separate lazies preserve isolation and avoid making one path load code for the other.

This follows the broader static-vs-motion vocabulary in
[`motion-strategy.md`](./motion-strategy.md): static is the lightweight component path, and motion
is the explicit runtime animation or gesture path.

## Effect Combination Rule

Lazy modules should be scoped to runtime structure, not blindly to every individual effect.

One effect may justify a dedicated lazy module when it introduces the first alternate DOM or runtime
shape for a component. That does not mean each future effect should create another full component
implementation for every static and motion combination.

If a component gains multiple combinable effects, avoid materializing the full matrix of
implementations:

- `static + effectA`
- `static + effectB`
- `static + effectA + effectB`
- `motion + effectA`
- `motion + effectB`
- `motion + effectA + effectB`

That pattern turns modular effects into duplicated runtime variants and becomes hard to keep
consistent.

When a second structural/runtime effect appears for the same component, prefer reevaluating whether
the component needs a broader effect runtime per path, such as:

- static core;
- motion core;
- static with visual/runtime effects;
- motion with visual/runtime effects.

Inside those broader effect runtimes, individual effects can stay schema-driven and independently
enabled by their generated buckets/classes. Effect-specific hooks, slots, or adapters should be
composed only when their corresponding bucket exists.

The current Switch thumb-shrink implementation is acceptable as the first structural effect because it
preserves the cheapest core path and isolates the drag-sensitive motion path. It should be treated as
a cautious first case, not as a permanent rule that every future Switch effect gets its own full
static and motion component pair.

If another component adopts a more general effect-runtime strategy for multiple effects, revisit the
Switch strategy and align it where appropriate. Kiskadee should improve this architecture through
new use cases and refactor older component-specific choices when consistency becomes more valuable
than keeping the first implementation shape.

## Switch Thumb Shrink Effect

`effects.thumbShrink.rest` is a state-based geometry effect. It should be lazy and path-specific when
implemented in React.

The public contract is owned by `Switch`:

- `effects.thumbShrink.rest.boxWidth`
- `effects.thumbShrink.rest.boxHeight`

The runtime implementation should stay modular inside `Switch`.

The external thumb element remains the stable carrier. It owns base geometry, measurement, travel,
and drag constraints. The thumb-shrink effect applies to an internal visual thumb node.

This prevents the off/rest visual reduction from changing the measured draggable width in the
internal motion path, while keeping the normal `scales` size as the selected/on size.

When `thumbShrink` is absent, `Switch` should not render the internal visual node or load the
thumb-shrink effect module.

React resolves the generated `e.ts` bucket before activating the thumb-shrink module.

The carrier keeps `classNames.e3` so the existing escape hatch remains attached to the public thumb
element. The internal visual receives generated visual classes, radius classes, and the `e.ts`
classes.

For the schema and generated artifact side of control-state effects, see
[`control-state-effects.md`](../../../../web-builder/docs/definitions/control-state-effects.md).
