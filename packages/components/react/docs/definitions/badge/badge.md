# Badge

Status: canonical p-react definition.

Badge is passive metadata. The React root is a `span`; its Icon, Label, Count, and Dot parts do not
add interaction semantics. Direct string and number children are normalized into `Badge.Label`.

`Badge.Icon` accepts only Consumer-provided Icon content through `children`. `Badge.Count` is an
auxiliary count inside the same Badge. `Badge.Dot` is content-free, defaults to `s:sm:3`, and needs
an accessible description whenever the associated host does not already communicate its meaning.

Badge resolves its visual classes against `useSurfaceContext`. It never reads the interaction state
of a parent and never receives parent activator classes. Its Schema supports Rest only.

When composed through `Button.Badge`, the Button wrapper owns logical-corner positioning and
pointer transparency. Badge retains its classes, surface resolution, and passive semantics.

See the cross-package [Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
