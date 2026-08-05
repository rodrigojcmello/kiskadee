# Select Sequential Navigation

Headless Select supports two independent interaction surfaces:

- `Select.Trigger` owns the combobox semantics and opens the listbox;
- optional `Select.Previous` and `Select.Next` buttons move directly between adjacent enabled
  options.

Sequential buttons do not replace the trigger and do not open the listbox. Consumers may compose
them around the trigger to create a stepper-like Select while preserving the complete list as the
authoritative choice surface.

Navigation is bounded rather than circular. The previous button is disabled at the first enabled
option, the next button is disabled at the last enabled option, and disabled options are skipped.
The root `disabled` state disables all three controls.

The headless package owns selection, bounds, disabled-option handling, button semantics, and
accessible default labels. Geometry, icons, borders, focus presentation, and responsive layout
belong to the styled consumer.
