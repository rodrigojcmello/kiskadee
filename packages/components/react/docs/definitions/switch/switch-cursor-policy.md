# Switch Cursor Policy

Switch action owners consume `cursor: var(--k-cc)` in both static and Motion branches.
The global preset policy or explicit KiskadeeContext preference determines default/pointer;
Switch does not impose a fixed default cursor. Children inherit the root cursor.

Disabled and read-only states keep the existing unavailable cursor override. Cursor choice
never changes interaction, focus, selected state, or activation feedback.

Follow the canonical [cursor policy](../../../../../../docs/definitions/cursor-policy.md).
