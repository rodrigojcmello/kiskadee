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

Without a custom `render`, `Select.Content` preserves its native `<ul role="listbox">` contract and
its ref is an `HTMLUListElement`. Supplying `render` changes the mechanical positioner contract to a
`<div>`-compatible element, so both the callback's `ref` and the public forwarded ref are typed as
`HTMLDivElement`. The overload prevents a rendered div from ever being delivered through a ref
declared as `HTMLUListElement`.

`Select.Content` is unmounted while closed by default. A visual presence adapter may set
`forceMount` only while retaining an exit frame; forced closed content remains `aria-hidden` and
`inert`. Option order, disabled state, typeahead, and the selected value remain available from
`Root.options`, so collection behavior never depends on a closed listbox staying in the DOM.
