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

Chip uses the same input Surface Context for the independent regions `e2` (Content/Select)
and `e5` (Remove). Selection affects the `e2` output consumed by the inline Badge. Remove
publishes its own Rest or Disabled output for its icon. Neither sibling reads the other's
produced context. Each action uses its Disabled output when either that action or the root
is disabled. Disabling only one action leaves the sibling on its own active recipe.

Chip scale values are local to Chip. Kiskadee-authored official presets should normally keep a Chip
visually smaller than the corresponding Button so represented entities remain subordinate to
commands; this is a preset recommendation rather than a Core rule. A preset must author and justify
its own geometry instead of deriving Chip dimensions from Button at runtime.

See the cross-package [Badge and Chip contract](../../../../../../docs/definitions/badge-chip-contract.md).
