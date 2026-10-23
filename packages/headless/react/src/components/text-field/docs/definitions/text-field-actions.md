# TextField Actions

`useHeadlessTextFieldActions` is an optional behavior bridge for descendants of
`HeadlessTextField.Root`. It is exported from the package root and the existing `text-field`
subpath. It exposes commands rather than the private context or native input ref.

The options are `inputType` (default `text`) and `visibilityEnabled` (default `false`). The result
contains `value`, `inputId`, boolean `disabled` and `readOnly`, `clear`, resolved `inputType`,
`visible` and `toggleVisibility`. The visual consumer forwards the returned type to the same
Input and composes its existing Buttons, labels, icons and optional announcements.

## Clear

`clear()` does nothing while disabled, read-only or already empty. Otherwise it focuses the native
Input before requesting `setValue('')`. This allows a visual Clear button to disappear without
leaving focus on a removed control. Whitespace remains a non-empty value.

The command uses the Root's existing value state. Uncontrolled fields update immediately;
controlled fields notify `onValueChange('')` and retain the supplied value until their owner
accepts the change. The hook does not mutate `input.value`, fabricate `inputProps.onChange`
events, submit a form, or reset other controls. An announcement must wait until the value actually
becomes empty after a clear request; its localized text belongs to the visual consumer.

## Password visibility

Visibility is available only when `visibilityEnabled` is true and the configured base type is
`password`. It starts hidden. The hook returns `text` while visible and the base type otherwise.
Removing that capability or changing the base type hides the value and resets the local reveal
state. Visibility does not own another copy of the field value.

`toggleVisibility()` is blocked while disabled, but remains available while read-only because it
does not edit the value. Disabling a field does not itself change a visibility choice already
made by the user. The hook snapshots the native selection and restores it after the rendered type
changes, only while the capability remains active and the native type is still `text` or
`password`. A simultaneous external type change discards the snapshot. It does not call `focus()`
for this action, so a focused Button keeps keyboard focus.
The visual consumer must keep the same native Input node, identity, value and form attributes.

The hook supplies no button text, artwork, ARIA label or live-region content. Those resources and
their translations remain consumer-owned. Auxiliary actions must use `type="button"`; their
existing Button component owns activation and keyboard behavior.
