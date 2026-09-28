# TextField intent and terminal-state contract

This contract applies to every preset and platform implementation of TextField.

Neutral is the canonical presentation for disabled and read-only fields. Error and warning
express validation intent for editable fields; they do not define separate disabled/readOnly
visual recipes. Presets author terminal state deltas only under neutral, for every element,
mode, theme, segment and surface context. Do not duplicate terminal styles under validation
intents even when their resolved colors would be equal.

Visual resolution precedence is:

1. Disabled or read-only: select neutral intent, then apply the corresponding state.
2. Otherwise: explicit intent, then validation status, then neutral.

This is visual resolution only. Preserve the consumer's intent, validation status, message,
accessible invalid state and native disabled/readOnly semantics. Removing a terminal condition
restores the requested validation presentation. Read-only remains focusable and selectable;
disabled follows native disabled behavior. Neutral terminal overrides must suppress unwanted
hover/pressed/focus paint according to the preset's state policy.

This contract does not change Button or require all intent/state combinations for other
components. Omitted visual deltas remain distinct from unsupported user interactions.

Showcase demonstrates the same five scenarios per supported TextField mode: Neutral, Error,
Warning, Disabled (neutral), Read-only (neutral). Documentation outside the field identifies
intent versus state/condition and describes the use case; labels remain realistic form labels.
Hover, focus and pressed are explored through interaction, not permanently forced previews.
