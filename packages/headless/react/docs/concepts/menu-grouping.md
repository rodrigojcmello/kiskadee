# Menu Grouping

Status: canonical definition.

Menu groups are semantic context boundaries, not optional layout wrappers. Every menu collection,
including each submenu page, contains only top-level groups. A group contains exactly one category
of row:

- `Menu.Group`: action items, links, and submenu triggers;
- `Menu.CheckboxGroup`: independent checkbox items;
- `Menu.RadioGroup`: mutually exclusive radio items.

Groups cannot be nested. Checkbox and radio items cannot be mixed with each other or with command
items in one group. A label is optional for every group and names that group when present.

`MenuTree` encodes the same rule with `group`, `checkbox-group`, and `radio-group` nodes. Root and
submenu `items` arrays contain only those group nodes. Separator nodes do not exist: adjacent groups
are the durable contextual boundary, while a styled presenter decides whether that boundary is
painted.

The React Menu primitives reject rows mounted outside their matching group and reject nested
groups. This keeps manual composition and `MenuTree` composition equivalent instead of allowing a
presenter to repair ambiguous input.

Dropdown-based presenters always paint the automatic boundary between groups. BottomSheet-based
presenters preserve the same semantic groups but may suppress boundary paint through their own
`groupSeparators` visual option. Suppressing paint never merges groups or changes selection
semantics.
