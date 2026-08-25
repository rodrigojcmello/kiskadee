# Chip

Status: canonical p-react definition.

Chip represents one entity or value. Every root contains exactly one `Chip.Content` or
`Chip.Select`. Optional `Chip.Remove` is a sibling native button, so selectable and removable Chips
never nest controls.

`Chip.Select` supports controlled and uncontrolled booleans. `Chip.Remove` requires an accessible
name, invokes `onRemove`, and does not mutate selection or consumer data. Root `disabled` disables
both interactive targets.

When Remove is present, Structural CSS zeroes only the adjacent logical corners of the two sibling
surfaces. The Chip therefore remains visually continuous without nesting either native button.

`Chip.Icon` accepts Consumer-provided Icon content. `Chip.Remove` uses the `close` Essential Icon
unless explicit children are supplied. If neither resolves, p-react omits the complete Remove
affordance and warns in development. `Chip.Badge` is valid only inside `Chip.Content` or
`Chip.Select`; it applies only authored relation spacing around an independent Rest-only Badge.

Chip consumes its surrounding Surface Context and publishes the surface authored for descendants
inside Content or Select. Remove remains a sibling and does not inherit that primary content
surface accidentally.

See the cross-package [Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
