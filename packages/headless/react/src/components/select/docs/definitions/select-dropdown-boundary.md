# Select And Shared Dropdown Boundary

Status: canonical definition.

Headless Select owns selection semantics and reuses only mechanical collection and anchored-overlay
infrastructure. It is not a visual specialization of Dropdown.

DOM focus remains on `Select.Trigger`. While the listbox is open, `aria-activedescendant` identifies
the active option by stable value key. The active key is distinct from the committed selected value;
Escape closes without committing the active option.

`Root.options` is authoritative for order, disabled state, and `textValue`. `Select.Option` renders
the corresponding view. A contradictory option-level disabled value produces a development warning
and does not change keyboard navigation.

The public Trigger, Content, and Option render callbacks allow a styled consumer to apply an
existing trigger or Dropdown surface without nested buttons or duplicated selection logic. Styling,
portal decoration, icons, and item geometry remain outside the headless Select.
