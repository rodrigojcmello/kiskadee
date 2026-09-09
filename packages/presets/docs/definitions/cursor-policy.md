# Preset Cursor Policy

The canonical contract is [Cursor Policy](../../../../docs/definitions/cursor-policy.md).

Every current preset explicitly declares
`global.interaction.controlCursor: { value: 'pointer', scope: 'web' }`.
Omission resolves to the same default. An explicit object must include both fields.
This is a Kiskadee cross-platform preference, not an upstream visual-fidelity claim.

Use `scope: 'all'` to request the same cursor on native adapters with cursor support, or
`value: 'default'` to request the arrow. Web includes DOM rendering in desktop shells.
No source palette, radius, interaction state or native platform behavior is inferred from cursor.
