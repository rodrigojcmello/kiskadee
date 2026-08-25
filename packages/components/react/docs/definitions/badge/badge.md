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
the complete ring is omitted. No style fallback is created.

Badge resolves its visual classes against `useSurfaceContext`. It never reads the interaction state
of a parent and never receives parent activator classes. Its Schema supports Rest only.

When composed through `Button.Badge`, Button owns the relationship. Inline-start/end use the
Schema-authored Button `e7` gap and stay adjacent to the label; the four external placements use
logical-corner Structural CSS. Both wrappers remain pointer-transparent. Badge retains its classes,
surface resolution, and passive semantics.

The public intents are `neutral`, `primary`, `novelty`, `positive`, `warning`, and `attention`.
High surfaces resolve the preset-authored functional `vivid` reference for their own tonal family;
Badge does not impose one shared tonal position across intents.

See the cross-package [Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
