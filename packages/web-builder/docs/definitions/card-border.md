# Static Card Border Compilation

Presets opt in through `components.card.options.border`, a boolean map scoped to
segment, theme, consumed surface context, intent and emphasis. Validation requires
each declared coordinate to have surface and border Rest recipes, width and style.

Phase 5 moves only the opted-in Card e1 Rest border class out of `c` into the
palette-local `b[contextBucket][intent][emphasisBucket]` leaf:

```ts
{ on: 'recipe-class', off: 'transparent-class', default: false }
```

The `off` class is a shared, build-emitted transparent border declaration. It is
mechanical paint suppression, not a new preset color. Width and style remain in
their existing scale/decoration classes. Other palette states remain in `c`.
The component metadata artifact also publishes the authored boolean map; the
resolved palette leaf lets React consume its default atomically with the recipe.

Static Card selects explicit `border` before the default. CardAction always selects
the default Rest class and retains its interaction palette classes and legacy
shadow suppression. This preserves Fluent CardAction paint while allowing static
Card to activate previously unavailable Rest borders. No runtime color calculation,
contrast heuristic, context switch or automatic shadow substitution is involved.

Schemas without the map retain their existing `c` artifact unchanged. Missing
capabilities never cause the renderer to fabricate a border. Both lazy component
artifact merging and aggregate Showcase merging preserve `b`.
