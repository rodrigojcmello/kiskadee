# Badge

Status: canonical p-react definition.

Badge is passive metadata. The React root is a `span` and accepts exactly one string or number.
`Badge.Dot` is content-free, defaults to `s:sm:3`, and always uses filled/high presentation.
`Badge.Mark` accepts exactly one Consumer-provided Icon through `children` and never accepts text or
numbers.

Contained Mark uses the authored pill surface with a smaller icon. Full-bleed Mark removes the
authored surface and lets its artwork fill the complete viewport; it may be bi-color. Both need an
accessible description whenever the associated host does not already communicate their meaning.

Text Badge supports `square`, `rounded`, and `pill`; Dot and Mark use `pill`. Optional
`separation="ring"` adds the Badge-owned separation outline. If the preset does not publish `e6`,
the complete ring is omitted. No style fallback is created. The Web separation layer matches the
Badge viewport and paints the ring externally, so the outline does not reduce the visible surface
or change intrinsic geometry. Full-bleed Mark may additionally use the same layer as a backing
behind transparent artwork.

Text Badge authors one nominal `boxHeight`. Structural CSS applies it as both minimum block size
and minimum inline size; the Schema does not author a duplicate `boxWidth`. Short content therefore
starts from a square viewport, while `12`, `99+`, or `New` may increase only the inline size and form
a pill. Dot and Mark keep independent fixed width and height maps.

Badge resolves its visual classes against `useSurfaceContext`. It never reads the interaction state
of a parent and never receives parent activator classes. Its Schema supports Rest only.

`shadow` is an opt-in `Badge.Dot` capability intended for an externally overlaid Dot. When the
active preset publishes the Dot shadow recipe, it applies one static Rest shadow to `e5`; otherwise
it does nothing and creates no fallback. The default is off. Text Badge and both Mark presentations
never accept `shadow`. A Dot with `separation="ring"` never accepts `shadow`: the opaque ring is the
only separation treatment in that composition.

When composed through `Button.Badge`, Button owns the relationship. Inline-start/end use the
Schema-authored Button `e7` gap and stay adjacent to the label; the four external placements use
logical-corner Structural CSS. Inline placements inherit Button's produced content surface, while
external placements inherit the surrounding surface consumed by Button. An explicit Badge
`surfaceContext` overrides either relation. Both wrappers remain pointer-transparent. Badge retains
its classes and passive semantics.

The public intents are `neutral`, `primary`, `novelty`, `positive`, `warning`, and `attention`.
High surfaces resolve the preset-authored functional `vivid` reference for their own tonal family;
Badge does not impose one shared tonal position across intents.

See the cross-package [Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
