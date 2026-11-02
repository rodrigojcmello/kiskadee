# Static Card Border Compilation

Presets opt in through `components.card.options.border`, which declares `defaultMode` and an
`adaptive` boolean map scoped to segment, theme, consumed surface context, intent and emphasis.
This behavior policy does not add a color-variant coordinate. Validation requires each declared
coordinate to have Standard surface and border Rest recipes, width and style.

Phase 5 moves only the opted-in Card e1 Rest border class out of `c` into the
palette-local `b[contextBucket][colorVariantBucket][intent][emphasisBucket]` leaf:

```ts
{ on: 'recipe-class', off: 'transparent-class', adaptive: false }
```

The `off` class is a shared, build-emitted transparent border declaration. It is
mechanical paint suppression, not a new preset color. Width and style remain in
their existing scale/decoration classes. Other palette states remain in `c`.
The component metadata artifact also publishes the authored policy; the resolved palette leaf
lets React consume its adaptive decision atomically with the recipe. The policy applies to the
corresponding paint in each emitted color variant.

Card and CardAction select explicit `border` before the preset default mode. Adaptive false
suppresses the Rest border; CardAction retains authored interaction deltas. Explicit `border={false}`
or the preset's `defaultMode: never` suppresses paint in every state. Shadow does not change the
border decision. No runtime color calculation, contrast heuristic, context switch or automatic
shadow substitution is involved.

Schemas without the map retain their existing `c` artifact unchanged. Missing
capabilities never cause the renderer to fabricate a border. Component resource merging preserves
`b`; build-only aggregates are not a runtime fallback.
