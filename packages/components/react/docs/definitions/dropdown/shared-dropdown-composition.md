# Shared Dropdown Composition

Status: canonical definition.

`Dropdown` is the shared visual surface for anchored collections. It does not decide whether a
collection is a menu, a value selector, or autocomplete suggestions.

The semantic owners remain independent:

- `Menu` owns `menu` and `menuitem`, real item focus, action activation, typeahead, and focus
  restoration;
- `Select` owns `combobox`, `listbox`, `option`, committed value, and active-descendant focus;
- `Autocomplete` owns editable input value, selected value, filtering input, and active-descendant
  focus.

Those components reuse the same Dropdown class map and DOM slots. They never change semantics by
passing a `menu | select | autocomplete` visual variant.

`Dropdown.Root` combines the visual provider with the mechanical headless root for a standalone
anchored Dropdown. Semantic owners that already control their own overlay use
`Dropdown.VisualProvider` instead. This keeps one visual class-map source without mounting a second
open state, anchor registry, ID pair, or mechanical context.

## Elements

- `e1`: floating surface;
- `e2`: interactive collection item;
- `e3`: optional leading icon;
- `e4`: principal label;
- `e5`: optional supporting description;
- `e6`: optional trailing indicator;
- `e7`: explicit separator.

The surface may contain arbitrary non-interactive supporting content. Rich content that introduces
multiple focus targets, dialog behavior, or form controls belongs to a future Popover or advanced
search contract rather than Dropdown.

## Icon Column

`Dropdown.Items` contains explicit `Dropdown.Group` regions. Each Group owns the surface-derived
padding around its items and is an independent icon-column scope. Structural CSS uses `:has()` to
reserve a leading column only when at least one item in that Group renders `Dropdown.Icon`. Items
without icons render no placeholder but align their labels with icon-bearing siblings in the same
Group. Another Group without icons remains a single content column.

The icon viewport comes from `global.iconSizes` through the normal `iconSize` Builder expansion.
No browser measurement or icon-presence JavaScript is used.

## Separators And States

Separators are never inferred between items. Consumers split items into Groups and insert
`Dropdown.Separator` between them. Each Group keeps the item padding, while the separator is a
full-bleed line with no margin, padding, or inset of its own. The semantic owner remains responsible
for any role appropriate to that context; generic Dropdown does not presume separator semantics.

`Dropdown.Separator` and the public neutral `Separator` component consume the same preset recipe,
but do not share component DOM or class maps. Colored, stateful, or component-specific dividers
remain local to their owning component.

Items use the component's internal `medium` emphasis. Rest is the base and interaction states are
sparse deltas. Dropdown exposes neutral and destructive intent in the first contract; it does not
copy Button's public emphasis matrix.

## Mechanical Overlay

The headless anchored-overlay layer owns only controlled or uncontrolled open state, anchor and
floating refs, portal presence, placement, collision handling, width policy, Escape, and outside
press. It does not own roles, selection, item keyboard behavior, or focus policy.

Stacking order is visual/application policy. The headless layer never injects a z-index; a styled
component or consuming overlay system may establish the appropriate layer for its environment.

Portal presence is hydration-stable: a portalled surface remains inline until the client mount has
completed, then moves to its resolved portal container. Semantic components decide how focus is
restored and what an Escape means.

## ButtonMenu

`ButtonMenu` is one public orchestration API over Button, Menu, and Dropdown:

- without `ButtonMenu.Action`, Trigger is one menu button;
- with `ButtonMenu.Action`, Action and Trigger are two sibling Buttons and two tab stops;
- only Trigger owns `aria-haspopup`, `aria-expanded`, `aria-controls`, and menu opening;
- Action may submit a form; Trigger is always `type="button"`;
- Button classes style Action and Trigger, while Dropdown classes style Content and items.
- `ButtonMenu.Group` reuses the visual Dropdown group, while `ButtonMenu.Separator` supplies menu
  separator semantics around the same Dropdown-owned line.

ButtonMenu has no schema of its own. Connected corners and seam geometry are structural composition;
creating a second Button schema would introduce visual drift.
